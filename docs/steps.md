# PRAMAAN-X — STEPS.md (Execution Roadmap)

Derived strictly from the PRD (USP, Tech Stack, 20 Key Features, Workflow §1–20). Nothing here is code; no application files are touched.

Tags used throughout: **[MVP]** must ship for the demo · **[STRETCH]** ship only if MVP gates are green · **[RESEARCH]** research-grade, defer unless proven on real data.

---

## 0. Unresolved PRD Requirements (answer before / during Phase 0)

The PRD does not specify these. They are **not assumed** anywhere below; each has a stated default-for-planning that must be confirmed or replaced.

| # | Open question | Why it matters | Planning default (until answered) |
|---|---|---|---|
| U1 | Which DWR site(s) and which format (IMD Level-2 / CF-Radial / HDF5 / GRIB)? Is the Kolkata DWR data actually obtainable? | Gates Phases 2–6 | Treat as unknown; Phase 0 decides. Pyart/wradlib readers chosen by format |
| U2 | How is historical DWR / INSAT / lightning / AWS data obtained (IMD request, MOSDAC, public archives)? Licence/sharing limits? | Gates all training and replay | Use whatever is legally obtainable; log provenance per file |
| U3 | Which lightning source (IITM network, ISRO, GLM-like, other)? | Lightning features, Neural Hawkes | Optional input; system must run without it |
| U4 | Which NWP (IMD GFS/WRF, ERA5, NCUM)? Needed fields (CAPE, shear, DCAPE, PWAT)? | 3–6 h horizon, hail/downburst | ERA5 as offline fallback for replay; flag as not-real-time |
| U5 | Target region and event list ("Kalbaisakhi 2025" is the only named event). How many events can we get? | Blind benchmark validity | Minimum 1 demo event; benchmark claims limited by event count |
| U6 | Definition of "event/ground truth" per hazard (what observed data verifies hail, downburst, extreme rain?) | Verification metrics for Phases 9, 14 | Rain from AWS/gauges; lightning from lightning obs; hail/downburst **have no ground truth unless reports obtained** → label as unverified |
| U7 | "16+ futures" — does flow matching need to be learned, or is an ensemble acceptable for MVP? | Phase 10 scope | Perturbation ensemble for MVP; Flow Matching [RESEARCH] |
| U8 | Skill-gating thresholds (BSS/CSI cutoffs) | Phase 10/14 | Derived from validation data, never hard-coded guesses |
| U9 | Exposure datasets (WorldPop, OSM, hospitals, schools, airports) licences/versions | Phase 11 | OSM + WorldPop (open) |
| U10 | Alert standard "CAP 1.2" — is a valid CAP XML enough, or must a real dissemination channel exist? | Phase 12 | Valid CAP 1.2 XML generation only; no real dissemination |
| U11 | Team size, roles, hackathon dates, GPU access | Schedule | Assumed 4–5 students, 1 GPU (or Colab/Kaggle), ~8 weeks — **replace** |
| U12 | Real-time live feed access at demo time (internet, feed latency)? | Live mode | Live mode = *simulated live* from replay unless a true feed is confirmed; UI must label it |
| U13 | PRD says "Final System" (Workflow §20) with empty content | Final integration | Interpreted as end-to-end pipeline in Phase 15–16; confirm |
| U14 | "Virtual-DWR model" (Feature 6) — undefined training target/data | Radar-failure fallback | [RESEARCH]; MVP fallback = satellite+lightning+NWP motion/persistence, not synthesised radar |
| U15 | Compute budget for Swin Transformer / Neural Operators / Temporal Perceiver | Phase 8 | MVP uses classical methods; deep models only after baselines |

---

## 1. Project Readiness

### 1.1 Prerequisites
- Team agrees on U1–U6 owners and a single **Data Lead** responsible for provenance.
- At least one radar event (volume scans over ≥ 6 h) + co-located INSAT IR + lightning (if any) + AWS rain obtained. **If not obtainable by end of Phase 2, the scope drops to the fallback in §4.6.**
- Everyone can run Docker and a Python 3.11/3.12 env.

### 1.2 Software and accounts
| Need | Purpose |
|---|---|
| Git + GitHub org, branch protection on `main` | Collaboration |
| Python 3.11 or 3.12 (via `uv` or `conda`) | Core |
| Node 20 LTS + pnpm | Frontend |
| Docker + Docker Compose | PostGIS/Timescale, Redis, NATS, MinIO |
| GPU (local CUDA 12.x or Kaggle/Colab) | Only from Phase 8b onward |
| MOSDAC account (INSAT), Copernicus account (DEM), ECMWF/CDS account (ERA5), IMD contact | Data |
| Map style source for MapLibre (self-host or OSM-based tiles) | Frontend |
| MLflow + DVC remote (MinIO or Google Drive) | Experiment/data tracking |

### 1.3 Dataset requirements (minimum viable)
| Data | Minimum | Notes |
|---|---|---|
| DWR volume scans | 1 full convective event (≥ 6 h) for demo; ≥ 5 events to claim any benchmark | Record sensor site, scan strategy, timestamps |
| INSAT IR (e.g. TIR1) | Same events | 15–30 min cadence assumed; **verify** |
| Lightning | Same events (optional) | U3 |
| NWP/reanalysis | Same events | ERA5 acceptable offline |
| AWS/rain gauges | Same region | Verification of rain |
| Terrain | Copernicus DEM tiles for region | Static |
| Exposure | OSM extract, WorldPop raster | Static |

Every record must carry `event_time`, `available_time`, `ingestion_time`, `source`, `resolution`, `latency`, `quality_flag` (PRD §1A). `available_time` is the anti-leakage backbone — **if the true availability time is unknown, assume event_time + documented nominal latency and record that assumption in the manifest.**

### 1.4 Repository setup (target layout; created in Phase 1)
```
pramaan-x/
├── PRD.md  STEPS.md  README.md  DECISIONS.md  Makefile
├── pyproject.toml  uv.lock  docker-compose.yml  .env.example
├── configs/            # YAML: grid, qc thresholds, tracker, model, skill-gate
├── data/               # DVC-tracked (raw/, interim/, processed/, zarr/) — never in git
├── docs/               # schemas.md, data_contracts.md, runbook.md, validation_report.md
├── notebooks/          # exploration only; nothing imported from here
├── src/pramaanx/
│   ├── common/         # schemas (pydantic), time utils, logging, config
│   ├── ingest/         # readers, manifest, availability-time logic
│   ├── qc/             # radar/sat/lightning QC
│   ├── grid/           # common grid, regridding, observability tensor
│   ├── storms/         # detect, track, objects, lifecycle, graph
│   ├── forecast/       # baselines, lagrangian, advanced models
│   ├── hazards/        # lightning, hail, downburst, rain
│   ├── uncertainty/    # ensembles, conformal, calibration, skill_gate
│   ├── impact/         # exposure, hazard x exposure
│   ├── replay/         # replay engine, leakage guard
│   ├── ledger/         # SHA-256 chain
│   ├── api/            # FastAPI, WebSocket, CAP
│   └── eval/           # metrics, benchmark runner
├── frontend/           # Next.js app
├── tests/              # unit/, integration/, e2e/, fixtures/ (tiny real slices)
├── scripts/            # reproducible CLI entrypoints
└── infra/              # SQL migrations, NATS config, Grafana dashboards
```

