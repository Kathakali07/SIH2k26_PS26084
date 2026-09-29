import numpy as np
from datasets import load_dataset
import torch

print("Connecting to Hugging Face to stream real UK Met Office radar data...")

# Load in streaming mode so we don't download Terabytes of data
try:
    dataset = load_dataset("openclimatefix/nimrod-uk-1km", split="train", streaming=True)
    
    # Grab the very first real storm event from the dataset
    real_event = next(iter(dataset))
    
    print("\nSuccessfully downloaded a real radar event!")
    print(f"Data keys available: {real_event.keys()}")
    
    # We don't know the exact key name, so we print it out
    for key, value in real_event.items():
        if isinstance(value, list) or isinstance(value, np.ndarray):
            arr = np.array(value)
            print(f"Array '{key}': Shape {arr.shape}")
except Exception as e:
    print(f"Failed to stream dataset: {e}")
