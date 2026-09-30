// ClimaX Mobile API Configuration & Client

// Cloud Render service URL (production) with local fallback options
export const DEFAULT_API_BASE = 'https://sih2k26-ps26084.onrender.com';
export const LOCAL_API_BASE = 'http://localhost:8000';
export const ANDROID_EMULATOR_API_BASE = 'http://10.0.2.2:8000';

let currentApiBase = DEFAULT_API_BASE;

export function getApiBase() {
  return currentApiBase;
}

export function setApiBase(url) {
  currentApiBase = url.replace(/\/+$/, '');
  return currentApiBase;
}

// Normalizes storm whether coming from API .storms array or GeoJSON .features
export function normalizeStormFeature(f) {
  if (!f) return null;
  const p = f.properties || f;
  let lat = f.position?.lat || p.position?.lat;
  let lon = f.position?.lon || p.position?.lon;

  // Derive center from polygon geometry if position is missing
  if ((!lat || !lon) && f.geometry?.coordinates?.[0]) {
    const coords = f.geometry.coordinates[0];
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    lon = (Math.min(...lons) + Math.max(...lons)) / 2;
    lat = (Math.min(...lats) + Math.max(...lats)) / 2;
  }

  return {
    id: p.id || f.id || 'storm',
    name: p.name || f.name || p.id,
    hazard_type: p.hazard_type || f.hazard_type || 'Thunderstorm',
    severity: p.severity || f.severity || 'HIGH',
    max_dbz: p.max_dbz ?? f.max_dbz ?? 55,
    area_km2: p.area_km2 ?? f.area_km2 ?? 300,
    lifecycle: p.lifecycle || f.lifecycle || 'Mature',
    speed_kmh: p.motion?.speed_kmh ?? p.speed_kmh ?? f.speed_kmh ?? 30,
    direction: p.motion?.direction_degrees ?? p.direction ?? f.direction ?? 45,
    position: { lon: lon || 8.23, lat: lat || 46.82 },
    hazards: p.hazards || f.hazards || {
      lightning: 0.8,
      hail: 0.6,
      downburst: 0.5,
      extreme_rain: 0.9,
    },
    nearest_target: p.nearest_target || f.nearest_target,
    eta_minutes: p.eta_minutes ?? f.eta_minutes ?? 30,
    uncertainty_scale: p.uncertainty_scale ?? f.uncertainty_scale ?? 1.0,
    geometry: f.geometry,
    description: p.description || f.description,
  };
}

// Built-in Swiss fallback scenario generator in case device is completely offline
export function generateLocalFallbackScenario(frameIndex = 19, radarActive = true) {
  const FRAME_COUNT = 38;
  const clampedIndex = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));
  const isForecast = clampedIndex >= 19;
  const uncertaintyScale = radarActive ? 1.0 : 2.5;

  const progress = clampedIndex / (FRAME_COUNT - 1);
  const nowProgress = Math.abs(clampedIndex - 19) / 19;

  return {
    scenario_id: 'swiss_dgmr_event_20160711',
    scenario_name: 'Swiss Alpine Convective Nowcast (DGMR)',
    region: 'Switzerland (Alps / Central Plateau)',
    frame_index: clampedIndex,
    total_frames: FRAME_COUNT,
    now_frame_index: 19,
    valid_time: isForecast ? `T+${(clampedIndex - 19) * 5}m` : `T-${(19 - clampedIndex) * 5}m`,
    is_forecast: isForecast,
    radar_active: radarActive,
    uncertainty_scale: uncertaintyScale,
    features: [
      {
        id: 'storm_01',
        name: 'Alpine Supercell',
        hazard_type: 'Thunderstorm',
        severity: clampedIndex > 14 && clampedIndex < 28 ? 'EXTREME' : 'HIGH',
        max_dbz: Math.round(74 - nowProgress * 12),
        area_km2: Math.round(420 + Math.sin(progress * Math.PI) * 110),
        lifecycle: clampedIndex < 8 ? 'Developing' : clampedIndex < 24 ? 'Mature' : 'Dissipating',
        speed_kmh: 46.2,
        direction: 54.0,
        position: {
          lon: 8.15 + progress * 0.9,
          lat: 46.40 + progress * 0.75,
        },
        hazards: {
          lightning: 0.88,
          hail: 0.72,
          downburst: 0.65,
          extreme_rain: 0.92,
        },
        nearest_target: 'Gotthard Highway A2',
        eta_minutes: Math.max(5, Math.round(28 - progress * 20)),
      },
      {
        id: 'storm_02',
        name: 'Bernese Core Cell',
        hazard_type: 'Cloudburst',
        severity: clampedIndex > 16 && clampedIndex < 26 ? 'HIGH' : 'MODERATE',
        max_dbz: Math.round(68 - nowProgress * 14),
        area_km2: Math.round(280 + Math.sin(progress * Math.PI) * 70),
        lifecycle: clampedIndex < 10 ? 'Developing' : clampedIndex < 26 ? 'Mature' : 'Dissipating',
        speed_kmh: 38.5,
        direction: 48.0,
        position: {
          lon: 7.35 + progress * 0.75,
          lat: 46.45 + progress * 0.5,
        },
        hazards: {
          lightning: 0.76,
          hail: 0.58,
          downburst: 0.48,
          extreme_rain: 0.84,
        },
        nearest_target: 'Lake Lucerne Ferry',
        eta_minutes: Math.max(8, Math.round(42 - progress * 25)),
      },
      {
        id: 'storm_03',
        name: 'Jura Frontal Cluster',
        hazard_type: 'Severe Squall',
        severity: 'HIGH',
        max_dbz: Math.round(64 - nowProgress * 10),
        area_km2: Math.round(350 + Math.sin(progress * Math.PI) * 90),
        lifecycle: clampedIndex < 12 ? 'Developing' : 'Mature',
        speed_kmh: 52.0,
        direction: 62.0,
        position: {
          lon: 6.85 + progress * 0.85,
          lat: 46.90 + progress * 0.45,
        },
        hazards: {
          lightning: 0.64,
          hail: 0.45,
          downburst: 0.78,
          extreme_rain: 0.70,
        },
        nearest_target: 'Basel EuroAirport',
        eta_minutes: Math.max(12, Math.round(55 - progress * 30)),
      },
    ],
  };
}
