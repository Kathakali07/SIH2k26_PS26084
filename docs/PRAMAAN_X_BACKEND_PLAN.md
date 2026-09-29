# PRAMAAN-X Backend Plan — SIH Demo

## Goal

Provide a stable API and deterministic scenario state for the PRAMAAN-X demo. The backend should support the complete UI experience, while identifying which values are measured, calculated, simulated, or unavailable.

This is a time-boxed demo plan, not a production weather-ingestion or model-training plan. The current repository has a FastAPI backend, an `EarthformerStub` that generates random predictions, a prototype contour/tracking engine, and `.npy` mock files that the live endpoint does not currently use. Verify formats and behavior before building on them.

## Backend definition of done

- Backend starts with documented commands.
- One selected, repeatable input mode is used: an immediately usable, cited real sample if one exists; otherwise deterministic synthetic demo data.
- Scenario and GeoJSON endpoints return consistent storm IDs/data.
- Storm geometry is valid RFC 7946 GeoJSON with `[longitude, latitude]` coordinates.
- Radar failure and reset work and update the same shared state consumed by the frontend.
- Replay frames and demo capabilities are deterministic.
- Unsupported signals are not presented as measured observations.

## Shared conventions

- Time: UTC ISO-8601.
- Coordinates: GeoJSON `[longitude, latitude]`; document any image-grid transform.
- Probability/reliability/forecast weights: `0..1` in the API; presentation may format as percent.
- Provenance values: `measured`, `calculated`, `simulated`, `unavailable`.
- Demo mode: `synthetic_demo` unless traceable real data is actually loaded.
- Same input + scenario time + sensor state must produce the same response.
- Missing input measurements should be `null`/unavailable, never invented and labeled measured.

## Suggested API contract

```json
{
  "scenario_id": "kolkata_demo_01",
  "scenario_name": "Kalbaishakhi Prototype Scenario",
  "mode": "synthetic_demo",
  "valid_time_utc": "2026-09-29T12:00:00Z",
  "data_sources": [{ "name": "Synthetic radar sequence", "status": "demo" }],
  "sensors": {
    "radar": { "available": true, "reliability": 0.92, "age_seconds": 120 },
    "satellite": { "available": false, "reliability": null, "age_seconds": null },
    "lightning": { "available": false, "reliability": null, "age_seconds": null },
    "nwp": { "available": false, "reliability": null, "age_seconds": null }
  },
  "forecast_product": { "horizon": "0-60m", "level": "storm_track", "confidence": "demo" },
  "storms": [],
  "interactions": [],
  "forecast_members": [],
  "impacts": [],
  "events": []
}
```

Each storm should include a stable `id`, GeoJSON geometry, position, area, reflectivity, motion, lifecycle, hazard values, ETA/interval if present, and provenance. If a data source does not support a field, mark that field simulated or unavailable.

## Reusable instruction for the coding agent

Prepend this to each task prompt:

```text
You are working only on the PRAMAAN-X backend in the existing repository. Inspect relevant files before editing and preserve unrelated work. Implement only this step. Do not claim Earthformer inference or real sensor fusion unless it is actually implemented and running. Use deterministic demo values and explicit provenance. Run relevant backend checks and report changed files, commands/results, and remaining issues. Do not start the next step until I review this one.
```

## B1 — Audit inputs and startup (20–30 minutes)

**Inspect:** `backend/main.py`, `backend/engine.py`, `backend/generate_mock.py`, `backend/tracker.py`, `data/mock_frames/`, `requirements.txt`.

**Tasks:**

1. Determine what the `.npy` files contain; confirm whether `np.load` returns arrays or serialized dictionaries/objects.
2. Check if any real weather dataset is actually present and quickly usable.
3. Check imports, Python dependencies, backend start command, API behavior, and expected tensor shapes.
4. Select one mode. Timebox real-data investigation; use deterministic demo data if no suitable sample exists.
5. Report the proposed schema and files to change before implementation.

**Prompt:**

```text
Backend B1 audit: inspect the backend and data files. Determine exact .npy contents and shapes, whether any real weather data is present and parseable, how to start FastAPI, and what the current live endpoint actually does. Do not edit files. Report a recommended demo input mode, data-source/provenance label, API issues, and smallest safe backend implementation sequence. Do not assume the mock files match engine.py input requirements.
```

**Acceptance:** Input mode, startup command, actual file format, and implementation blockers are known.

## B2 — Establish the scenario contract and fixture (30–45 minutes)

**Tasks:**

1. Coordinate exact schema names with frontend owner.
2. Create one scenario source of truth with 3–4 storm objects and at least 5 coherent replay frames.
3. Include demo interactions, hazard fields, forecast members whose weights sum to 1, sensor health, illustrative impacts, events/explanations, and alert preview.
4. Ensure IDs, timestamp, geometry, motion, severity, and event state evolve consistently across frames.
5. Mark unsupported values as simulated; do not generate random values at request time.

**Prompt:**

