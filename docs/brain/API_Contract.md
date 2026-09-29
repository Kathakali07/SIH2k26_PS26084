# API Contract

## Overview
The FastAPI backend acts as the bridge between the [[Earthformer_Spec]] engine and the [[Frontend_State]]. It adheres strictly to RFC 7946 GeoJSON formats.

## Endpoints

### 1. `/api/nowcast/live`
- **Method**: GET
- **Description**: Streams a real-time `FeatureCollection` of Polygons representing current and forecasted storm cells.
- **Payload Schema**:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[lon1, lat1], [lon2, lat2], ...]]
        },
        "properties": {
          "id": "cell_123",
          "hazard_type": "Cloudburst",
          "severity": "HIGH",
          "eta_utc": "2026-09-29T12:45:00Z"
        }
      }
    ]
  }
  ```

### 2. `/api/kill-radar`
- **Method**: POST
- **Description**: Simulates a sensor failure (falling back to Satellite IR).
- **Behavior**: When triggered, the engine artificially multiplies the spatial bounds of the GeoJSON polygons by $2.5\times$ in the `/api/nowcast/live` response. This allows the [[Frontend_State]] to visually demonstrate increased uncertainty to the end-user.