### 1.5 Development environment (reproducible)
```bash
git clone <repo> && cd pramaan-x
uv venv --python 3.12 && source .venv/bin/activate
uv pip install -e ".[dev]"            # pins in pyproject + uv.lock
docker compose up -d                   # postgis/timescale, redis, nats, minio
make env-check                         # runs scripts/env_check.py (see Phase 1)
make test
```
**Install rule (team preference: validate mechanics empirically):** no library goes into the architecture until `scripts/env_check.py` has *imported it and executed a minimal real call* in the pinned environment. Versions seen on PyPI at planning time (to be re-verified, pinned in `uv.lock`): arm-pyart 2.3.0, wradlib 2.9.6, satpy 0.60.0, pysteps 1.21.5, torch-geometric 2.8.0.post1, xarray 2026.9.0, zarr 3.4.0, dask 2026.8.0, pyresample 1.35.0, rasterio 1.5.2. Known risk areas: zarr 3.x ↔ xarray/dask compatibility, GDAL/rasterio wheels, PyG ↔ torch/CUDA pairing, pysteps on current NumPy. Resolve in Phase 1, not later.

### 1.5.1 Global Definition of Done (applies to every phase)
- [ ] Code merged via PR, reviewed by one other member
- [ ] Unit tests + the phase's integration test pass in CI
- [ ] Phase CLI is reproducible from a clean clone (`make phaseN`)
- [ ] Output schemas validated by pydantic/JSON-schema and documented in `docs/data_contracts.md`
- [ ] Metrics logged to MLflow with data version (DVC hash) and git SHA
- [ ] No leakage: every time-dependent function takes `as_of` and refuses data with `available_time > as_of`
- [ ] No placeholder outputs exposed as predictions; unimplemented outputs return `status: "unavailable"`
- [ ] Docs updated; checklist ticked

---

## 2. Cross-Cutting Contracts (freeze in Phase 1, change only via DECISIONS.md)

**C1 Record envelope** (all sources): `event_time, available_time, ingestion_time, source, site_id, resolution_m, latency_s, quality_flag, uri`.

**C2 Common grid dataset** (xarray → Zarr): dims `(time, y, x)`; CRS stored in attrs; variables `dbz, vil, echo_top, ir_bt, lightning_count, cape, shear, dcape, pwat, terrain` plus `observability_*`; all with `*_age_s` and `*_valid` masks. Grid resolution from config (PRD: 1–3 km; **default 2 km, confirm in Phase 4**).

**C3 Observability tensor** `R(x,y,t)` channels: radar_age, radar_range, beam_height, beam_blockage, radar_quality, sat_age, lightning_coverage, missing_mask, sensor_health — each in [0,1] or documented units.

**C4 StormObject** (pydantic): `storm_id, track_id, t, centroid(lon,lat), area_km2, shape(orientation,eccentricity), speed_kmh, heading_deg, accel, max_dbz, vil, echo_top_km, lightning_rate, lightning_accel, ir_bt_min, ir_cooling_rate, cape, shear, dcape, growth_rate, lifecycle ∈ {initiating, developing, mature, dissipating, unknown}, sensor_reliability, provenance{fields: measured|derived|unavailable}`. Missing values are `null` + provenance, **never zero-filled**.

**C5 StormGraph**: nodes = StormObject ids; edge features `distance_km, rel_velocity, rel_heading, overlap, convergence, intensity_diff`; edge labels (training only) `merge|split|none`.

**C6 ForecastProduct**: `product_type ∈ {storm_track, hazard_zone, regional_outlook}`, `lead_min`, `issued_at`, `valid_at`, `data_cutoff` (= `as_of`), `members[]`, `probability`, `eta_median_min`, `eta_interval{level, lo, hi}`, `confidence`, `skill_gate{passed, reason}`, `observability_summary`, `model_version`.

**C7 ImpactProduct**: `hazard, exposure_layer, exposure_value, risk_class, method`.

**C8 LedgerEntry**: `entry_id, as_of, input_manifest_hash, model_version, prediction_hash, sensor_state, prev_hash, hash=SHA256(prev_hash‖payload)`.

**C9 API/WebSocket**: versioned `/api/v1/*`, WS topics `storms`, `forecasts`, `observability`, `alerts`; messages are C4/C6/C7 JSON with `schema_version`.

---

## 3. Phased Implementation

Phase map (dependencies in brackets):

| Ph | Name | Tag | Depends on |
|---|---|---|---|
| 0 | Validation & feasibility | MVP | — |
| 1 | Repo & infra | MVP | 0 |
| 2 | Data acquisition | MVP | 0, 1 |
| 3 | Ingestion & QC | MVP | 1, 2 |
| 4 | Common grid & observability | MVP | 3 |
| 5 | Storm detection | MVP | 4 |
| 6 | Storm objects & tracking | MVP | 5 |
| 7 | Interaction graph | MVP (rule-based) / STRETCH (learned) | 6 |
| 8 | Nowcasting baselines (8a) → advanced (8b) | 8a MVP, 8b STRETCH/RESEARCH | 6 (7 optional) |
| 9 | Hazard probabilities | Lightning & rain MVP; hail/downburst STRETCH | 6, 8a |
| 10 | Uncertainty & skill-gating | MVP | 8a, 9, 14-metrics |
| 11 | Impact assessment | MVP | 9 |
| 12 | Backend & real-time | MVP | 6, 8a, 10, 11 |
| 13 | Frontend | MVP | 12 (mock contract earlier) |
| 14 | Replay & benchmark | MVP | 8a, 10 |
| 15 | Integration & validation | MVP | all MVP |
| 16 | Deployment & demo | MVP | 15 |

Note: 10 and 14 are mutually dependent (skill gating needs verification metrics; benchmark needs the uncertainty outputs). Resolution: the **metrics module (`eval/`) is built first in Phase 8a**, then 10 and 14 consume it.

---

### Phase 0 — Requirement Validation & Feasibility [MVP]
**Objective.** Convert the PRD into a verified, data-backed scope; decide what is real vs deferred.

**Tasks**
1. Build a requirement traceability matrix: PRD features 1–20 → phase → MVP/STRETCH/RESEARCH → data needed → test.
2. Resolve or assign owners to U1–U15; record answers in `DECISIONS.md`.
3. Data feasibility spike (2 days max): obtain *one* real radar file, *one* INSAT IR file, *one* lightning/NWP sample; open each with the candidate library and plot it.
4. Library feasibility spike: install and run minimal calls for Py-ART, wradlib, Satpy, pyresample, pySTEPS, PyG, MapLibre, deck.gl in the pinned env.
5. Compute feasibility: measure time to load/regrid one scan; estimate per-event cost.
6. Decide go/fallback (§4.6).

**Technical details.** Spike code lives in `notebooks/spikes/` and is throwaway; findings copied to `docs/feasibility.md` with the exact commands and versions used.

