import numpy as np
import os
import cv2

def generate_mock_data(output_dir, num_frames=20):
    os.makedirs(output_dir, exist_ok=True)
    
    # Grid size (e.g. 500x500 km at 1km res)
    grid_shape = (500, 500)
    
    # We will simulate a couple of storm cells moving.
    # Cell 1: Starts at (100, 100), moves right and down, grows
    # Cell 2: Starts at (400, 150), moves left and down
    
    cell1_pos = [100.0, 100.0]
    cell1_vel = [10.0, 5.0]
    cell1_radius = 20.0
    cell1_intensity = 45.0 # dBZ
    
    cell2_pos = [400.0, 150.0]
    cell2_vel = [-8.0, 6.0]
    cell2_radius = 15.0
    cell2_intensity = 35.0 # dBZ
    
    for i in range(num_frames):
        # Create empty radar and IR grids
        radar_dbz = np.zeros(grid_shape, dtype=np.float32)
        ir_temp = np.full(grid_shape, 290.0, dtype=np.float32) # Background temp 290K
        vil = np.zeros(grid_shape, dtype=np.float32)
        
        # Draw Cell 1
        cv2.circle(radar_dbz, (int(cell1_pos[0]), int(cell1_pos[1])), int(cell1_radius), cell1_intensity, -1)
        # Apply Gaussian blur for realistic look
        radar_dbz = cv2.GaussianBlur(radar_dbz, (15, 15), 5)
        
        # Draw Cell 2
        cv2.circle(radar_dbz, (int(cell2_pos[0]), int(cell2_pos[1])), int(cell2_radius), cell2_intensity, -1)
        
        # IR Temp drops where there are storms (colder cloud tops)
        ir_temp[radar_dbz > 10] = 220.0 
        
        # VIL roughly correlates with dBZ
        vil = radar_dbz * 0.5
        
        # Update positions
        cell1_pos[0] += cell1_vel[0]
        cell1_pos[1] += cell1_vel[1]
        
        # Cell 1 intensifies and grows
        cell1_intensity += 1.0
        cell1_radius += 1.0
        
        # Cell 2 intensifies rapidly (CI / Rapid intensification demo)
        if i > 5:
            cell2_intensity += 3.0
            cell2_radius += 2.0
            
        cell2_pos[0] += cell2_vel[0]
        cell2_pos[1] += cell2_vel[1]
        
        # Save frame
        frame_data = {
            'radar_dbz': radar_dbz,
            'ir_temp': ir_temp,
            'vil': vil
        }
        np.save(os.path.join(output_dir, f'frame_{i:03d}.npy'), frame_data)
        
    print(f"Generated {num_frames} mock frames in {output_dir}")

if __name__ == '__main__':
    generate_mock_data('../data/mock_frames')
