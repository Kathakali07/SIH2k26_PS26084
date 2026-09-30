# ClimaX: 12-Hour Prototype Build Plan

## 1. Purpose

Build a polished, interactive prototype that presents the **complete ClimaX product experience** in the UI, while grounding available capabilities in real inputs where practical and using deterministic demo data for signals/models that cannot be implemented credibly in the remaining 12 hours.

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

## 14. Step-by-step AI-agent execution guide

Use these prompts **one at a time and in order**. Give the AI coding agent the whole repository context. After each step, review the diff and run the stated checks before asking it to continue. Do not ask an agent to implement the entire plan in one prompt: smaller steps reduce integration breakage.

### Reusable instruction to prepend to every prompt

```text
You are working in the existing PRAMAAN-X repository. First inspect the relevant files and follow the current project conventions. Implement only the requested step; do not redesign unrelated parts or claim a simulated capability is real. Preserve working user changes. Keep demo values deterministic and use a shared scenario source of truth. Clearly label measured, calculated, simulated, and unavailable values in the UI. After editing, run the relevant checks available in this repository, report changed files, commands/results, and any remaining issue. Do not begin the next plan step until I review this step.
```

### Step 1 — Audit the app and establish a runnable baseline (about 20 minutes)

**What to do:** Check current startup commands, backend import/run behavior, frontend build/lint, component/map dependencies, API behavior, and available data. Do not change product behavior yet. Identify blockers and recommend the smallest safe implementation sequence.

**Give the agent:**

```text
Perform a read-only implementation audit for the 12-hour PRAMAAN-X demo. Inspect backend/main.py, backend/engine.py, backend/generate_mock.py, frontend/package.json, frontend/src/App.jsx, frontend/src/components/WeatherMap.jsx, frontend/src/components/GISMap.jsx, and the available data files. Determine exact commands to start frontend/backend and run build/lint. Check whether a real input dataset is present and actually parseable; do not download data or assume .npy files contain plain arrays. Report: (1) startup/build blockers, (2) data format findings, (3) which current UI is displayed and how it is centered, (4) recommended files/sequence for a working demo. Do not edit files.
```

**Accept when:** We know the actual start commands, whether the input is real or synthetic, and the files that need modification. Resolve startup blockers before adding features.

### Step 2 — Define one deterministic complete demo scenario (about 40 minutes)

**What to do:** Create one shared scenario dataset that powers the dashboard and replay. Include several storm cells and enough timeline states to show movement, changing intensity/lifecycle, interactions, multiple futures, hazard cards, sensor states, impacts, explanation events, and alert preview. Use field-level provenance.

**Give the agent:**

```text
Implement the PRAMAAN-X deterministic demo scenario layer. Inspect the existing frontend/backend structure first and choose the simplest shared source of truth that both sides can use reliably (prefer a JSON fixture under an appropriate data or frontend source directory unless the current API architecture makes a Python fixture clearly simpler). Include 3–4 storm objects around West Bengal/Kolkata and at least 5 timestamped replay frames so positions, intensity, lifecycle, and events visibly evolve. Include interactions, hazard cards (lightning, hail, downburst, extreme rain), several weighted forecast futures summing to 100%, lead-time products, sensor health, illustrative impacts, a forecast-change explanation, and an alert preview. Add provenance to every field or group: measured/calculated/simulated/unavailable. Because no validated real dataset/model is guaranteed, label this fixture synthetic_demo and label unsupported values simulated. Make replay values deterministic and internally coherent; radar failure must have a baseline and degraded state with wider uncertainty and a lower forecast product level. Do not add random values generated at runtime. Return the schema and file path when complete.
```

**Accept when:** One fixture contains the full visible story; repeated loads are identical; no fabricated value is marked measured.

### Step 3 — Make the backend serve scenario, radar failure, and reset (about 60 minutes)

**What to do:** Add a stable API around the chosen scenario. Ensure the live endpoint’s GeoJSON can represent storm objects and radar-off geometry. Avoid starting expensive/random model inference for the UI demo.

**Give the agent:**

