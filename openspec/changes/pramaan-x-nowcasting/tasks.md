# Tasks

## 1. Backend: Setup & Mock Generation

- [ ] 1.1 Implement `backend/generate_mock.py` to create numpy arrays matching `[Batch, Time, Channel, Height, Width]` simulating SEVIR radar outputs and verify `.npy` files are generated correctly.

## 2. Backend: Engine & Object Tracking

- [ ] 2.1 Refactor `backend/engine.py` to ingest numpy arrays and extract storm contours using `cv2.findContours` (threshold 40 dBZ). Verify that contours with valid centroids and area are returned.
- [ ] 2.2 Implement Hungarian matching (`scipy.optimize.linear_sum_assignment`) in the engine to track storm objects frame-over-frame and compute `(u, v)` velocity vectors. Verify by passing two consecutive frames and confirming non-zero velocity output.
- [ ] 2.3 Implement hazard classification logic (Cloudburst/Thunderstorm) and verify that a high-intensity, small-area storm is flagged as a Cloudburst.

## 3. Backend: FastAPI Endpoint Integration

- [ ] 3.1 Update `backend/main.py` to expose `/api/nowcast/live` returning valid RFC 7946 GeoJSON incorporating the engine's tracking polygons and `eta_utc`. Verify with a curl request to ensure valid JSON output.
- [ ] 3.2 Implement `/api/kill-radar` endpoint that toggles sensor state and multiplies GeoJSON polygon bounds by 2.5x. Verify by polling `/api/nowcast/live` before and after calling the kill switch to confirm expanded bounds.

## 4. Frontend: GIS Dashboard

- [ ] 4.1 Set up React component `MapDashboard.jsx` using `maplibre-gl` to poll `/api/nowcast/live` every 2 seconds. Verify that the network tab shows consistent successful polling.
- [ ] 4.2 Map the GeoJSON feature classes to distinct colors (solid yellow for Thunderstorm, pulsing red for Cloudburst) in MapLibre layers. Verify visual rendering in the browser.
- [ ] 4.3 Implement `onClick` interaction on storm polygons to render a Tailwind-styled modal containing a live MM:SS countdown parsed from `eta_utc`. Verify that clicking a storm displays a counting-down timer.