**Inputs:** PRD, data contacts. **Outputs:** `docs/traceability.md`, `docs/feasibility.md`, `DECISIONS.md`, scope freeze.
**Dependencies:** none.
**Files:** `docs/`, `DECISIONS.md`, `notebooks/spikes/`.
**Libraries:** all candidates (smoke-test only).
**Tests:** spike scripts must run end-to-end from a clean env (becomes `scripts/env_check.py` in Phase 1).
**Acceptance**
- Every PRD feature has a tag and an owner.
- At least one real radar scan renders as a reflectivity map.
- Unknowns list explicitly states which are still open.
**Failure cases:** radar data unobtainable → activate fallback; proprietary format unsupported by Py-ART → write a thin reader or request CF-Radial conversion; library conflicts → drop library from MVP.
**Checklist**
- [ ] Traceability matrix · [ ] U1–U15 answered/owned · [ ] Real scan plotted · [ ] Env spike reproducible · [ ] Go/fallback decision logged

---

### Phase 1 — Repository & Infrastructure Setup [MVP]
**Objective.** Reproducible environment, CI, contracts, empty-but-wired services.

**Tasks**
1. Create repo layout (§1.4), `pyproject.toml` with extras `[dev,ml,geo,api]`, lockfile.
2. `docker-compose.yml`: PostGIS+TimescaleDB (single Postgres image supporting both, or two services — verify), Redis/Valkey, NATS JetStream, MinIO. Health checks on all.
3. `scripts/env_check.py`: import + minimal call for every library; prints versions; fails loudly.
4. Implement contracts C1–C9 as pydantic models in `common/schemas.py`; export JSON Schema to `docs/schemas/`.
5. Config system (YAML + pydantic-settings); logging; `as_of` time utility + `LeakageError`.
6. CI (GitHub Actions): lint (ruff), type-check (mypy on `common/`), unit tests, frontend build.
7. DVC init with MinIO remote; MLflow server in compose.
8. Makefile targets: `env-check, up, down, test, lint, phaseN`.

**Inputs:** Phase 0 decisions. **Outputs:** running compose stack, green CI, schema package.
**Dependencies:** 0.
**Libraries:** uv, pydantic, ruff, mypy, pytest, DVC, MLflow, Docker.
**Tests:** unit — schema validation rejects missing/zero-filled fields, `as_of` guard raises on future data; integration — `docker compose up` then health-check script passes; `make env-check` passes on clean clone.
**Acceptance:** new member can reach green `make test` in < 30 min following README only.
**Failure cases:** GDAL/rasterio wheel mismatch (use conda-forge or pinned wheels); zarr 3 vs xarray backend errors (pin compatible pair, test round-trip in env_check); PyG/torch/CUDA mismatch (install CPU first; GPU later); port conflicts.
**Checklist**
- [ ] Compose healthy · [ ] CI green · [ ] Schemas C1–C9 frozen · [ ] env_check passes · [ ] README quickstart verified by a second person

---

### Phase 2 — Historical & Sample Data Acquisition [MVP]
**Objective.** Real, versioned, provenance-tracked event data.

**Tasks**
1. Select event list (U5), write `data/events.yaml` (name, bbox, start/end, hazards observed, sources, licence).
2. Acquire radar, INSAT IR, lightning, NWP/ERA5, AWS rain, DEM, OSM, WorldPop per §1.3.
3. Build `data/manifests/<event>.parquet` with C1 fields per file, including checksum and original filename.
4. Document nominal latency per source for `available_time`; mark each as `measured|nominal|assumed`.
5. Cut **tiny fixtures** (a few scans, small bbox) into `tests/fixtures/` (real data, small; check licence).
6. Track everything with DVC.

**Inputs:** accounts, contacts. **Outputs:** DVC-tracked raw data + manifests + fixtures.
**Dependencies:** 0, 1.
**Files:** `data/raw/`, `data/manifests/`, `data/events.yaml`, `scripts/download_*.py`, `docs/data_sources.md`.
**Libraries:** requests/httpx, MOSDAC/CDS APIs (cdsapi), boto/minio client, pandas.
**Tests:** manifest completeness (no null C1 fields), checksum verification, file-opens test per source via the Phase-3 readers (smoke).
**Acceptance:** ≥ 1 event with all mandatory sources (radar + IR + rain); optional sources explicitly marked absent otherwise.
**Failure cases:** timestamps in local time vs UTC (normalise and test); missing scans/gaps (record in manifest, do not interpolate silently); licence restrictions on redistribution; very large downloads (subset bbox/time).
**Checklist**
- [ ] events.yaml · [ ] Manifests · [ ] DVC push · [ ] Fixtures committed · [ ] Latency assumptions documented

---

### Phase 3 — Data Ingestion & Quality Control [MVP]
**Objective.** Read every source into validated, QC-flagged, availability-stamped records.

**Tasks**
1. Readers: `ingest/radar.py` (Py-ART/wradlib), `ingest/satellite.py` (Satpy; fallback rasterio/netCDF), `ingest/lightning.py`, `ingest/nwp.py`, `ingest/aws.py`. Each returns data + C1 envelope.
2. QC pipeline (PRD §2): format validation → geolocation check → missing-value → outlier → sensor-quality → timestamp validation.
3. Radar QC: ground-clutter filter (start with threshold + texture/Gabella-style in wradlib), beam blockage (DEM-based, wradlib), attenuation flag, AP flag; **flag, don't delete**.
4. Satellite QC: missing scan, stale, navigation sanity (known landmarks), cloud-mask availability.
5. Lightning QC: duplicate flashes, impossible coordinates, temporal gaps.
6. Write QC report per file (`qc_report.json`) and aggregate coverage stats.
7. Ledger stub: record ingest events (full ledger in Phase 12).
8. Live gateway: abstraction `DataGateway.get(as_of)` with two backends — `ReplayGateway` (MVP) and `LiveGateway` (STRETCH, only if feed confirmed, U12).

**Inputs:** raw data, manifests. **Outputs:** QC'd intermediate NetCDF/Zarr + QC reports.
**Dependencies:** 1, 2.
**Files:** `src/pramaanx/ingest/`, `src/pramaanx/qc/`, `configs/qc.yaml`, `tests/unit/test_qc_*.py`.
**Libraries:** Py-ART, wradlib, Satpy, xarray, numpy, scipy, pandas.
**Tests**
- Unit: synthetic corrupted arrays (NaN blocks, spikes, wrong coords) each trigger the correct flag; timestamp parser handles UTC/IST.
- Integration: fixture event end-to-end → QC report generated; `ReplayGateway.get(as_of)` never returns `available_time > as_of`.
**Acceptance:** QC flags visually verified on ≥ 3 scans (clutter/blockage maps plotted and reviewed); zero crashes on full event; leakage test passes.
**Failure cases:** vendor-specific field names; sweep ordering; velocity folding (flag Doppler as low-trust until dealiased — dealiasing is STRETCH); over-aggressive clutter removal deleting real echoes.
**Checklist**
- [ ] All readers · [ ] QC report · [ ] Leakage test · [ ] Manual visual QC sign-off · [ ] Gateway interface frozen

---

### Phase 4 — Common Geospatial Grid & Preprocessing [MVP]
**Objective.** Aligned multi-source grid + observability tensor.

