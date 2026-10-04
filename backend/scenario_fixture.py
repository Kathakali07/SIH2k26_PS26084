"""Deterministic, explicitly simulated scenario fixture for the ClimaX UI.

This fixture is separate from the synthetic raster tracking engine: it supplies
coherent demo-only fields that are not present in the raster files. No values
in this module represent live observations or calibrated forecasts.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from math import atan2, cos, pi, sin, sqrt
from typing import Any


SCENARIO_ID = "kolkata_demo_01"
SCENARIO_NAME = "Kalbaishakhi Prototype Scenario"
MODE = "synthetic_demo"
FRAME_INTERVAL_MINUTES = 5
FRAME_COUNT = 5
BASE_TIME = datetime(2026, 9, 29, 12, 0, tzinfo=timezone.utc)

# Fixed time series: each index corresponds to a five-minute replay frame.
# Positions are [longitude, latitude]. Values not available from radar frames
# are deterministic illustrations and carry simulated provenance.
STORM_SERIES: dict[str, dict[str, Any]] = {
    "storm_17": {
        "name": "Northwest Cell",
        "positions": [[88.08, 22.30], [88.14, 22.34], [88.20, 22.38], [88.26, 22.42], [88.32, 22.46]],
        "area_km2": [45, 55, 68, 80, 93],
        "max_dbz": [44, 48, 51, 54, 58],
        "lifecycle": ["Developing", "Developing", "Developing", "Mature", "Mature"],
        "hazards": {
            "lightning": [0.22, 0.31, 0.42, 0.56, 0.68],
            "hail": [0.08, 0.12, 0.18, 0.26, 0.34],
            "downburst": [0.12, 0.18, 0.25, 0.33, 0.41],
            "extreme_rain": [0.25, 0.34, 0.43, 0.54, 0.66],
        },
        "indicators": {"lightning_rate_flashes_min": [4, 7, 11, 17, 23], "vil_kg_m2": [12, 16, 20, 25, 31], "echo_top_km": [7.0, 8.1, 9.0, 10.2, 11.0]},
    },
    "storm_21": {
        "name": "Eastern Cell",
        "positions": [[89.05, 22.95], [88.89, 22.88], [88.73, 22.81], [88.57, 22.74], [88.41, 22.67]],
        "area_km2": [110, 125, 143, 160, 178],
        "max_dbz": [46, 48, 53, 57, 60],
        "lifecycle": ["Developing", "Developing", "Mature", "Mature", "Mature"],
        "hazards": {
            "lightning": [0.28, 0.35, 0.49, 0.64, 0.77],
            "hail": [0.10, 0.14, 0.23, 0.32, 0.43],
            "downburst": [0.16, 0.22, 0.33, 0.45, 0.57],
            "extreme_rain": [0.31, 0.39, 0.52, 0.64, 0.75],
        },
        "indicators": {"lightning_rate_flashes_min": [6, 9, 15, 22, 30], "vil_kg_m2": [15, 18, 24, 31, 37], "echo_top_km": [7.5, 8.2, 9.5, 10.8, 12.1]},
    },
    "storm_25": {
        "name": "Initiating Cell",
        "positions": [[87.82, 21.72], [87.86, 21.76], [87.90, 21.80], [87.94, 21.84], [87.98, 21.88]],
        "area_km2": [8, 10, 13, 16, 18],
        "max_dbz": [43, 48, 52, 56, 59],
        "lifecycle": ["Initiating", "Initiating", "Developing", "Developing", "Mature"],
        "hazards": {
            "lightning": [0.05, 0.12, 0.24, 0.43, 0.63],
            "hail": [0.03, 0.08, 0.16, 0.27, 0.39],
            "downburst": [0.04, 0.11, 0.20, 0.32, 0.45],
            "extreme_rain": [0.11, 0.19, 0.33, 0.52, 0.71],
        },
        "indicators": {"lightning_rate_flashes_min": [0, 2, 5, 9, 15], "vil_kg_m2": [4, 7, 11, 16, 21], "echo_top_km": [4.2, 5.4, 6.7, 8.0, 9.3]},
    },
    "storm_31": {
        "name": "Southern Cell",
        "positions": [[89.50, 21.90], [89.54, 21.93], [89.58, 21.96], [89.62, 21.99], [89.66, 22.02]],
        "area_km2": [95, 89, 78, 61, 44],
        "max_dbz": [55, 52, 48, 43, 39],
        "lifecycle": ["Mature", "Mature", "Dissipating", "Dissipating", "Dissipating"],
        "hazards": {
            "lightning": [0.61, 0.48, 0.33, 0.18, 0.08],
            "hail": [0.31, 0.24, 0.15, 0.08, 0.03],
            "downburst": [0.42, 0.34, 0.23, 0.12, 0.05],
            "extreme_rain": [0.58, 0.49, 0.35, 0.22, 0.11],
        },
        "indicators": {"lightning_rate_flashes_min": [21, 17, 12, 7, 3], "vil_kg_m2": [28, 25, 20, 14, 9], "echo_top_km": [10.5, 9.8, 8.6, 7.2, 5.8]},
    },
}

ENVIRONMENT_SERIES: dict[str, dict[str, list[float]]] = {
    "storm_17": {"ir_temp_k": [252, 247, 241, 235, 228], "cape_jkg": [820, 870, 930, 990, 1040], "shear_ms": [13, 14, 15, 16, 17], "dcape_jkg": [520, 560, 610, 660, 710], "moisture_pct": [68, 70, 73, 76, 79]},
    "storm_21": {"ir_temp_k": [249, 245, 238, 231, 224], "cape_jkg": [900, 960, 1030, 1110, 1190], "shear_ms": [16, 17, 18, 19, 20], "dcape_jkg": [600, 650, 710, 780, 840], "moisture_pct": [71, 73, 76, 79, 82]},
    "storm_25": {"ir_temp_k": [265, 258, 250, 241, 232], "cape_jkg": [500, 620, 740, 890, 1020], "shear_ms": [10, 11, 12, 13, 14], "dcape_jkg": [380, 430, 490, 560, 630], "moisture_pct": [62, 66, 70, 75, 79]},
    "storm_31": {"ir_temp_k": [226, 230, 237, 246, 256], "cape_jkg": [980, 900, 790, 650, 510], "shear_ms": [18, 17, 16, 14, 12], "dcape_jkg": [750, 690, 610, 520, 430], "moisture_pct": [77, 74, 70, 65, 60]},
}

FORECAST_PRODUCTS = [
    {"horizon": "0-60m", "product_level": "storm_track", "description": "Object motion and near-term track", "provenance": "simulated_demo"},
    {"horizon": "1-3h", "product_level": "probabilistic_hazard_zone", "description": "Storm evolution and interaction-based hazard zones", "provenance": "simulated_demo"},
    {"horizon": "3-6h", "product_level": "regional_outlook", "description": "Regional convective susceptibility outlook", "provenance": "simulated_demo"},
]

FORECAST_OFFSETS = [
    (-0.018, 0.024), (-0.014, 0.012), (-0.010, 0.020), (-0.006, 0.008),
    (-0.002, 0.016), (0.002, 0.004), (0.006, 0.012), (0.010, 0.000),
    (0.014, 0.008), (0.018, -0.004), (-0.016, -0.008), (-0.012, -0.016),
    (-0.008, -0.004), (0.008, -0.012), (0.012, -0.020), (0.016, -0.012),
]

EVENTS_BY_FRAME = [
    [{"type": "scenario_start", "storm_ids": list(STORM_SERIES), "message": "Synthetic scenario initialized.", "provenance": "simulated"}],
    [{"type": "approach", "storm_ids": ["storm_17", "storm_21"], "message": "Storm 17 and Storm 21 are converging.", "provenance": "simulated"}],
    [{"type": "initiation", "storm_ids": ["storm_25"], "message": "New convective cell enters the developing stage.", "provenance": "simulated"}],
    [{"type": "rapid_intensification", "storm_ids": ["storm_21", "storm_25"], "message": "Reflectivity and demo lightning indicators are increasing.", "provenance": "simulated"}],
    [
        {"type": "merge_risk", "storm_ids": ["storm_17", "storm_21"], "message": "Storm interaction indicates elevated merge risk.", "provenance": "simulated"},
        {"type": "dissipation", "storm_ids": ["storm_31"], "message": "Southern cell is in the dissipating stage.", "provenance": "simulated"},
    ],
]

IMPACT_TARGETS = [
    {"id": "kolkata_airport", "name": "Kolkata Airport", "type": "airport", "lon": 88.4467, "lat": 22.6547, "exposure": 0.95},
    {"id": "nh12_corridor", "name": "NH-12 Corridor", "type": "road", "lon": 88.38, "lat": 22.54, "exposure": 0.78},
    {"id": "urban_villages", "name": "South Bengal Settlements", "type": "village", "lon": 87.98, "lat": 21.88, "exposure": 0.72},
    {"id": "medical_network", "name": "Regional Hospitals", "type": "hospital", "lon": 88.30, "lat": 22.58, "exposure": 0.83},
    {"id": "schools_network", "name": "Regional Schools", "type": "school", "lon": 88.25, "lat": 22.49, "exposure": 0.68},
    {"id": "critical_grid", "name": "Critical Infrastructure", "type": "infrastructure", "lon": 88.50, "lat": 22.42, "exposure": 0.88},
]


def _time_text(value: datetime) -> str:
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def _severity(dbz: float) -> str:
    if dbz >= 55:
        return "HIGH"
    if dbz >= 45:
        return "MODERATE"
    return "LOW"


def _polygon(lon: float, lat: float, area_km2: float) -> list[list[list[float]]]:
    # An eight-vertex illustrative footprint with area-scaled radius.
    radius_km = sqrt(max(area_km2, 1.0) / pi)
    radius_lon = radius_km / 103.0
    radius_lat = radius_km / 111.0
    ring = []
    for index in range(8):
        angle = 2.0 * pi * index / 8.0
        ring.append([lon + radius_lon * cos(angle), lat + radius_lat * sin(angle)])
    ring.append(ring[0].copy())
    return [ring]


def _storm_at(storm_id: str, series: dict[str, Any], frame_index: int) -> dict[str, Any]:
    lon, lat = series["positions"][frame_index]
    if frame_index:
        prev_lon, prev_lat = series["positions"][frame_index - 1]
        east_kmh = (lon - prev_lon) * 103.0 * 60.0 / FRAME_INTERVAL_MINUTES
        north_kmh = (lat - prev_lat) * 111.0 * 60.0 / FRAME_INTERVAL_MINUTES
    else:
        next_lon, next_lat = series["positions"][1]
        east_kmh = (next_lon - lon) * 103.0 * 60.0 / FRAME_INTERVAL_MINUTES
        north_kmh = (next_lat - lat) * 111.0 * 60.0 / FRAME_INTERVAL_MINUTES
    speed_kmh = sqrt(east_kmh**2 + north_kmh**2)
    direction = (atan2(east_kmh, north_kmh) * 180.0 / pi) % 360.0
    if frame_index >= 2:
        p0 = series["positions"][frame_index - 2]
        p1 = series["positions"][frame_index - 1]
        old_east = (p1[0] - p0[0]) * 103.0 * 60.0 / FRAME_INTERVAL_MINUTES
        old_north = (p1[1] - p0[1]) * 111.0 * 60.0 / FRAME_INTERVAL_MINUTES
        acceleration = speed_kmh - sqrt(old_east**2 + old_north**2)
    else:
        acceleration = 0.0
    dbz = float(series["max_dbz"][frame_index])
    area = float(series["area_km2"][frame_index])
    hazards = {name: float(values[frame_index]) for name, values in series["hazards"].items()}
    lifecycle = series["lifecycle"][frame_index]
    hazard_type = "Cloudburst" if area < 20.0 and dbz > 55.0 else "Thunderstorm"
    environmental = ENVIRONMENT_SERIES[storm_id]
    environmental_indicators = {name: float(values[frame_index]) for name, values in environmental.items()}
    previous_ir = environmental["ir_temp_k"][max(0, frame_index - 1)]
    previous_lightning = series["indicators"]["lightning_rate_flashes_min"][max(0, frame_index - 1)]
    ir_cooling = (previous_ir - environmental_indicators["ir_temp_k"]) / FRAME_INTERVAL_MINUTES
    lightning_acceleration = (series["indicators"]["lightning_rate_flashes_min"][frame_index] - previous_lightning) / FRAME_INTERVAL_MINUTES

    return {
        "id": storm_id,
        "name": series["name"],
        "position": {"lon": float(lon), "lat": float(lat)},
        "geometry": {"type": "Polygon", "coordinates": _polygon(lon, lat, area)},
        "area_km2": area,
        "max_dbz": dbz,
        "motion": {"east_kmh": round(east_kmh, 1), "north_kmh": round(north_kmh, 1), "speed_kmh": round(speed_kmh, 1), "direction_degrees": round(direction, 1), "acceleration_kmh_per_5min": round(acceleration, 1)},
        "lifecycle": lifecycle,
        "growth_rate_km2_per_5min": float(series["area_km2"][frame_index] - series["area_km2"][max(0, frame_index - 1)]),
        "hazard_type": hazard_type,
        "severity": _severity(dbz),
        "hazards": hazards,
        "indicators": {
            **{name: values[frame_index] for name, values in series["indicators"].items()},
            **environmental_indicators,
            "lightning_acceleration_flashes_min2": round(lightning_acceleration, 2),
            "ir_cooling_k_per_min": round(ir_cooling, 2),
        },
        "sensor_reliability": {"radar": 0.92, "satellite": None, "lightning": None, "nwp": None},
        "provenance": {
            "position": "simulated",
            "geometry": "simulated",
            "area_km2": "simulated",
            "max_dbz": "simulated",
            "motion": "calculated_from_scenario_frames",
            "lifecycle": "simulated",
            "growth_rate_km2_per_5min": "calculated_from_scenario_frames",
            "hazard_type": "calculated_demo_threshold",
            "severity": "calculated_demo_threshold",
            "hazards": "simulated",
            "indicators": "simulated",
            "sensor_reliability": "simulated_demo_indicator",
        },
    }


def _interactions(frame_index: int) -> list[dict[str, Any]]:
    risk = [0.28, 0.42, 0.58, 0.71, 0.82][frame_index]
    return [
        {
            "id": "interaction_17_21",
            "storm_ids": ["storm_17", "storm_21"],
            "relation": "approaching" if frame_index < 4 else "merge_risk",
            "merge_probability": risk,
            "relative_motion": "converging",
            "explanation": "Scenario tracks move toward a shared interaction region.",
            "provenance": "simulated",
        },
        {
            "id": "interaction_25_31",
            "storm_ids": ["storm_25", "storm_31"],
            "relation": "relative_motion",
            "merge_probability": max(0.05, 0.25 - frame_index * 0.03),
            "relative_motion": "separating",
            "explanation": "Scenario tracks remain spatially distinct.",
            "provenance": "simulated",
        },
    ]


def _forecast_members(frame_index: int, radar_active: bool) -> list[dict[str, Any]]:
    center_lon, center_lat = STORM_SERIES["storm_17"]["positions"][frame_index]
    prev = STORM_SERIES["storm_17"]["positions"][max(0, frame_index - 1)]
    step_lon = center_lon - prev[0] if frame_index else 0.06
    step_lat = center_lat - prev[1] if frame_index else 0.04
    spread_scale = 1.0 if radar_active else 2.5
    members = []
    for index, (offset_lon, offset_lat) in enumerate(FORECAST_OFFSETS):
        future = []
        for lead in range(1, 7):
            future.append([
                float(center_lon + step_lon * lead + offset_lon * lead * spread_scale),
                float(center_lat + step_lat * lead + offset_lat * lead * spread_scale),
            ])
        members.append({
            "member_id": f"future_{index + 1:02d}",
            "weight": 0.0625,
            "storm_id": "storm_17",
            "trajectory": future,
            "provenance": "simulated_demo_member",
        })
    # Correct floating-point accumulation explicitly while retaining equal weights.
    members[-1]["weight"] = 1.0 - sum(item["weight"] for item in members[:-1])
    return members


def _impacts(storms: list[dict[str, Any]]) -> list[dict[str, Any]]:
    impacts = []
    for target in IMPACT_TARGETS:
        nearby = min(
            storms,
            key=lambda storm: (storm["position"]["lon"] - target["lon"]) ** 2 + (storm["position"]["lat"] - target["lat"]) ** 2,
        )
        distance_km = sqrt(
            ((nearby["position"]["lon"] - target["lon"]) * 103.0) ** 2
            + ((nearby["position"]["lat"] - target["lat"]) * 111.0) ** 2
        )
        hazard = max(nearby["hazards"].values()) * max(0.0, 1.0 - distance_km / 100.0)
        score = min(1.0, hazard * target["exposure"])
        level = "HIGH" if score >= 0.5 else "MODERATE" if score >= 0.25 else "LOW"
        impacts.append({
            **target,
            "nearest_storm_id": nearby["id"],
            "distance_km": round(distance_km, 1),
            "risk_score": round(score, 3),
            "risk_level": level,
            "provenance": "illustrative_demo_calculation",
        })
    return impacts


def build_frame(frame_index: int, radar_active: bool = True) -> dict[str, Any]:
    if not 0 <= frame_index < FRAME_COUNT:
        raise IndexError(f"frame_index must be between 0 and {FRAME_COUNT - 1}")
    valid_time = BASE_TIME + timedelta(minutes=FRAME_INTERVAL_MINUTES * frame_index)
    storms = [_storm_at(storm_id, series, frame_index) for storm_id, series in STORM_SERIES.items()]
    for storm in storms:
        speed = storm["motion"]["speed_kmh"]
        # ETA and interval are scenario estimates, not calibrated prediction output.
        eta_minutes = max(10.0, 70.0 - speed * 0.55 + (4 - frame_index) * 2.0)
        half_width = 12.0 if radar_active else 27.0
        storm["eta_minutes"] = round(eta_minutes)
        storm["eta_interval_minutes"] = [max(0, round(eta_minutes - half_width)), round(eta_minutes + half_width)]
        storm["provenance"]["eta"] = "simulated_demo_estimate"
        storm["provenance"]["eta_interval"] = "simulated_demo_uncertainty"

    observations = []
    for storm in storms:
        severity_hazard = max(storm["hazards"].values())
        observations.append({"storm_id": storm["id"], "hazard": storm["hazard_type"], "probability": severity_hazard, "provenance": "simulated"})

    eta_storm = next(storm for storm in storms if storm["id"] == "storm_17")
    eta_anchor = valid_time + timedelta(minutes=eta_storm["eta_minutes"])
    lead_products = [dict(product) for product in FORECAST_PRODUCTS]
    if not radar_active:
        lead_products[0] = {**lead_products[0], "product_level": "probabilistic_hazard_zone", "description": "Radar unavailable; near-term product downgraded and uncertainty widened."}
        lead_products[0]["provenance"] = "simulated_sensor_failure_degradation"

    return {
        "frame_index": frame_index,
        "valid_time_utc": _time_text(valid_time),
        "storms": storms,
        "interactions": _interactions(frame_index),
        "events": [dict(event, timestamp_utc=_time_text(valid_time)) for event in EVENTS_BY_FRAME[frame_index]],
        "forecast": {
            "lead_time_products": lead_products,
            "forecast_members": _forecast_members(frame_index, radar_active),
            "eta_summary": {"storm_id": "storm_17", "arrival_utc": _time_text(eta_anchor), "interval_minutes": eta_storm["eta_interval_minutes"], "provenance": "simulated_demo_estimate"},
            "skill_gate": {
                "display_level": "storm_track" if radar_active else "probabilistic_hazard_zone",
                "confidence_label": "DEMO ONLY",
                "rolling_skill_score": 0.72 if radar_active else 0.38,
                "score_provenance": "simulated_not_historically_validated",
                "reason": "Synthetic scenario status; no benchmark data is connected." if radar_active else "Radar unavailable; precision downgraded and uncertainty widened.",
            },
        },
        "hazard_summary": observations,
        "impacts": _impacts(storms),
        "alert_preview": {
            "alert_id": f"demo-alert-{frame_index + 1}",
            "status": "PREVIEW ONLY",
            "hazard": "Extreme rainfall / convective storm",
            "storm_ids": [storm["id"] for storm in storms if max(storm["hazards"].values()) >= 0.6],
            "area": "West Bengal demo region",
            "effective_time_utc": _time_text(valid_time),
            "message": "Illustrative prototype alert; not an official warning.",
            "provenance": "simulated_demo",
        },
    }


def build_scenario(frame_index: int = FRAME_COUNT - 1, radar_active: bool = True) -> dict[str, Any]:
    """Return canonical scenario state plus replay frames and current products."""
    current = build_frame(frame_index, radar_active)
    replay_frames = [build_frame(index, radar_active) for index in range(FRAME_COUNT)]
    return {
        "schema_version": "1.0",
        "scenario_id": SCENARIO_ID,
        "scenario_name": SCENARIO_NAME,
        "mode": MODE,
        "data_sources": [{"name": "Deterministic ClimaX demo fixture", "status": "synthetic_demo", "fields": ["storm_tracks", "hazard_indicators", "forecast_members", "impact_scenario"]}],
        "sensors": {
            "radar": {"status": "simulated_online" if radar_active else "offline", "available": radar_active, "reliability": 0.92 if radar_active else 0.0, "age_seconds": 0, "provenance": "synthetic_demo"},
            "satellite": {"status": "unavailable", "available": False, "reliability": None, "age_seconds": None, "provenance": "unavailable_no_feed_connected"},
            "lightning": {"status": "unavailable", "available": False, "reliability": None, "age_seconds": None, "provenance": "unavailable_no_feed_connected"},
            "nwp": {"status": "unavailable", "available": False, "reliability": None, "age_seconds": None, "provenance": "unavailable_no_feed_connected"},
        },
        "fallback": {
            "active": not radar_active,
            "mode": "simulated_fallback" if not radar_active else None,
            "message": "Radar unavailable; alternate-sensor fallback is illustrative only." if not radar_active else None,
        },
        "observability": {
            "score": 0.92 if radar_active else 0.34,
            "label": "DEMO INDICATOR",
            "uncertainty_scale": 1.0 if radar_active else 2.5,
            "provenance": "simulated_demo",
        },
        "frame_index": frame_index,
        "frame_count": FRAME_COUNT,
        "frame_interval_minutes": FRAME_INTERVAL_MINUTES,
        "current": current,
        "valid_time_utc": current["valid_time_utc"],
        "storms": current["storms"],
        "interactions": current["interactions"],
        "events": current["events"],
        "forecast": current["forecast"],
        "hazard_summary": current["hazard_summary"],
        "impacts": current["impacts"],
        "alert_preview": current["alert_preview"],
        "replay": {"mode": "synthetic_scenario_replay", "frames": replay_frames, "provenance": "simulated_not_verified_historical_replay"},
        "model": {"name": "deterministic scenario fixture", "trained_earthformer_inference": False},
    }