```text
Implement the minimal FastAPI demo API using the scenario fixture created in Step 2. Inspect current route behavior before changing it. Add GET /api/scenario for the complete current scenario; keep GET /api/nowcast/live returning a valid GeoJSON FeatureCollection for map layers; make POST /api/kill-radar explicitly set radar offline (accept an explicit active value if useful, rather than only toggling); add POST /api/reset-demo. Ensure all endpoints read the same state/source so the UI cannot disagree. When radar is offline, update sensor status, uncertainty representation/interval, and forecast product level, and mark fallback as simulated if alternate live feeds are absent. Avoid random inference in the demo endpoints. Validate GeoJSON ring closure and [longitude, latitude] ordering. Add a small, meaningful API verification script or tests only if needed to establish endpoint behavior. Run available Python checks and report exact curl/request examples.
```

**Accept when:** Scenario, GeoJSON, radar-off, and reset calls work repeatedly and agree with one another.

### Step 4 — Build the PRAMAAN-X operations dashboard shell (about 90 minutes)

**What to do:** Replace the visible Australia-oriented weather demo with the SIH prototype dashboard while reusing useful existing project styling/components where practical. Prioritize information hierarchy and complete product visibility over decorative animations.

**Give the agent:**

```text
Implement the main PRAMAAN-X prototype dashboard UI in the existing React/Vite app. Inspect existing components and styles and reuse useful pieces, but replace the visible Australia-centered WeatherMap/demo content because the SIH scenario is India/Kolkata. Build a responsive dark command-center layout with: PRAMAAN-X/prototype badge; scenario, mode, valid-time/replay-time header; sensor status strip for Radar/Satellite/Lightning/NWP; India-centered map region; storm list; selected storm details; and a right/bottom analysis area that can show the other product panels. Use the Step 2 scenario as data for now if API integration is not yet completed. Do not create unrelated new pages or leave the initial screen showing the old Australia demo. Add loading/error/empty states where relevant. Run frontend build and lint; report any existing warnings separately from new ones.
```

**Accept when:** The first screen communicates PRAMAAN-X, shows India/Kolkata, has the scenario context and space for the full feature set, and builds successfully.

### Step 5 — Connect map, storm selection, and object intelligence (about 90 minutes)

**What to do:** Connect the dashboard to the backend, render storm polygons/tracks, and make object details agree with selected storm data. Ensure unsupported fields show their status.

**Give the agent:**

```text
Connect the PRAMAAN-X dashboard to GET /api/scenario and GET /api/nowcast/live. Inspect the actual response shape and map library currently installed; do not assume MapLibre is installed just because it appears in the long-term stack. Use the simplest working map approach consistent with the existing dependencies (Leaflet is already used). Render storm polygons/markers and tracks in the India scenario area, add a legend, and make map/list selection synchronize. The selected-storm view must show storm ID, location, area, reflectivity, speed/direction/acceleration, growth/lifecycle, hazards, ETA/interval when supplied, and field provenance badges. Display unsupported or absent measurements as unavailable rather than inventing them. Add refresh/error/stale-data behavior. Verify map coordinates are in [lon, lat] for GeoJSON and correct Leaflet order where applicable. Run build/lint and report the manual API-to-map test steps.
```

**Accept when:** A storm from the API can be selected from either map or list and its panel values/provenance match the API.

### Step 6 — Add full product-vision panels using the shared scenario (about 90 minutes)

**What to do:** Make every major concept visible in the running UI without pretending every concept is a trained model. These panels should all derive from the shared fixture/API.

**Give the agent:**

```text
Add the remaining PRAMAAN-X product panels using the same scenario response; do not create disconnected random values. Include: (1) storm interaction graph with nodes/edges and relation labels, (2) lead-time selector for 0–60m, 1–3h, 3–6h with product type/precision explanation, (3) multiple-futures display with weights that total 100%, (4) hazard cards for lightning, hail, downburst, and extreme rain, (5) skill/observability gate explaining the displayed product level, (6) replay timeline and event/“why forecast changed” feed, (7) illustrative impact exposure panel for airport/road/village/hospital/school/infrastructure, and (8) alert preview. Every simulated panel/value must have a visible demo/simulated label or a clear global demo-mode legend. Handle small screens by using tabs, collapsible panels, or scrolling rather than removing required features. Verify all panels update from scenario/replay selection rather than maintaining independent values. Run build/lint.
```

