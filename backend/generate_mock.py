"""Create deterministic synthetic radar/IR/VIL frames for local demos."""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT_DIR = ROOT / "data" / "mock_frames"


def generate_mock_data(output_dir: str | Path = DEFAULT_OUTPUT_DIR, num_frames: int = 20) -> list[Path]:
    """Generate frame dictionaries containing synthetic 500x500 fields."""
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    grid_shape = (500, 500)

    cell1_pos = [100.0, 100.0]
    cell1_vel = [10.0, 5.0]
    cell1_radius = 20.0
    cell1_intensity = 45.0

    cell2_pos = [400.0, 150.0]
    cell2_vel = [-8.0, 6.0]
    cell2_radius = 15.0
    cell2_intensity = 35.0

    paths: list[Path] = []
    for i in range(num_frames):
        radar_dbz = np.zeros(grid_shape, dtype=np.float32)
        ir_temp = np.full(grid_shape, 290.0, dtype=np.float32)
        cv2.circle(radar_dbz, tuple(map(int, cell1_pos)), int(cell1_radius), cell1_intensity, -1)
        radar_dbz = cv2.GaussianBlur(radar_dbz, (15, 15), 5)
        cv2.circle(radar_dbz, tuple(map(int, cell2_pos)), int(cell2_radius), cell2_intensity, -1)
        ir_temp[radar_dbz > 10] = 220.0
        vil = radar_dbz * 0.5

        path = output / f"frame_{i:03d}.npy"
        timestamp = datetime(2026, 9, 29, 12, 0, tzinfo=timezone.utc) + timedelta(minutes=5 * i)
        np.save(path, {
            "radar_dbz": radar_dbz,
            "ir_temp": ir_temp,
            "vil": vil,
            "timestamp_utc": timestamp.isoformat(timespec="seconds").replace("+00:00", "Z"),
        })
        paths.append(path)

        cell1_pos[0] += cell1_vel[0]
        cell1_pos[1] += cell1_vel[1]
        cell1_intensity += 1.0
        cell1_radius += 1.0
        if i > 5:
            cell2_intensity += 3.0
            cell2_radius += 2.0
        cell2_pos[0] += cell2_vel[0]
        cell2_pos[1] += cell2_vel[1]

    return paths


def load_mock_frames(input_dir: str | Path = DEFAULT_OUTPUT_DIR) -> list[dict[str, np.ndarray]]:
    """Read frame dictionaries and return validated arrays."""
    frames = []
    for path in sorted(Path(input_dir).glob("frame_*.npy")):
        loaded = np.load(path, allow_pickle=True)
        if loaded.shape != ():
            raise ValueError(f"Invalid frame container: {path}")
        item = loaded.item()
        if not isinstance(item, dict) or "radar_dbz" not in item:
            raise ValueError(f"Invalid synthetic frame: {path}")
        radar = np.asarray(item["radar_dbz"], dtype=np.float32)
        if radar.ndim != 2 or radar.size == 0 or not np.isfinite(radar).all() or np.any((radar < -40) | (radar > 100)):
            raise ValueError(f"Invalid radar_dbz data in {path}")
        frame = {"radar_dbz": radar}
        for key in ("ir_temp", "vil"):
            if key in item:
                values = np.asarray(item[key], dtype=np.float32)
                limits = (150.0, 350.0) if key == "ir_temp" else (0.0, 500.0)
                if values.shape != radar.shape or not np.isfinite(values).all() or np.any((values < limits[0]) | (values > limits[1])):
                    raise ValueError(f"Invalid {key} data in {path}")
                frame[key] = values
        frames.append(frame)
    if not frames:
        raise FileNotFoundError(f"No frame_*.npy files found under {input_dir}")
    return frames


def build_sevir_tensor(frames: list[dict[str, np.ndarray]]) -> np.ndarray:
    """Stack radar into [Batch, Time, Channel, Height, Width]."""
    if not frames:
        raise ValueError("At least one frame is required")
    radar = np.stack([frame["radar_dbz"] for frame in frames], axis=0)
    if radar.ndim != 3 or radar.shape[1] == 0 or radar.shape[2] == 0 or not np.isfinite(radar).all():
        raise ValueError("Frames must be finite, consistently shaped [Height, Width] radar arrays")
    if np.any((radar < -40.0) | (radar > 100.0)):
        raise ValueError("Radar values must be in the supported -40..100 dBZ range")
    return radar[None, :, None, :, :].astype(np.float32, copy=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--num-frames", type=int, default=20)
    parser.add_argument("--write-tensor", action="store_true", help="also save mock_radar_tensor.npy")
    args = parser.parse_args()
    frame_paths = generate_mock_data(args.output_dir, args.num_frames)
    print(f"Generated {len(frame_paths)} synthetic demo frames in {args.output_dir}")
    if args.write_tensor:
        tensor = build_sevir_tensor(load_mock_frames(args.output_dir))
        tensor_path = args.output_dir / "mock_radar_tensor.npy"
        np.save(tensor_path, tensor)
        print(f"Saved tensor {tensor.shape} to {tensor_path}")
