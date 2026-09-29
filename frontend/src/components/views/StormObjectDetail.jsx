import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ChevronLeft, ChevronRight, Activity, Satellite, Zap, Compass, Wind, ShieldAlert, Thermometer, Layers, Plus, Minus } from 'lucide-react';

export default function StormObjectDetail({ storms = [], setActiveTab, selectedStormId, onStormSelect }) {
  const stormList = storms.map(s => s.properties);
  const currentStorm = stormList.find(s => s.id === selectedStormId) || stormList[0] || {
    id: 'storm_01',
    name: 'Alpine Supercell',
    hazard_type: 'Thunderstorm',
    severity: 'HIGH',
    max_dbz: 74.0,
    area_km2: 420.0,
    lifecycle: 'Mature',
    motion: { speed_kmh: 38, direction_degrees: 45, east_kmh: 27, north_kmh: 27 },
    nearest_target: 'Gotthard Highway/Tunnel',
    indicators: { lightning_rate_flashes_min: 42, vil_kg_m2: 52, echo_top_km: 13.5, cape_jkg: 1850 },
    hazards: { lightning: 0.88, hail: 0.72, downburst: 0.65, extreme_rain: 0.92 }
  };

  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [activeLayer, setActiveLayer] = useState('Radar');

  const currentIndex = stormList.findIndex(s => s.id === currentStorm.id);
  const handlePrev = () => {
    if (stormList.length > 0) {
      const prevIdx = (currentIndex - 1 + stormList.length) % stormList.length;
      onStormSelect?.(stormList[prevIdx].id);
    }
  };
  const handleNext = () => {
    if (stormList.length > 0) {
      const nextIdx = (currentIndex + 1) % stormList.length;
      onStormSelect?.(stormList[nextIdx].id);
    }
  };

  const p = currentStorm;
  const isHigh = p.severity === 'HIGH';
  const isMod = p.severity === 'MODERATE';

  // Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  const defaultCoords = {
    storm_01: [46.75, 8.60], // Alpine Supercell: Uri / Gotthard Pass
    storm_02: [46.70, 7.72], // Bernese Core: Bernese Oberland / Interlaken
    storm_03: [47.30, 7.25], // Jura Frontal: Solothurn / Jura
    storm_04: [46.22, 8.90], // Ticino Feeder: Bellinzona / Lugano
  };
  const stormLatLon = p.position 
    ? [p.position.lat, p.position.lon] 
    : defaultCoords[p.id] || [46.75, 8.60];

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: stormLatLon,
        zoom: 9,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        className: 'dark-tiles',
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
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

  // Update map layers and center when selected storm or layer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    map.setView(stormLatLon, 9, { animate: true });

    const [cLat, cLng] = stormLatLon;
    const dbz = p.max_dbz || 65;

    // 1. Range Rings (10km, 25km, 50km)
    [10000, 25000, 50000].forEach((r) => {
      L.circle([cLat, cLng], {
        radius: r,
        color: 'rgba(148, 163, 184, 0.22)',
        fill: false,
        weight: 1,
        dashArray: '4 4',
        interactive: false,
      }).addTo(group);
    });

    const dbzToColor = (val) => {
      if (val >= 65) return 'rgba(168, 85, 247, 0.8)';
      if (val >= 55) return 'rgba(239, 68, 68, 0.75)';
      if (val >= 45) return 'rgba(249, 115, 22, 0.65)';
      if (val >= 35) return 'rgba(234, 179, 8, 0.55)';
      return 'rgba(34, 197, 94, 0.45)';
    };

    const spanKm = Math.sqrt(p.area_km2 || 350) / 2;
    const baseR = Math.max(spanKm * 1000, 11000);

    // 2. Concentric Reflectivity rings
    [
      { r: baseR * 2.2, d: dbz * 0.35, o: 0.2 },
      { r: baseR * 1.6, d: dbz * 0.55, o: 0.32 },
      { r: baseR * 1.1, d: dbz * 0.75, o: 0.48 },
      { r: baseR * 0.7, d: dbz * 0.9, o: 0.65 },
      { r: baseR * 0.35, d: dbz, o: 0.85 },
    ].forEach((ring) => {
      L.circle([cLat, cLng], {
        radius: ring.r,
        color: 'transparent',
        fillColor: dbzToColor(ring.d),
        fillOpacity: ring.o,
        interactive: false,
      }).addTo(group);
    });

    // 3. Storm Core Pin Marker
    const stormIcon = L.divIcon({
      className: 'storm-marker',
      html: `
        <div style="position:relative; width:26px; height:26px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(239,68,68,0.5); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative; width:12px; height:12px; border-radius:50%; background:#ef4444; border:2px solid #ffffff; box-shadow:0 0 12px #ef4444;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    L.marker([cLat, cLng], { icon: stormIcon })
      .bindTooltip(`<b>${p.name || p.id}</b><br>${dbz.toFixed(0)} dBZ • ${p.lifecycle || 'Mature'}`, {
        permanent: true,
        direction: 'top',
        className: 'custom-tooltip',
        offset: [0, -14],
      })
      .addTo(group);

    // 4. Past Track & Future Forecast Track
    const headingDeg = p.motion?.direction_degrees || 45;
    const speedKmh = p.motion?.speed_kmh || 38;
    const headingRad = (headingDeg * Math.PI) / 180;
    const pastKm = (speedKmh * 0.5) / 111;
    const pastLat = cLat - pastKm * Math.cos(headingRad);
    const pastLng = cLng - (pastKm * Math.sin(headingRad)) / Math.cos((cLat * Math.PI) / 180);

    L.polyline([[pastLat, pastLng], [cLat, cLng]], {
      color: '#38bdf8',
      weight: 3,
      dashArray: '3 3',
    }).addTo(group);

    const futKm = (speedKmh * 1.0) / 111;
    const futLat = cLat + futKm * Math.cos(headingRad);
    const futLng = cLng + (futKm * Math.sin(headingRad)) / Math.cos((cLat * Math.PI) / 180);

    L.polyline([[cLat, cLng], [futLat, futLng]], {
      color: '#c084fc',
      weight: 3,
      dashArray: '6 4',
    }).addTo(group);

    // 5. Uncertainty Cone
    const spreadRad = 0.26;
    const coneLeftLat = cLat + futKm * Math.cos(headingRad - spreadRad);
    const coneLeftLng = cLng + (futKm * Math.sin(headingRad - spreadRad)) / Math.cos((cLat * Math.PI) / 180);
    const coneRightLat = cLat + futKm * Math.cos(headingRad + spreadRad);
    const coneRightLng = cLng + (futKm * Math.sin(headingRad + spreadRad)) / Math.cos((cLat * Math.PI) / 180);

    L.polygon([[cLat, cLng], [coneLeftLat, coneLeftLng], [coneRightLat, coneRightLng]], {
      color: 'rgba(168, 85, 247, 0.45)',
      fillColor: 'rgba(168, 85, 247, 0.14)',
      weight: 1.5,
    }).addTo(group);

    // 6. Target Marker
    const targetMap = {
      storm_01: { name: 'Gotthard Highway / Tunnel', lat: 46.55, lon: 8.60 },
      storm_02: { name: 'Interlaken / Bernese Hub', lat: 46.68, lon: 7.86 },
      storm_03: { name: 'Basel Rhine Logistics', lat: 47.56, lon: 7.59 },
      storm_04: { name: 'Lugano / Bellinzona Area', lat: 46.01, lon: 8.95 },
    };
    const target = targetMap[p.id] || { name: p.nearest_target || 'Target Hub', lat: cLat + 0.12, lon: cLng + 0.12 };

    L.circleMarker([target.lat, target.lon], {
      radius: 6,
      color: '#ffffff',
      fillColor: '#ef4444',
      fillOpacity: 1,
      weight: 2,
    })
      .bindTooltip(`<b>Target: ${target.name}</b><br>High Vulnerability Asset`, {
        permanent: false,
        className: 'custom-tooltip',
      })
      .addTo(group);

  }, [p, activeLayer]);

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-[#111622] rounded-xl border border-gray-800/60 p-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('Live Nowcast')}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} /> Back to Live Map
          </button>
          <div className="h-5 w-[1px] bg-gray-800"></div>

          {/* Storm Title & Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={p.id}
              onChange={(e) => onStormSelect?.(e.target.value)}
              className="bg-[#182030] text-sm font-bold text-gray-100 border border-gray-700/60 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {stormList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.id} ({s.max_dbz?.toFixed(0)} dBZ)
                </option>
              ))}
            </select>

            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              isHigh ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              isMod ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/40'
            }`}>
              {p.severity} SEVERITY
            </span>

            <span className="text-xs text-gray-400 ml-1">
              Stage: <strong className="text-gray-200">{p.lifecycle || 'Mature'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="px-2.5 py-1 rounded-lg bg-[#182030] hover:bg-gray-800 text-xs text-gray-300 flex items-center gap-1 border border-gray-700/50 transition-colors cursor-pointer">
            <ChevronLeft size={13} /> Prev Storm
          </button>
          <button onClick={handleNext} className="px-2.5 py-1 rounded-lg bg-[#182030] hover:bg-gray-800 text-xs text-gray-300 flex items-center gap-1 border border-gray-700/50 transition-colors cursor-pointer">
            Next Storm <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="flex gap-2 shrink-0">
        {['Overview', 'Forecast', 'Hazards', 'Interactions', 'Impact', 'Environment'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#111622] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Map View with REAL LEAFLET MAP */}
        <div className="flex-[3] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col shadow-lg">
          {/* Leaflet map container */}
          <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />

          {/* Layer switcher */}
          <div className="absolute top-4 left-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-xl p-2 flex flex-col gap-1.5 shadow-xl text-xs">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
              <input type="radio" checked={activeLayer === 'Radar'} onChange={() => setActiveLayer('Radar')} className="accent-blue-500" />
              <Activity size={13} className="text-blue-400" /> Radar Reflectivity (dBZ)
            </label>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
              <input type="radio" checked={activeLayer === 'Satellite'} onChange={() => setActiveLayer('Satellite')} className="accent-blue-500" />
              <Satellite size={13} className="text-purple-400" /> Satellite IR Cloud Top
            </label>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
              <input type="radio" checked={activeLayer === 'Lightning'} onChange={() => setActiveLayer('Lightning')} className="accent-blue-500" />
              <Zap size={13} className="text-amber-400" /> EUCLID Lightning Density
            </label>
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

          {/* Target callout */}
          <div className="absolute bottom-4 right-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/60 px-3 py-1.5 rounded-lg text-xs text-gray-300 shadow-xl">
            <span className="text-gray-400">Target Area: </span>
            <strong className="text-blue-400">{p.nearest_target || 'Gotthard / Lucerne Corridor'}</strong>
          </div>

          {/* Radar dBZ Colorbar */}
          <div className="absolute bottom-4 left-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-lg p-2.5 shadow-xl">
            <div className="text-[10px] text-gray-300 mb-1 font-medium">Reflectivity dBZ Scale</div>
            <div className="w-44 h-2.5 rounded bg-gradient-to-r from-blue-600 via-green-500 via-yellow-400 via-red-600 to-purple-600 mb-1" />
            <div className="flex justify-between text-[9px] text-gray-400 font-mono">
              <span>15</span><span>30</span><span>45</span><span>60</span><span>75+</span>
            </div>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col overflow-y-auto custom-scrollbar shadow-lg">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3 pb-2 border-b border-gray-800">
            {activeSubTab} Analysis: {p.name || p.id}
          </h3>

          {activeSubTab === 'Overview' && (
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Position</span>
                <span className="text-gray-200 font-mono font-medium">
                  {stormLatLon[0].toFixed(2)}°N, {stormLatLon[1].toFixed(2)}°E
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Footprint Area</span>
                <span className="text-gray-200 font-medium">{p.area_km2?.toFixed(0) || '420'} km²</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Max Reflectivity</span>
                <span className="text-amber-400 font-bold">{p.max_dbz?.toFixed(1) || '74.0'} dBZ</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Echo Top Height</span>
                <span className="text-gray-200 font-medium">{p.indicators?.echo_top_km || 13.5} km</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Ground Velocity</span>
                <span className="text-gray-200 font-medium">
                  {p.motion?.speed_kmh?.toFixed(0) || 38} km/h @ {p.motion?.direction_degrees?.toFixed(0) || 45}° (NE)
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Lightning Rate</span>
                <span className="text-yellow-400 font-semibold flex items-center gap-1">
                  <Zap size={12} /> {p.indicators?.lightning_rate_flashes_min || 42} flashes/min
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Critical Target</span>
                <span className="text-blue-400 font-semibold">{p.nearest_target || 'Gotthard Highway/Tunnel'}</span>
              </div>
            </div>
          )}

          {activeSubTab === 'Forecast' && (
            <div className="flex flex-col gap-2.5 text-xs">
              <p className="text-gray-400 text-[11px] leading-relaxed">
                DGMR Generative Nowcast projects this convective core to propagate Northeast along the Alpine valley with continued high reflectivity for the next 45 minutes.
              </p>
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40">
                <span className="text-[10px] text-purple-300 font-bold block mb-1.5 uppercase">DGMR AI Forecast Waypoints</span>
                <div className="flex justify-between text-gray-300 py-1 border-b border-purple-900/40">
                  <span>+15m ETA:</span><strong>Gotthard Pass Core</strong>
                </div>
                <div className="flex justify-between text-gray-300 py-1 border-b border-purple-900/40">
                  <span>+35m ETA:</span><strong>Lake Lucerne Basin</strong>
                </div>
                <div className="flex justify-between text-gray-300 py-1">
                  <span>+60m ETA:</span><strong>Zurich South Perimeter</strong>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'Hazards' && (
            <div className="flex flex-col gap-2 text-xs">
              {Object.entries(p.hazards || { lightning: 0.88, hail: 0.72, downburst: 0.65, extreme_rain: 0.92 }).map(([hazard, prob]) => (
                <div key={hazard} className="p-2 rounded-lg bg-[#182030]/60 border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="capitalize text-gray-300 font-medium">{hazard.replace('_', ' ')}</span>
                    <span className="text-red-400 font-bold">{Math.round(prob * 100)}% Risk</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${prob * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSubTab === 'Environment' && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Surface CAPE</span>
                <span className="text-gray-200 font-mono font-bold">1,850 J/kg (Extreme)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Deep Layer Shear (0-6km)</span>
                <span className="text-gray-200 font-mono">22 m/s (Supercell favorable)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Downdraft CAPE (DCAPE)</span>
                <span className="text-gray-200 font-mono">780 J/kg (Downburst risk)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#182030]/60 border border-gray-800">
                <span className="text-gray-400">Freezing Level (0°C)</span>
                <span className="text-gray-200 font-mono">3,850 m MSL</span>
              </div>
            </div>
          )}

          {['Interactions', 'Impact'].includes(activeSubTab) && (
            <div className="text-xs text-gray-400 p-3 leading-relaxed">
              {activeSubTab === 'Interactions' ? (
                <>Storm interaction analysis detects severe inflow interaction with the <strong>Bernese Core Cell</strong>, indicating an elevated merger risk within 40–60 minutes over Central Switzerland.</>
              ) : (
                <>High impact exposure mapped to critical alpine infrastructure: <strong>Gotthard Highway/Tunnel</strong> (High vulnerability) and regional settlements in Uri and Lucerne basins.</>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Lifecycle Timeline */}
      <div className="h-[80px] bg-[#111622] rounded-xl border border-gray-800/60 p-3 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex flex-col gap-1 w-44">
          <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">Lifecycle Timeline</span>
          <span className="text-[11px] text-gray-400">Current: <strong className="text-blue-400">{p.lifecycle || 'Mature'}</strong></span>
        </div>

        {/* Timeline steps */}
        <div className="flex-1 max-w-xl flex items-center justify-between relative px-6">
          <div className="absolute left-6 right-6 h-1 bg-gray-800 rounded-full"></div>
          {['Initiating', 'Developing', 'Mature', 'Dissipating'].map((stage) => {
            const isCurrent = p.lifecycle === stage || (stage === 'Mature' && !p.lifecycle);
            const isPast = ['Initiating', 'Developing'].includes(stage) && p.lifecycle === 'Mature';
            return (
              <div key={stage} className="flex flex-col items-center gap-1 relative z-10">
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isCurrent ? 'bg-blue-500 border-white scale-125 shadow-[0_0_12px_#3b82f6]' :
                  isPast ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600'
                }`} />
                <span className={`text-[11px] font-medium ${isCurrent ? 'text-blue-300 font-bold' : 'text-gray-500'}`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-right text-[11px] text-gray-400 w-44">
          <div>Peak Intensity: <strong className="text-amber-400">{p.max_dbz?.toFixed(0)} dBZ</strong></div>
          <div>Duration: <strong className="text-gray-200">1h 45m active</strong></div>
        </div>
      </div>
    </div>
  );
}
