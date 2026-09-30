# ClimaX Frontend Plan — SIH Demo

## Goal

Build a polished, judge-friendly React dashboard that presents the complete ClimaX experience. Connect real/calculated fields to the backend where available; drive simulated panels from the same deterministic scenario; visibly distinguish measured, calculated, simulated, and unavailable data.

The repository currently has a React + Vite UI and Leaflet components. Inspect what `App.jsx` actually renders before editing: the current `WeatherMap` shown by the app is Australia-centered, while `GISMap.jsx` may not be mounted. Do not switch to MapLibre or another stack during the deadline unless the existing setup cannot support the demo.

## Frontend definition of done

- Dashboard opens on an India/Kolkata-centered scenario view.
- Scenario, mode, valid/replay time, and sensor status are obvious.
- Storm map, storm list, and selected-object panel stay synchronized.
- All major PRAMAAN-X concepts have a visible UI representation: object intelligence, interactions, initiation/intensification, sensor trust/failure, lead-time products, futures, four hazard types, ETA/uncertainty, skill gate, change explanation, replay, impacts, and alerts.
- Simulated outputs are identifiable; the UI does not silently invent live values when API fails.
- Replay and Kill Radar controls work end to end.
- App builds and can be run with concise instructions.

## Suggested screen layout

### Header

- PRAMAAN-X product name and `PROTOTYPE / DEMO SCENARIO` badge.
- Scenario name, mode, valid time, replay play/pause state.
- Data freshness/status and a visible provenance legend.

### Sensor strip and overview cards

- Radar, Satellite, Lightning, NWP status/reliability/age.
- Storm count, highest demo hazard, current product/lead time, observability/confidence indicator.
- Clear warning when radar is offline or data is stale.

### Main workspace

- India map centered on Kolkata or selected scenario region.
- Storm polygons, motion tracks, selectable storm markers, legend, illustrative impact zones.
- Storm list and synchronized selected-storm intelligence card.

### Analysis panels/tabs

- Storm interaction graph and event explanation.
- Forecast lead-time selector, multiple futures and uncertainty display.
- Lightning, hail, downburst, and extreme-rain cards.
- Skill gate/product precision explanation.
- Replay timeline and “why did forecast change?” event list.
- Impact exposure and alert preview.

Keep the information dense but readable on the laptop/screen used for judging. Panels may be tabs, drawers, or scroll areas; do not omit the feature categories.

## Shared API expectations

Coordinate with the backend owner and use the same response contract:

- `GET /api/scenario`: metadata, sensor states, storms, interactions, forecast products/members, impacts, replay frames/events, provenance.
- `GET /api/nowcast/live`: GeoJSON FeatureCollection for map.
- `POST /api/kill-radar`: explicitly set radar offline/active and return updated scenario state.
- `POST /api/reset-demo`: return to the baseline demo state.

If backend is not ready while building the shell, use a temporary fixture matching the agreed schema. Replace it with the API response during integration; do not leave two unrelated scenario sources in the finished application.

## Reusable instruction for the coding agent

Prepend this to each task prompt:

```text
You are working only on the PRAMAAN-X frontend in the existing repository. Inspect App.jsx and existing components before editing; preserve unrelated work and existing project conventions. Implement only this step. Use one shared scenario/API source for all panels. Clearly distinguish measured, calculated, simulated, and unavailable values. Do not claim real feeds or calibrated predictions that are not connected. Run frontend build/lint after changes and report files, commands/results, and remaining issues. Do not start the next step until I review this one.
```

## F1 — Audit active UI and map dependencies (20 minutes)

**Inspect:** `frontend/src/App.jsx`, `frontend/src/App.css`, `frontend/src/index.css`, `frontend/src/components/*`, `frontend/package.json`, `frontend/vite.config.js`.

**Tasks:**

1. Identify active components mounted by `App.jsx`.
2. Confirm actual installed map libraries and CSS conventions.
3. Identify conflicting Australia/NOAA demo content.
4. Propose a compact command-center layout and exact files to change.

**Prompt:**