**Accept when:** All major features in the product vision are explorable from the UI and consistent with one scenario state.

### Step 7 — Implement radar failure and replay interactions end to end (about 60 minutes)

**What to do:** Give the judge two obvious, working interactions: advance through the scenario and simulate radar loss/recovery.

**Give the agent:**

```text
Wire the replay controls and Simulate Radar Failure control to the shared scenario/backend. Replay must support play, pause, previous/next or step, and a visible timestamp; advancing replay updates storm geometry, selected details, graph/events, hazard/futures panels together. Kill Radar must call the backend, update the sensor strip and scenario state, visibly widen the map uncertainty zone/ETA interval as represented by the fixture, and downgrade the forecast product level; reset must restore the baseline. If alternate feeds are not real, the UI must say fallback is simulated. Prevent duplicate intervals/listeners and handle API errors without crashing. Add or update a short manual test sequence and run build/lint plus backend checks.
```

**Accept when:** Replay advances coherently; radar on → off → reset visibly changes and restores all related UI panels.

### Step 8 — Visual polish and demo usability (about 45 minutes)

**What to do:** Make the interface legible and judge-friendly. Avoid spending this step redesigning underlying architecture.

**Give the agent:**

```text
Polish the current PRAMAAN-X dashboard for a live SIH presentation without adding new feature scope. Improve hierarchy, spacing, text contrast, map legend, selected/hover states, loading/error states, compact sensor labels, and responsive behavior. Make measured/calculated/simulated/unavailable legend easy to find. Ensure the judge can locate storm selection, lead-time switch, replay controls, and Simulate Radar Failure quickly. Remove leftover unrelated Australia/NOAA demo labels or placeholder content that conflicts with the Kolkata scenario. Do not add unsupported data claims. Run frontend build and lint and list any remaining visual limitation.
```

**Accept when:** A new viewer can understand the dashboard and find the demo controls without explanation.

### Step 9 — Integration verification and bug fixing (about 60 minutes)

**What to do:** Test the exact presentation flow from clean startup. Fix only blocking defects.

**Give the agent:**

```text
Perform an end-to-end verification of the PRAMAAN-X demo. Inspect the current implementation and run the documented backend and frontend commands from a clean process. Verify: scenario endpoint; valid GeoJSON; map display and storm selection; object details and provenance; all feature panels; replay play/pause/step and synchronized timestamp; radar failure and reset; no-data/API error behavior; frontend production build and lint; backend checks available in the repository. Fix only defects that block the planned demo or create misleading/inconsistent UI. Do not add features. Report each check as pass/fail with command or manual steps, and identify any unverified item.
```

**Accept when:** The full flow works twice from clean startup; failures and remaining unverified behavior are known.

### Step 10 — Prepare presentation material from the actual running demo (about 75 minutes)

**What to do:** Make slides and demo narration reflect implementation status. The product vision can be complete in the presentation, but prototype evidence must be genuine.

**Give the agent:**

```text
Using the actual PRAMAAN-X UI and verified implementation, prepare a slide-by-slide PPT outline and a 3–5 minute live demo script. Cover the full vision: storm objects, interaction graph, initiation/intensification, observability/sensor failure, multiple futures, probabilistic ETA, four hazards, lead-time adaptation/skill gate, forecast-change explanation, impacts/alerts, replay/benchmark/ledger, data and architecture workflow. For each capability, clearly classify it as demonstrated from input, calculated prototype behavior, deterministic simulated UI scenario, or roadmap. Include a status matrix and propose which real screenshots we should capture. Do not invent model results, datasets, probabilities as validated values, benchmarks, or sensor integrations. Mark ambitious production capabilities as roadmap when not implemented.
```

**Accept when:** Slide claims match the app, all vision areas are represented, and a backup screenshot/recording is ready.

### Step 11 — Final rehearsal and freeze (about 30 minutes)

**What to do:** Use a person unfamiliar with the implementation to run the demo from written instructions. Stop adding features.

**Give the agent:**

