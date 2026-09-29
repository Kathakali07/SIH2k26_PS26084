# PRAMAAN-X Tasks & Workflow

## Phase 1: Propose (Current Phase)
- [x] Create Obsidian-compatible `/docs/brain` folder.
- [x] Write `[[design]]` document specifying architecture and data contracts.
- [x] Write `[[tasks]]` document outlining the OpenSpec workflow.
- [ ] Seek User approval for Phase 2 execution.

## Phase 2: Apply
### Backend Implementation
- [ ] Refactor or build `engine.py` to match exact SEVIR/Earthformer tensor slicing requirements and tracking logic.
  - Implement contour extraction using `cv2.findContours`.
  - Implement the Hungarian algorithm frame-over-frame matching for velocity ($u, v$).
  - Calculate `eta_utc` using the tracked velocity.
- [ ] Refactor or build `main.py` (FastAPI).
  - Update `/api/nowcast/live` to output exact RFC 7946 GeoJSON.
  - Ensure correct property mappings (`hazard_type`, `severity`, `eta_utc`).
  - Implement `/api/kill-radar` endpoint correctly applying $2.5\times$ bounding box multiplier logic.
- [ ] Generate SEVIR mock arrays to match the `[Batch, Time, Channel, Height, Width]` shape requirement for testing.

### Frontend Implementation
- [ ] Reconfigure frontend to consume `eta_utc` and render the digital clock ticking down to zero.
- [ ] Style MapLibre layers based on `hazard_type` (e.g., pulsing red for Cloudbursts).
- [ ] Integrate interactive modal populated with countdown values based on polygon `onClick`.

## Phase 3: Verify
- [ ] Validate GeoJSON outputs from `/api/nowcast/live` using a linter/validator.
- [ ] Verify the tracking algorithm correctly associates identical cells across sequential frames.
- [ ] End-to-end integration test: Radar kill switch successfully expands uncertainty bounds on the frontend.
- [ ] End-to-end integration test: Cloudburst hazard thresholds are accurately mapped to pulsing UI components.