```text
Frontend F1 audit: read the actual React/Vite app. Determine which components App.jsx renders, which map library and UI dependencies are installed, how CSS is organized, and the exact npm start/build/lint commands. Identify Australia/NOAA or unrelated demo content in the active view. Propose a compact PRAMAAN-X dashboard layout suitable for a judge laptop and list files to change. Do not edit files. Do not assume GISMap.jsx is active or MapLibre is installed.
```

**Acceptance:** Active screen/dependencies and minimal UI change plan are known.

## F2 — Build the command-center shell (60–90 minutes)

**Tasks:**

1. Replace the active initial Australia weather view with India/Kolkata PRAMAAN-X workspace.
2. Add header, prototype/mode/time labels, sensor strip, summary cards.
3. Add map/storm-list/detail layout.
4. Add tabs/drawers/sections for every remaining PRAMAAN-X concept.
5. Add provenance legend, loading/error/empty states.

**Prompt:**

```text
Frontend F2: implement the PRAMAAN-X dashboard shell in the existing React/Vite app using installed dependencies and existing style patterns. The initial view must be centered on India/Kolkata, not Australia. Include PRAMAAN-X/prototype badge, scenario/mode/valid-time header, Radar/Satellite/Lightning/NWP health strip, summary cards, map region, storm list, selected-storm detail card, and accessible analysis panels/tabs for interactions, forecast futures/horizons, hazards, trust/skill gate, replay/events, impact, and alert preview. Add a visible measured/calculated/simulated/unavailable legend, plus loading/error/empty states. Temporary data must follow the agreed scenario contract and be deterministic. Remove conflicting active Australia/NOAA copy. Run npm run build and npm run lint.
```

**Acceptance:** Initial screen shows the right product/region and has a place for every required feature area; build succeeds.

## F3 — Connect API and storm map (60–90 minutes)

**Tasks:**

1. Configure backend base URL in one place.
2. Load scenario metadata and GeoJSON.
3. Render storm markers/polygons/tracks with correct map coordinate conversion.
4. Synchronize selection between map, list, and detail card.
5. Populate source/time/provenance and show API loading/error/stale/no-data states.

**Prompt:**

```text
Frontend F3: integrate the dashboard with the backend's agreed response schema. Fetch /api/scenario and /api/nowcast/live using a single configurable local API base URL. Render GeoJSON storm features using the map library already installed. Keep India view centered on the scenario region. Make selection synchronized between map and storm list, and populate selected-storm properties directly from the API. Respect GeoJSON [longitude, latitude] and the map library's coordinate order. Display source, mode, valid time, and per-field provenance. Add loading/error/stale/empty states; do not silently show mock “live” values if the request fails. Run build/lint and provide manual integration instructions.
```

**Acceptance:** API storm appears on the map; selected storm fields match backend; failures are visible.

## F4 — Implement all product-vision panels (60–90 minutes)

**Panels/features:**

1. Storm object intelligence: location, shape/area, motion, acceleration, intensity, lifecycle, growth/decay, available environmental indicators, provenance.
2. Interaction graph: nodes, proximity/relative motion, approach/merge/split/intensification event.
3. Initiation and rapid intensification indicators/events.
4. Sensor observability/reliability and fallback status.
5. Horizon modes: 0–60 minutes, 1–3 hours, 3–6 hours with product/precision explanation.
6. Multiple futures with probabilities/weights and uncertainty visualization.
7. Hazard cards: lightning, hail, downburst/damaging wind, extreme rain/cloudburst.
8. Skill-gated product level and reason.
9. Forecast change explanation feed.
10. Historical-style replay controls and event timeline.
11. Impact/exposure for airport, roads, villages, hospitals, schools, critical infrastructure.
12. Alert preview.

**Prompt:**

