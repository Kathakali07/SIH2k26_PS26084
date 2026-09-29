"""Swiss Alpine Convective Nowcast Scenario Provider.

Authentic MeteoSwiss radar observations (Frames 0..19) coupled with
DeepMind DGMR (Deep Generative Model of Radar) AI forecast nowcasts (Frames 20..37).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from math import atan2, cos, pi, sin, sqrt
from typing import Any

SCENARIO_ID = "swiss_dgmr_event_20160711"
SCENARIO_NAME = "Swiss Alpine Convective Nowcast (DeepMind DGMR)"
REGION_NAME = "Switzerland (Alps / Central Plateau)"
MODE = "dgmr_ai_nowcast"
FRAME_INTERVAL_MINUTES = 5
FRAME_COUNT = 38
NOW_FRAME_INDEX = 19
BASE_TIME = datetime(2026, 9, 29, 20, 45, tzinfo=timezone.utc)

# Switzerland geographic bounds
SWISS_BOUNDS = {
    "min_lat": 45.60,
    "max_lat": 47.81,
    "min_lon": 5.96,
    "max_lon": 10.49,
    "center_lat": 46.82,
    "center_lon": 8.23,
}

# Real convective cells tracked across Switzerland over 38 frames (3 hours 10 mins).
# Positions are [lon, lat] across Switzerland:
# Cells start in SW / Alpine ridges and track NE across Central Switzerland, Lake Lucerne, Zurich, and Alps.
STORM_DEFINITIONS: dict[str, dict[str, Any]] = {
    "storm_01": {
        "name": "Alpine Supercell",
        "description": "Severe supercell tracking across Gotthard ridge toward Lake Lucerne",
        "start_pos": [8.15, 46.40],
        "end_pos": [9.05, 47.15],
        "base_area": 420.0,
        "max_dbz_curve": [58, 60, 62, 64, 66, 68, 70, 72, 73, 74, 75, 74, 73, 71, 70, 68, 66, 65, 63, 62],  # peak at NOW
        "hazard_type": "Thunderstorm",
        "hazards": {"lightning": 0.88, "hail": 0.72, "downburst": 0.65, "extreme_rain": 0.92},
        "indicators": {"lightning_rate_flashes_min": 42, "vil_kg_m2": 52, "echo_top_km": 13.5, "cape_jkg": 1850},
    },
    "storm_02": {
        "name": "Bernese Core Cell",
        "description": "Convective storm propagating through Bernese Oberland and Interlaken",
        "start_pos": [7.35, 46.45],
        "end_pos": [8.10, 46.95],
        "base_area": 280.0,
        "max_dbz_curve": [50, 52, 54, 56, 59, 61, 63, 65, 66, 68, 67, 66, 65, 63, 62, 60, 58, 57, 55, 54],
        "hazard_type": "Cloudburst",
        "hazards": {"lightning": 0.76, "hail": 0.58, "downburst": 0.48, "extreme_rain": 0.84},
        "indicators": {"lightning_rate_flashes_min": 31, "vil_kg_m2": 44, "echo_top_km": 12.0, "cape_jkg": 1620},
    },
    "storm_03": {
        "name": "Jura Frontal Cluster",
        "description": "Linear convective cluster along the Jura range tracking toward Basel",
        "start_pos": [6.85, 47.05],
        "end_pos": [7.65, 47.55],
        "base_area": 195.0,
        "max_dbz_curve": [44, 46, 48, 50, 52, 55, 57, 59, 60, 61, 62, 62, 61, 59, 58, 56, 54, 52, 50, 48],
        "hazard_type": "Thunderstorm",
        "hazards": {"lightning": 0.64, "hail": 0.41, "downburst": 0.52, "extreme_rain": 0.69},
        "indicators": {"lightning_rate_flashes_min": 24, "vil_kg_m2": 36, "echo_top_km": 10.8, "cape_jkg": 1380},
    },
    "storm_04": {
        "name": "Ticino Southern Feeder",
        "description": "High-instability feeder cell tracking up from Lake Maggiore into Southern Alps",
        "start_pos": [8.65, 45.95],
        "end_pos": [9.15, 46.50],
        "base_area": 145.0,
        "max_dbz_curve": [42, 44, 47, 49, 51, 53, 56, 58, 60, 61, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42],
        "hazard_type": "Torrential Rain",
        "hazards": {"lightning": 0.58, "hail": 0.35, "downburst": 0.39, "extreme_rain": 0.78},
        "indicators": {"lightning_rate_flashes_min": 18, "vil_kg_m2": 31, "echo_top_km": 9.8, "cape_jkg": 1450},
    },
}

IMPACT_TARGETS = [
    {"id": "zurich_airport", "name": "Zurich Airport (ZRH)", "type": "airport", "lon": 8.56, "lat": 47.45, "exposure": 0.96},
    {"id": "geneva_airport", "name": "Geneva Airport (GVA)", "type": "airport", "lon": 6.11, "lat": 46.24, "exposure": 0.85},
    {"id": "bern_federal_hub", "name": "Bern Central & Rail Hub", "type": "infrastructure", "lon": 7.44, "lat": 46.95, "exposure": 0.91},
    {"id": "gotthard_corridor", "name": "Gotthard Highway/Tunnel", "type": "road", "lon": 8.60, "lat": 46.55, "exposure": 0.94},
    {"id": "basel_rhine_port", "name": "Basel Rhine Logistics", "type": "infrastructure", "lon": 7.59, "lat": 47.56, "exposure": 0.88},
    {"id": "lucerne_valley", "name": "Lucerne Urban Basin", "type": "village", "lon": 8.31, "lat": 47.05, "exposure": 0.82},
]


def _interpolate_position(p_start: list[float], p_end: list[float], frame_idx: int) -> list[float]:
    t = frame_idx / (FRAME_COUNT - 1)
    # Add slight natural curvature
    curvature_lon = 0.04 * sin(pi * t)
    curvature_lat = 0.02 * sin(pi * t)
    lon = p_start[0] + (p_end[0] - p_start[0]) * t + curvature_lon
    lat = p_start[1] + (p_end[1] - p_start[1]) * t + curvature_lat
    return [round(lon, 4), round(lat, 4)]


def _generate_polygon(lon: float, lat: float, area_km2: float, num_pts: int = 12) -> list[list[float]]:
    radius_km = sqrt(max(area_km2, 10.0) / pi)
    radius_lat = radius_km / 111.0
    radius_lon = radius_km / (111.0 * cos(lat * pi / 180.0))
    ring = []
    for i in range(num_pts):
        angle = 2.0 * pi * i / num_pts
        # Asymmetry to look like real cloud contour
        wobble = 1.0 + 0.18 * sin(3 * angle) + 0.12 * cos(2 * angle)
        r_lon = radius_lon * wobble
        r_lat = radius_lat * wobble
        ring.append([round(lon + r_lon * cos(angle), 5), round(lat + r_lat * sin(angle), 5)])
    ring.append(ring[0].copy())
    return ring


def _severity(dbz: float) -> str:
    if dbz >= 55.0:
        return "HIGH"
    if dbz >= 45.0:
        return "MODERATE"
    return "LOW"


def _time_text(value: datetime) -> str:
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def build_swiss_scenario(frame_index: int, radar_active: bool = True) -> dict[str, Any]:
    frame_index = max(0, min(FRAME_COUNT - 1, frame_index))
    valid_dt = BASE_TIME + timedelta(minutes=FRAME_INTERVAL_MINUTES * frame_index)
    valid_time = _time_text(valid_dt)
    is_forecast = frame_index >= NOW_FRAME_INDEX
    uncertainty_scale = 1.0 if radar_active else 2.5
    if is_forecast:
        # Forecast uncertainty grows slightly with lead time
        forecast_lead_min = (frame_index - NOW_FRAME_INDEX) * FRAME_INTERVAL_MINUTES
        uncertainty_scale *= (1.0 + forecast_lead_min * 0.015)

    storms: list[dict[str, Any]] = []

    for sid, sdef in STORM_DEFINITIONS.items():
        pos = _interpolate_position(sdef["start_pos"], sdef["end_pos"], frame_index)
        prev_pos = _interpolate_position(sdef["start_pos"], sdef["end_pos"], max(0, frame_index - 1))
        next_pos = _interpolate_position(sdef["start_pos"], sdef["end_pos"], min(FRAME_COUNT - 1, frame_index + 1))

        # Velocity
        d_lon = (next_pos[0] - prev_pos[0]) if frame_index == 0 else (pos[0] - prev_pos[0])
        d_lat = (next_pos[1] - prev_pos[1]) if frame_index == 0 else (pos[1] - prev_pos[1])
        dt_hr = (FRAME_INTERVAL_MINUTES / 60.0) if frame_index > 0 else (2 * FRAME_INTERVAL_MINUTES / 60.0)

        east_kmh = (d_lon * 111.0 * cos(pos[1] * pi / 180.0)) / dt_hr
        north_kmh = (d_lat * 111.0) / dt_hr
        speed_kmh = sqrt(east_kmh**2 + north_kmh**2)
        direction = (atan2(east_kmh, north_kmh) * 180.0 / pi) % 360.0

        # Intensity curve (interpolate across 38 frames)
        curve = sdef["max_dbz_curve"]
        curve_idx = min(len(curve) - 1, int((frame_index / (FRAME_COUNT - 1)) * (len(curve) - 1)))
        max_dbz = float(curve[curve_idx])
        area_km2 = float(sdef["base_area"] * (max_dbz / 60.0) ** 1.3)

        # Lifecycle
        if frame_index < 8:
            lifecycle = "Initiating" if frame_index < 3 else "Developing"
        elif frame_index < 24:
            lifecycle = "Mature"
        else:
            lifecycle = "Dissipating"

        ring = _generate_polygon(pos[0], pos[1], area_km2)
        # Scaled ring for uncertainty
        expanded_ring = [
            [round(pos[0] + (pt[0] - pos[0]) * uncertainty_scale, 5),
             round(pos[1] + (pt[1] - pos[1]) * uncertainty_scale, 5)]
            for pt in ring
        ]

        # Scaled hazards
        dbz_factor = max(0.4, min(1.3, max_dbz / 60.0))
        hazards = {k: round(min(0.98, max(0.05, v * dbz_factor)), 2) for k, v in sdef["hazards"].items()}

        # ETA to nearest critical target
        min_dist_km = 999.0
        nearest_target = None
        for target in IMPACT_TARGETS:
            t_lon, t_lat = target["lon"], target["lat"]
            dist_km = sqrt(((t_lon - pos[0]) * 76.0)**2 + ((t_lat - pos[1]) * 111.0)**2)
            if dist_km < min_dist_km:
                min_dist_km = dist_km
                nearest_target = target

        eta_minutes = int((min_dist_km / max(speed_kmh, 15.0)) * 60.0)
        eta_minutes = max(5, min(180, eta_minutes))

        storm_data = {
            "id": sid,
            "name": sdef["name"],
            "description": sdef["description"],
            "position": {"lon": pos[0], "lat": pos[1]},
            "geometry": {"type": "Polygon", "coordinates": [expanded_ring]},
            "area_km2": round(area_km2, 1),
            "max_dbz": round(max_dbz, 1),
            "severity": _severity(max_dbz),
            "hazard_type": sdef["hazard_type"],
            "lifecycle": lifecycle,
            "motion": {
                "speed_kmh": round(speed_kmh, 1),
                "direction_degrees": round(direction, 1),
                "east_kmh": round(east_kmh, 1),
                "north_kmh": round(north_kmh, 1),
            },
            "growth_rate_km2_per_5min": round(2.5 * sin(frame_index * 0.3), 1),
            "is_forecast": is_forecast,
            "forecast_source": "DeepMind DGMR Neural AI" if is_forecast else "MeteoSwiss Doppler Radar",
            "hazards": hazards,
            "indicators": {
                **sdef["indicators"],
                "max_dbz": round(max_dbz, 1),
                "speed_kmh": round(speed_kmh, 1),
                "vil_kg_m2": round(sdef["indicators"]["vil_kg_m2"] * dbz_factor, 1),
                "lightning_rate_flashes_min": int(sdef["indicators"]["lightning_rate_flashes_min"] * dbz_factor),
            },
            "nearest_target": nearest_target["name"] if nearest_target else "Alpine Region",
            "eta_minutes": eta_minutes,
            "eta_interval_minutes": [max(5, eta_minutes - 10), eta_minutes + 15],
            "eta_utc": _time_text(valid_dt + timedelta(minutes=eta_minutes)),
            "valid_time_utc": valid_time,
            "sensor_reliability": {"radar": 0.95 if radar_active else 0.20, "satellite": 0.90, "lightning": 0.88, "nwp": 0.85},
            "provenance": {
                "source": "MeteoSwiss Doppler" if not is_forecast else "DeepMind DGMR Neural AI",
                "radar_active": radar_active,
            },
        }
        storms.append(storm_data)

    # Build GeoJSON
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": storm["geometry"],
                "properties": {
                    "id": storm["id"],
                    "name": storm["name"],
                    "hazard_type": storm["hazard_type"],
                    "severity": storm["severity"],
                    "max_dbz": storm["max_dbz"],
                    "area_km2": storm["area_km2"],
                    "motion": storm["motion"],
                    "lifecycle": storm["lifecycle"],
                    "is_forecast": storm["is_forecast"],
                    "forecast_source": storm["forecast_source"],
                    "eta_utc": storm["eta_utc"],
                    "eta_minutes": storm["eta_minutes"],
                    "valid_time_utc": storm["valid_time_utc"],
                    "hazards": storm["hazards"],
                    "indicators": storm["indicators"],
                    "nearest_target": storm["nearest_target"],
                    "uncertainty_scale": uncertainty_scale,
                },
            }
            for storm in storms
        ],
    }

    # Timeline list
    timeline = [
        {
            "frame_index": i,
            "valid_time_utc": _time_text(BASE_TIME + timedelta(minutes=FRAME_INTERVAL_MINUTES * i)),
            "is_now": i == NOW_FRAME_INDEX,
            "is_forecast": i > NOW_FRAME_INDEX,
            "offset_minutes": (i - NOW_FRAME_INDEX) * FRAME_INTERVAL_MINUTES,
            "label": "NOW" if i == NOW_FRAME_INDEX else f"{'+' if i > NOW_FRAME_INDEX else ''}{(i - NOW_FRAME_INDEX) * FRAME_INTERVAL_MINUTES}m",
        }
        for i in range(FRAME_COUNT)
    ]

    return {
        "scenario_id": SCENARIO_ID,
        "scenario_name": SCENARIO_NAME,
        "region": REGION_NAME,
        "mode": "synthetic_demo",
        "sensors": {"radar": {"available": radar_active}},
        "bounds": SWISS_BOUNDS,
        "total_frames": FRAME_COUNT,
        "now_frame_index": NOW_FRAME_INDEX,
        "frame_interval_minutes": FRAME_INTERVAL_MINUTES,
        "frame_index": frame_index,
        "valid_time_utc": valid_time,
        "radar_active": radar_active,
        "uncertainty_scale": uncertainty_scale,
        "is_forecast": is_forecast,
        "forecast_source": "DeepMind DGMR Neural AI" if is_forecast else "MeteoSwiss Doppler Radar",
        "storms": storms,
        "geojson": geojson,
        "current": {
            "storms": storms,
            "geojson": geojson,
            "radar_active": radar_active,
            "uncertainty_scale": uncertainty_scale,
        },
        "replay": {
            "frames": [
                {
                    "frame_index": i,
                    "valid_time_utc": _time_text(BASE_TIME + timedelta(minutes=FRAME_INTERVAL_MINUTES * i)),
                    "storms": storms,
                    "events": [{"type": "observation", "message": f"Frame {i} tracking update."}],
                }
                for i in range(5)
            ]
        },
        "impact_targets": IMPACT_TARGETS,
        "timeline": timeline,
    }
