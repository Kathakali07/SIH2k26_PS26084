"""Deterministic storm-object tracking over the repository's demo frames.

The bundled frames are synthetic demo data, not live radar observations and
not Earthformer predictions.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
import re

import cv2
import numpy as np
from scipy.optimize import linear_sum_assignment
try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

DEFAULT_FRAMES_DIR = Path(__file__).resolve().parent.parent / "data" / "mock_frames"
DEMO_BASE_TIME = datetime(2026, 9, 29, 12, 0, tzinfo=timezone.utc)
MIN_DBZ = -40.0
MAX_DBZ = 100.0


class DGMRInferenceEngine:
    """Wrapper for DeepMind's Deep Generative Model of Radar (DGMR)."""
    
    def __init__(self, device: str | None = None):
        if not HAS_TORCH:
            print("WARNING: PyTorch ('torch') is not installed. Real-time inference disabled (mock/precomputed mode active).")
            self.is_loaded = False
            return
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Initializing DGMR on device: {self.device}")
        try:
            from dgmr import DGMR
            print("Loading pretrained DGMR weights from openclimatefix/dgmr...")
            # This automatically downloads the weights from Hugging Face if not cached.
            self.model = DGMR.from_pretrained("openclimatefix/dgmr").to(self.device)
            self.model.eval()
            self.is_loaded = True
        except ImportError:
            print("WARNING: 'dgmr' library not found. Install it via pip/git to use real inference.")
            self.is_loaded = False
            
    def predict(self, context_tensor: np.ndarray) -> np.ndarray:
        """
        Runs the forward pass through DGMR.
        DGMR expects [Batch, Time, Channels, Height, Width].
        Our context_tensor is [1, 20, 1, 500, 500].
        """
        if not self.is_loaded:
            raise RuntimeError("DGMR library is not installed. Cannot run real inference.")
            
        tensor_pt = torch.tensor(context_tensor, dtype=torch.float32, device=self.device)
        
        # DGMR usually takes 4 frames of context
        tensor_context = tensor_pt[:, -4:, :, :, :]
        
        # Crop to 256x256 to match typical DGMR constraints (must be powers of 2)
        # We'll take the center 256x256
        H, W = tensor_context.shape[3], tensor_context.shape[4]
        h_start = (H - 256) // 2
        w_start = (W - 256) // 2
        tensor_context = tensor_context[:, :, :, h_start:h_start+256, w_start:w_start+256]
        
        with torch.no_grad():
            prediction = self.model(tensor_context)
            
        # prediction is [Batch, Future_Time, Channels, H, W]
        # Pad it back to 500x500 so our tracker doesn't get confused
        padded_prediction = torch.zeros(
            (prediction.shape[0], prediction.shape[1], prediction.shape[2], H, W),
            dtype=prediction.dtype, device=prediction.device
        )
        padded_prediction[:, :, :, h_start:h_start+256, w_start:w_start+256] = prediction
        # Convert to numpy
        prediction_np = padded_prediction.cpu().numpy()
        prediction_np = np.nan_to_num(prediction_np, nan=0.0)
        
        # DGMR outputs rain rate in mm/hr (typically 0.0 to ~3.0).
        # Convert to dBZ using the standard Marshall-Palmer Z-R relationship:
        #   Z = 200 * R^1.6   (Z in mm^6/m^3, R in mm/hr)
        #   dBZ = 10 * log10(Z)
        # Example: R=0.5 mm/hr → Z=76 → dBZ=18.8  (light rain)
        #          R=1.0 mm/hr → Z=200 → dBZ=23.0  (moderate rain)
        #          R=2.0 mm/hr → Z=607 → dBZ=27.8  (heavy rain)
        #          R=3.0 mm/hr → Z=1149 → dBZ=30.6 (intense rain)
        rain_rate = np.clip(prediction_np, 0.0, None)  # No negative rain
        Z = 200.0 * np.power(rain_rate + 1e-6, 1.6)    # Marshall-Palmer
        dbz = 10.0 * np.log10(Z + 1e-10)               # Convert to dBZ
        
        # Where rain rate was ~0, set to no-echo
        dbz[rain_rate < 0.01] = -40.0
        
        dbz = np.clip(dbz, MIN_DBZ, MAX_DBZ)
        
        return dbz



