# Tasks

## 1. Earthformer Inference & Nowcasting Engine

- [ ] 1.1 Implement Earthformer Model Loading: In `backend/engine.py`, write the PyTorch initialization code to load the Earthformer Cuboid Transformer architecture from a local `.ckpt` checkpoint file. Verify by successfully instantiating the model on the RTX 3050 Ti GPU (`cuda`).
- [ ] 1.2 Implement Raw Data Ingestion & Inference: Write a data loader function that parses raw weather data (provided by the user) into the 65-minute context tensor `[Batch, 13, Channel, Height, Width]`. Run the PyTorch forward pass locally to output the 60-minute prediction tensor. Calibrate the origin of the $384 \times 384$ output grid to Indian coordinates (`22.5726° N, 88.3639° E` - Kolkata) for Kalbaishakhi tracking. Verify output tensor shapes and mapped coordinate bounds.
- [ ] 1.3 Implement Object Tracking: Convert the predicted PyTorch tensor to a NumPy array and extract storm cell contours using `cv2.findContours` at a $> 40\text{ dBZ}$ threshold. Verify by outputting contour coordinates and properties (centroid, bounding box, area).
- [ ] 1.4 Implement Frame-over-Frame Matching: Use the Hungarian algorithm (`scipy.optimize.linear_sum_assignment`) based on Euclidean distance to associate cell centroids across the 12 forecast frames. Verify stable object IDs across time slices.
- [ ] 1.5 Extract Velocity and Classify Hazards: Compute velocity vectors $(u,v)$ for each tracked object. Apply strict thresholding (`Area < 20 km² AND max dBZ > 55` = Cloudburst). Verify accurate classification of severe cells.

## 2. FastAPI Data Contract

- [ ] 2.1 Refactor `backend/main.py` to serve `/api/nowcast/live`. Ensure it strictly maps the engine's tracking output to RFC 7946 GeoJSON containing `hazard_type`, `severity`, and `eta_utc`. Verify via curl that the response parses as valid GeoJSON.
- [ ] 2.2 Implement `/api/kill-radar` endpoint in `backend/main.py` that multiplies current spatial bounds of polygons by $2.5\times$ and updates ETA intervals. Verify by polling `/api/nowcast/live` pre- and post-activation and comparing polygon areas.

## 3. Frontend Integration Guide (Teammate Hand-off)

- [ ] 3.1 Generate a comprehensive `frontend_integration_guide.md` artifact detailing the exact API contracts, MapLibre layer initialization logic (including the `maxBounds` for India `[68.7, 8.4, 97.2, 37.6]`), and polling loops required to connect to the FastAPI backend. Verify by ensuring the guide is complete and ready to be handed off to the frontend teammate.
