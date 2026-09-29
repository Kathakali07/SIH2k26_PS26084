from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
from datetime import datetime, timedelta, timezone
from engine import NowcastEngine

app = FastAPI(title="PRAMAAN-X Backend (Real Inference)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SystemState:
    def __init__(self):
        self.radar_active = True
        # Initialize the actual ML engine
        self.engine = NowcastEngine()

state = SystemState()

@app.post("/api/kill-radar")
def kill_radar():
    """
    Task 2.2: Toggle sensor state and expand bounds.
    """
    state.radar_active = not state.radar_active
    status_msg = "Radar Offline (IR Fallback Mode). Uncertainty bounds expanded 2.5x." if not state.radar_active else "Radar Online."
    return {"radar_active": state.radar_active, "message": status_msg}

@app.get("/api/nowcast/live")
def get_live_data():
    """
    Task 2.1: Endpoint serving GeoJSON from local PyTorch inference.
    """
    # 1. Run local RTX 3050 Ti inference
    # In production, we'd pass the path to the newest raw weather data sweep here.
    prediction_tensor = state.engine.ingest_and_predict()
    
    # 2. Extract and match storm cells frame-over-frame
    tracked_storms = state.engine.match_and_classify_cells(prediction_tensor)
    
    # 3. Format as RFC 7946 GeoJSON
    features = []
    
    # Base timestamp (now) to compute eta_utc
    now_utc = datetime.now(timezone.utc)
    
    for sid, storm in tracked_storms.items():
        # Polygon geometry from engine
        # We need to map the image (x, y) coordinates to Lat/Lon
        # Origin is Kolkata: 22.5726 N, 88.3639 E
        cx, cy = storm['centroid']
        u, v = storm['velocity']
        
        # Calculate ETA based on velocity magnitude
        # We assume 1 frame = 5 minutes. If velocity is high, it hits sooner.
        # This is a simplification for the hackathon prototype countdown logic.
        speed_px_per_frame = (u**2 + v**2)**0.5
        if speed_px_per_frame > 0:
            # Random mock logic: time to hit a fixed distance / speed
            frames_to_impact = 100.0 / speed_px_per_frame
            eta = now_utc + timedelta(minutes=(frames_to_impact * 5))
        else:
            eta = now_utc + timedelta(minutes=60) # default
            
        eta_str = eta.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # Map pixel contours to lat/lon using calibration (approximate for demo)
        geo_polygon = []
        for point in storm['contour']:
            # contour points are [[x, y]]
            px = point[0][0]
            py = point[0][1]
            
            lon = state.engine.origin_lon + (px * state.engine.deg_per_pixel_lon)
            lat = state.engine.origin_lat + (py * state.engine.deg_per_pixel_lat)
            geo_polygon.append([lon, lat])
            
        # GeoJSON strictly requires the first and last points to be identical
        if len(geo_polygon) > 0 and geo_polygon[0] != geo_polygon[-1]:
            geo_polygon.append(geo_polygon[0])
            
        # Apply uncertainty inflation if radar is dead (Task 2.2)
        if not state.radar_active and len(geo_polygon) > 0:
            # We scale the polygon outward from its centroid by 2.5x (approx 1.58 radius)
            c_lon = state.engine.origin_lon + (cx * state.engine.deg_per_pixel_lon)
            c_lat = state.engine.origin_lat + (cy * state.engine.deg_per_pixel_lat)
            inflated_polygon = []
            for p in geo_polygon:
                new_lon = c_lon + (p[0] - c_lon) * 2.5
                new_lat = c_lat + (p[1] - c_lat) * 2.5
                inflated_polygon.append([new_lon, new_lat])
            geo_polygon = inflated_polygon
            
        if len(geo_polygon) >= 4: # Valid polygon needs at least 4 points (triangle + closed)
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [geo_polygon]
                },
                "properties": {
                    "id": f"storm_cell_{sid}",
                    "hazard_type": storm["hazard_type"],
                    "severity": storm["severity"],
                    "eta_utc": eta_str,
                    "max_dbz": float(storm["max_dbz"]),
                    "area_km2": float(storm["area_km2"]),
                    "velocity_u": float(u),
                    "velocity_v": float(v)
                }
            })
            
    return {
        "type": "FeatureCollection",
        "features": features
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
