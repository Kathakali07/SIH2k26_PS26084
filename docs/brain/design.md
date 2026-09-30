# ClimaX System Design

## Overview
ClimaX is a real-time convective-scale weather nowcasting prototype. It integrates a pre-trained SOTA Earthformer backbone with deterministic OpenCV tracking to predict and track extreme weather events (Thunderstorms, Cloudbursts).

## Architecture

### 1. ML & Physics Engine ([[engine]])
- **Input Tensor**: `[Batch, Time, Channel, Height, Width]` (e.g., `[1, 13, 1, 384, 384]`).
  - Context: 65 minutes of Radar VIL.
- **Output Tensor**: 60-minute forecast (12 future frames).
- **Processing**:
  - The output tensor is converted to a NumPy array.
  - OpenCV (`cv2.findContours`) isolates storm cells exceeding 40 dBZ.
- **Object Tracking**:
  - Calculates centroid, bounding box, and area.
  - Matches frames using the Hungarian algorithm (`scipy.optimize.linear_sum_assignment`) based on Euclidean distance to establish velocity vectors $(u, v)$.
- **Hazard Thresholding**:
  - **Cloudburst**: Area $< 20\text{km}^2$ AND max intensity $> 55$ dBZ.
  - **Thunderstorm**: max intensity $> 40$ dBZ.

### 2. FastAPI Backend ([[main]])
- **Data Contract**: Strictly adheres to RFC 7946 GeoJSON.
- **Endpoints**:
  - `/api/nowcast/live`: Runs the inference engine on sample SEVIR `.npy` arrays, extracts contours, and streams a `FeatureCollection` of Polygons. Properties include `hazard_type`, `severity`, and an absolute `eta_utc` timestamp calculated via velocity vectors.
  - `/api/kill-radar`: Simulates sensor failure. Multiplies the spatial bounds of the GeoJSON polygons by $2.5\times$ to increase visual uncertainty.

### 3. Frontend GIS Dashboard ([[frontend]])
- **Stack**: Next.js/Vite React, MapLibre GL JS, Tailwind CSS.
- **Map Config**: Dark-mode TopoJSON basemap.
- **Rendering**: 
  - Polls `/api/nowcast/live` inside a `useEffect` loop.
  - Uses MapLibre `GeoJSONSource` and `Layer`.
  - Styles: Cloudbursts = pulsing red polygons, Thunderstorms = solid yellow.
- **Interactivity**: 
  - `onClick` event on hazard polygons opens a Tailwind-styled modal.
  - Parses `eta_utc` against `Date.now()` to render a live MM:SS countdown clock.