```text
Do a final demo-readiness pass only. Review startup instructions and the end-to-end checklist. Confirm the selected scenario is reset to its baseline state, the right demo mode/data-source labels are visible, the map opens at the intended location, and the demo sequence can be completed with the available controls. Do not make broad refactors or add features. Only fix a severe blocker; otherwise return a concise readiness checklist and the exact commands/demo sequence for the presenter.
```

**Accept when:** Presenter can start the system, run the demo sequence, and switch to a recording/screenshots if live services fail.

## 15. Agent handoff rules

- Give the agent **one numbered step only**, plus the reusable instruction above.
- Ask it to inspect before editing and to name the files it intends to change.
- Review the diff and run the acceptance checks before starting the next step.
- Keep one shared scenario contract; reject independently generated panel values.
- If an agent says it completed a check, verify the command/result yourself when possible.
- If a step exceeds its time box, reduce scope to the acceptance gate and move forward; do not let a panel block the integrated demo.
- Preserve an accessible known-good version before large UI changes and keep a screen recording once the demo works.

## 16. Backend workstream — separate step-by-step plan

Use this as the backend agent's focused task list. The frontend can begin its shell in parallel after the scenario contract in Backend Step B1 is agreed, but it should not invent a competing response schema.

### Backend B1 — Choose and normalize the demo input (30–45 minutes)

**Files to inspect:** `backend/engine.py`, `backend/generate_mock.py`, `backend/main.py`, `data/mock_frames/`, `requirements.txt`.

**Tasks:**

- Determine what each `.npy` file actually stores and whether it is loadable as the array the engine expects.
- Check for any real dataset already present; use it only if it is readily parseable and can be cited.
- Choose one input mode: traceable real sample, or deterministic synthetic scenario.
- Define input frame shape, coordinate/grid assumptions, timestamps, and provenance labels.
- Do not spend the sprint implementing raw DWR/INSAT ingestion or training Earthformer.

**Agent prompt:**

```text
Backend workstream B1: inspect the existing backend and data files before editing. Determine the actual format and contents of data/mock_frames/*.npy, whether those files can be consumed by backend/engine.py, and whether any real weather dataset is already included. Do not assume file formats. Recommend one data mode that can reliably run in this demo: existing parseable real sample, or deterministic synthetic fixture. Then implement only the smallest needed loader/normalizer for the chosen mode, with input validation, timestamps, spatial assumptions, and source/provenance metadata. Do not claim Earthformer inference; EarthformerStub is a stub. Run a small repeatability/shape check and report the selected mode and exact test result.
```

**Acceptance:** The backend has one documented, repeatable input mode and can load at least one frame without shape/format ambiguity.

### Backend B2 — Define the shared scenario contract (20 minutes; coordinate with frontend)

**Tasks:**

- Agree the exact field names with the frontend before building routes.
- Include scenario metadata, sensors, storms, forecasts, interactions, impacts, replay frames/events, and provenance.
- Keep GeoJSON feature properties aligned with storm IDs and values in scenario payload.
- Keep absent fields null/unavailable; demo-simulated properties explicitly marked.

**Agent prompt:**

```text
Backend workstream B2: define the canonical JSON response contract for the PRAMAAN-X prototype. It must cover scenario_id/name/mode/valid_time_utc/data_sources, sensors, forecast_product, storms (with GeoJSON-compatible geometry, measured/calculated/simulated/unavailable provenance), interactions, forecast_members, impacts, replay/events, and radar status. Keep GET /api/nowcast/live compatible as a FeatureCollection whose feature IDs/properties match the scenario storm IDs. Use UTC ISO-8601 timestamps, GeoJSON [longitude, latitude], and probabilities/weights in 0..1. Share the proposed exact schema with me before you implement frontend-dependent changes. Do not populate absent measurements with fake observed values.
```

**Acceptance:** Frontend owner confirms the names/types; one schema is used throughout.

### Backend B3 — Deterministic storm data and tracking (60–90 minutes)

**Files:** likely `backend/engine.py`, optionally a new scenario/data module and fixture.

**Tasks:**

