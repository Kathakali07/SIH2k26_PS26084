# PRAMAAN-X: 12-Hour Prototype Build Plan

## 1. Purpose

Build a polished, interactive prototype that presents the **complete PRAMAAN-X product experience** in the UI, while grounding available capabilities in real inputs where practical and using deterministic demo data for signals/models that cannot be implemented credibly in the remaining 12 hours.

The prototype must make the distinction clear:

- **Measured:** read directly from an identified input dataset.
- **Calculated:** derived by implemented code from measured/demo input.
- **Simulated:** generated for the demonstration to represent a proposed capability.

The goal is a coherent end-to-end demo, not a claim that every research model, sensor feed, probability, or benchmark is production-ready.

## 2. What exists in the repository now

- React + Vite dashboard with Leaflet-based maps, charts, location panels, and animation.
- FastAPI endpoints: `GET /api/nowcast/live` and `POST /api/kill-radar`.
- A Python prototype for contour extraction, centroid/area computation, Hungarian matching, velocity, and basic hazard labels.
- A model class named `EarthformerStub` which currently returns random predictions; it is not a trained Earthformer inference implementation.
- Generated `.npy` mock frames under `data/mock_frames/`; the live API currently does not use these files.
- The current visible `WeatherMap` is centered on Australia and displays illustrative overlays, not the backend storm GeoJSON.
- A countdown component and planning documents exist, but the countdown and map are not integrated with live endpoint features.

Use this inventory as the starting point. Do not assume existing components are already connected just because the files are present.

## 3. Demo definition of done

At submission, a judge should be able to:

1. Open a dashboard clearly marked **PRAMAAN-X Prototype / Demo Scenario**.
2. See the selected scenario, data source/mode, valid time, and sensor status.
3. View one or more storm objects on an India-centered map.
4. Select a storm and inspect its state, motion, lifecycle, hazards, and forecast details.
5. Explore storm interactions, multiple possible futures, lead-time products, and impact exposure in the UI.
6. Trigger **Simulate Radar Failure** and see the sensor status, uncertainty, confidence/product level, and map zone change without the app failing.
7. Start or pause a historical-style replay and see the displayed scenario advance consistently.
8. See a visible indication of which values are measured, calculated, simulated, or unavailable.

The prototype can represent unavailable capabilities with deterministic scenario data. Never label a simulated output as a measured observation or validated probability.

## 4. Scope: show the whole product, implement a focused vertical slice

### Implement for real in this sprint

- One stable scenario data source: use an existing real sample if immediately available and straightforward to parse; otherwise use the repository’s synthetic frames or a deterministic scenario generator.
- Consistent storm-object schema and scenario API.
- Storm-object extraction/tracking for the selected input when possible; otherwise deterministic object tracks.
- Frontend-to-backend integration, map rendering, selection/detail panel, replay controls, and radar-failure interaction.
- Deterministic simulated panels for the remaining concepts so all major product areas are explorable.
- Startup instructions and a repeatable verification/demo sequence.

### Represent as prototype/demo simulations

- Lightning rate/jumps, IR cooling, CAPE/CIN/shear/DCAPE, VIL/echo-top if absent from the input.
- Interaction graph events, convective initiation, hazard-specific probabilities, 16+ forecast members, ETA intervals, skill scores/gating, impacts, and explanatory forecast changes unless directly calculated or supported by validated sources.
- Satellite/lightning/NWP fallback when those actual feeds are not integrated.

### Explicitly out of scope for the 12-hour build

Training large models; operational sensor ingestion; scientifically calibrated ensemble/conformal forecasts; validated hazard engines; a defensible blind benchmark; complete replay leakage controls; production databases/streaming/MLOps; nationwide exposure datasets.

## 5. Product experience and UI areas

Build one cohesive dashboard. Prefer a small number of tabs/drawers/panels over 20 separate pages.

### A. Operations overview

- Header: `PRAMAAN-X`, prototype badge, scenario name, current/replay time, mode badge.
- Sensor strip: Radar, Satellite, Lightning, NWP, plus age/health indicators.
- Status summary: active storms, highest demo hazard, confidence/product level, data freshness.
- Main map centered on the selected Indian region (Kolkata by default), with storm polygons/tracks, impact locations, uncertainty zones, and selectable layers.
- Selected storm card with ID, centroid/location, area, reflectivity, movement, lifecycle, growth trend, ETA, interval, and data provenance.

