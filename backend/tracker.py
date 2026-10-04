import cv2
import numpy as np

def extract_storm_cells(radar_dbz, threshold=40.0):
    """
    Extract contours from radar dBZ array where intensity > threshold.
    Returns list of dicts with cell properties.
    """
    # Create binary mask
    mask = np.zeros_like(radar_dbz, dtype=np.uint8)
    mask[radar_dbz >= threshold] = 255
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    cells = []
    for i, contour in enumerate(contours):
        area = cv2.contourArea(contour)
        if area < 10: # Minimum area filter
            continue
            
        M = cv2.moments(contour)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
        else:
            cx, cy = 0, 0
            
        x, y, w, h = cv2.boundingRect(contour)
        
        # Max dBZ in this contour
        contour_mask = np.zeros_like(mask)
        cv2.drawContours(contour_mask, [contour], -1, 255, -1)
        max_dbz = np.max(radar_dbz[contour_mask == 255]) if np.any(contour_mask == 255) else 0
        
        # Grid coordinate projection: 1 pixel represents ~1.0 km
        # Geographic origin coordinates for radar domain mapping
        base_lon = 88.3639
        base_lat = 22.5726
        
        # Approximate degree scaling per grid unit
        lon = base_lon + (cx * 0.009)
        lat = base_lat - (cy * 0.009)
        
        # Convert contour to geo-coordinates
        geo_contour = []
        for point in contour:
            px, py = point[0]
            plon = base_lon + (px * 0.009)
            plat = base_lat - (py * 0.009)
            geo_contour.append([plon, plat])
            
        # Ensure polygon is closed for GeoJSON
        if geo_contour:
            geo_contour.append(geo_contour[0])
            
        cells.append({
            "id": i,
            "cx": cx,
            "cy": cy,
            "lon": lon,
            "lat": lat,
            "area_km2": float(area),
            "max_dbz": float(max_dbz),
            "bbox": [int(x), int(y), int(w), int(h)],
            "polygon": geo_contour
        })
        
    return cells

def generate_future_polygons(cell, velocity_vector, num_steps=3, spread_factor=0.01):
    """
    Generates uncertainty polygons (Multiple Futures) based on velocity.
    """
    polygons = []
    current_poly = np.array(cell["polygon"])
    
    vx, vy = velocity_vector # in degrees per step
    
    for step in range(1, num_steps + 1):
        # Translate polygon
        next_poly = current_poly.copy()
        next_poly[:, 0] += vx * step
        next_poly[:, 1] += vy * step
        
        # Expand polygon for uncertainty (Gaussian spread simulation)
        # Find centroid of next_poly
        cx = np.mean(next_poly[:, 0])
        cy = np.mean(next_poly[:, 1])
        
        # Scale points outwards from centroid
        scale = 1.0 + (spread_factor * step)
        next_poly[:, 0] = cx + (next_poly[:, 0] - cx) * scale
        next_poly[:, 1] = cy + (next_poly[:, 1] - cy) * scale
        
        polygons.append(next_poly.tolist())
        
    return polygons
