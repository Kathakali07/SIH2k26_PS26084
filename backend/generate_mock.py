"""Create deterministic synthetic radar/IR/VIL frames for local demos."""

from __future__ import annotations

import argparse
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
        np.save(path, {"radar_dbz": radar_dbz, "ir_temp": ir_temp, "vil": vil})
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
        item = np.load(path, allow_pickle=True).item()
        if not isinstance(item, dict) or "radar_dbz" not in item:
            raise ValueError(f"Invalid synthetic frame: {path}")
        frames.append({key: np.asarray(value, dtype=np.float32) for key, value in item.items()})
    if not frames:
        raise FileNotFoundError(f"No frame_*.npy files found under {input_dir}")
    return frames


def build_sevir_tensor(frames: list[dict[str, np.ndarray]]) -> np.ndarray:
    """Stack radar into [Batch, Time, Channel, Height, Width]."""
    radar = np.stack([frame["radar_dbz"] for frame in frames], axis=0)
    if radar.ndim != 3:
        raise ValueError("Each radar frame must be [Height, Width]")
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