- Use the selected normalized input or deterministic frames.
- Extract contours and track stable IDs across frames where input supports it.
- Compute geometry, centroid, area, intensity, motion, direction, and growth only when supported.
- If scenario-only, predefine the sequence and label those values simulated.
- Ensure stable results; handle no-storm frames and invalid arrays.

**Agent prompt:**

```text
Backend workstream B3: implement the storm-object sequence for the agreed scenario schema. Reuse the existing OpenCV contour extraction and Hungarian matching where appropriate, but verify shapes and units rather than trusting comments. For frame-backed input, compute only supported properties (contour, centroid/location using documented calibration, area, max reflectivity, frame-to-frame motion/growth). For synthetic scenario data, make 3–4 coherent storm tracks across at least 5 timestamps with stable IDs. Include lifecycle and unsupported intelligence fields only as deterministic simulated values with provenance. Return valid closed polygon rings and safe empty results. Add/run focused checks for fixed-input repeatability, no-storm input, and GeoJSON geometry.
```

**Acceptance:** Same input/time returns the same tracks and valid GeoJSON; no runtime random inference in the demo path.

### Backend B4 — Scenario, radar-failure, replay, and reset API (45–60 minutes)

**Files:** `backend/main.py` and scenario/state module.

**Tasks:**

- `GET /api/scenario`: entire current shared scenario.
- `GET /api/nowcast/live`: GeoJSON for map.
- `POST /api/kill-radar`: explicit offline state; return updated state.
- `POST /api/reset-demo`: deterministic initial state.
- Replay can be served as frames in the scenario response; backend replay route is optional.
- On radar loss, visibly expand uncertainty and downgrade product level; only mark fallback feeds available if actually present.

**Agent prompt:**

```text
Backend workstream B4: implement the agreed API around one shared scenario state. Add GET /api/scenario, retain GET /api/nowcast/live as GeoJSON FeatureCollection, make POST /api/kill-radar set radar active/offline explicitly (avoid ambiguous toggle-only semantics), and POST /api/reset-demo restore the exact baseline. Ensure changes propagate consistently across scenario and GeoJSON endpoints. In radar-off state, widen the scenario uncertainty representation and downgrade forecast_product; show fallback as simulated unless alternate data sources are truly loaded. Use safe validation/errors and CORS needed by the local Vite app. Provide request examples and test normal → radar-off → reset, plus valid GeoJSON.
```

**Acceptance:** API normal/offline/reset responses are consistent; frontend can call them locally; no hidden state mismatch.

### Backend B5 — Backend verification and handoff (30 minutes)

**Tasks:**

- Run from documented command and expose an easy local URL.
- Verify all routes, response types, GeoJSON, timestamps, coordinate order, reset, and empty/error behavior.
- Provide frontend agent with a response fixture/example and CORS/base URL.

**Agent prompt:**

```text
Backend workstream B5: verify the completed demo backend from a clean process. Run the documented start command and exercise GET /api/scenario, GET /api/nowcast/live, POST /api/kill-radar, and POST /api/reset-demo. Check JSON parsing, stable IDs, coordinate bounds/order, polygon closure, provenance, radar state changes, and reset. Fix only backend integration blockers. Write concise local API run instructions and give me a sample response shape for frontend integration. Report each check pass/fail and the exact commands used.
```

**Backend final handoff:** Start command, base URL, route list, canonical schema/sample payload, selected data mode and source, radar-off behavior, test results, known limitations.

## 17. Frontend workstream — separate step-by-step plan

Use this as the frontend agent's focused task list. The frontend can start its visual shell while B1/B2 are underway, but integrate against the agreed schema before implementing data-bound panels.

### Frontend F1 — Audit existing UI and plan the screen (20 minutes)

**Files to inspect:** `frontend/src/App.jsx`, `frontend/src/App.css`, `frontend/src/index.css`, `frontend/src/components/*`, `frontend/package.json`.

**Tasks:**

- Identify which map/dashboard is actually rendered and existing packages/styles.
- Keep Leaflet if it is already installed and working; do not switch map stacks during the deadline without a strong reason.
- Design one command-center screen that can show the full feature set via cards, tabs, or drawers.
- Remove Australia-specific content from the active demo view.

**Agent prompt:**

