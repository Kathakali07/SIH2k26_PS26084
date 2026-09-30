# Proposal

## Why

We need to build a real-time convective-scale Nowcasting System (0–6 hour lead time) operating at a hyper-local 1–3 km spatial resolution for a 36-hour hackathon prototype (ClimaX). Traditional physics-based models are too computationally slow to simulate rapid developments like severe thunderstorms, hail, downburst winds, and cloudbursts in real-time.

## What Changes

- Implement a pre-trained Earthformer SOTA Backbone (simulated via mock NumPy tensors for the prototype) to predict future Radar VIL/Reflectivity tensors.
- Implement a Deterministic Object-Tracking Strategy using OpenCV (`cv2.findContours`) and the Hungarian matching algorithm (`scipy.optimize.linear_sum_assignment`) to track storm cell movement and compute velocity vectors.
- Expose a FastAPI backend (`/api/nowcast/live`) streaming RFC 7946 GeoJSON.
- Implement a sensor failure fallback endpoint (`/api/kill-radar`) that expands uncertainty polygons ($2.5\times$).
- Build a React + MapLibre GL JS frontend rendering the GeoJSON layers (current cells and future polygons) and displaying live countdowns.

## Capabilities

### New Capabilities
- `nowcasting-engine`: Core inference integration and OpenCV object tracking that translates raw tensor data into trackable storm cells with calculated properties and vectors.
- `radar-fallback`: A resilience mechanism simulating sensor failure that dynamically updates GeoJSON uncertainty geometries and inflates ETA bounds.
- `nowcast-dashboard`: Web UI layer mapping GeoJSON capabilities and providing interactive hazard countdown popups.

### Modified Capabilities
- None.

## Impact

- Overwrites existing boilerplate React app in `frontend/` to integrate MapLibre and Axios.
- Introduces `backend/engine.py` and refactors `backend/main.py` with strict GeoJSON specs and API routes.
- Adds mock SEVIR tensor arrays in `data/` for local testing.
