"""FastAPI endpoints for the Swiss Alpine DGMR Convective Nowcasting Demo."""

from __future__ import annotations

from typing import Any
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .swiss_scenario import FRAME_COUNT, NOW_FRAME_INDEX, build_swiss_scenario
except ImportError:
    from swiss_scenario import FRAME_COUNT, NOW_FRAME_INDEX, build_swiss_scenario


app = FastAPI(title="PRAMAAN-X Swiss DGMR Nowcasting API", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