```text
Backend B2: define and implement a deterministic scenario fixture for the PRAMAAN-X UI. First agree the exact response schema with the frontend owner. Include scenario metadata/mode/source/time; radar, satellite, lightning, and NWP sensor state; 3–4 storm objects around West Bengal/Kolkata; at least 5 timestamped frames; storm interactions; lead-time products; forecast members with weights summing to 1; four hazard categories; illustrative impacts; events/explanations; alert preview; and field-level provenance. Use synthetic_demo for generated values. Make all frames coherent and deterministic. Do not represent absent measurements as observed. Put the fixture in the simplest maintainable location and report its path/schema.
```

**Acceptance:** One fixture is shared, deterministic, and sufficient to populate all major UI panels.

## B3 — Normalize data and produce storm objects (45–75 minutes)

**Tasks:**

1. Implement a narrow loader for the chosen data format.
2. Validate dimensions, channels, timestamps, ranges, and missing values.
3. Reuse existing contour extraction/Hungarian tracking where suitable.
4. For real or frame input, compute only supported properties: contours, location (with documented calibration), area, reflectivity, and motion/growth where multiple timestamps exist.
5. For synthetic scenario mode, provide pre-defined deterministic trajectories and mark them simulated.
6. Handle no-storm frames and bad input safely.

**Prompt:**

```text
Backend B3: implement the narrow data loader/normalizer and storm-object generation for the agreed scenario. Verify shapes and units instead of trusting existing comments. Reuse OpenCV contour extraction and Hungarian matching if appropriate. Only compute properties supported by input. Document grid-to-geographic calibration and frame interval. For synthetic-only indicators, use deterministic fixture values and simulated provenance. Ensure stable storm IDs, safe empty/no-storm behavior, and closed valid GeoJSON rings. Add focused checks for shape, repeatability, no-storm input, and geometry. Do not implement or imply trained Earthformer inference.
```

**Acceptance:** Same frames produce stable objects; geometry and timestamps validate; unsupported properties remain labelled.

## B4 — Implement API and shared state (45–60 minutes)

**Routes:**

- `GET /api/scenario` — complete scenario/state for UI.
- `GET /api/nowcast/live` — GeoJSON FeatureCollection for map.
- `POST /api/kill-radar` — explicitly set radar active/offline, returning updated state.
- `POST /api/reset-demo` — restore the deterministic baseline.
- Replay may be returned as frames in `/api/scenario`; a separate replay route is optional.

**Tasks:**

1. Ensure all routes read/update the same scenario state.
2. Ensure GeoJSON features map back to scenario storm IDs.
3. On radar loss, update sensor status, expand uncertainty representation/interval, and downgrade the forecast product according to fixture logic.
4. Only claim fallback sensors are active if their data is actually present; otherwise label fallback behavior simulated.
5. Add CORS for the local frontend and safe error handling.

**Prompt:**

```text
Backend B4: implement the minimal FastAPI routes around the shared deterministic scenario. Add GET /api/scenario, keep GET /api/nowcast/live as a valid GeoJSON FeatureCollection, implement POST /api/kill-radar with explicit active/offline state, and POST /api/reset-demo. Scenario and live GeoJSON must agree on IDs, valid time, properties, and radar state. Radar offline must widen uncertainty and downgrade forecast product as represented by the fixture. Identify absent alternate feeds as simulated/unavailable, not active live fallback. Configure local CORS, validate requests, and return useful errors. Give curl examples and run normal → offline → reset checks.
```

**Acceptance:** All endpoints agree; radar-off and reset work repeatedly without process restart.

**Status: Implemented.** `/api/scenario` embeds the same GeoJSON FeatureCollection returned by `/api/nowcast/live` for the selected `frame_index`; storm IDs, valid time, ETA properties, radar state, and uncertainty scale are consistent. Radar failure is idempotent, widens polygon bounds and ETA intervals, downgrades the near-term product, and reports the alternate-sensor fallback as simulated. Reset restores the baseline. Local Vite CORS, FastAPI validation responses, and curl examples are documented in `backend/README.md`.

## B5 — Backend verification and frontend handoff (30 minutes)

**Verify:**

- Backend clean start.
- Scenario and live responses parse.
- Feature IDs and properties match scenario storms.
- Coordinates are within intended region and correctly ordered.
- Polygon rings are closed.
- Radar-off updates status/uncertainty/product; reset restores baseline.
- Empty/no-data response is safe.

**Prompt:**

```text
Backend B5: from a clean process, run the backend and verify GET /api/scenario, GET /api/nowcast/live, POST /api/kill-radar, and POST /api/reset-demo. Check JSON, GeoJSON ring closure, coordinate ordering/bounds, stable IDs, timestamps, provenance, radar state changes, reset, and empty/error behavior. Fix only integration blockers. Provide exact startup command, base URL, a sample payload, request examples, test results, and known limitations for the frontend owner.
```

**Final backend handoff:** Start command, local base URL, routes, schema/sample response, chosen data mode/source, radar-off semantics, checks run, known limitations.

## Backend priority if time slips

1. App/backend starts.
2. Deterministic scenario endpoint works.
3. Valid storm GeoJSON is available.
4. Radar failure and reset return consistent states.
5. Tracking from input, if available and stable.
6. Additional simulated metadata and polish.

Do not block the demo trying to ingest every proposed sensor or train a model.