class NowcastEngine:
    """Load radar frames, build the expected tensor, and track storm objects."""

    def __init__(
        self,
        frames_dir: str | Path | None = None,
        *,
        threshold_dbz: float = 15.0,
        frame_interval_minutes: float = 5.0,
        km_per_pixel: float = 1.0,
        origin_lat: float = 22.5726,
        origin_lon: float = 88.3639,
    ) -> None:
        self.frames_dir = Path(frames_dir) if frames_dir else DEFAULT_FRAMES_DIR
        self.threshold_dbz = float(threshold_dbz)
        self.frame_interval_minutes = float(frame_interval_minutes)
        self.km_per_pixel = float(km_per_pixel)
        self.origin_lat = float(origin_lat)
        self.origin_lon = float(origin_lon)
        if self.frame_interval_minutes <= 0.0 or self.km_per_pixel <= 0.0:
            raise ValueError("Frame interval and grid resolution must be positive")
        if not -90.0 <= self.origin_lat <= 90.0 or not -180.0 <= self.origin_lon <= 180.0:
            raise ValueError("Grid origin must be a valid latitude/longitude")
        self.deg_per_pixel_lat = self.km_per_pixel / 111.0
        self.deg_per_pixel_lon = self.km_per_pixel / 103.0
        self.source = "Synthetic radar sequence (repository demo frames)"

        self.frames = self.load_frames(self.frames_dir)
        self.frame_timestamps = [frame["timestamp_utc"] for frame in self.frames]
        self.input_tensor = self.build_context_tensor(self.frames)
        self.tracks = self.match_and_classify_cells(self.input_tensor)
        self.latest_frame_index = self.input_tensor.shape[1] - 1
        self.latest_storms = {
            sid: storm
            for sid, storm in self.tracks.items()
            if storm["last_seen_frame"] == self.latest_frame_index
        }

    @staticmethod
    def load_frames(frames_dir: str | Path) -> list[dict[str, np.ndarray]]:
        """Load the existing per-frame .npy dictionaries with validation."""
        frame_paths = sorted(Path(frames_dir).glob("frame_*.npy"))
        if not frame_paths:
            raise FileNotFoundError(f"No frame_*.npy demo frames found in {frames_dir}")

        frames: list[dict] = []
        expected_shape: tuple[int, int] | None = None
        previous_timestamp: datetime | None = None
        for path in frame_paths:
            try:
                loaded = np.load(path, allow_pickle=True)
            except Exception as exc:
                raise ValueError(f"Could not load frame {path}: {exc}") from exc
            if loaded.shape != () or not isinstance(loaded.item(), dict):
                raise ValueError(f"{path} must contain a saved dictionary")
            raw = loaded.item()
            if "radar_dbz" not in raw:
                raise ValueError(f"{path} is missing radar_dbz")

            radar = np.asarray(raw["radar_dbz"], dtype=np.float32)
            if radar.ndim != 2 or not np.isfinite(radar).all():
                raise ValueError(f"{path} radar_dbz must be a finite 2D array")
            if radar.size == 0 or np.any((radar < MIN_DBZ) | (radar > MAX_DBZ)):
                raise ValueError(f"{path} radar_dbz must contain values in the supported -40..100 dBZ range")
            if expected_shape is None:
                expected_shape = radar.shape
            elif radar.shape != expected_shape:
                raise ValueError(f"{path} has shape {radar.shape}; expected {expected_shape}")

            frame: dict = {"radar_dbz": radar}
            for key in ("ir_temp", "vil"):
                if key in raw:
                    values = np.asarray(raw[key], dtype=np.float32)
                    if values.shape != radar.shape or not np.isfinite(values).all():
                        raise ValueError(f"{path} {key} must match radar_dbz shape and be finite")
                    limits = (150.0, 350.0) if key == "ir_temp" else (0.0, 500.0)
                    if np.any((values < limits[0]) | (values > limits[1])):
                        raise ValueError(f"{path} {key} values must be in {limits[0]}..{limits[1]}")
                    frame[key] = values

            raw_timestamp = raw.get("timestamp_utc")
            if raw_timestamp is None:
                match = re.search(r"frame_(\d+)$", path.stem)
                frame_number = int(match.group(1)) if match else len(frames)
                timestamp = DEMO_BASE_TIME + timedelta(minutes=5 * frame_number)
            else:
                try:
                    timestamp = datetime.fromisoformat(str(raw_timestamp).replace("Z", "+00:00"))
                except ValueError as exc:
                    raise ValueError(f"{path} timestamp_utc must be ISO-8601") from exc
                if timestamp.tzinfo is None:
                    raise ValueError(f"{path} timestamp_utc must include a timezone")
                timestamp = timestamp.astimezone(timezone.utc)
            if previous_timestamp is not None and timestamp <= previous_timestamp:
                raise ValueError(f"{path} timestamp_utc must be later than the preceding frame")
            frame["timestamp_utc"] = timestamp
            previous_timestamp = timestamp
            frames.append(frame)
        return frames

    @staticmethod
    def build_context_tensor(frames: list[dict[str, np.ndarray]]) -> np.ndarray:
        """Stack radar dBZ into [Batch, Time, Channel, Height, Width]."""
        if not frames:
            raise ValueError("At least one radar frame is required")
        radar = np.stack([frame["radar_dbz"] for frame in frames], axis=0)
        if radar.ndim != 3 or radar.shape[-1] == 0 or radar.shape[-2] == 0:
            raise ValueError("Radar frames must have consistent [Height, Width] dimensions")
        if not np.isfinite(radar).all() or np.any((radar < MIN_DBZ) | (radar > MAX_DBZ)):
            raise ValueError("Radar frames must be finite and within the supported -40..100 dBZ range")
        return radar[None, :, None, :, :].astype(np.float32, copy=False)

    def ingest_and_predict(self, raw_data_path: str | Path | None = None, use_dgmr: bool = False) -> np.ndarray:
        """Return deterministic demo frames in the expected 5D tensor layout, OR run DGMR inference.

        `raw_data_path` accepts either a 5D radar tensor or one of the saved
        per-frame dictionaries. The demo endpoint uses the bundled sequence.
        If `use_dgmr` is True, it will pass the context tensor to the DGMR model.
        """
        if use_dgmr:
            if not hasattr(self, 'dgmr_engine'):
                self.dgmr_engine = DGMRInferenceEngine()
            print("Running Real DGMR Inference...")
            # For this MVP, we just pass the bundled mock sequence as the "raw data" context
            # to feed the DGMR model to predict the *next* frames.
            context_tensor = self.input_tensor.copy()
            future_tensor = self.dgmr_engine.predict(context_tensor)
            return future_tensor

        if raw_data_path is None:
            return self.input_tensor.copy()

        loaded = np.load(raw_data_path, allow_pickle=True)
        if loaded.shape == () and isinstance(loaded.item(), dict):
            frame = loaded.item()
            if "radar_dbz" not in frame:
                raise ValueError("Frame dictionary is missing radar_dbz")
            radar = np.asarray(frame["radar_dbz"], dtype=np.float32)
            if radar.ndim != 2 or radar.size == 0 or not np.isfinite(radar).all():
                raise ValueError("radar_dbz must be a non-empty, finite [Height, Width] array")
            if np.any((radar < MIN_DBZ) | (radar > MAX_DBZ)):
                raise ValueError("radar_dbz values must be in the supported -40..100 dBZ range")
            return radar[None, None, None, :, :]
        values = np.asarray(loaded, dtype=np.float32)
        if values.ndim != 5:
            raise ValueError("raw_data_path must contain a [B,T,C,H,W] radar tensor")
        self.validate_tensor(values)
        return values

    @staticmethod
    def validate_tensor(values: np.ndarray) -> None:
        if values.shape[0] != 1 or values.shape[1] < 1 or values.shape[2] != 1:
            raise ValueError("Expected non-empty [1, Time, 1, Height, Width] radar tensor")
        if values.shape[3] < 1 or values.shape[4] < 1 or not np.isfinite(values).all():
            raise ValueError("Radar tensor dimensions must be non-empty and values finite")
        if np.any((values < MIN_DBZ) | (values > MAX_DBZ)):
            raise ValueError("Radar tensor values must be in the supported -40..100 dBZ range")

    def extract_storm_cells(self, frame: np.ndarray) -> list[dict]:
        """Extract >40 dBZ contours with geometry and physical-unit metadata."""
        frame_np = np.asarray(frame, dtype=np.float32).squeeze()
        if frame_np.ndim != 2 or not np.isfinite(frame_np).all():
            raise ValueError("A radar frame must be a finite [Height, Width] array")
        if frame_np.size == 0 or np.any((frame_np < MIN_DBZ) | (frame_np > MAX_DBZ)):
            raise ValueError("Radar frame values must be in the supported -40..100 dBZ range")

        mask = (frame_np > self.threshold_dbz).astype(np.uint8) * 255
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cells: list[dict] = []
        for contour in contours:
            area_px = float(cv2.contourArea(contour))
            if area_px < 1.0:
                continue

            moments = cv2.moments(contour)
            if moments["m00"] == 0:
                continue
            cx = float(moments["m10"] / moments["m00"])
            cy = float(moments["m01"] / moments["m00"])
            cell_mask = np.zeros_like(mask)
            cv2.drawContours(cell_mask, [contour], -1, 255, thickness=cv2.FILLED)
            max_dbz = float(frame_np[cell_mask == 255].max())
            x, y, width, height = cv2.boundingRect(contour)

            points = contour[:, 0, :].astype(float)
            geo_ring = [self.pixel_to_lonlat(float(xp), float(yp)) for xp, yp in points]
            if geo_ring and geo_ring[0] != geo_ring[-1]:
                geo_ring.append(geo_ring[0])

            cells.append({
                "centroid": (cx, cy),
                "position": self.pixel_to_lonlat(cx, cy),
                "bbox": (x, y, width, height),
                "area_px": area_px,
                "area_km2": area_px * self.km_per_pixel**2,
                "max_dbz": max_dbz,
                "contour": contour,
                "ring": geo_ring,
                "provenance": {
                    "input": "synthetic_demo_frames",
                    "position": "calculated_from_grid_transform",
                    "area_km2": "calculated_from_contour_and_grid_resolution",
                    "max_dbz": "read_from_synthetic_radar_frame",
                },
            })
        return cells

    def pixel_to_lonlat(self, x: float, y: float) -> list[float]:
        """Map the 1 km synthetic grid east/south from its northwest origin."""
        lon = self.origin_lon + x * self.deg_per_pixel_lon
        lat = self.origin_lat - y * self.deg_per_pixel_lat
        return [float(lon), float(lat)]

    def match_and_classify_cells(self, frames_tensor: np.ndarray) -> dict[int, dict]:
        """Track contour centroids between frames using Hungarian assignment."""
        # Reject implausible jumps: a merged/split contour becomes a new track
        # instead of assigning an unrealistic velocity to an existing storm.
        max_match_distance_px = 30.0
        values = np.asarray(frames_tensor, dtype=np.float32)
        if values.ndim == 5:
            self.validate_tensor(values)
            if values.shape[0] != 1 or values.shape[2] != 1:
                raise ValueError("Expected radar tensor layout [1, Time, 1, Height, Width]")
            frames = values[0, :, 0]
        elif values.ndim == 4:
            if values.shape[0] < 1 or values.shape[1] != 1 or values.shape[2] < 1 or values.shape[3] < 1:
                raise ValueError("Expected frame layout [Time, 1, Height, Width]")
            frames = values[:, 0]
        elif values.ndim == 3:
            if values.shape[0] < 1 or values.shape[1] < 1 or values.shape[2] < 1:
                raise ValueError("Expected non-empty [Time, Height, Width] frames")
            frames = values
        else:
            raise ValueError("Expected [B,T,C,H,W], [T,C,H,W], or [T,H,W] input")
        if not np.isfinite(frames).all() or np.any((frames < MIN_DBZ) | (frames > MAX_DBZ)):
            raise ValueError("Radar frames must be finite and within the supported -40..100 dBZ range")

        tracks: dict[int, dict] = {}
        previous: list[dict] = []
        next_id = 0
        previous_timestamp: datetime | None = None

        if len(self.frame_timestamps) >= len(frames):
            timestamps = self.frame_timestamps[-len(frames):]
        else:
            timestamps = [DEMO_BASE_TIME + timedelta(minutes=self.frame_interval_minutes * i) for i in range(len(frames))]

        for frame_index, (frame, timestamp) in enumerate(zip(frames, timestamps)):
            if previous_timestamp is not None and timestamp <= previous_timestamp:
                raise ValueError("Frame timestamps must increase while tracking")
            current = self.extract_storm_cells(frame)
            assigned_current: set[int] = set()
            assigned_previous: set[int] = set()

            if previous and current:
                cost = np.empty((len(previous), len(current)), dtype=np.float64)
                for i, prior in enumerate(previous):
                    for j, candidate in enumerate(current):
                        dx = prior["centroid"][0] - candidate["centroid"][0]
                        dy = prior["centroid"][1] - candidate["centroid"][1]
                        cost[i, j] = np.hypot(dx, dy)

                rows, cols = linear_sum_assignment(cost)
                for row, col in zip(rows, cols):
                    prior = previous[row]
                    elapsed_minutes = (timestamp - prior["timestamp_utc"]).total_seconds() / 60.0
                    # A 200 km/h gate preserves the generated 96–120 km/h tracks
                    # but rejects merge/split jumps that would imply implausible motion.
                    max_displacement_px = min(
                        max_match_distance_px,
                        200.0 * elapsed_minutes / 60.0 / self.km_per_pixel,
                    )
                    if cost[row, col] > max_displacement_px:
                        continue
                    cell = current[col]
                    cell["id"] = prior["id"]
                    px, py = prior["centroid"]
                    cx, cy = cell["centroid"]
                    cell["velocity"] = (cx - px, cy - py)
                    cell["elapsed_minutes"] = elapsed_minutes
                    cell["acceleration"] = (
                        cell["velocity"][0] - prior.get("velocity", (0.0, 0.0))[0],
                        cell["velocity"][1] - prior.get("velocity", (0.0, 0.0))[1],
                    )
                    assigned_current.add(int(col))
                    assigned_previous.add(int(row))

            for index, cell in enumerate(current):
                if index not in assigned_current:
                    cell["id"] = next_id
                    cell["velocity"] = (0.0, 0.0)
                    cell["acceleration"] = (0.0, 0.0)
                    cell["elapsed_minutes"] = self.frame_interval_minutes
                    next_id += 1
                self._classify_hazard(cell)
                prior_track = tracks.get(cell["id"])
                history = list(prior_track["history"]) if prior_track else []
                history.append({
                    "frame": frame_index,
                    "timestamp_utc": timestamp,
                    "position": cell["position"],
                    "max_dbz": cell["max_dbz"],
                    "area_km2": cell["area_km2"],
                })
                cell["history"] = history
                cell["first_seen_frame"] = prior_track["first_seen_frame"] if prior_track else frame_index
                cell["last_seen_frame"] = frame_index
                cell["timestamp_utc"] = timestamp
                cell["motion"] = {
                    "u_px_per_frame": float(cell["velocity"][0]),
                    "v_px_per_frame": float(cell["velocity"][1]),
                    "speed_kmh": float(np.hypot(*cell["velocity"]) * self.km_per_pixel * 60.0 / cell["elapsed_minutes"]),
                    "elapsed_minutes": float(cell["elapsed_minutes"]),
                    "provenance": "calculated_from_frame_centroids",
                }
                cell["growth_rate_km2_per_frame"] = (
                    float(cell["area_km2"] - prior_track["area_km2"]) if prior_track else 0.0
                )
                cell["growth_rate_km2_per_hour"] = (
                    float((cell["area_km2"] - prior_track["area_km2"]) * 60.0 / cell["elapsed_minutes"])
                    if prior_track else 0.0
                )
                tracks[cell["id"]] = cell

            previous = current
            previous_timestamp = timestamp

        return tracks

    def _classify_hazard(self, cell: dict) -> None:
        if cell["max_dbz"] < 35.0:
            cell["hazard_type"] = "Light/Moderate Rain"
            cell["severity"] = "LOW"
        elif cell["area_km2"] < 20.0 and cell["max_dbz"] > 55.0:
            cell["hazard_type"] = "Cloudburst"
            cell["severity"] = "HIGH"
        else:
            cell["hazard_type"] = "Thunderstorm"
            cell["severity"] = "MODERATE"
