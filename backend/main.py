"""FastAPI endpoints for the deterministic PRAMAAN-X demo scenario."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .scenario_fixture import FRAME_COUNT, build_scenario
except ImportError:  # Support `python backend/main.py` and uvicorn app-dir mode.
    from scenario_fixture import FRAME_COUNT, build_scenario


app = FastAPI(title="PRAMAAN-X Synthetic Demo API", version="0.3.0")
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


def _iso_utc(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _feature_from_storm(storm: dict[str, Any], valid_time: str) -> dict[str, Any]:
    center_lon = storm["position"]["lon"]
    center_lat = storm["position"]["lat"]
    uncertainty_scale = 1.0 if state.radar_active else 2.5
    ring = storm["geometry"]["coordinates"][0]
    expanded_ring = [
        [center_lon + (point[0] - center_lon) * uncertainty_scale,
         center_lat + (point[1] - center_lat) * uncertainty_scale]
        for point in ring
    ]

    valid_dt = datetime.fromisoformat(valid_time.replace("Z", "+00:00"))
    eta_minutes = storm["eta_minutes"]
    eta_low, eta_high = storm["eta_interval_minutes"]
    return {
        "type": "Feature",
        "geometry": {"type": "Polygon", "coordinates": [expanded_ring]},
        "properties": {
            "id": storm["id"],
            "name": storm["name"],
            "hazard_type": storm["hazard_type"],
            "severity": storm["severity"],
            "eta_utc": _iso_utc(valid_dt + timedelta(minutes=eta_minutes)),
            "eta_min_utc": _iso_utc(valid_dt + timedelta(minutes=eta_low)),
            "eta_max_utc": _iso_utc(valid_dt + timedelta(minutes=eta_high)),
            "eta_is_demo_estimate": True,
            "valid_time_utc": valid_time,
            "max_dbz": storm["max_dbz"],
            "area_km2": storm["area_km2"],
            "motion": storm["motion"],
            "lifecycle": storm["lifecycle"],
            "growth_rate_km2_per_5min": storm["growth_rate_km2_per_5min"],
            "hazards": storm["hazards"],
            "indicators": storm["indicators"],
            "sensor_reliability": storm["sensor_reliability"],
            "provenance": storm["provenance"],
            "radar_active": state.radar_active,
            "uncertainty_scale": uncertainty_scale,
        },
    }


def _scenario(frame_index: int) -> dict[str, Any]:
    scenario = build_scenario(frame_index=frame_index, radar_active=state.radar_active)
    geojson = {
        "type": "FeatureCollection",
        "features": [
            _feature_from_storm(storm, scenario["valid_time_utc"])
            for storm in scenario["storms"]
        ],
    }
    feature_by_id = {feature["properties"]["id"]: feature for feature in geojson["features"]}
    uncertainty_scale = 1.0 if state.radar_active else 2.5
    for storm in scenario["storms"]:
        feature = feature_by_id[storm["id"]]
        storm["radar_active"] = state.radar_active
        storm["uncertainty_scale"] = uncertainty_scale
        storm["uncertainty_geometry"] = feature["geometry"]
        storm.update({
            key: value
            for key, value in feature["properties"].items()
            if key not in {"id", "name", "hazard_type", "severity", "max_dbz", "area_km2", "motion", "lifecycle", "growth_rate_km2_per_5min", "hazards", "indicators", "sensor_reliability", "provenance"}
        })
    scenario["radar_active"] = state.radar_active
    scenario["uncertainty_scale"] = uncertainty_scale
    scenario["geojson"] = geojson
    scenario["current"]["storms"] = scenario["storms"]
    scenario["current"]["geojson"] = geojson
    scenario["current"]["radar_active"] = state.radar_active
    scenario["current"]["uncertainty_scale"] = uncertainty_scale
    return scenario


def _feature_collection(scenario: dict[str, Any]) -> dict[str, Any]:
    """Build a valid empty-or-populated GeoJSON collection from scenario state."""
    return {
        "type": "FeatureCollection",
        "features": [
            _feature_from_storm(storm, scenario["valid_time_utc"])
            for storm in scenario.get("storms", [])
        ],
    }


@app.get("/api/health")
def get_health() -> dict[str, str]:
    return {"status": "ok", "mode": "synthetic_demo"}


@app.get("/api/nowcast/live")
def get_live_data(
    frame_index: int = Query(default=FRAME_COUNT - 1, ge=0, lt=FRAME_COUNT),
) -> dict[str, Any]:
    """Return the selected fixture frame as an RFC 7946 FeatureCollection."""
    scenario = _scenario(frame_index)
    return _feature_collection(scenario)


@app.get("/api/scenario")
def get_scenario(
    frame_index: int = Query(default=FRAME_COUNT - 1, ge=0, lt=FRAME_COUNT),
) -> dict[str, Any]:
    """Return canonical scenario state and all timestamped replay frames."""
    scenario = _scenario(frame_index)
    scenario["geojson"] = _feature_collection(scenario)
    scenario["current"]["geojson"] = scenario["geojson"]
    return scenario


@app.post("/api/kill-radar")
def set_radar_state(request: RadarStateRequest | None = None) -> dict[str, Any]:
    """Set radar offline (no body) or online with `{\"active\": true}`."""
    state.radar_active = bool(request.active) if request is not None else False
    return {
        "radar_active": state.radar_active,
        "fallback_active": not state.radar_active,
        "fallback_mode": "simulated_fallback" if not state.radar_active else None,
        "uncertainty_scale": 1.0 if state.radar_active else 2.5,
        "message": "Radar online." if state.radar_active else "Radar offline; fallback behavior is simulated and uncertainty widened.",
    }


@app.post("/api/reset-demo")
def reset_demo() -> dict[str, Any]:
    state.reset()
    return {"radar_active": True, "mode": "synthetic_demo", "message": "Demo state reset."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
