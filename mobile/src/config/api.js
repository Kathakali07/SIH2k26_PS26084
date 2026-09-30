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
    motion: p.motion || f.motion || {
      speed_kmh: p.speed_kmh ?? 30,
      direction_degrees: p.direction ?? 45,
    },
    position: { lon: lon || 8.23, lat: lat || 46.82 },
    is_forecast: p.is_forecast ?? f.is_forecast ?? false,
    forecast_source: p.forecast_source || f.forecast_source,
    hazards: p.hazards || f.hazards || {
      lightning: 0.8,
      hail: 0.6,
      downburst: 0.5,
      extreme_rain: 0.9,
    },
    nearest_target: p.nearest_target || f.nearest_target,
    eta_minutes: p.eta_minutes ?? f.eta_minutes ?? 30,
    uncertainty_scale: p.uncertainty_scale ?? f.uncertainty_scale ?? 1.0,
    geometry: f.geometry || p.geometry,
    description: p.description || f.description,
  };
}

