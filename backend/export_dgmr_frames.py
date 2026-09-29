"""Export DGMR sequence (context + future) to data/mock_frames for deployment."""
import os
import shutil
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta, timezone

from engine import NowcastEngine, DGMRInferenceEngine
from run_dgmr_inference import load_pysteps_real_data

def export_frames():
    ROOT = Path(__file__).resolve().parent.parent
    OUTPUT_DIR = ROOT / "data" / "mock_frames"
    
    print(f"Exporting DGMR frames to {OUTPUT_DIR}")
    
    # 1. Get DGMR output
    print("Loading base engine and real context...")
    base_engine = NowcastEngine()
    context_tensor = load_pysteps_real_data()
    base_engine.input_tensor = context_tensor
    
    # 2. Clear old mock frames
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("Running DGMR AI Inference...")
    future_tensor = base_engine.ingest_and_predict(use_dgmr=True)
    
    # 3. Concatenate context and future
    # context is [1, 20, 1, 500, 500], future is [1, 18, 1, 500, 500]
    full_sequence = np.concatenate([context_tensor, future_tensor], axis=1)
    
    # Extract the actual 3D array: [Time, Height, Width]
    frames = full_sequence[0, :, 0, :, :]
    
    print(f"Full sequence shape: {frames.shape}")
    
    # 4. Save each frame as frame_XXX.npy
    start_time = datetime(2026, 7, 11, 12, 0, tzinfo=timezone.utc)
    for i in range(frames.shape[0]):
        radar_dbz = frames[i]
        path = OUTPUT_DIR / f"frame_{i:03d}.npy"
        timestamp = start_time + timedelta(minutes=5 * i)
        
        # We save radar_dbz. (engine.py handles missing ir_temp/vil)
        np.save(path, {
            "radar_dbz": radar_dbz,
            "timestamp_utc": timestamp.isoformat(timespec="seconds").replace("+00:00", "Z"),
        })
    
    print(f"Successfully exported {frames.shape[0]} frames to {OUTPUT_DIR}")

if __name__ == "__main__":
    export_frames()
