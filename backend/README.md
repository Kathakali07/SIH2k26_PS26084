# PRAMAAN-X Backend Demo

The backend currently runs a **deterministic synthetic demo sequence** from `../data/mock_frames/`. These files are not live weather observations and the backend does not run trained Earthformer inference.

## Setup and run

From the repository root:

```bash
python -m pip install -r requirements.txt
python backend/main.py
```

The API listens on `http://localhost:8000`.

## API

- `GET /api/health` — health and demo mode.
- `GET /api/scenario` — canonical scenario metadata, current frame, five replay frames, storms, interactions, forecast products/members, hazard summary, sensor/observability status, impacts, events, alert preview, and provenance.
- `GET /api/scenario?frame_index=0` — select a replay frame (`0`–`4`).
- `GET /api/nowcast/live` — GeoJSON FeatureCollection for the current demo frame; also accepts `?frame_index=0`.
- `POST /api/kill-radar` — set radar offline; no body is needed. To restore it directly, send `{"active": true}`.
- `POST /api/reset-demo` — restore initial radar-online state.

The UI scenario source of truth is `backend/scenario_fixture.py`. Storm IDs and frame timestamps are stable. The same selected frame is returned by `/api/scenario` and `/api/nowcast/live`. The fixture contains four evolving storm tracks, two interaction edges, three lead-time products, 16 weighted forecast members, the four hazard categories, impact targets, timestamped scenario events, and an alert preview. Forecast-member weights sum to 1.

All fixture meteorological indicators and probabilities are **simulated**. Motion/growth fields are deterministic calculations from the scenario tracks. Satellite, lightning, and NWP are marked unavailable because no such live feeds are connected. The replay is a synthetic scenario replay, not verified historical replay.

Radar fallback is simulated. No live satellite, lightning, or NWP feed is connected. The ETA is an illustrative demo estimate.

## Regenerate demo frames

```bash
python backend/generate_mock.py --num-frames 20 --write-tensor
```

Per-frame files contain `radar_dbz`, `ir_temp`, and `vil` arrays. The optional combined `mock_radar_tensor.npy` has `[Batch, Time, Channel, Height, Width]` layout. The grid is 500×500 at the demo's 1 km/pixel assumption.

Frame timestamps are stored as UTC ISO-8601. Legacy demo frames without a timestamp derive one from the numeric frame suffix at five-minute spacing. The input normalizer validates finite values and ranges (`-40..100 dBZ`, `150..350 K` for IR temperature, `0..500` for VIL), consistent spatial dimensions, and strictly increasing frame times. The pixel transform uses the configured northwest origin (88.3639°E, 22.5726°N), 1 km per pixel, approximately 103 km/degree longitude and 111 km/degree latitude; row coordinates increase southward.

## Verify

```bash
python -m unittest backend.test_backend -v
```
