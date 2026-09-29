import os
import glob
from PIL import Image
import torch
import numpy as np
import scipy.ndimage as ndimage
from engine import NowcastEngine, DGMRInferenceEngine

def load_pysteps_real_data(shape=(1, 20, 1, 500, 500)):
    print("Loading actual Swiss radar data from PySTEPS...")
    data_dir = os.path.join(
        "real_radar_data", "pysteps-data-master", "radar", "mch", "20160711"
    )
    
    # Check if we have files
    gif_files = sorted(glob.glob(os.path.join(data_dir, "*.gif")))
    if len(gif_files) == 0:
        raise FileNotFoundError(f"Could not find .gif files in {data_dir}")
        
    print(f"Found {len(gif_files)} real radar frames. Loading the first {shape[1]}...")
    
    tensor = np.zeros(shape, dtype=np.float32)
    for t in range(min(shape[1], len(gif_files))):
        # Read the 8-bit GIF image
        img = Image.open(gif_files[t]).convert('L')
        # Resize to match our expected shape (500x500)
        img = img.resize((shape[4], shape[3]), Image.NEAREST)
        arr = np.array(img, dtype=np.float32)
        
        # DGMR expects rain rate in mm/hr, roughly [0, 1] range
        # Just normalize the 8-bit GIF pixel values
        rain_rate = arr / 255.0
        
        tensor[0, t, 0] = rain_rate
        
    return tensor

def run_dgmr_test():
    print("=== PRAMAAN-X DGMR Real Data Test ===")
    
    print("Loading base engine...")
    base_engine = NowcastEngine()
    
    # Load the REAL Swiss data!
    context_tensor = load_pysteps_real_data()
    base_engine.input_tensor = context_tensor
    print(f"Real Data Context Tensor Shape: {context_tensor.shape}")
    
    print("\nTriggering DeepMind DGMR Inference...")
    future_tensor = base_engine.ingest_and_predict(use_dgmr=True)
    
    print(f"\nDGMR Output Tensor Shape: {future_tensor.shape}")
    
    print("\nTracking objects in the DGMR AI future forecast...")
    tracks = base_engine.match_and_classify_cells(future_tensor)
    
    print(f"\nFound {len(tracks)} tracked storm cells across the forecasted future!")
    
    for sid, storm in list(tracks.items())[:3]:
        print(f"\n--- Storm {sid} ---")
        print(f"Hazard: {storm.get('hazard_type')} ({storm.get('severity')})")
        print(f"Max dBZ: {storm.get('max_dbz', 0):.1f}")
        print(f"Area: {storm.get('area_km2', 0):.1f} km²")
        if "velocity" in storm:
            print(f"Velocity Vector: {storm['velocity']}")
            
if __name__ == "__main__":
    run_dgmr_test()