```text
Frontend workstream F1: read-only audit the actual React/Vite application and determine which components App.jsx renders, which map library/dependencies are installed, current CSS approach, and frontend start/build/lint commands. Propose a compact India/Kolkata-centered PRAMAAN-X command-center layout reusing useful components. List exact files to change and risks; do not edit files yet. Do not assume MapLibre is installed or that GISMap.jsx is used by App.jsx.
```

**Acceptance:** We know the active UI, map library, commands, and screen layout before changing code.

### Frontend F2 — Build dashboard shell and visual hierarchy (60–90 minutes)

**Tasks:**

- Header with product/prototype/scenario/mode/time.
- Sensor health strip and top summary cards.
- India-focused map area, storm list, selected-object detail panel.
- Panels/tabs for interactions, forecast/hazards, trust, replay, impacts, and alerts.
- Visible source/provenance legend.

**Agent prompt:**

```text
Frontend workstream F2: implement the PRAMAAN-X dashboard shell in the existing React/Vite app using current dependencies and style conventions. Make the initial screen India/Kolkata-centered rather than Australia-focused. Include header with PRAMAAN-X/prototype badge, scenario/mode/time; Radar/Satellite/Lightning/NWP health strip; summary cards; map and storm list; selected storm detail area; and accessible panels/tabs for interaction graph, forecast futures/lead times, hazards, skill/trust, replay/events, impact, and alert preview. Add a clearly visible legend for measured/calculated/simulated/unavailable. It is okay to use the agreed fixture until backend integration is ready, but no component may invent independent random values. Add loading/error/empty states. Run npm run build and npm run lint and report results.
```

**Acceptance:** Main dashboard is complete in structure, legible, and starts/builds; old Australia demo is no longer the initial experience.

### Frontend F3 — Integrate scenario API and map layers (60–90 minutes)

**Tasks:**

- Fetch `/api/scenario` and `/api/nowcast/live` from configurable local base URL.
- Render GeoJSON/storms and selectable markers/list items.
- Keep selected storm synchronized across map, list, object card, and other panels.
- Show data age, source/mode, loading, stale, no-data, and API error states.

**Agent prompt:**

```text
Frontend workstream F3: integrate the UI with the backend's agreed schema and local API base URL. Fetch /api/scenario and /api/nowcast/live; render storm features on the existing installed map library with India bounds/view centered on the scenario region. Make selection synchronized between map and storm list and populate the detail panel from the selected API storm. Show source, mode, valid time, and per-field provenance. Correctly convert GeoJSON [lon,lat] to the map library's expected coordinate order. Add loading/error/stale/empty states and graceful handling if the API is unreachable. Do not silently switch to fake live values on failure. Run build/lint and list manual integration steps.
```

**Acceptance:** Storms shown on the map and their details come from the backend response; errors are visible rather than masked.

### Frontend F4 — Fill every PRAMAAN-X concept panel (60–90 minutes)

**Tasks:**

- Interaction graph with relations and explanations.
- Horizon selector, probability distribution/futures, hazard cards.
- Skill gate/product precision, sensor reliability and observability.
- Replay timeline and “why changed” feed.
- Impact/exposure and alert preview.
- Explicit prototype labels for simulated values.

**Agent prompt:**

```text
Frontend workstream F4: complete the visible product panels using only the shared scenario API/fixture. Add a storm interaction graph; 0–60m/1–3h/3–6h selector with product explanation; multiple forecast futures and weights; lightning/hail/downburst/extreme-rain cards; observability and skill-gate status; replay/event/forecast-change panel; illustrative impact exposure layers/cards; and alert preview. Make weights total 100% as supplied by the scenario. All panels must respond to selected storm, current replay frame, and sensor mode as applicable. Label simulated demo outputs directly. Do not claim calibration or real sensor fusion. Keep usable on a laptop presentation screen. Run build/lint.
```

**Acceptance:** Each major concept from the PRAMAAN-X feature list has a visible, understandable representation, all fed from shared state.

### Frontend F5 — Replay and Kill Radar interactions (45–60 minutes)

**Tasks:**

