# PRAMAAN-X Backend Handoff — Frontend Integration

## Backend status and demo-data mode

The backend is ready for local frontend integration. It serves a **deterministic synthetic demo scenario**, not live radar/satellite/lightning/NWP data. It does not run trained Earthformer inference. Forecast probabilities, environmental indicators, ETA intervals, impact scores, skill indicators, and fallback behavior are illustrative and carry demo provenance.

## Start the backend

From the repository root:

```bash
python -m pip install -r requirements.txt
python backend/main.py
```

Base URL: `http://localhost:8000`

Vite CORS origins allowed: `http://localhost:5173` and `http://127.0.0.1:5173`.

## Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health check and current mode |
| GET | `/api/scenario` | Full scenario, current state, all replay frames, panels, provenance, and embedded GeoJSON |
| GET | `/api/scenario?frame_index=0` | Select replay frame 0–4 |
| GET | `/api/nowcast/live` | Current selected frame as RFC 7946 GeoJSON FeatureCollection |
| GET | `/api/nowcast/live?frame_index=0` | Selected replay frame as GeoJSON |
| POST | `/api/kill-radar` | Set radar offline; no body required |
| POST | `/api/kill-radar` with `{"active":true}` | Restore radar active state |
| POST | `/api/reset-demo` | Restore baseline state |

Invalid `frame_index` and invalid request bodies receive FastAPI `422` validation responses. An empty storm list is formatted safely as `{"type":"FeatureCollection","features":[]}`.

## Canonical scenario contract

`GET /api/scenario` returns the canonical scenario. Key properties:

- `scenario_id`, `scenario_name`, `mode`, `data_sources`, `valid_time_utc`
- `frame_index`, `frame_count`, `frame_interval_minutes`
- `sensors`, `fallback`, `observability`, `uncertainty_scale`, `radar_active`
- `storms`, `interactions`, `events`, `hazard_summary`, `impacts`, `alert_preview`
- `forecast.lead_time_products`, `forecast.forecast_members`, `forecast.eta_summary`, `forecast.skill_gate`
- `replay.frames` (five ordered, timestamped frames)
- `geojson` (the FeatureCollection for the selected frame)

The FeatureCollection from `/api/nowcast/live` is the same selected-frame GeoJSON embedded in `/api/scenario`. Match records by stable storm `id`; GeoJSON positions are `[longitude, latitude]`, and exterior polygon rings are closed. All feature properties include `valid_time_utc`, `eta_utc`, `eta_min_utc`, `eta_max_utc`, `radar_active`, and `uncertainty_scale` along with storm properties and provenance.

The scenario has four stable IDs (`storm_17`, `storm_21`, `storm_25`, `storm_31`) over five five-minute-spaced frames. It includes four hazard categories, 16 forecast members with weights summing to 1, three lead-time products, two interaction edges, six illustrative impact targets, timestamped events, and an alert preview.

## Minimal valid GeoJSON response example

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[88.31, 22.46], [88.32, 22.45], [88.33, 22.46], [88.32, 22.47], [88.31, 22.46]]]
      },
      "properties": {
        "id": "storm_17",
        "hazard_type": "Thunderstorm",
        "severity": "HIGH",
        "valid_time_utc": "2026-09-29T12:20:00Z",
        "eta_utc": "2026-09-29T12:40:00Z",
        "eta_min_utc": "2026-09-29T12:28:00Z",
        "eta_max_utc": "2026-09-29T12:52:00Z",
        "radar_active": true,
        "uncertainty_scale": 1.0,
        "eta_is_demo_estimate": true,
        "provenance": { "hazards": "simulated" }
      }
    }
  ]
}
```

## Frontend integration sequence

1. Fetch `/api/scenario` on app start and store it as the scenario source of truth.
2. Use `/api/nowcast/live` as the GeoJSON source for map rendering, or use `scenario.geojson`; both are aligned.
3. When replay changes, request both routes with the same `frame_index`, or update all panels from `scenario.replay.frames[frame_index]` and the matching GeoJSON.
4. On Kill Radar, `POST /api/kill-radar`, then refetch scenario/live. Show radar offline, simulated fallback, uncertainty scale `2.5`, widened ETA interval, and downgraded `forecast.skill_gate.display_level`.
5. On reset, `POST /api/reset-demo`, then refetch scenario/live.
6. Show provenance/demo labels; do not label unavailable sensors as active data feeds.

## Smoke-test commands

```bash
curl http://localhost:8000/api/health
curl "http://localhost:8000/api/scenario?frame_index=0"
curl "http://localhost:8000/api/nowcast/live?frame_index=0"
curl -X POST http://localhost:8000/api/kill-radar
curl http://localhost:8000/api/scenario
curl -X POST http://localhost:8000/api/reset-demo
```

## Verification performed

- Clean-process start using the documented command; health/scenario/live returned HTTP 200.
- Radar-off and reset returned HTTP 200 and updated/restored shared state.
- Automated tests verify scenario/live consistency, IDs/timestamps, polygon closure and Indian bounds, forecast-weight sums, invalid-request `422`, CORS, radar uncertainty/ETA widening, reset, empty GeoJSON, input validation, tracking, and deterministic output.
- Test command: `python -m unittest backend.test_backend -v`.

## Known limitations

- Scenario and fixture-derived meteorological values are synthetic; no real sensor feeds are connected.
- No trained Earthformer or calibrated probabilistic forecast is running.
- Radar fallback is a UI demonstration; satellite/lightning/NWP are unavailable.
- ETA, probabilities, skill indicator, exposure risk, and alert are illustrative, not operational warnings.
- Replay is a synthetic scenario sequence, not verified historical replay.