**Tasks**
1. Define grid in `configs/grid.yaml` (CRS, bbox, resolution; default 2 km — evaluate 1 vs 2 vs 3 km on memory/time).
2. Radar → grid: polar-to-Cartesian composite (max-column or CAPPI; document choice), derive `dbz, vil, echo_top`. Record beam height per cell.
3. Satellite IR → grid via pyresample (BT, plus 15/30-min cooling-rate with proper time alignment).
4. Lightning → grid: counts per time window; derive rate.
5. NWP/ERA5 → grid with temporal and spatial interpolation; derive CAPE/shear/DCAPE/PWAT only from fields actually present (U4); otherwise leave `unavailable`.
6. Terrain from DEM.
7. Observability tensor R (C3) from radar range/beam height/blockage/age, satellite age, lightning coverage, missing mask.
8. Write to Zarr with chunking by time; `dask` for lazy ops; consolidate metadata.
9. Time alignment policy: each grid time-slice uses the *latest observation with `available_time ≤ slice_time`* and stores its age.

**Inputs:** QC'd data. **Outputs:** `data/zarr/<event>.zarr` conforming to C2/C3.
**Dependencies:** 3.
**Files:** `src/pramaanx/grid/`, `configs/grid.yaml`.
**Libraries:** xarray, dask, zarr, pyresample, rasterio, GDAL, pyproj, numba (optional).
**Tests:** unit — regridding a known synthetic field preserves values/geolocation within tolerance; CRS round-trip; age computation; integration — Zarr round-trip identical; plotted overlays (radar edge vs coastline/known landmark).
**Acceptance:** visual alignment verified; observability channels in expected ranges; one event processes within the team's time budget (record actual time, don't guess).
**Failure cases:** half-pixel offset; wrong radar elevation handling; satellite parallax ignored (document as known limitation); chunk explosion; timezone mismatch.
**Checklist**
- [ ] Grid config · [ ] All sources aligned · [ ] Observability tensor · [ ] Zarr schema tests · [ ] Alignment visually verified

---

### Phase 5 — Storm Detection & Segmentation [MVP baseline / STRETCH deep]
**Objective.** Per-timestep convective storm masks.

**Tasks**
1. **Baseline [MVP]:** threshold reflectivity (e.g. ≥ 35 dBZ — value tuned and documented), morphological cleanup, connected components, minimum-area filter, optionally watershed for splitting merged cores; satellite IR cold-cloud threshold as secondary detector where radar is unreliable.
2. Respect observability: cells where `radar_quality` is low are labelled low-confidence, not silently dropped.
3. Optional: multimodal Swin-based segmentation **[RESEARCH]** — only if labelled masks exist (use baseline masks as weak labels and *say so*).
4. Evaluate against hand-labelled masks on a small subset (≥ 20 frames labelled by team).

**Inputs:** Zarr grid. **Outputs:** `storm_label(time,y,x)` int array + per-frame detection QC.
**Dependencies:** 4.
**Files:** `src/pramaanx/storms/detect.py`, `configs/storms.yaml`, `tests/unit/test_detect.py`.
**Libraries:** scikit-image, scipy.ndimage, OpenCV, xarray.
**Tests:** synthetic blobs (known count/area) recovered; split/merge synthetic case; integration — fixture event produces plausible counts, visual overlay review.
**Acceptance:** IoU/CSI vs hand labels reported (real numbers, small-sample caveat stated); no frames with unlabelled crash.
**Failure cases:** threshold sensitivity; stratiform contamination (bright band); clutter becoming "storms"; storm fragmentation at beam-height boundaries.
**Checklist**
- [ ] Baseline detector · [ ] Hand-label eval · [ ] Observability-aware flags · [ ] Config-driven thresholds

---

### Phase 6 — Storm Object Extraction & Lifecycle Tracking [MVP]
**Objective.** Time-consistent StormObjects (C4) with kinematics and lifecycle.

**Tasks**
1. Feature extraction per labelled cell: area, shape, centroid, dBZ max/percentiles, VIL, echo-top, IR min/cooling rate, lightning rate/accel, environment (CAPE/shear/DCAPE sampled at centroid, if available), reliability from R.
2. Tracking: Lucas–Kanade/Farnebäck optical flow (OpenCV) to predict displacement → Hungarian assignment between frames (cost = overlap/centroid distance/size) → `track_id`; handle merge/split by recording parent/child links.
3. Kinematics: speed, heading, acceleration from track history (smoothed; document filter).
4. Growth/decay from area/VIL/max-dBZ trends.
5. Lifecycle classifier **[MVP: rule-based]** (initiating/developing/mature/dissipating from growth and intensity trend, thresholds in config); learned lifecycle model **[STRETCH]** only with enough labelled tracks.
6. Persist to TimescaleDB (`storm_state` hypertable) and Parquet.
7. Track-quality metrics: track length distribution, ID switches on synthetic data.

**Inputs:** Phase 5 labels + grid. **Outputs:** `storm_objects.parquet`, DB table, track metrics.
**Dependencies:** 5.
**Files:** `src/pramaanx/storms/{features,track,lifecycle}.py`, `infra/sql/002_storm_state.sql`.
**Libraries:** OpenCV, scipy (linear_sum_assignment), pandas, SQLAlchemy/psycopg.
**Tests:** unit — constant-velocity synthetic storm tracked with correct speed; merge/split link logic; null handling (no zero-fill); integration — fixture event yields continuous tracks; DB round-trip schema-valid.
**Acceptance:** tracks inspected on overlay video for ≥ 10 storms; speed/heading plausible vs manual estimate; missing features marked `unavailable` with provenance.
**Failure cases:** ID switching in dense clusters; optical-flow aperture problem; acceleration noise (over-differentiation); timestep irregularity (use real Δt).
**Checklist**
- [ ] Features · [ ] Tracker · [ ] Kinematics · [ ] Lifecycle rules · [ ] DB persistence · [ ] Overlay video review

---

### Phase 7 — Storm Interaction Graph [MVP rule-based / STRETCH learned]
**Objective.** Graph (C5) per timestep with interaction signals.

**Tasks**
1. Build graph: nodes = StormObjects; edges within distance threshold; edge features per C5.
2. **MVP rule-based predictor:** merge-risk from closing speed + distance + overlap trajectory; split-risk from elongation/bimodal core; new-cell hints from outflow proximity (only if data supports).
3. Auto-derive event labels (merge/split) from Phase 6 parent/child links for evaluation.
4. **STRETCH:** PyG Graph Transformer for merge/split/intensification; train on labels from available events; evaluate against the rule-based baseline on a held-out event. **Keep it only if it beats the baseline on held-out data.**
5. Report event counts — if too few merges exist to train, state that and do not train.

**Inputs:** StormObjects. **Outputs:** `storm_graph/*.json`, interaction risk fields on objects.
**Dependencies:** 6.
**Files:** `src/pramaanx/storms/graph.py`, `src/pramaanx/storms/interaction_rules.py`, (STRETCH) `forecast/gnn.py`.
**Libraries:** NetworkX, PyTorch, PyTorch Geometric.
**Tests:** synthetic two-storm converge scenario → merge risk rises monotonically; graph build deterministic; PyG batch loads (STRETCH).
**Acceptance:** rule-based merge-risk evaluated against derived merge events with POD/FAR reported honestly.
**Failure cases:** too few interaction events; label leakage from using future frames in features; graph size explosion in widespread convection.
**Checklist**
- [ ] Graph builder · [ ] Rule predictor · [ ] Label derivation · [ ] Evaluation · [ ] (Stretch) GNN beats baseline or is dropped

---

