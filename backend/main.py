"""FastAPI endpoints for the deterministic PRAMAAN-X demo scenario."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:  # Support both `python backend/main.py` and `uvicorn main:app --app-dir backend`.
    from .engine import NowcastEngine
except ImportError:
    from engine import NowcastEngine


app = FastAPI(title="PRAMAAN-X Synthetic Demo API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RadarStateRequest(BaseModel):
    active: bool = False


class SystemState:
    def __init__(self) -> None:
        self.radar_active = True
        self.engine = NowcastEngine()

    def reset(self) -> None:
        self.radar_active = True


state = SystemState()


def _iso_utc(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _eta_minutes(storm: dict[str, Any]) -> float:
    u, v = storm["velocity"]
    speed_px_per_frame = (u**2 + v**2) ** 0.5
    if speed_px_per_frame <= 0:
        return 60.0
    # Illustrative demo estimate: 100 grid pixels at the observed frame motion.
    return max(5.0, (100.0 / speed_px_per_frame) * state.engine.frame_interval_minutes)


def _feature_for_storm(sid: int, storm: dict[str, Any], now: datetime) -> dict[str, Any] | None:
    ring = storm["ring"]
    if len(ring) < 4:
        return None

    center_lon, center_lat = storm["position"]
    scale = 2.5 if not state.radar_active else 1.0
    coordinates = [[
        [center_lon + (lon - center_lon) * scale, center_lat + (lat - center_lat) * scale]
        for lon, lat in ring
    ]]

    eta_minutes = _eta_minutes(storm)
    interval_minutes = 15.0 if not state.radar_active else 5.0
    eta = now + timedelta(minutes=eta_minutes)
    eta_min = now + timedelta(minutes=max(0.0, eta_minutes - interval_minutes))
    eta_max = now + timedelta(minutes=eta_minutes + interval_minutes)
    u, v = storm["velocity"]
    return {
        "type": "Feature",
        "geometry": {"type": "Polygon", "coordinates": coordinates},
        "properties": {
            "id": f"storm_cell_{sid}",
            "hazard_type": storm["hazard_type"],
            "severity": storm["severity"],
            "eta_utc": _iso_utc(eta),
            "eta_min_utc": _iso_utc(eta_min),
            "eta_max_utc": _iso_utc(eta_max),
            "eta_is_demo_estimate": True,
            "max_dbz": float(storm["max_dbz"]),
            "area_km2": float(storm["area_km2"]),
            "velocity_u": float(u),
            "velocity_v": float(v),
            "centroid": {"lon": float(center_lon), "lat": float(center_lat)},
            "bbox_px": list(storm["bbox"]),
            "source_mode": "synthetic_demo",
            "storm_data_provenance": "calculated_from_synthetic_frames",
            "radar_active": state.radar_active,
            "uncertainty_scale": scale,
        },
    }


def _features(now: datetime | None = None) -> list[dict[str, Any]]:
    timestamp = now or datetime.now(timezone.utc)
    result = []
    for sid, storm in sorted(state.engine.latest_storms.items()):
        feature = _feature_for_storm(sid, storm, timestamp)
        if feature is not None:
            result.append(feature)
    return result


@app.get("/api/health")
def get_health() -> dict[str, str]:
    return {"status": "ok", "mode": "synthetic_demo"}


@app.get("/api/nowcast/live")
def get_live_data() -> dict[str, Any]:
    """Return the latest tracked storms as an RFC 7946 GeoJSON FeatureCollection."""
    return {"type": "FeatureCollection", "features": _features()}


@app.get("/api/scenario")
def get_scenario() -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    feature_collection = {"type": "FeatureCollection", "features": _features(now)}
    storms = []
    for feature in feature_collection["features"]:
        properties = feature["properties"]
        storms.append({
            "id": properties["id"],
            "geometry": feature["geometry"],
            "position": properties["centroid"],
            "area_km2": properties["area_km2"],
            "max_dbz": properties["max_dbz"],
            "motion": {
                "u": properties["velocity_u"],
                "v": properties["velocity_v"],
                "speed_px_per_frame": float((properties["velocity_u"]**2 + properties["velocity_v"]**2) ** 0.5),
            },
            "hazard_type": properties["hazard_type"],
            "severity": properties["severity"],
            "eta_utc": properties["eta_utc"],
            "eta_min_utc": properties["eta_min_utc"],
            "eta_max_utc": properties["eta_max_utc"],
            "provenance": {
                "geometry": "calculated_from_synthetic_radar",
                "max_dbz": "synthetic_input",
                "motion": "calculated_from_synthetic_frames",
                "hazard_type": "calculated_threshold_demo",
                "eta": "simulated_demo_estimate",
            },
        })

    return {
        "scenario_id": "kolkata_demo_01",
        "scenario_name": "PRAMAAN-X Synthetic Storm Tracking Demo",
        "mode": "synthetic_demo",
        "valid_time_utc": _iso_utc(now),
        "frame_count": len(state.engine.frames),
        "frame_interval_minutes": state.engine.frame_interval_minutes,
        "grid": {
            "height": int(state.engine.input_tensor.shape[-2]),
            "width": int(state.engine.input_tensor.shape[-1]),
            "km_per_pixel": state.engine.km_per_pixel,
            "origin": {"lon": state.engine.origin_lon, "lat": state.engine.origin_lat},
        },
        "data_sources": [{"name": state.engine.source, "status": "synthetic_demo"}],
        "sensors": {
            "radar": {"available": state.radar_active, "reliability": 0.9 if state.radar_active else 0.0, "age_seconds": 0, "provenance": "simulated"},
            "satellite": {"available": False, "reliability": None, "age_seconds": None, "provenance": "unavailable"},
            "lightning": {"available": False, "reliability": None, "age_seconds": None, "provenance": "unavailable"},
            "nwp": {"available": False, "reliability": None, "age_seconds": None, "provenance": "unavailable"},
        },
        "fallback": {
            "active": not state.radar_active,
            "mode": "simulated_fallback" if not state.radar_active else None,
            "message": "Radar unavailable; fallback behavior is simulated. No alternate live feed is connected." if not state.radar_active else None,
        },
        "uncertainty_scale": 2.5 if not state.radar_active else 1.0,
        "storms": storms,
        "geojson": feature_collection,
        "model": {"name": "deterministic demo tracking", "earthformer_inference": False},
    }


@app.post("/api/kill-radar")
def set_radar_state(request: RadarStateRequest | None = None) -> dict[str, Any]:
    """Set radar unavailable (default) or restore it with `{\"active\": true}`."""
    state.radar_active = bool(request.active) if request is not None else False
    return {
        "radar_active": state.radar_active,
        "fallback_active": not state.radar_active,
        "fallback_mode": "simulated_fallback" if not state.radar_active else None,
        "uncertainty_scale": 1.0 if state.radar_active else 2.5,
        "message": "Radar online." if state.radar_active else "Radar offline; fallback behavior simulated and uncertainty expanded.",
    }


@app.post("/api/reset-demo")
def reset_demo() -> dict[str, Any]:
    state.reset()
    return {"radar_active": True, "mode": "synthetic_demo", "message": "Demo state reset."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
