"""Deterministic storm-object tracking over the repository's demo frames.

The bundled frames are synthetic demo data, not live radar observations and
not Earthformer predictions.
"""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from scipy.optimize import linear_sum_assignment


DEFAULT_FRAMES_DIR = Path(__file__).resolve().parent.parent / "data" / "mock_frames"


class NowcastEngine:
    """Load radar frames, build the expected tensor, and track storm objects."""

    def __init__(
        self,
        frames_dir: str | Path | None = None,
        *,
        threshold_dbz: float = 40.0,
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
        self.deg_per_pixel_lat = self.km_per_pixel / 111.0
        self.deg_per_pixel_lon = self.km_per_pixel / 103.0
        self.source = "Synthetic radar sequence (repository demo frames)"

        self.frames = self.load_frames(self.frames_dir)
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

        frames: list[dict[str, np.ndarray]] = []
        expected_shape: tuple[int, int] | None = None
        for path in frame_paths:
            loaded = np.load(path, allow_pickle=True)
            if loaded.shape != () or not isinstance(loaded.item(), dict):
                raise ValueError(f"{path} must contain a saved dictionary")
            raw = loaded.item()
            if "radar_dbz" not in raw:
                raise ValueError(f"{path} is missing radar_dbz")

            radar = np.asarray(raw["radar_dbz"], dtype=np.float32)
            if radar.ndim != 2 or not np.isfinite(radar).all():
                raise ValueError(f"{path} radar_dbz must be a finite 2D array")
            if expected_shape is None:
                expected_shape = radar.shape
            elif radar.shape != expected_shape:
                raise ValueError(f"{path} has shape {radar.shape}; expected {expected_shape}")

            frame = {"radar_dbz": radar}
            for key in ("ir_temp", "vil"):
                if key in raw:
                    values = np.asarray(raw[key], dtype=np.float32)
                    if values.shape != radar.shape or not np.isfinite(values).all():
                        raise ValueError(f"{path} {key} must match radar_dbz shape and be finite")
                    frame[key] = values
            frames.append(frame)
        return frames

    @staticmethod
    def build_context_tensor(frames: list[dict[str, np.ndarray]]) -> np.ndarray:
        """Stack radar dBZ into [Batch, Time, Channel, Height, Width]."""
        radar = np.stack([frame["radar_dbz"] for frame in frames], axis=0)
        return radar[None, :, None, :, :].astype(np.float32, copy=False)

    def ingest_and_predict(self, raw_data_path: str | Path | None = None) -> np.ndarray:
        """Return deterministic demo frames in the expected 5D tensor layout.

        `raw_data_path` accepts either a 5D radar tensor or one of the saved
        per-frame dictionaries. The demo endpoint uses the bundled sequence.
        No trained forecast model is run here.
        """
        if raw_data_path is None:
            return self.input_tensor.copy()

        loaded = np.load(raw_data_path, allow_pickle=True)
        if loaded.shape == () and isinstance(loaded.item(), dict):
            frame = loaded.item()
            tensor = self.build_context_tensor([{"radar_dbz": np.asarray(frame["radar_dbz"], dtype=np.float32)}])
            return tensor
        values = np.asarray(loaded, dtype=np.float32)
        if values.ndim != 5:
            raise ValueError("raw_data_path must contain a [B,T,C,H,W] radar tensor")
        return values

    def extract_storm_cells(self, frame: np.ndarray) -> list[dict]:
        """Extract >40 dBZ contours with geometry and physical-unit metadata."""
        frame_np = np.asarray(frame, dtype=np.float32).squeeze()
        if frame_np.ndim != 2 or not np.isfinite(frame_np).all():
            raise ValueError("A radar frame must be a finite [Height, Width] array")

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
            })
        return cells

    def pixel_to_lonlat(self, x: float, y: float) -> list[float]:
        """Map the 1 km synthetic grid east/south from its northwest origin."""
        lon = self.origin_lon + x * self.deg_per_pixel_lon
        lat = self.origin_lat - y * self.deg_per_pixel_lat
        return [float(lon), float(lat)]

    def match_and_classify_cells(self, frames_tensor: np.ndarray) -> dict[int, dict]:
        """Track contour centroids between frames using Hungarian assignment."""
        # The synthetic tracks approach and merge; allow a larger centroid jump
        # at a merge/split while still preventing matches across the full grid.
        max_match_distance_px = 60.0
        values = np.asarray(frames_tensor, dtype=np.float32)
        if values.ndim == 5:
            if values.shape[0] != 1 or values.shape[2] != 1:
                raise ValueError("Expected radar tensor layout [1, Time, 1, Height, Width]")
            frames = values[0, :, 0]
        elif values.ndim == 4:
            if values.shape[1] != 1:
                raise ValueError("Expected frame layout [Time, 1, Height, Width]")
            frames = values[:, 0]
        elif values.ndim == 3:
            frames = values
        else:
            raise ValueError("Expected [B,T,C,H,W], [T,C,H,W], or [T,H,W] input")

        tracks: dict[int, dict] = {}
        previous: list[dict] = []
        next_id = 0

        for frame_index, frame in enumerate(frames):
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
                    if cost[row, col] > max_match_distance_px:
                        continue
                    prior = previous[row]
                    cell = current[col]
                    cell["id"] = prior["id"]
                    px, py = prior["centroid"]
                    cx, cy = cell["centroid"]
                    cell["velocity"] = (cx - px, cy - py)
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
                    next_id += 1
                self._classify_hazard(cell)
                prior_track = tracks.get(cell["id"])
                history = list(prior_track["history"]) if prior_track else []
                history.append({"frame": frame_index, "position": cell["position"], "max_dbz": cell["max_dbz"], "area_km2": cell["area_km2"]})
                cell["history"] = history
                cell["first_seen_frame"] = prior_track["first_seen_frame"] if prior_track else frame_index
                cell["last_seen_frame"] = frame_index
                tracks[cell["id"]] = cell

            previous = current

        return tracks

    def _classify_hazard(self, cell: dict) -> None:
        if cell["area_km2"] < 20.0 and cell["max_dbz"] > 55.0:
            cell["hazard_type"] = "Cloudburst"
            cell["severity"] = "HIGH"
        else:
            cell["hazard_type"] = "Thunderstorm"
            cell["severity"] = "MODERATE"
