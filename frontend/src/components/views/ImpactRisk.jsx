import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Plane, Car, Home, PlusSquare, Settings, MapPin, AlertTriangle, ShieldAlert, Plus, Minus, Clock, ArrowUpRight, Radio, Sparkles } from 'lucide-react';

// Static Swiss Infrastructure Asset Catalog (Coordinates & Critical Classification)
const BASE_INFRASTRUCTURE = [
  // Airports & Aviation Hubs
  { id: 'zrh', name: 'Zurich Airport (ZRH)', category: 'Airports', type: 'International Aviation Hub', lat: 47.45, lon: 8.56, icon: 'plane' },
  { id: 'gva', name: 'Geneva Airport (GVA)', category: 'Airports', type: 'International Hub', lat: 46.24, lon: 6.11, icon: 'plane' },
  { id: 'bsl', name: 'EuroAirport Basel (BSL)', category: 'Airports', type: 'Regional Cargo & Pax', lat: 47.59, lon: 7.53, icon: 'plane' },
  { id: 'brn', name: 'Bern Regional Airport (BRN)', category: 'Airports', type: 'Regional Hub', lat: 46.91, lon: 7.50, icon: 'plane' },

  // Road & Trans-Alpine Transit Network
  { id: 'a2_gotthard', name: 'Gotthard Highway A2 / Tunnel', category: 'Road Network', type: 'Trans-Alpine Freight Axis', lat: 46.55, lon: 8.60, icon: 'car' },
  { id: 'a1_corridor', name: 'A1 Highway (Zurich–Bern)', category: 'Road Network', type: 'East-West Transit Spine', lat: 47.25, lon: 8.10, icon: 'car' },
  { id: 'a13_pass', name: 'San Bernardino A13 Pass', category: 'Road Network', type: 'Alpine Freight Pass', lat: 46.50, lon: 9.30, icon: 'car' },
  { id: 'erstfeld_hub', name: 'Gotthard Base Tunnel Portal', category: 'Road Network', type: 'High-Speed Rail Portal', lat: 46.82, lon: 8.64, icon: 'car' },

  // Settlements & Populated Valleys
  { id: 'interlaken', name: 'Interlaken & Oberland Basin', category: 'Villages', type: 'Tourism Valley Settlement', lat: 46.68, lon: 7.86, icon: 'home' },
  { id: 'altdorf', name: 'Altdorf & Uri Alpine Valleys', category: 'Villages', type: 'Flash Flood Vulnerable Basin', lat: 46.88, lon: 8.64, icon: 'home' },
  { id: 'lucerne_basin', name: 'Lake Lucerne Perimeter Towns', category: 'Villages', type: 'Lakeside Settlements', lat: 47.05, lon: 8.31, icon: 'home' },
  { id: 'zug_sihltal', name: 'Zug & Sihltal Catchment', category: 'Villages', type: 'Sub-Alpine Valley Towns', lat: 47.17, lon: 8.52, icon: 'home' },

  // Emergency Healthcare & Trauma Centers
  { id: 'usz', name: 'University Hospital Zurich (USZ)', category: 'Hospitals', type: 'Level 1 Trauma Center', lat: 47.38, lon: 8.55, icon: 'plus' },
  { id: 'inselspital', name: 'Inselspital Bern Medical Center', category: 'Hospitals', type: 'Regional University Hospital', lat: 46.95, lon: 7.42, icon: 'plus' },
  { id: 'luzern_spital', name: 'Kantonsspital Luzern', category: 'Hospitals', type: 'Emergency Hospital Hub', lat: 47.06, lon: 8.30, icon: 'plus' },
  { id: 'bellinzona_spital', name: 'Ospedale San Giovanni Bellinzona', category: 'Hospitals', type: 'Ticino Regional Medical', lat: 46.19, lon: 9.02, icon: 'plus' },

  // Energy & Critical Grid Infrastructure
  { id: 'gotthard_power', name: 'Gotthard Base Tunnel Power Feed', category: 'Critical Infrastructure', type: 'Railway Grid Traction', lat: 46.52, lon: 8.68, icon: 'settings' },
  { id: 'grimsel_dam', name: 'Grimsel Hydro Storage Complex', category: 'Critical Infrastructure', type: 'High-Altitude Hydro Dam', lat: 46.57, lon: 8.33, icon: 'settings' },
  { id: 'beznau_grid', name: 'Swissgrid Beznau Substation', category: 'Critical Infrastructure', type: 'National 380kV Grid Node', lat: 47.55, lon: 8.23, icon: 'settings' },
  { id: 'bannalp_dam', name: 'Bannalp Hydro Reservoir', category: 'Critical Infrastructure', type: 'Alpine Water Retention Dam', lat: 46.87, lon: 8.43, icon: 'settings' },
];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStormCenter(feature) {
  const coords = feature.geometry?.coordinates?.[0] || [];
  if (!coords.length) {
    return { lat: 46.75, lon: 8.60 };
  }
  const lats = coords.map(c => c[1]);
  const lons = coords.map(c => c[0]);
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lon: (Math.min(...lons) + Math.max(...lons)) / 2,
  };
}

