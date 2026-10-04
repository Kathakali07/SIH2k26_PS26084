"""FastAPI endpoints for the Swiss Alpine DGMR Convective Nowcasting Demo."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .swiss_scenario import FRAME_COUNT, NOW_FRAME_INDEX, build_swiss_scenario
except ImportError:
    from swiss_scenario import FRAME_COUNT, NOW_FRAME_INDEX, build_swiss_scenario


app = FastAPI(title="ClimaX Swiss DGMR Nowcasting API", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RadarStateRequest(BaseModel):
    active: bool = False


class SystemState:
    def __init__(self) -> None:
        self.radar_active = True

    def reset(self) -> None:
        self.radar_active = True


state = SystemState()


def _scenario(frame_index: int) -> dict[str, Any]:
    return build_swiss_scenario(frame_index=frame_index, radar_active=state.radar_active)


def _feature_collection(scenario: dict[str, Any]) -> dict[str, Any]:
    """Helper for backward compatibility."""
    return scenario.get("geojson", {"type": "FeatureCollection", "features": []})


@app.get("/api/health")
def get_health() -> dict[str, Any]:
    return {
        "status": "ok",
        "mode": "dgmr_ai_nowcast",
        "region": "Switzerland",
        "total_frames": FRAME_COUNT,
        "now_frame_index": NOW_FRAME_INDEX,
    }


@app.get("/api/nowcast/live")
def get_live_data(
    frame_index: int = Query(default=NOW_FRAME_INDEX, ge=0, lt=FRAME_COUNT),
) -> dict[str, Any]:
    """Return the selected frame as an RFC 7946 FeatureCollection."""
    scenario = _scenario(frame_index)
    return scenario["geojson"]


@app.get("/api/scenario")
def get_scenario(
    frame_index: int = Query(default=NOW_FRAME_INDEX, ge=0, lt=FRAME_COUNT),
) -> dict[str, Any]:
    """Return canonical scenario state and all timestamped replay frames."""
    return _scenario(frame_index)


@app.post("/api/kill-radar")
def set_radar_state(request: RadarStateRequest | None = None) -> dict[str, Any]:
    """Set radar offline (no body) or online with `{\"active\": true}`."""
    state.radar_active = bool(request.active) if request is not None else False
    return {
        "radar_active": state.radar_active,
        "fallback_active": not state.radar_active,
        "fallback_mode": "dgmr_neural_fallback" if not state.radar_active else None,
        "uncertainty_scale": 1.0 if state.radar_active else 2.5,
        "message": "Radar online." if state.radar_active else "Radar offline; DGMR generative model providing fallback forecasting with widened uncertainty bounds.",
    }


@app.post("/api/reset-demo")
def reset_demo() -> dict[str, Any]:
    state.reset()
    return {"radar_active": True, "mode": "dgmr_ai_nowcast", "message": "Demo state reset to online."}


@app.post("/api/ingest/radar")
def ingest_radar_scan(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    """Ingest a Doppler radar reflectivity scan or volume for DGMR neural nowcasting."""
    source = (payload or {}).get("source_name", "MeteoSwiss Rad4Alps Polarimetric Composite")
    preset = (payload or {}).get("preset", "live_stream")
    timestamp = datetime.now(timezone.utc).isoformat()
    
    return {
        "status": "success",
        "ingestion_channel": "REST_API_PIPELINE",
        "source": source,
        "preset": preset,
        "timestamp_utc": timestamp,
        "format": "Doppler Polarimetric Reflectivity (dBZ)",
        "grid_dimensions": {"height": 500, "width": 500, "resolution_km": 1.0},
        "dgmr_input_tensor": {
            "shape": [1, 4, 1, 256, 256],
            "dtype": "float32",
            "channels": ["radar_reflectivity_dbz"],
        },
        "quality_control": {
            "ground_clutter_filter": "applied (rho_HV > 0.85)",
            "attenuation_correction": "applied (Z-Phi polarimetric method)",
            "anomalous_propagation": "suppressed",
        },
        "cells_segmented": 4,
        "max_reflectivity_dbz": 74.0,
        "nowcast_lead_time_min": 90,
        "frames_generated": 18,
        "message": f"Successfully ingested {source} radar scan. DGMR spatio-temporal nowcast generated for T+5m to T+90m.",
    }


# If compiled frontend exists in frontend/dist, serve it directly
from pathlib import Path
from fastapi import Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

dist_dir = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    @app.exception_handler(404)
    async def spa_404_handler(request: Request, exc: Exception):
        index_file = dist_dir / "index.html"
        if not request.url.path.startswith("/api/") and index_file.exists():
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    @app.get("/")
    async def serve_index():
        return FileResponse(dist_dir / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