- Play/pause/step and replay time update.
- Kill Radar calls API and changes sensor strip, uncertainty geometry, forecast product/interval, and explanation.
- Reset returns UI/backend to baseline.
- Avoid timer leaks and stale asynchronous response race conditions.

**Agent prompt:**

```text
Frontend workstream F5: wire replay controls to scenario frames and the Simulate Radar Failure/Reset controls to backend endpoints. Replay play/pause/step must keep map, selected storm, graph, hazards, events, and visible timestamp synchronized. Radar failure must update from the API response, change sensor status, show fallback availability accurately, expand the uncertainty zone/interval and downgrade product level when supplied. Reset must restore baseline. Handle loading and failed requests, avoid duplicate setIntervals/listeners, and avoid independent client-side fake state that conflicts with the server. Run build/lint and provide the click-by-click manual verification sequence.
```

**Acceptance:** Replay and radar controls complete their full cycles without reload or contradictory panels.

### Frontend F6 — Visual polish and judge usability (30–45 minutes)

**Tasks:**

- Improve contrast, typography, spacing, map legend, clear controls, hover/selected states.
- Make labels readable and simulation indicators visible.
- Remove stale map attribution/content that conflicts with the demo scenario.

**Agent prompt:**

```text
Frontend workstream F6: polish the existing PRAMAAN-X screen for an SIH live presentation. Improve information hierarchy, contrast, spacing, map legend, control discoverability, selected storm state, sensor warnings, and responsive laptop layout. Remove conflicting leftover Australia/NOAA demo copy. Keep all provenance/demo labels visible; do not add unsupported claims or new feature scope. Run npm run build and npm run lint and report any remaining issue.
```

**Acceptance:** A judge can find scenario, storm, hazard, replay, and Kill Radar controls at a glance.

### Frontend F7 — Final frontend verification and demo handoff (30–45 minutes)

**Tasks:**

- Clean frontend start and production build.
- Check API online/offline, map selection, panels, replay, radar-off/reset, and responsive screen.
- Supply exact presenter flow and capture screenshot/recording.

**Agent prompt:**

```text
Frontend workstream F7: verify the finished dashboard in a clean browser session against the running backend. Test initial load, API loading/error, storm selection from map/list, detail/provenance, all concept panels, replay, Kill Radar, reset, and laptop presentation dimensions. Run production build and lint. Fix only demo-blocking issues. Provide exact frontend start command, backend dependency/base URL, pass/fail results, known limitations, and recommended screenshot/recording frames.
```

**Frontend final handoff:** Start command, required API URL, demo sequence, controls, verified features, limitations, and backup media path.

## 18. Backend/frontend integration contract and parallel work

### Integration order

1. Backend agent completes B1 and shares the input mode and B2 schema proposal.
2. Frontend agent completes F1 and can build F2 using a temporary fixture matching that proposed schema.
3. Backend completes B2/B3/B4 while frontend builds the shell; schema changes are agreed before merge.
4. Frontend integrates F3 only after the backend sample payload is stable.
5. Backend B5 and frontend F5/F7 verify against the same running API.
6. One integration owner runs the full end-to-end demo and resolves conflicts; avoid separate agents changing the same App/API files simultaneously.

### Required shared behavior

- One selected `scenario_id`, `valid_time_utc`, storm IDs, and provenance vocabulary across API and UI.
- Radar-off state must be represented consistently in sensor status, uncertainty, product level, map, and explanation.
- Replay timestamp must correspond to the currently displayed storm/map/panel data.
- Forecast weights sum to 1 (or 100% if the contract explicitly uses percent).
- A `synthetic_demo` source stays visibly identified as synthetic in the UI and presentation.
- If real data is connected, include the actual source and timestamp; do not relabel synthetic auxiliary features as measured.

### Time-boxing by workstream

- Backend core (B1–B4): target 3–4 hours; B5 verification: 30 minutes.
- Frontend shell/integration (F1–F3): target 3–4 hours.
- Product panels and interactions (F4–F5): target 2–2.5 hours.
- Polish, integration test, slides, rehearsal: reserve at least 2 hours.

If implementation runs over, simplify representation (static interaction graph, fixed replay frames, compact hazard cards) while keeping the full feature categories visible and the controls working.