### Phase 8 — Baseline Nowcasting & Forecasting [8a MVP; 8b STRETCH/RESEARCH]
**Objective.** Honest, measurable forecasts; then optional advanced models.

**8a Tasks [MVP]**
1. **Eval module first** (`eval/metrics.py`): CSI, POD, FAR, FSS, Brier, BSS, CRPS, ETA error/coverage — unit-tested on known inputs.
2. Baselines: persistence; Lagrangian persistence (optical-flow advection); pySTEPS (S-PROG/STEPS) as the strong classical comparator.
3. **Storm-object extrapolation (0–60 min):** advect storm centroid/shape with tracked velocity + growth/decay trend; produce `storm_track` ForecastProduct.
4. **1–3 h:** extrapolation with decaying confidence + CI/initiation heuristics (below); output probabilistic zones (C6 `hazard_zone`) from ensemble spread (Phase 10).
5. **3–6 h:** regional susceptibility from NWP environment indices (CAPE/shear/PWAT thresholds from literature, tuned on validation) **[MVP only if NWP available, otherwise omit]**.
6. **Convective initiation [STRETCH heuristic → RESEARCH learned]:** IR cooling-rate + cloud growth + lightning precursors + CAPE/CIN as logistic/GBM model on pixels with labels from later radar initiation; report as probability **only if calibrated** (Phase 10).
7. Compare all methods on validation events by lead time.

**8b Tasks [STRETCH/RESEARCH — gate: 8a complete and benchmark harness green]**
- Swin / Neural Operator / Temporal Perceiver / Cross-Attention nowcaster; Conditional Flow Matching futures; Neural-operator 1–3 h model.
- Rule: train on training events only; log to MLflow; promote to product **only if it beats pySTEPS and Lagrangian persistence on held-out events with stated confidence intervals**. Otherwise record as negative result.
- Virtual-DWR (U14) stays RESEARCH.

**Inputs:** grid, StormObjects, tracks. **Outputs:** forecasts per lead time, metric tables.
**Dependencies:** 6 (7 optional).
**Files:** `src/pramaanx/forecast/{baselines,lagrangian,object_extrap,ci,environment}.py`, `src/pramaanx/eval/`, `configs/forecast.yaml`.
**Libraries:** pySTEPS, OpenCV, scikit-learn, LightGBM (optional), PyTorch (8b), MLflow.
**Tests:** metric functions vs hand-computed cases; advection of synthetic field by known velocity recovered; leakage test (forecast at `as_of` uses no later data); integration — forecast pipeline on fixture event outputs schema-valid C6.
**Acceptance:** table of CSI/FSS/BSS by lead time for each baseline on held-out data; baseline order sanity (Lagrangian ≥ persistence at short lead; if not, investigate).
**Failure cases:** pySTEPS config/NumPy incompatibility; optical-flow errors at gaps; evaluation on training events (leakage); skill reported on tiny samples without caveat.
**Checklist**
- [ ] Metrics module · [ ] 3 baselines · [ ] Object extrapolation · [ ] Lead-time tables · [ ] (Stretch) CI heuristic · [ ] (Research) models promoted only if they beat baselines

---

### Phase 9 — Hazard Probability Estimation [Lightning, Extreme rain MVP; Hail, Downburst STRETCH]
**Objective.** Hazard-specific, evaluated probabilities.

**Tasks**
1. **Lightning [MVP]:** next-30-min lightning probability/density from current lightning rate, VIL, IR cooling, echo-top; lightning-jump detector (σ-level style) on flash-rate series. Needs lightning data (U3); otherwise lightning proxy products are marked `proxy` and labelled as such. Neural Hawkes **[RESEARCH]**.
2. **Extreme rain [MVP-lite]:** radar-rainfall via Z–R (document relationship), accumulation along tracked storm path, residence time; evaluate vs AWS. GPD tail model **[STRETCH]**, only with enough exceedances (state sample count; otherwise do not claim tails).
3. **Hail [STRETCH]:** physically-based indices (VIL density, echo-top vs −20°C/freezing level, MESH where radar supports) → probability via calibrated logistic model; **ground truth is U6 — without hail reports, output is "indicator" not "probability" and must be labelled so**.
4. **Downburst [STRETCH]:** indicators (echo-top collapse, core descent, DCAPE, Doppler divergence when velocity valid). Same labelling rule.
5. Each hazard outputs C6 with `probability`, `calibrated: true|false`.

**Inputs:** StormObjects, forecasts, environment. **Outputs:** hazard products + verification tables where truth exists.
**Dependencies:** 6, 8a.
**Files:** `src/pramaanx/hazards/{lightning,rain,hail,downburst}.py`.
**Libraries:** scikit-learn, scipy.stats (GPD), pandas, PyTorch (Hawkes, RESEARCH).
**Tests:** unit — jump detector on synthetic series; Z–R known values; GPD fit on synthetic data recovers params; integration — each hazard returns valid schema or `unavailable`.
**Acceptance:** each hazard marked **verified** (ground truth + metrics), **indicator-only**, or **unavailable** in the UI/API.
**Failure cases:** no ground truth; class imbalance; Z–R miscalibration; Doppler data unusable (aliasing).
**Checklist**
- [ ] Lightning · [ ] Rain · [ ] Hail (or labelled indicator) · [ ] Downburst (or labelled indicator) · [ ] Verification status per hazard documented

---

### Phase 10 — Uncertainty Quantification & Skill-Gating [MVP]
**Objective.** Calibrated uncertainty, honest ETA intervals, and enforced product downgrading.

**Tasks**
1. **Ensemble [MVP]:** 16 members via perturbations (motion vector, growth rate, observation uncertainty scaled by observability, pySTEPS stochastic members) → probability map. Flow-matching generative futures **[RESEARCH]**; label the ensemble method truthfully in `model_version`.
2. **ETA + interval [MVP]:** ETA distribution from member arrival times at target location; wrap with **split-conformal** (calibration events held out); Adaptive Conformal Inference **[STRETCH]**. Evaluate empirical coverage of the 80% interval.
3. **Calibration:** isotonic/beta calibration for hazard probabilities; reliability diagrams on validation data.
4. **Observability coupling:** interval width inflated as function of R (e.g. radar_quality); fit the inflation on validation, don't hand-pick.
5. **Skill-gate [MVP]:** table of skill (BSS/CSI) per product × lead time (rolling validation); rule: if skill below configured threshold **or** current data quality below threshold → downgrade `storm_track → hazard_zone → regional_outlook → none`. Thresholds in `configs/skill_gate.yaml`, justified from validation (U8). Every downgrade has a recorded reason.
6. **"Why did forecast change?" [MVP-lite]:** diff successive ForecastProducts; attribute change to logged events (lightning jump, merge, IR cooling, sensor degradation, CI) using rule-based attribution; SHAP-style attribution **[STRETCH]**. Attribution is stated as "contributing signals", not causal proof.