export default function ImpactRisk({
  storms = [],
  setActiveTab,
  frameIndex = 19,
  setFrameIndex,
  nowFrameIndex = 19,
  totalFrames = 38,
}) {
  const [activeCategory, setActiveCategory] = useState('Overview');
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // ── 1. DYNAMIC RISK ENGINE: Compute live distance, ETA, and risk for all assets ──
  const evaluatedAssets = useMemo(() => {
    const stormObjects = (storms || []).map(f => {
      const p = f.properties || {};
      const center = getStormCenter(f);
      const spanKm = Math.sqrt(p.area_km2 || 350) / 1.77;
      return {
        id: p.id,
        name: p.name || 'Storm Cell',
        lat: center.lat,
        lon: center.lon,
        maxDbz: p.max_dbz || 55,
        radiusKm: Math.max(spanKm, 12),
        speedKmh: p.motion?.speed_kmh || 38,
        directionDeg: p.motion?.direction_degrees || 45,
        hazards: p.hazards || { lightning: 0.8, hail: 0.6, downburst: 0.5, extreme_rain: 0.7 },
        indicators: p.indicators || { lightning_rate_flashes_min: 35, vil_kg_m2: 45, echo_top_km: 12 },
      };
    });

    return BASE_INFRASTRUCTURE.map(asset => {
      if (!stormObjects.length) {
        return {
          ...asset,
          risk: 'Low',
          color: '#10b981',
          badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          eta: '> 2h',
          distanceKm: 120,
          nearestStorm: null,
          threatScore: 10,
        };
      }

      // Find closest storm and approach vector
      let closestStorm = stormObjects[0];
      let minDistance = 99999;

      stormObjects.forEach(s => {
        const d = getDistanceKm(asset.lat, asset.lon, s.lat, s.lon);
        if (d < minDistance) {
          minDistance = d;
          closestStorm = s;
        }
      });

      // Vector geometry: is storm moving towards asset?
      const headingRad = (closestStorm.directionDeg * Math.PI) / 180;
      const motionVec = [Math.cos(headingRad), Math.sin(headingRad)];
      const dLat = asset.lat - closestStorm.lat;
      const dLon = (asset.lon - closestStorm.lon) * Math.cos((asset.lat * Math.PI) / 180);
      const vecNorm = Math.sqrt(dLat * dLat + dLon * dLon) || 1;
      const dot = (dLat * motionVec[0] + dLon * motionVec[1]) / vecNorm;
      const isApproaching = dot > 0.25;

      // Dynamic ETA
      let etaText = '';
      if (minDistance <= closestStorm.radiusKm) {
        etaText = 'Active Core (<5m)';
      } else if (isApproaching) {
        const minutes = Math.max(5, Math.round((minDistance / closestStorm.speedKmh) * 60));
        etaText = `~${minutes}m`;
      } else {
        const minutes = Math.round((minDistance / closestStorm.speedKmh) * 60) + 15;
        etaText = `~${minutes}m (Peripheral)`;
      }

      // Dynamic Risk Assessment
      let risk = 'Low';
      let color = '#10b981';
      let badgeClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      let threatScore = 15;

      if (minDistance <= closestStorm.radiusKm * 1.15 || (minDistance <= 22 && closestStorm.maxDbz >= 62)) {
        risk = 'Extreme';
        color = '#a855f7';
        badgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
        threatScore = 95;
      } else if ((minDistance <= 42 && closestStorm.maxDbz >= 52) || (isApproaching && minDistance <= 55 && closestStorm.maxDbz >= 58)) {
        risk = 'High';
        color = '#ef4444';
        badgeClass = 'bg-red-500/20 text-red-400 border border-red-500/40';
        threatScore = 75;
      } else if (minDistance <= 75 && closestStorm.maxDbz >= 42) {
        risk = 'Moderate';
        color = '#f59e0b';
        badgeClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
        threatScore = 48;
      }

      return {
        ...asset,
        risk,
        color,
        badgeClass,
        eta: etaText,
        distanceKm: Math.round(minDistance * 10) / 10,
        nearestStorm: closestStorm,
        threatScore,
      };
    });
  }, [storms]);

  // Filtered Assets by Category Tab
  const displayedAssets = useMemo(() => {
    let list = evaluatedAssets;
    if (activeCategory !== 'Overview') {
      list = evaluatedAssets.filter(a => a.category === activeCategory);
    }
    // Sort so most threatened assets always appear at top
    return [...list].sort((a, b) => b.threatScore - a.threatScore);
  }, [evaluatedAssets, activeCategory]);

  // Selected Asset (defaults to highest threat asset)
  const currentAsset = useMemo(() => {
    return (
      evaluatedAssets.find(a => a.id === selectedAssetId) ||
      displayedAssets[0] ||
      evaluatedAssets[0]
    );
  }, [evaluatedAssets, displayedAssets, selectedAssetId]);

  // Dynamic Hazard Indicators for current selected asset
  const dynamicHazards = useMemo(() => {
    if (!currentAsset || !currentAsset.nearestStorm) {
      return {
        lightning: 'Low (<5 fl/min)',
        hail: 'Low (<10%)',
        wind: 'Normal (<40 km/h)',
        rain: 'Light (<5 mm/h)',
      };
    }
    const s = currentAsset.nearestStorm;
    const prox = Math.max(0.1, 1 - currentAsset.distanceKm / 80);

    const flRate = Math.round((s.indicators?.lightning_rate_flashes_min || 40) * prox);
    const hailProb = Math.round((s.hazards?.hail || 0.7) * prox * 100);
    const windSpeed = Math.round(55 + (s.hazards?.downburst || 0.6) * 45 * prox);
    const rainRate = Math.round((s.hazards?.extreme_rain || 0.8) * 70 * prox);

    return {
      lightning: flRate >= 25 ? `High (${flRate} fl/min)` : flRate >= 10 ? `Moderate (${flRate} fl/min)` : `Low (${flRate} fl/min)`,
      hail: hailProb >= 55 ? `High (${(hailProb * 0.04).toFixed(1)} cm / ${hailProb}%)` : hailProb >= 25 ? `Moderate (${hailProb}%)` : `Low (${hailProb}%)`,
      wind: windSpeed >= 80 ? `High (${windSpeed} km/h Gusts)` : windSpeed >= 60 ? `Moderate (${windSpeed} km/h)` : `Low (${windSpeed} km/h)`,
      rain: rainRate >= 45 ? `Extreme (${rainRate} mm/h)` : rainRate >= 20 ? `High (${rainRate} mm/h)` : `Moderate (${rainRate} mm/h)`,
    };
  }, [currentAsset]);

  const handleAssetClick = (asset) => {
    setSelectedAssetId(asset.id);
    if (mapInstanceRef.current && asset.lat && asset.lon) {
      mapInstanceRef.current.flyTo([asset.lat, asset.lon], 11, { duration: 0.8 });
    }
  };

  // Helper Icon renderer
  const renderAssetIcon = (iconType, size = 14) => {
    switch (iconType) {
      case 'plane': return <Plane size={size} />;
      case 'car': return <Car size={size} />;
      case 'home': return <Home size={size} />;
      case 'plus': return <PlusSquare size={size} />;
      default: return <Settings size={size} />;
    }
  };

  // ── 2. Initialize Leaflet Map ──
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.85, 8.35], // Switzerland center
        zoom: 8,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        className: 'dark-tiles',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── 3. Render Dynamic Map Layers: Storm Cores + Infrastructure Pins + Impact Vectors ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw Active Convective Storm Threat Zones dynamically from live storms prop
    (storms || []).forEach(f => {
      const p = f.properties || {};
      const center = getStormCenter(f);
      const spanKm = Math.sqrt(p.area_km2 || 350) / 1.77;
      const radiusMeters = Math.max(spanKm * 1000, 14000);
      const isFore = p.is_forecast;

      // Outer threat halo
      L.circle([center.lat, center.lon], {
        radius: radiusMeters,
        color: isFore ? '#c084fc' : '#ef4444',
        fillColor: isFore ? '#c084fc' : '#ef4444',
        fillOpacity: 0.22,
        weight: 1.5,
        dashArray: isFore ? '5 5' : '4 4',
      })
        .bindTooltip(`<b>${p.name || 'Convective Core'}</b><br>${p.max_dbz?.toFixed(0) || 60} dBZ &bull; ${p.severity || 'HIGH'} Threat`, { className: 'custom-tooltip' })
        .addTo(group);

      // Core center marker
      L.circleMarker([center.lat, center.lon], {
        radius: 6,
        color: '#ffffff',
        fillColor: isFore ? '#c084fc' : '#ef4444',
        fillOpacity: 1,
        weight: 2,
      }).addTo(group);
    });

    // 2. Gotthard A2 Highway Polyline if relevant
    if (['Overview', 'Road Network'].includes(activeCategory)) {
      const a2Highway = [
        [47.56, 7.59], [47.35, 7.90], [47.05, 8.31], [46.88, 8.64],
        [46.55, 8.60], [46.20, 9.02], [46.00, 8.95]
      ];
      L.polyline(a2Highway, {
        color: '#a855f7',
        weight: 3.5,
        dashArray: '6 4',
      }).bindTooltip('<b>Gotthard A2 Corridor</b> (Trans-Alpine Axis)', { className: 'custom-tooltip' }).addTo(group);
    }

    // 3. Asset Markers with dynamic risk color and size
    displayedAssets.forEach(asset => {
      if (!asset.lat || !asset.lon) return;

      const isSelected = currentAsset?.id === asset.id;

      if (isSelected) {
        L.circle([asset.lat, asset.lon], {
          radius: 4500,
          color: '#38bdf8',
          fillColor: '#38bdf8',
          fillOpacity: 0.35,
          weight: 2,
        }).addTo(group);

        // Dynamic threat vector connecting selected asset to threatening storm core
        if (asset.nearestStorm) {
          const s = asset.nearestStorm;
          L.polyline([[asset.lat, asset.lon], [s.lat, s.lon]], {
            color: '#38bdf8',
            weight: 2.5,
            dashArray: '4 4',
          })
            .bindTooltip(`<b>Threat Vector:</b> ${asset.distanceKm} km to ${s.name}<br>ETA: <b>${asset.eta}</b>`, {
              permanent: true,
              className: 'custom-tooltip',
            })
            .addTo(group);
        }
      }

      const marker = L.circleMarker([asset.lat, asset.lon], {
        radius: isSelected ? 10 : asset.risk === 'Extreme' ? 8 : asset.risk === 'High' ? 7 : 5.5,
        color: isSelected ? '#38bdf8' : '#ffffff',
        fillColor: asset.color,
        fillOpacity: 0.95,
        weight: isSelected ? 3 : 2,
      });

      marker.on('click', () => handleAssetClick(asset));

      marker.bindTooltip(`
        <div style="font-size:11px;">
          <b>${asset.name}</b><br/>
          <span style="color:#94a3b8">${asset.type}</span><br/>
          <b style="color:${asset.color}">${asset.risk} Risk</b> &bull; ETA: ${asset.eta}<br/>
          <span style="color:#cbd5e1;font-size:10px;">${asset.distanceKm} km from ${asset.nearestStorm?.name || 'Storm'}</span>
        </div>
      `, { permanent: isSelected, direction: 'top', className: 'custom-tooltip', offset: [0, -10] });

      marker.addTo(group);
    });

  }, [storms, displayedAssets, currentAsset, activeCategory]);

  const isForecast = frameIndex > nowFrameIndex;
  const offsetMin = (frameIndex - nowFrameIndex) * 5;

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0 select-none">
      {/* Top Filter Tabs & Dynamic Scrubber Indicator */}
      <div className="flex items-center justify-between bg-[#111622] p-2.5 rounded-xl border border-gray-800/60 shrink-0 shadow-lg">
        <div className="flex items-center gap-2">
          {['Overview', 'Airports', 'Road Network', 'Villages', 'Hospitals', 'Critical Infrastructure'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lead Time Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Clock size={13} className="text-blue-400" />
          <span className="text-gray-400">
            Nowcast Horizon: <strong className={isForecast ? 'text-purple-300' : 'text-emerald-400'}>
              {frameIndex === nowFrameIndex ? 'T+0 (NOW)' : `+${offsetMin} min (AI Nowcast)`}
            </strong>
          </span>
          {setFrameIndex && (
            <div className="flex items-center gap-1 ml-2 border-l border-gray-700 pl-3">
              {[
                { label: 'NOW', idx: nowFrameIndex },
                { label: '+30m', idx: Math.min(totalFrames - 1, nowFrameIndex + 6) },
                { label: '+60m', idx: Math.min(totalFrames - 1, nowFrameIndex + 12) },
                { label: '+90m', idx: Math.min(totalFrames - 1, nowFrameIndex + 18) },
              ].map(step => (
                <button
                  key={step.label}
                  onClick={() => setFrameIndex(step.idx)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    frameIndex === step.idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#182030] text-gray-400 hover:text-white border border-gray-700/60'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Map View with REAL DYNAMIC LEAFLET MAP */}
        <div className="flex-[2.6] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col shadow-lg">
          {/* Leaflet map container */}
          <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />

          {/* Top Overlay Badge */}
          <div className="absolute top-4 left-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-200">Dynamic Multi-Hazard Asset Exposure</span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              Live Proximity &amp; Speed Engine
            </span>
          </div>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1 bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors text-base font-bold cursor-pointer"
            >
              +
            </button>
            <div className="h-[1px] w-full bg-gray-700" />
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors text-base font-bold cursor-pointer"
            >
              -
            </button>
          </div>

          {/* Dynamic Impact Risk Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-lg p-2.5 shadow-xl w-[260px]">
            <div className="text-[10px] text-gray-300 mb-1 font-medium flex justify-between">
              <span>Dynamic Exposure Threat</span>
              <span className="text-[9px] text-gray-400 font-mono">Distance &bull; dBZ &bull; ETA</span>
            </div>
            <div className="w-full h-2.5 rounded bg-gradient-to-r from-emerald-600 via-amber-500 via-red-600 to-purple-600 mb-1" />
            <div className="flex justify-between text-[9px] text-gray-400 font-mono">
              <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
            </div>
          </div>
        </div>

        {/* Right Asset Risk Assessment Panel: COMPUTED DYNAMICALLY */}
        <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col justify-between shadow-lg">
          <div>
            {/* Header Card: Dynamic Region/Asset Title */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-[#182030]/70 border border-gray-800 mb-3">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Active Monitored Node</span>
                <span className="text-sm font-bold text-white truncate block">{currentAsset?.name || 'Gotthard Corridor'}</span>
                <span className="text-[10px] text-blue-400 font-mono">
                  {currentAsset?.distanceKm} km from {currentAsset?.nearestStorm?.name || 'Storm Core'}
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${currentAsset?.badgeClass}`}>
                {currentAsset?.risk?.toUpperCase()} RISK
              </span>
            </div>

            {/* Dynamic Hazard Breakdown computed from nearest storm */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-2 rounded bg-[#0a0d14] border border-gray-800">
                <span className="text-gray-400 text-[10px] block">Lightning Threat</span>
                <span className="text-red-400 font-bold mt-0.5 block truncate">{dynamicHazards.lightning}</span>
              </div>
              <div className="p-2 rounded bg-[#0a0d14] border border-gray-800">
                <span className="text-gray-400 text-[10px] block">Hail Probability</span>
                <span className="text-amber-400 font-bold mt-0.5 block truncate">{dynamicHazards.hail}</span>
              </div>
              <div className="p-2 rounded bg-[#0a0d14] border border-gray-800">
                <span className="text-gray-400 text-[10px] block">Downburst Winds</span>
                <span className="text-blue-400 font-bold mt-0.5 block truncate">{dynamicHazards.wind}</span>
              </div>
              <div className="p-2 rounded bg-[#0a0d14] border border-gray-800">
                <span className="text-gray-400 text-[10px] block">Flash Flood / Rain</span>
                <span className="text-purple-400 font-bold mt-0.5 block truncate">{dynamicHazards.rain}</span>
              </div>
            </div>

            {/* Dynamic Risk List sorted by risk */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Vulnerable Assets ({displayedAssets.length})
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Sorted by Threat</span>
            </div>

            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
              {displayedAssets.map((asset) => {
                const isSelected = currentAsset?.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleAssetClick(asset)}
                    className={`flex justify-between items-center p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500/80 shadow-md shadow-blue-500/20'
                        : 'bg-[#182030]/50 border-gray-800/80 hover:bg-[#1f293d] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`p-1 rounded shrink-0 ${isSelected ? 'bg-blue-500 text-white' : 'bg-[#0a0d14] text-blue-400 border border-gray-700/50'}`}>
                        {renderAssetIcon(asset.icon)}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-blue-300 font-bold' : 'text-gray-200'}`}>
                          {asset.name}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block">
                          {asset.distanceKm} km &bull; {asset.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold block" style={{ color: asset.color }}>{asset.risk}</span>
                      <span className="text-[10px] text-gray-400 font-mono">ETA {asset.eta}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center text-xs">
            <span className="text-gray-400">
              High/Extreme Nodes: <strong className="text-red-400">{evaluatedAssets.filter(a => ['Extreme', 'High'].includes(a.risk)).length} Active</strong>
            </span>
            <button
              onClick={() => setActiveTab('Alerts')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Issue Early Warning &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