```text
Frontend F4: implement the remaining PRAMAAN-X panels using only the shared API/scenario state. Include storm intelligence fields and lifecycle; interaction graph; initiation/intensification indicators; observability/sensor reliability; lead-time selector (0–60m, 1–3h, 3–6h) with product explanation; multiple futures with supplied weights summing to 100%; cards for lightning, hail, downburst, and extreme rain; skill gate; forecast-change explanation; replay timeline; illustrative exposure/impact panel; alert preview. Keep simulated panels coherent with selected storm, scenario time, and sensor state. Make simulation/prototype status visible directly on relevant values/cards. Do not imply calibrated probabilities, real fallback fusion, or verified historical replay. Make all feature categories accessible on a laptop. Run build/lint.
```

**Acceptance:** All concept categories can be shown from the dashboard and share one scenario/time state.

## F5 — Wire replay, Kill Radar, and reset (45–60 minutes)

**Tasks:**

1. Implement play/pause/step and timestamp display.
2. Make replay update map, storm panel, graph, hazards, events, and forecast together.
3. Connect Kill Radar and reset routes.
4. On radar loss, update sensor strip, uncertainty zone/interval, product level, and explanation.
5. Avoid timers/listeners leaks and stale request races.

**Prompt:**

```text
Frontend F5: wire replay controls to scenario frames and Simulate Radar Failure/Reset to backend APIs. Play/pause/step must update valid time and all scenario-backed panels together. Radar failure must use the API response and update sensor strip, fallback availability, map uncertainty zone/interval, forecast product level, and explanation. Reset restores the exact baseline. Handle loading/errors; avoid duplicate intervals/listeners and client-only values conflicting with backend. Run build/lint and provide a manual test sequence.
```

**Acceptance:** Replay and radar-off/reset work without reload and all panels agree.

## F6 — Presentation-focused polish (30–45 minutes)

**Tasks:**

- Improve hierarchy, contrast, spacing, storm selection, map legend, sensor warnings, labels, and laptop layout.
- Ensure judge can find replay, lead-time, storm selection, and Kill Radar quickly.
- Remove unrelated attribution/demo copy that contradicts the scenario.

**Prompt:**

```text
Frontend F6: polish the existing PRAMAAN-X dashboard for a live SIH demo. Improve hierarchy, spacing, contrast, map legend, selected/hover states, sensor warnings, provenance badges, and laptop presentation dimensions. Make storm selection, lead-time control, replay, and Simulate Radar Failure obvious. Remove leftover unrelated Australia/NOAA content. Preserve honest demo labels; do not add features or unsupported claims. Run npm run build and npm run lint and report remaining issues.
```

**Acceptance:** A new viewer can understand the screen and operate the demo controls quickly.

## F7 — Frontend verification and presenter handoff (30–45 minutes)

**Tasks:**

- Test clean browser start, API loading/error, storm select, every panel, replay, radar-off/reset.
- Check laptop resolution and text legibility.
- Capture screenshots/recording once stable.
- Give presenter exact start and demo instructions.

**Prompt:**

```text
Frontend F7: run a final clean-session check against the running backend. Verify initial load, map location, scenario/source labels, API error state, storm selection from map/list, detail/provenance, every feature panel, replay synchronization, radar failure/reset, laptop layout, production build, and lint. Fix only demo blockers. Return pass/fail results, exact start command, API base URL requirement, click-by-click demo sequence, known limitations, and recommended screenshot/recording frames.
```

**Acceptance:** A presenter can run the screen from a fresh browser and knows the verified flow and limitations.

## Frontend priority if time slips

1. App starts and opens on PRAMAAN-X/India scenario.
2. Backend storm data renders and selection details work.
3. Kill Radar and reset visibly work.
4. All major product features are visible through compact panels/tabs.
5. Provenance labels remain visible.
6. Replay and secondary charts/polish.

Simplify graphics before hiding product areas. Use a static graph, compact hazard cards, and predefined replay frames if necessary.

## Integration rules

- Agree schema with backend before F3; temporary frontend fixture must match it exactly.
- Use one selected scenario, storm ID, valid time, and provenance vocabulary everywhere.
- Replay changes all dependent panels together.
- Backend is the source of truth for radar online/offline state.
- Do not silently fall back to fake data when API is unavailable; show an error or explicitly switch to labeled demo fixture mode.
- Capture a stable demo recording after integration; avoid large changes once it works.