**Inputs:** ensembles, hazard products, metrics. **Outputs:** uncertainty-annotated C6, `skill_table.json`, reliability plots, coverage report.
**Dependencies:** 8a, 9, eval module.
**Files:** `src/pramaanx/uncertainty/{ensemble,conformal,calibration,skill_gate,explain}.py`, `configs/skill_gate.yaml`.
**Libraries:** MAPIE or hand-written split-conformal (verify API in env_check), scikit-learn, pySTEPS, numpy.
**Tests:** conformal coverage ≈ nominal on synthetic exchangeable data; gate downgrades when skill/quality mocked low; interval widens when radar_quality drops (monotonic); reliability computation.
**Acceptance:** empirical 80% coverage reported on held-out events (whatever it is); gate transitions logged; no product shown above its gated level.
**Failure cases:** conformal exchangeability violated (events not exchangeable — report this limitation); too few calibration samples; gate flapping (add hysteresis).
**Checklist**
- [ ] Ensemble · [ ] Conformal ETA · [ ] Calibration plots · [ ] Skill table · [ ] Gate + hysteresis · [ ] Change explanations

---

### Phase 11 — Geospatial Impact Assessment [MVP]
**Objective.** Hazard × Exposure → Impact (C7).

**Tasks**
1. Load OSM (roads, airports, hospitals, schools) into PostGIS via OSMnx/osm2pgsql; WorldPop population raster to grid.
2. Exposure score per feature: documented, simple, transparent (e.g. population in hazard zone; asset inside p>threshold footprint).
3. Risk class matrix (hazard probability band × exposure class) in config; **explicitly a heuristic, not a validated damage model**.
4. ETA to each asset from ensemble.
5. API-ready queries: `impact_for_forecast(forecast_id)`; spatial indexes.

**Inputs:** hazard products, exposure layers. **Outputs:** ImpactProduct list, GeoJSON.
**Dependencies:** 9 (needs ≥ 1 hazard).
**Files:** `src/pramaanx/impact/`, `infra/sql/003_exposure.sql`, `configs/impact.yaml`.
**Libraries:** PostGIS, GeoPandas, Shapely, OSMnx, rasterio, rasterstats.
**Tests:** known polygon/point intersection cases; CRS-correct area/distance; empty-hazard case returns no impact.
**Acceptance:** airport/hospital/road examples verified by hand against map for one event.
**Failure cases:** OSM tag inconsistency; CRS errors in area calc; stale exposure data; slow spatial joins without GiST indexes.
**Checklist**
- [ ] Exposure ingested · [ ] Matrix configured · [ ] Spatial index · [ ] Manual verification · [ ] "Heuristic" labelling in UI/API

---

### Phase 12 — Backend APIs & Real-Time Updates [MVP]
**Objective.** Versioned REST + WebSocket serving C4/C6/C7, alerts, ledger.

