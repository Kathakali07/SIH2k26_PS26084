# Design

## Context

The backend is built in Python using FastAPI, OpenCV, and SciPy to process predictive tensors. The frontend relies on React, Tailwind, and MapLibre GL JS to parse GeoJSON feature streams. The project leverages pre-computed SEVIR arrays to simulate model inference for the hackathon prototype.

## Goals / Non-Goals

**Goals:**
- Provide a robust mock of the Earthformer model output tensors.
- Establish a zero-latency streaming mechanism between FastAPI and React using GeoJSON.
- Accurately track frame-over-frame storm velocities using OpenCV and Hungarian matching.
- Demonstrate sensor failure gracefully by rendering expanded uncertainty bounds on the UI.

**Non-Goals:**
- Actually training or serving live Earthformer PyTorch model inferences during the hackathon (too slow, prone to crash).
- Implementing precise topographical physics routing for rainfall.

## Decisions

- **Hungarian Algorithm vs. Optical Flow**: We decided to use `scipy.optimize.linear_sum_assignment` (Hungarian matching algorithm) based on Euclidean distance of cell centroids rather than dense optical flow (PySTEPS). It is faster, more deterministic for object tracking (Storm-as-an-Object intelligence), and easier to represent as discrete GeoJSON polygons.
- **FastAPI + Polling vs WebSockets**: We use a standard REST GET endpoint (`/api/nowcast/live`) polled every 2 seconds by React rather than WebSockets. For a hackathon demo, stateless polling is resilient and trivially deployable to platforms like Render/Vercel without connection drops.
- **GeoJSON as Data Contract**: MapLibre GL JS natively consumes GeoJSON. It simplifies transferring arbitrary polygons (and future uncertainty polygons) with nested feature properties over the wire.

## Risks / Trade-offs

- **Risk**: Tensor processing blocking the event loop.
  **Mitigation**: NumPy operations and OpenCV tracking are extremely fast for $500 \times 500$ grids, but we will ensure the `/api/nowcast/live` endpoint stays sub-100ms by skipping complex interpolations.
- **Risk**: GeoJSON payload size getting too large with multiple uncertainty polygons.
  **Mitigation**: Limit prediction steps (`num_steps=3`) and use simplified contours (`cv2.CHAIN_APPROX_SIMPLE`).