### B. Storm intelligence

Represent each storm as an evolving object with fields for:

- ID, timestamp, location, area, shape/polygon, intensity/reflectivity.
- Speed, direction, acceleration, growth/decay, lifecycle: Initiating → Developing → Mature → Dissipating.
- VIL, echo-top, lightning rate/acceleration, IR temperature/cooling, CAPE, shear, DCAPE, moisture, sensor reliability.
- Per-field provenance/status: measured, calculated, simulated, or unavailable.

Where the dataset does not contain a field, populate only in the deterministic demo scenario and display a simulation indicator.

### C. Storm interaction graph

- Render storm IDs as nodes and proximity/relative-motion edges.
- Show a demo relation such as approaching, possible merger, splitting, or interaction intensification.
- Provide a relationship explanation and confidence label.
- Derive from positions when simple; otherwise use fixed scenario events. Label simulated relationships.

### D. Forecast and hazard panel

- Lead-time selector: `0–60 min`, `1–3 h`, `3–6 h`.
- Explain the selected product type: track, probabilistic hazard zone, or regional susceptibility.
- Show multiple futures with a small set of scenario members (UI may summarize 16 deterministic demo members), weights totaling 100%, and a probability/uncertainty visualization.
- Hazard cards: lightning, hail, damaging wind/downburst, extreme rain/cloudburst.
- Display ETA and interval only as demo estimates unless supported by validated data. Make time horizon and assumptions visible.

### E. Trust, skill gate, and sensor failure

- Show sensor health/data age and a simple observability/reliability indicator.
- Radar failure control changes Radar to unavailable, displays which fallback inputs are actually present, expands uncertainty visually, and downgrades the displayed forecast product when the scenario says skill/observability is insufficient.
- Show an explanation such as “Radar unavailable; scenario fallback active; uncertainty widened.”
- If alternate live feeds are absent, state “fallback behavior simulated”; do not imply real multimodal fusion.

### F. Replay and explanation

- Scenario picker and play/pause/step/speed controls.
- Replay advances through a predefined sequence of timestamps/storm states.
- Forecast-change feed gives scenario explanations: intensification, approach/merger, new cell, or sensor degradation.
- Distinguish demonstration replay from a verified historical replay. Do not claim no-future-leakage validation unless it is actually implemented.

### G. Impact and alerts

- Display illustrative exposure markers/zones: airport, road, village, hospital, school, critical infrastructure.
- Combine demo hazard and exposure into a simple impact level with a visible “illustrative scenario” label unless actual exposure data and calculations are used.
- Show an alert preview with hazard, location, effective time, confidence, and recommended next action. Keep alert output a prototype preview, not an official warning.

## 6. Shared scenario data contract

Use one scenario payload as the source of truth for the dashboard, API, replay, and kill-radar behavior. Avoid independently random values in each component.

