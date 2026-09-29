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
- `GET /api/scenario` — scenario metadata, tracked storms, sensors, provenance, and embedded GeoJSON.
- `GET /api/nowcast/live` — GeoJSON FeatureCollection for map rendering.
- `POST /api/kill-radar` — set radar offline; no body is needed. To restore it directly, send `{"active": true}`.
- `POST /api/reset-demo` — restore initial radar-online state.

Radar fallback is simulated. No live satellite, lightning, or NWP feed is connected. The ETA is an illustrative demo estimate.

## Regenerate demo frames

```bash
python backend/generate_mock.py --num-frames 20 --write-tensor
```

Per-frame files contain `radar_dbz`, `ir_temp`, and `vil` arrays. The optional combined `mock_radar_tensor.npy` has `[Batch, Time, Channel, Height, Width]` layout. The grid is 500×500 at the demo's 1 km/pixel assumption.

## Verify

```bash
python -m unittest backend.test_backend -v
```
