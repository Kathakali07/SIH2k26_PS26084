import torch
import torch.nn as nn
import numpy as np
import cv2
import os

class EarthformerStub(nn.Module):
    """
    A stub representing the Earthformer Cuboid Transformer.
    In the real environment, this would be:
    from earthformer.cuboid_transformer.cuboid_transformer import CuboidTransformerModel
    """
    def __init__(self):
        super().__init__()
        # Dummy layer to register a parameter so we can test device movement
        self.dummy_param = nn.Parameter(torch.zeros(1))

    def forward(self, x):
        """
        x shape: [Batch, Time_in, Channel, Height, Width]
        Returns: [Batch, Time_out, Channel, Height, Width]
        """
        # For the hackathon prototype, if we don't have the real heavy inference running,
        # we simulate the output tensor (12 future frames) based on the input shape.
        b, t_in, c, h, w = x.shape
        t_out = 12 # 60-minute forecast at 5-minute intervals
        
        # We simulate the prediction. In reality, the Transformer generates this.
        # Here we just generate random noise centered around a moving storm cell.
        out = torch.rand((b, t_out, c, h, w), device=x.device) * 20.0
        return out


class NowcastEngine:
    def __init__(self, checkpoint_path="earthformer_sevir.ckpt"):
        """
        Task 1.1: Earthformer Model Loading
        Loads the Earthformer Cuboid Transformer architecture onto the RTX 3050 Ti GPU (cuda).
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Initializing Earthformer on device: {self.device}")
        
        # Initialize model
        self.model = EarthformerStub().to(self.device)
        
        # If a real checkpoint exists, load it.
        if os.path.exists(checkpoint_path):
            try:
                # Load weights. We use map_location to ensure it targets our specific device.
                checkpoint = torch.load(checkpoint_path, map_location=self.device)
                self.model.load_state_dict(checkpoint['state_dict'])
                print("Loaded Earthformer checkpoint successfully.")
            except Exception as e:
                print(f"Failed to load checkpoint, falling back to initialized weights: {e}")
        else:
            print(f"No checkpoint found at {checkpoint_path}. Using initialized stub for testing.")
            
        self.model.eval()

        # Task 1.2: Geo-Calibration
        # We calibrate the origin of the 384x384 output grid to Indian coordinates 
        # (Kolkata: 22.5726° N, 88.3639° E) for Kalbaishakhi tracking.
        # Assuming a spatial resolution of 2km per pixel.
        self.origin_lat = 22.5726
        self.origin_lon = 88.3639
        self.km_per_pixel = 2.0
        # Roughly 1 degree of latitude is ~111 km. 
        # Longitude varies, but at 22° N, cos(22°) ~ 0.927, so 1 degree lon is ~103 km.
        self.deg_per_pixel_lat = self.km_per_pixel / 111.0
        self.deg_per_pixel_lon = self.km_per_pixel / 103.0

    def ingest_and_predict(self, raw_data_path=None):
        """
        Task 1.2: Raw Data Ingestion & Inference
        Parses raw weather data into a 65-minute context tensor and runs the forward pass.
        """
        # In a production environment, we would parse IMD/INSAT raw sweeps here.
        # For this prototype test, we simulate the parsed input tensor if no file is provided.
        # Shape requirement: [Batch, 13 (65 mins), Channel (1), Height (384), Width (384)]
        if raw_data_path and os.path.exists(raw_data_path):
            # Load from numpy array saved from preprocessing pipeline
            data_np = np.load(raw_data_path)
            input_tensor = torch.tensor(data_np, dtype=torch.float32)
        else:
            print("Simulating raw weather data ingestion...")
            input_tensor = torch.rand((1, 13, 1, 384, 384), dtype=torch.float32) * 50.0 # simulate dBZ values
        
        # Move tensor to RTX 3050 Ti (cuda)
        input_tensor = input_tensor.to(self.device)
        
        print(f"Running inference on input tensor of shape: {input_tensor.shape}")
        
        # Disable gradient calculation for faster inference
        with torch.no_grad():
            prediction_tensor = self.model(input_tensor)
            
        print(f"Prediction output shape: {prediction_tensor.shape}")
        return prediction_tensor
        
    def extract_storm_cells(self, frame_tensor):
        """
        Task 1.3: Object Tracking (Contour Extraction)
        Converts the PyTorch tensor to a NumPy array and uses cv2.findContours
        to isolate storm cells > 40 dBZ.
        """
        # Convert single frame [C, H, W] to numpy array [H, W]
        # Frame tensor shape expected: [1, 384, 384]
        frame_np = frame_tensor.squeeze().cpu().numpy()
        
        # Threshold at 40 dBZ
        _, mask = cv2.threshold(frame_np, 40.0, 255, cv2.THRESH_BINARY)
        mask = mask.astype(np.uint8)
        
        # Extract contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        cells = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < 1.0: # Filter out noise
                continue
            
            # Compute centroid using image moments
            M = cv2.moments(cnt)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx, cy = 0, 0
                
            # Get max intensity inside this contour using a mask for this specific contour
            cell_mask = np.zeros_like(mask)
            cv2.drawContours(cell_mask, [cnt], 0, 255, -1)
            max_intensity = np.max(frame_np[cell_mask == 255])
            
            x, y, w, h = cv2.boundingRect(cnt)
            
            cells.append({
                "centroid": (cx, cy),
                "bbox": (x, y, w, h),
                "area_px": area,
                "area_km2": area * (self.km_per_pixel ** 2), # convert pixel area to km^2
                "max_dbz": max_intensity,
                "contour": cnt.tolist()
            })
            
        return cells

    def match_and_classify_cells(self, frames_tensor):
        """
        Task 1.4: Frame-over-Frame Matching
        Task 1.5: Velocity Extraction & Hazard Classification
        """
        import scipy.optimize as opt
        
        # frames_tensor shape expected: [12, 1, 384, 384] (after removing batch dim)
        frames_tensor = frames_tensor.squeeze(0) # -> [12, 1, 384, 384]
        
        tracked_objects = {}
        next_object_id = 0
        
        # We will process each frame and match with the previous frame
        prev_cells = []
        
        for t in range(frames_tensor.shape[0]):
            current_cells = self.extract_storm_cells(frames_tensor[t])
            
            if t == 0:
                # Initialize tracked objects
                for cell in current_cells:
                    cell["id"] = next_object_id
                    cell["velocity"] = (0, 0)
                    self._classify_hazard(cell)
                    tracked_objects[next_object_id] = cell
                    next_object_id += 1
                prev_cells = current_cells
                continue
            
            if len(prev_cells) == 0 or len(current_cells) == 0:
                # No matches possible
                for cell in current_cells:
                    cell["id"] = next_object_id
                    cell["velocity"] = (0, 0)
                    self._classify_hazard(cell)
                    next_object_id += 1
                prev_cells = current_cells
                continue
                
            # Compute distance matrix for Hungarian algorithm
            cost_matrix = np.zeros((len(prev_cells), len(current_cells)))
            for i, p_cell in enumerate(prev_cells):
                for j, c_cell in enumerate(current_cells):
                    px, py = p_cell["centroid"]
                    cx, cy = c_cell["centroid"]
                    # Euclidean distance
                    cost_matrix[i, j] = np.sqrt((px - cx)**2 + (py - cy)**2)
                    
            # Hungarian matching (minimize total distance)
            row_ind, col_ind = opt.linear_sum_assignment(cost_matrix)
            
            # Distance threshold to prevent matching cells that are too far apart
            MAX_DISTANCE = 30.0 # max pixels a storm can move in 5 mins
            
            assigned_current = set()
            for r, c in zip(row_ind, col_ind):
                if cost_matrix[r, c] < MAX_DISTANCE:
                    # Match found
                    matched_cell = current_cells[c]
                    matched_cell["id"] = prev_cells[r]["id"]
                    
                    # Compute velocity (u, v) in pixels per frame
                    px, py = prev_cells[r]["centroid"]
                    cx, cy = matched_cell["centroid"]
                    matched_cell["velocity"] = (cx - px, cy - py)
                    
                    self._classify_hazard(matched_cell)
                    # Update tracked state with latest frame info
                    tracked_objects[matched_cell["id"]] = matched_cell
                    assigned_current.add(c)
                    
            # Handle new cells that weren't matched
            for c, cell in enumerate(current_cells):
                if c not in assigned_current:
                    cell["id"] = next_object_id
                    cell["velocity"] = (0, 0)
                    self._classify_hazard(cell)
                    tracked_objects[next_object_id] = cell
                    next_object_id += 1
                    
            prev_cells = current_cells
            
        return tracked_objects
        
    def _classify_hazard(self, cell):
        """
        Applies strict thresholding rules for Cloudbursts vs Thunderstorms.
        """
        # Cloudburst: Area < 20 km² AND max intensity > 55 dBZ
        if cell["area_km2"] < 20.0 and cell["max_dbz"] > 55.0:
            cell["hazard_type"] = "Cloudburst"
            cell["severity"] = "HIGH"
        # Thunderstorm: max intensity > 40 dBZ (already filtered by 40 dBZ contour)
        else:
            cell["hazard_type"] = "Thunderstorm"
            cell["severity"] = "MODERATE"

if __name__ == "__main__":
    # Local verification block for Tasks 1.1 to 1.5
    engine = NowcastEngine()
    output_tensor = engine.ingest_and_predict()
    
    print("Testing contour extraction and Hungarian matching...")
    tracked_storms = engine.match_and_classify_cells(output_tensor)
    
    print(f"Found {len(tracked_storms)} distinct storm objects across the forecast.")
    for sid, storm in list(tracked_storms.items())[:3]:
        print(f"Storm {sid}: {storm['hazard_type']} ({storm['severity']}), "
              f"Max dBZ: {storm['max_dbz']:.1f}, Area: {storm['area_km2']:.1f} km², "
              f"Velocity: {storm['velocity']}")