Suggested shape (adapt names to existing code conventions):

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
  "storms": [{
    "id": "storm_17",
    "position": { "lon": 88.36, "lat": 22.57 },
    "geometry": { "type": "Polygon", "coordinates": [] },
    "area_km2": 120,
    "max_dbz": 58,
    "motion": { "speed_kmh": 43, "direction": "NE", "acceleration_kmh_per_min": 1.2 },
    "lifecycle": "Developing",
    "hazards": { "lightning": 0.72, "hail": 0.24, "downburst": 0.38, "extreme_rain": 0.68 },
    "eta_minutes": 42,
    "eta_interval_minutes": [31, 55],
    "provenance": { "max_dbz": "calculated", "hazards": "simulated", "eta_minutes": "simulated" }
  }],
  "interactions": [],
  "forecast_members": [],
  "impacts": [],
  "events": []
}
```

Requirements:

- GeoJSON uses `[longitude, latitude]`; polygon rings are closed and valid.
- All timestamps are UTC ISO-8601.
- Probabilities, reliability, and weights use a documented range (normally 0–1 internally, percent in UI).
- Demo values are deterministic for a given scenario and replay timestamp.
- Missing measurements are `null`/unavailable, not fabricated as observations.
- Radar failure modifies shared scenario state; the API and UI must agree.

## 7. API plan

Keep the current FastAPI approach and add only the smallest routes needed:

- `GET /api/nowcast/live`: current FeatureCollection or scenario response, preserving GeoJSON compatibility.
- `GET /api/scenario`: scenario metadata, sensors, storms, graph, forecast, impact, provenance.
- `POST /api/kill-radar`: explicitly set radar offline (prefer an `active` value over an ambiguous toggle); return updated sensor state and uncertainty/product state.
- `POST /api/reset-demo`: restore deterministic initial state for rehearsals.
- Optional `POST /api/replay/step` or a timestamp query parameter if replay state is managed by the backend; otherwise replay may be frontend-driven from the same scenario fixture.

Do not add WebSockets, a database, or a message broker unless the basic HTTP flow is already complete and stable.

## 8. Twelve-hour task schedule

### 00:00–00:30 — Scope freeze and input decision

- Assign owners for backend/data, UI, integration/demo, and slides (combine roles if the team is small).
- Check whether a real data sample is already available and can be parsed quickly. Record source, timestamp, format, and citation.
- Timebox the decision to 30 minutes. If no usable sample exists, proceed with the deterministic synthetic scenario and disclose that mode.
- Confirm the demo definition of done and freeze unrelated redesign.

**Gate:** At 00:30 there is exactly one chosen input mode and one named demo scenario.

### 00:30–01:00 — Stabilize scenario schema and setup

- Define the shared scenario structure and provenance labels.
- Decide which fields are measured/calculated/simulated/unavailable.
- Confirm backend and frontend start commands; document them.
- Establish a known-good baseline commit/worktree snapshot before risky changes.

**Gate:** Backend can start; frontend can start; scenario contract is agreed.

### 01:00–03:00 — Data path and storm objects

- Connect available real sample input if feasible; otherwise create/fix deterministic scenario frames.
- Fix shape/format assumptions and validate input timestamps/ranges.
- Reuse contour extraction/tracking where it works; correct integration issues rather than rewriting the whole engine.
- Expose storm IDs, geometry, location, intensity, area, motion, and provenance.
- Ensure repeatable results and handle empty/no-storm frames.

**Gate:** Repeated calls with the same input yield stable storm objects and valid GeoJSON.

### 03:00–04:00 — Backend state and demo controls

- Add a consolidated scenario endpoint or response model.
- Make radar failure an explicit state change and make reset reliable.
- Apply visible uncertainty expansion and product-level degradation in shared scenario state.
- Add meaningful errors for missing/bad input; avoid silent random fallback.

**Gate:** API can return baseline, radar-off, and reset states.

### 04:00–06:30 — Core dashboard integration

- Replace/repurpose the map view to center on the demo region in India.
- Render API storm polygons/tracks, selection state, and map legend.
- Add scenario/mode/time banner and sensor status strip.
- Add storm-object detail panel with available and simulated fields marked individually.
- Add loading, stale data, empty result, and API error states.

**Gate:** A judge can select a storm on the map and inspect its data from the API.

### 06:30–08:00 — Product-vision panels in demo mode

- Add interaction graph and event feed.
- Add lead-time selector and product-level explanation.
- Add multiple futures visualization and hazard cards.
- Add illustrative impact exposure and alert preview.
- Keep scenario values coherent and deterministic; label simulated probabilities/intervals.

**Gate:** Every major PRAMAAN-X concept has a visible UI representation, even where the underlying capability is simulated.

### 08:00–09:00 — Radar failure, replay, and explanation

- Connect Kill Radar/Reset controls to backend and update UI immediately from returned state.
- Expand uncertainty area/interval on radar loss; show available vs unavailable fallback sensors.
- Add replay controls over a fixed sequence of scenario timestamps.
- Show “why forecast changed” from scenario events; label as demo explanation when simulated.

**Gate:** Radar-off and replay are demonstrable without page reload or inconsistency.

### 09:00–10:00 — End-to-end test and freeze

- Clean restart backend/frontend.
- Check endpoint response and geometry; confirm map rendering and selection.
- Test radar on → off → reset.
- Test replay play/pause/step and time synchronization.
- Confirm all synthetic/simulated fields are visibly identified.
- Fix only blocking defects; freeze features at 10:00.

**Gate:** The full demo runs twice from a clean start.

### 10:00–11:15 — Slides, evidence, and narrative

- Create architecture diagram and product vision slides from the full PRAMAAN-X specification.
- Add a feature status matrix: demonstrated / simulated / planned.
- Capture genuine screenshots and, if possible, a short backup recording.
- Include actual input source/provenance and actual verification performed.
- Avoid invented evaluation metrics or implying models/data sources are integrated when they are not.

**Gate:** Slides accurately match the running prototype and tell the same story.

### 11:15–12:00 — Rehearsal and submission package

- Rehearse a 3–5 minute demo: scenario/data → storm object → interactions/futures → hazard/impact → kill radar → replay → roadmap.
- Verify startup instructions and data files are present.
- Keep a recording/screenshots and static slides ready in case connectivity or hardware fails.
- No new features; only fix a severe demo blocker.

**Gate:** A teammate can run the demo using the written instructions.

## 9. Suggested ownership

For a team of four (adjust to actual team size):

- **Backend/data owner:** input choice, scenario schema, engine/API, radar state/reset.
- **Frontend/map owner:** India map, API integration, selection/details, sensor strip.
- **Product UI owner:** graph, futures, hazard cards, impact, replay UI, provenance labels.
- **Integration/story owner:** run the app, verify end-to-end, capture evidence, PPT/demo script.

Integrate through the shared schema early. Do not let frontend panels invent independent values disconnected from the scenario.

## 10. Priority order if time slips

Keep these in order:

1. App starts reliably.
2. One deterministic input/scenario is shown on the map.
3. Storm selection/details work.
4. Kill Radar changes state and uncertainty visibly.
5. Provenance labels distinguish real/calculated/simulated values.
6. Replay and the remaining product panels.
7. Visual polish.

If behind schedule, simplify chart/graph complexity, reduce panel detail, and use a fixed replay scenario. Do not sacrifice a working end-to-end path or honest labeling to add more decorative features.

## 11. Verification checklist

### Backend

- [ ] Backend starts using documented command.
- [ ] Scenario/live endpoint returns valid JSON and valid closed GeoJSON polygons.
- [ ] Coordinates are longitude/latitude in that order and within the selected region.
- [ ] Input source, valid time, mode, and per-field provenance are returned.
- [ ] Results are deterministic for a fixed scenario/frame.
- [ ] Kill Radar changes sensor status and uncertainty; reset restores baseline.
- [ ] Empty storms and unavailable inputs return safe, understandable responses.

### Frontend

- [ ] Frontend starts using documented command.
- [ ] Map is centered on the selected Indian demo region.
- [ ] API storms display, update, and can be selected.
- [ ] Selected-storm panel agrees with API values.
- [ ] Measured/calculated/simulated/unavailable states are understandable.
- [ ] Radar failure updates map, sensor banner, forecast product, and uncertainty.
- [ ] Replay controls update displayed valid time and scenario state together.
- [ ] Error, loading, and no-data states do not crash the screen.

### Demo and presentation

- [ ] Full flow rehearsed from clean startup at least twice.
- [ ] Backup recording/screenshots prepared.
- [ ] No unsupported claim of live data, trained model, calibrated probability, verified replay, or benchmark result.
- [ ] Roadmap is explicitly separated from implemented and simulated prototype capabilities.

## 12. Demo script

1. **“This is the PRAMAAN-X prototype scenario.”** Point to mode, source, and valid time.
2. Select a storm and explain its object state, motion, lifecycle, and which properties are measured versus simulated.
3. Show the interaction graph and multiple future scenarios as prototype demonstrations.
4. Switch lead time and explain how the intended product changes from storm track to hazard zone to regional outlook.
5. Show hazard and impact panels; identify any simulated values.
6. Trigger **Simulate Radar Failure**. Show radar offline, fallback-source availability, uncertainty increase, and product downgrade.
7. Advance replay and show the event/explanation changing with the scenario time.
8. Close with the full roadmap: real multimodal feeds, model training, calibration/skill gating, historical blind benchmarks, and operational impact data.

## 13. Decisions that must remain honest

- “Real data” means a named, traceable source was actually loaded by the running application; otherwise call it synthetic/demo data.
- A model stub or deterministic scenario is not Earthformer inference.
- Simulated sensor indicators are not sensor fusion.
- An illustrative probability/ETA interval is not calibrated forecast confidence.
- A replay sequence is not a verified historical replay unless it enforces data availability time and is evaluated accordingly.
- A displayed benchmark number must come from a reproducible evaluation; otherwise omit it.

These boundaries make the demo coherent and credible while still letting the UI communicate the complete PRAMAAN-X vision.
