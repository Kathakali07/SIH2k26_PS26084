# Design: Init PRAMAAN-X Architecture

## Context
We are implementing the PRAMAAN-X convective-scale nowcasting prototype. The system must process ML tensor predictions into vector geometries and stream them to a web client with strict performance requirements and observability fallbacks. See [[Earthformer_Spec]] for mathematical context.

## Flow Architecture (PyTorch -> OpenCV -> FastAPI -> MapLibre)

### 1. PyTorch / ML Inference (Local RTX 3050 Ti)
- **Data Ingestion**: The backend will include a data loader to ingest *raw weather data* (e.g., radar/satellite sweeps) provided by the user and preprocess it into the 65-minute context tensor `[Batch, 13, Channel, Height, Width]`.
- **Local Inference**: The local Earthformer model (loaded from `.ckpt`) processes this context tensor on the RTX 3050 Ti GPU to generate a 60-minute forecast tensor `[Batch, 12, Channel, Height, Width]`.
- **Output**: The predicted tensor is converted to a standard NumPy array for downstream OpenCV processing.

### 2. OpenCV Object Tracking Layer (`engine.py`)
- **Isolation**: NumPy arrays are masked at $> 40\text{ dBZ}$. `cv2.findContours` builds closed polygon coordinates.
- **Matching**: `scipy.optimize.linear_sum_assignment` uses Euclidean centroid distances across the `Time` dimension (12 frames) to identify discrete storm objects.
- **Velocity**: Extracted $(u,v)$ values allow the engine to generate an absolute `eta_utc` timestamp for impending impact.

### 3. FastAPI Transport Layer (`main.py`)
- **Mapping**: Converts Python dictionaries/lists into standard RFC 7946 GeoJSON.
- **Streaming**: Exposes `/api/nowcast/live` for continuous client polling.
- **Observability**: Implements `/api/kill-radar` which dynamically inflates polygon coordinates by $2.5\times$ to represent sensor-loss uncertainty. See [[API_Contract]].

### 4. MapLibre GIS Dashboard (Frontend Teammate Hand-off)
- **Delegation**: The backend agent will NOT implement the React frontend. Instead, the agent will author a comprehensive integration guide and API contract for the frontend teammate.
- **Consumption**: The teammate's React client will use `useEffect` to poll FastAPI.
- **Rendering**: Updates the MapLibre `GeoJSONSource`. Cloudbursts pulse red, Thunderstorms display solid yellow.
- **Interactivity**: Clicking features triggers modal logic parsing `eta_utc` into a ticking UI clock. See [[Frontend_State]].

## Risks / Trade-offs
- **Risk**: GeoJSON blob size becomes too large for 2-second polling intervals.
- **Mitigation**: Implement `cv2.CHAIN_APPROX_SIMPLE` during contour extraction to aggressively downsample polygon vertex counts without losing macro-shape accuracy.

## Indian Contextualization (SIH Relevance)
To ensure the prototype addresses the Indian SIH problem statement effectively:
- **Meteorological Target**: While Amphan and Aila are massive tropical cyclones (synoptic scale, 3-7 days), this problem statement specifically targets **convective-scale extreme weather (0-6 hours)**. Therefore, the prototype will simulate a **Kalbaishakhi (Nor'wester)**—a rapidly developing, severe pre-monsoon thunderstorm common in Eastern India and Bangladesh. It perfectly fits the "rapid development in minutes" description.
- **Real Inference Calibration**: The PyTorch inference pipeline will run locally on an RTX 3050 Ti, mapping the $384 \times 384$ output tensor grid to the exact lat/lon bounds of West Bengal and Odisha (e.g., origin near `22.5726° N, 88.3639° E` for Kolkata) to track Kalbaishakhi trajectories.
- **GIS Mapping**: The frontend teammate will restrict `maxBounds` to the Indian subcontinent (`[68.7, 8.4, 97.2, 37.6]`) and overlay a public Indian States TopoJSON boundary layer.
