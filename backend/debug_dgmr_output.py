"""Debug script: What is DGMR actually outputting?"""
import os, glob, torch, numpy as np
from PIL import Image

# Load real Swiss radar data (no amplification, just raw pixel->dBZ)
data_dir = os.path.join("real_radar_data", "pysteps-data-master", "radar", "mch", "20160711")
gif_files = sorted(glob.glob(os.path.join(data_dir, "*.gif")))
print(f"Found {len(gif_files)} real radar frames")

tensor = np.zeros((1, 4, 1, 256, 256), dtype=np.float32)
for t in range(4):
    img = Image.open(gif_files[t]).convert('L')
    img = img.resize((256, 256), Image.NEAREST)
    arr = np.array(img, dtype=np.float32)
    # Simple linear map: 0-255 -> 0-1 (what DGMR actually expects as rain rate mm/hr)
    tensor[0, t, 0] = arr / 255.0

print(f"\n=== INPUT TENSOR ===")
print(f"Shape: {tensor.shape}")
print(f"Min: {tensor.min():.6f}, Max: {tensor.max():.6f}, Mean: {tensor.mean():.6f}")
print(f"Non-zero pixels: {np.count_nonzero(tensor)}/{tensor.size}")

# Load DGMR
from dgmr import DGMR
model = DGMR.from_pretrained("openclimatefix/dgmr")
model.eval()

input_tensor = torch.tensor(tensor, dtype=torch.float32)
print(f"\nInput to model: {input_tensor.shape}")

with torch.no_grad():
    output = model(input_tensor)

output_np = output.cpu().numpy()
print(f"\n=== RAW DGMR OUTPUT ===")
print(f"Shape: {output_np.shape}")
print(f"Min: {output_np.min():.6f}, Max: {output_np.max():.6f}, Mean: {output_np.mean():.6f}")
print(f"Non-zero pixels: {np.count_nonzero(output_np)}/{output_np.size}")

# Check each future frame
for t in range(output_np.shape[1]):
    frame = output_np[0, t, 0]
    print(f"  Frame {t:2d}: min={frame.min():.6f}, max={frame.max():.6f}, mean={frame.mean():.6f}, nonzero={np.count_nonzero(frame)}")