**Tasks**
1. FastAPI app: `/health, /api/v1/storms, /forecasts, /hazards, /impact, /observability, /skill, /replay/*, /ledger`.
2. WebSocket endpoint pushing topic updates; NATS JetStream as internal bus between pipeline worker and API (STRETCH to use NATS; MVP can use Redis pub/sub — decide in DECISIONS.md, don't build both).
3. Pipeline worker: for each new "scan" (live or replay tick) run Workflow §14 chain; publish updates.
4. **Failure injection endpoint** `/api/v1/sim/sensor/{name}/off` (radar etc.) forcing the observability layer to treat the sensor as unavailable → real fallback path (not a canned response).
5. **Ledger [MVP]:** append-only SHA-256 hash chain in PostgreSQL; verify endpoint recomputes chain.
6. **CAP 1.2 export** (valid XML; schema validation) for alerts (U10).
7. OpenAPI spec exported; contract tests against pydantic schemas; versioning header.
8. Basic auth/CORS config; rate limits not required for MVP.

**Inputs:** pipeline outputs. **Outputs:** running API, OpenAPI JSON, ledger, CAP XML.
**Dependencies:** 6, 8a, 10, 11.
**Files:** `src/pramaanx/api/`, `src/pramaanx/ledger/`, `infra/sql/004_ledger.sql`, `tests/integration/test_api_*.py`.
**Libraries:** FastAPI, uvicorn, websockets, SQLAlchemy, Redis (or NATS client), lxml/xmlschema (CAP validation), cryptography/hashlib.
**Tests:** contract tests (response validates against schema); WS client receives updates in order; ledger tamper test (modify a row → verify fails); sensor-off changes observability and widens intervals; CAP XML validates.
**Acceptance:** replay tick → WS message in < configured latency (measure and record, no invented target); ledger verification passes/fails correctly.
**Failure cases:** WS backpressure; DB connection pool exhaustion; timezone serialization; breaking schema versions; ledger ordering race (single writer).
**Checklist**
- [ ] REST endpoints · [ ] WS · [ ] Worker loop · [ ] Sensor-off path real · [ ] Ledger + verify · [ ] CAP valid · [ ] OpenAPI exported

---

### Phase 13 — Interactive Frontend Dashboard [MVP]
**Objective.** Judge-facing dashboard that shows only real API output.

**Tasks**
1. Start from the OpenAPI/JSON schemas using **mock-server data generated from real fixture outputs** (not hand-invented numbers) so FE can begin before Phase 12 completes; mocks are visibly flagged in dev builds.
2. Map: MapLibre + deck.gl layers: radar reflectivity (TiTiler or pre-rendered tiles), storm objects/tracks, graph edges, ensemble spread/probability map, hazard zones, impact assets.
3. Panels: storm detail (C4), ETA with interval, hazard probabilities with status badge (verified / indicator / unavailable), skill-gate level indicator, observability/sensor health, "why changed" feed.
4. Controls: replay timeline/player, **SIMULATE RADAR FAILURE** toggle (calls Phase 12 endpoint), hazard layer toggles.
5. Charts with ECharts: lightning rate series, ETA intervals, reliability/skill tables.
6. Accessibility/readability for demo projector; loading/error/empty states; no silent fallbacks to fake data.

**Inputs:** API. **Outputs:** Next.js app.
**Dependencies:** 12 (contract from Phase 1).
**Files:** `frontend/src/{app,components,lib/api,lib/ws}`, `frontend/tests/`.
**Libraries:** Next.js, TypeScript, React, MapLibre GL, deck.gl, ECharts, Zod (schema validation), Playwright.
**Tests:** type-checked API client from OpenAPI; component tests with fixtures; Playwright e2e: load → play replay → toggle radar failure → interval widens.
**Acceptance:** all displayed numbers traceable to API fields; UI shows data cutoff time and model version.
**Failure cases:** deck.gl performance with large tracks (decimate); WS reconnect; tile CRS mismatch; showing stale data without age indicator.
**Checklist**
- [ ] Map layers · [ ] Panels · [ ] Replay controls · [ ] Radar-failure toggle · [ ] Status badges · [ ] e2e test

---

### Phase 14 — Historical Replay & Benchmarking [MVP]
**Objective.** Leak-free replay and defensible benchmark.

**Tasks**
1. **Replay engine:** deterministic clock; for each tick `as_of`, run pipeline using `ReplayGateway(as_of)`; store ForecastProducts + ledger entries.
2. **Leakage guard tests:** poison test — inject sentinel values with future `available_time`; assert they never influence outputs.
3. **Event split:** training / validation / calibration / **blind** events fixed in `data/splits.yaml` *before* any model tuning; blind events touched only for final reporting.
4. **Benchmark runner:** Persistence, Lagrangian persistence, pySTEPS, basic neural baseline (only if built in 8b), PRAMAAN-X; metrics: CSI, POD, FAR, FSS, BSS, CRPS, ETA coverage, warning lead time, inference latency (measured).
5. Automatic scoring of replay vs actual.
6. Report generator → `docs/validation_report.md` with data version, git SHA, event counts, confidence intervals/bootstrap, and a limitations section.
7. If only 1–2 events exist, report as **case study**, not benchmark; no statistical claims.

**Inputs:** event store, models. **Outputs:** replay artefacts, benchmark tables, validation report.
**Dependencies:** 8a, 10.
**Files:** `src/pramaanx/replay/`, `src/pramaanx/eval/benchmark.py`, `data/splits.yaml`, `docs/validation_report.md`.
**Libraries:** xarray, pandas, scipy.stats/bootstrap, MLflow.
**Tests:** replay twice → identical outputs (determinism); poison test; metric reproducibility.
**Acceptance:** report numbers regenerated from a clean checkout; every table cell traceable to MLflow run.
**Failure cases:** split contamination; selecting thresholds on blind set; non-deterministic seeds; tiny sample overclaiming.
**Checklist**
- [ ] Replay engine · [ ] Poison test · [ ] Splits frozen · [ ] Benchmark runner · [ ] Report with limitations

---

### Phase 15 — Integration, Testing & Validation [MVP]
**Objective.** Prove the whole chain works and fails safely.

**Tasks**
1. End-to-end test: replay event → API → UI → alert → ledger verify.
2. Failure matrix tests: radar off, satellite off, lightning off, NWP off, stale data, missing scans, partial grid — each yields documented degraded behaviour (no crash, higher uncertainty/gating).
3. Schema/contract regression suite across all phases.
4. Performance measurement: per-tick latency per stage; memory; document actual numbers.
5. Security/hygiene: secrets in `.env`, no data in git, dependency audit.
6. Documentation: README, architecture, runbook, data contracts, limitations, validation report.
7. Freeze MVP; bug-bash with someone who didn't write the code.

**Dependencies:** all MVP phases.
**Files:** `tests/e2e/`, `docs/`, `scripts/e2e_replay.sh`.
**Libraries:** pytest, Playwright, locust/k6 (optional).
**Acceptance:** all Final Deliverables §6 items ticked; no open P0/P1 bugs.
**Failure cases:** integration-only schema drift; hidden placeholder values; time-zone display errors; demo-path bugs.
**Checklist**
- [ ] E2E green · [ ] Failure matrix · [ ] Latency report · [ ] Docs complete · [ ] Bug-bash done · [ ] MVP tag

---

### Phase 16 — Deployment & Final Demonstration [MVP]
**Objective.** One-command deployable system and a rehearsed, honest demo.

**Tasks**
1. Dockerfiles (api, worker, frontend); `docker-compose.prod.yml`; env templates; seeded demo DB/Zarr via `make demo-data`.
2. Offline-capable demo: pre-load replay event locally (assume venue network unreliable).
3. Monitoring: Prometheus metrics (ingest latency, data age, pipeline latency, gate state) + Grafana dashboard (STRETCH visual; metrics endpoint is MVP).
4. Demo scripts (see §6.3) with timings; recorded backup video of the real running system.
5. Rehearsals ×3; Q&A sheet with honest limitations (what's verified vs indicator).
6. Backup plan: laptop with local stack + recorded video + static report.

**Acceptance:** fresh machine → `make demo` → dashboard working in < documented time.
**Failure cases:** GPU not available at venue (MVP must run CPU); port clashes; network dependency for map tiles (self-host/pre-cache); large data not on demo machine.
**Checklist**
- [ ] Prod compose · [ ] Offline demo data · [ ] Metrics endpoint · [ ] Backup video · [ ] 3 rehearsals · [ ] Limitations slide

---

## 4. Development Planning

### 4.1 Critical path
`0 → 1 → 2 → 3 → 4 → 5 → 6 → 8a → 10 → 12 → 13 → 15 → 16`
Branches: `6 → 7`, `6/8a → 9 → 11 → 12`, `8a + 10 → 14 → 15`. Phase 2 (data access) is the single largest schedule risk.

### 4.2 Parallelizable work
| While… | …in parallel |
|---|---|
| Phase 2 downloading | Phase 1 infra, schema freeze, FE scaffold, exposure data prep (OSM/WorldPop, part of 11) |
| Phases 3–4 | FE with fixture-derived mocks; API skeleton; eval/metrics module; ledger module |
| Phases 6–8a | Impact engine, CAP, replay engine skeleton, Grafana/Prometheus |
| Phase 8b (stretch) | Never blocks MVP; runs only on spare member/GPU |

### 4.3 Team division (assumed 4–5 members; adjust per U11)
| Role | Owns |
|---|---|
| **AI/ML lead** | Phases 5–10, 14 metrics/benchmarks, calibration |
| **Data/geo engineer** | Phases 2–4, 11, data provenance, DVC |
| **Backend/infra** | Phases 1, 12, 16, ledger, CAP, monitoring, CI |
| **Frontend** | Phase 13, mock server, e2e UI tests |
| **Integration/QA (rotating lead or 5th member)** | Contracts, Phase 15, replay determinism, demo script, docs |

Pairing rule: every phase has an owner and a reviewer from a different role.

### 4.4 Timeline (assumes ~8 weeks; compress/expand proportionally once U11 is known)
| Week | Targets | Gate |
|---|---|---|
| 1 | Phase 0 complete; Phase 1 done; Phase 2 started | **G0:** real scan plotted, scope frozen |
| 2 | Phase 2 done; Phase 3 readers + QC; FE scaffold | **G1:** QC'd event ingests without error |
| 3 | Phase 4 grid + observability; Phase 5 baseline | **G2:** aligned Zarr + storm masks overlaid correctly |
| 4 | Phase 6 tracking; eval module; Phase 7 rules | **G3:** tracks continuous; metrics module tested |
| 5 | Phase 8a baselines; Phase 9 lightning/rain; Phase 11 start | **G4:** baseline lead-time table exists |
| 6 | Phase 10 ensemble/conformal/gate; Phase 12 API/WS/ledger; FE integration | **G5:** vertical slice: replay → API → UI |
| 7 | Phase 13 finish; Phase 14 benchmark; Phase 15 testing; stretch work begins only if G5 green | **G6:** MVP feature-complete freeze |
| 8 | Phase 15 bug-bash; Phase 16 deploy, rehearsals; docs | **G7:** demo-ready |

Daily: 15-min standup (blockers, contract changes), end-of-day merge to `main` only when CI green. Weekly: integration checkpoint demo of whatever works end-to-end.

### 4.5 Integration checkpoints
- **IC1 (end wk 2):** Gateway → QC → Zarr on one event.
- **IC2 (end wk 4):** Zarr → storm objects → DB → API stub returns real storm JSON.
- **IC3 (end wk 6):** Replay tick → forecast + ETA interval + impact → WS → map.
- **IC4 (end wk 7):** Radar-failure path end-to-end; ledger verification; benchmark report generated.

### 4.6 Risks & fallbacks
| Risk | Likelihood/Impact | Mitigation / Fallback |
|---|---|---|
| DWR data unobtainable (U1/U2) | High / Critical | Use any open radar archive from another Indian or public site with the same pipeline (declare it clearly); if no radar at all → satellite+lightning object tracking with explicit "radar unavailable" scope; never present synthetic data as real |
| Too few events for learning | High / High | Rule-based/classical models are the MVP; ML only where sample supports; present case study not benchmark |
| No ground truth for hail/downburst | High / Medium | Show as indicators with explicit badge |
| Lightning/NWP absent | Medium / Medium | Optional channels; skill-gate and observability handle absence; features marked `unavailable` |
| Library incompatibility | Medium / Medium | env_check in Phase 1; drop library, use alternative (e.g. hand-written split-conformal instead of MAPIE) |
| GPU/compute shortage | Medium / Low (MVP is CPU) | Defer 8b; use Kaggle/Colab for stretch |
| Live feed unavailable at demo | High / Low | Simulated-live from replay, clearly labelled |
| Schedule slip | High / High | Cut order: (1) 8b research models, (2) Hail/Downburst, (3) learned GNN, (4) NATS/Grafana, (5) ACI/GPD, (6) CI heuristics. **Do not cut**: QC, observability, tracking, baselines, conformal ETA, skill-gate, replay, ledger |
| Demo failure | Medium / High | Local stack, recorded video, pre-rendered replay |

---

## 5. Implementation Rules (binding)

1. Simplest working baseline first; advanced model enters only after baseline + benchmark harness exist and must beat the baseline on held-out data.
2. No placeholder feature shown as a real prediction. Unimplemented → `status: "unavailable"` in API and a visible badge in UI.
3. No fabricated data, performance numbers, or validation results. All reported numbers come from `docs/validation_report.md` generated by code; sample sizes are always printed.
4. Contracts C1–C9 are versioned; breaking change requires bumping `schema_version`, updating tests, and recording in `DECISIONS.md`.
5. Do not break working functionality: every phase merges only with the full previous test suite green; `make e2e-smoke` runs on each PR.
6. Reproducibility: pinned `uv.lock`, DVC data versions, fixed seeds, MLflow logging of git SHA + data hash; each phase has a `make phaseN` command.
7. Every phase is independently testable using fixtures from `tests/fixtures/` (real tiny data) without needing later phases.
8. Leakage rule: all pipeline functions take `as_of`; reading future `available_time` raises `LeakageError`.
9. No training on live data during demo; live/replay is inference only.
10. Every tunable threshold lives in `configs/`, with a recorded rationale; thresholds chosen on validation, never on blind events.
11. Unverified library mechanics are tested in the installed environment before being relied on (Phase 1 env_check, per-phase smoke tests).
12. Dependency discipline: skill-gate downgrades are logged and visible; a downgrade is a feature, never hidden.

---

## 6. Final Deliverables (MVP definition)

### 6.1 Working features
| Feature (PRD #) | Status | MVP form |
|---|---|---|
| 1 Storm cell intelligence | **MVP** | Threshold/watershed detection + object features + rule lifecycle (no Swin) |
| 2 Storm interaction graph | **MVP (rules)** / STRETCH (GNN) | Graph + rule-based merge/split risk, evaluated honestly |
| 3 Convective initiation | **STRETCH** (heuristic) / RESEARCH (Temporal Perceiver) | Only if calibrated and labelled |
| 4 Rapid intensification | **MVP-lite** | Rate-of-change rules on dZ/dt, dVIL/dt, lightning, IR |
| 5 Observability-aware fusion | **MVP** | Observability tensor + uncertainty inflation; learned fusion is STRETCH |
| 6 Sensor-failure resilience | **MVP** (fallback motion/persistence + gating) / RESEARCH (Virtual-DWR, modality dropout) | Real degraded path via simulate-off |
| 7 Multiple futures | **MVP** (16-member perturbation ensemble) / RESEARCH (Flow Matching) | Labelled truthfully |
| 8 Probabilistic ETA | **MVP** | Ensemble + split-conformal interval, coverage measured |
| 9 Lightning hazard | **MVP** (jump + probability) / RESEARCH (Neural Hawkes) | Requires lightning data |
| 10 Hail | **STRETCH** | Indicator unless verified |
| 11 Downburst | **STRETCH** | Indicator unless verified |
| 12 Extreme rain | **MVP-lite** (Z–R accumulation) / STRETCH (GPD tails) | Verified vs AWS where available |
| 13 Lead-time adaptive | **MVP** | Three method tiers (3–6 h only if NWP) |
| 14 Skill-gated forecast | **MVP** | Rolling skill table + enforced downgrade |
| 15 Why did forecast change | **MVP-lite** | Rule-based attribution |
| 16 Impact risk | **MVP** | Heuristic Hazard×Exposure (labelled) |
| 17 Historical replay | **MVP** | Leak-free deterministic replay |
| 18 Blind benchmark | **MVP** (case-study if few events) | Honest metrics, CIs |
| 19 Tamper-evident ledger | **MVP** | SHA-256 chain + verify |
| 20 End-to-end alerting | **MVP** | Alert + CAP 1.2 XML (no real dissemination) |

### 6.2 Validated outputs required
- [ ] `docs/validation_report.md` generated by code: per-lead-time CSI/POD/FAR/FSS/BSS/CRPS vs persistence, Lagrangian persistence, pySTEPS, with sample sizes and limitations
- [ ] Empirical ETA interval coverage report
- [ ] Reliability diagrams for each probability product shown
- [ ] Skill table driving the gate
- [ ] QC reports and tracking-quality metrics
- [ ] Per-hazard status: verified / indicator-only / unavailable
- [ ] Ledger verification output; poison-test (no-leakage) results

### 6.3 Demo scenarios (all run on real replay data; offline-capable)
1. **Replay case study:** chosen event (e.g. the named 2025 Kalbaisakhi event *if obtained*) stepping T−120 → T; show storm objects, ETA + interval, hazards, impact, and compare to what actually happened.
2. **Interaction:** a real merge/split episode and the system's merge risk before it.
3. **Radar failure:** click **SIMULATE RADAR FAILURE** — observability drops, interval widens, product downgrades per gate; show reason.
4. **Trust:** show skill-gate levels and the benchmark table incl. where PRAMAAN-X does *not* beat baselines.
5. **Audit:** ledger entry for a past forecast; tamper a row; verification fails.
6. **Alert:** generated CAP XML for an impacted asset.

### 6.4 Tests
- Unit tests per module (≥ phase-listed), integration per phase, e2e replay→API→UI, failure matrix, leakage poison test, ledger tamper test, contract tests. CI green on `main`.

### 6.5 Documentation
README + quickstart, architecture diagram, data contracts, DECISIONS.md (incl. U1–U15 resolutions), data sources/licences, runbook, validation report, limitations/known issues, demo script.

### 6.6 Deployment requirements
- `make demo` on a clean machine brings up DB, API, worker, frontend with preloaded replay data on CPU only.
- Self-hosted/pre-cached map tiles; no hard dependency on external internet at demo.
- Backup: recorded video + static validation report.

### 6.7 MVP exit checklist
- [ ] G0–G7 gates passed · [ ] All MVP rows in §6.1 real or explicitly "unavailable" · [ ] §6.2 artefacts generated · [ ] §6.4 tests green · [ ] §6.5 docs done · [ ] §6.6 demo verified on a second machine · [ ] No placeholder predictions anywhere · [ ] Open unresolved items (U1–U15) either answered or listed as limitations
