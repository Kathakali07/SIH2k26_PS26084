import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ChevronDown, Play, Pause, Plus, Minus, Layers, Satellite, Zap, Cloud, Target,
  Activity, Map as MapIcon, SkipBack, SkipForward, Radio, Sparkles, Clock
} from 'lucide-react';

export default function MainMap({
  geoData,
  onStormSelect,
  selectedStormId,
  isPlaying,
  setIsPlaying,
  frameIndex,
  setFrameIndex,
  totalFrames = 38,
  nowFrameIndex = 19,
  playbackSpeed = 400,
  setPlaybackSpeed,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const extraLayersRef = useRef([]);
  const hasFittedRef = useRef(false);
  const [activeLayers, setActiveLayers] = useState(['Storm Objects', 'Track & Forecast', 'Radar']);
  const [showLayers, setShowLayers] = useState(false);

  const toggleLayer = (layerName) => {
    setActiveLayers(prev =>
      prev.includes(layerName)
        ? prev.filter(l => l !== layerName)
        : [...prev, layerName]
    );
  };

  // Initialize map centered in Switzerland
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.82, 8.23], // Center of Switzerland
        zoom: 8,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: [[41.0, 1.0], [52.5, 16.0]],
        maxBoundsViscosity: 0.8,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        minZoom: 6,
        maxZoom: 19,
        noWrap: true,
        className: 'dark-tiles',
      }).addTo(map);

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

  // Render GeoJSON + radar heatmap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    // Clean previous layers
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }
    extraLayersRef.current.forEach(l => map.removeLayer(l));
    extraLayersRef.current = [];

    const severityColor = (sev) => {
      if (sev === 'HIGH') return { fill: '#ef4444', glow: 'rgba(239,68,68,0.65)' };
      if (sev === 'MODERATE') return { fill: '#f59e0b', glow: 'rgba(245,158,11,0.65)' };
      return { fill: '#3b82f6', glow: 'rgba(59,130,246,0.65)' };
    };

    const dbzToColor = (dbz) => {
      if (dbz >= 65) return 'rgba(168, 85, 247, 0.75)'; // Purple/magenta severe core
      if (dbz >= 55) return 'rgba(239, 68, 68, 0.7)';   // Red high dBZ
      if (dbz >= 45) return 'rgba(249, 115, 22, 0.6)';  // Orange
      if (dbz >= 35) return 'rgba(234, 179, 8, 0.5)';   // Yellow
      if (dbz >= 25) return 'rgba(34, 197, 94, 0.4)';   // Green
      if (dbz >= 15) return 'rgba(59, 130, 246, 0.3)';  // Blue
      return 'rgba(30, 64, 175, 0.15)';
    };

    const features = geoData.features || [];

    // ── Radar Heatmap Concentric Circles ──
    if (activeLayers.includes('Radar')) {
      features.forEach(feature => {
        const p = feature.properties;
        const coords = feature.geometry?.coordinates?.[0];
        if (!coords || coords.length < 3) return;

        const lats = coords.map(c => c[1]);
        const lngs = coords.map(c => c[0]);
        const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
        const rM = Math.max(span * 111 * 1000 / 2, 7000);
        const dbz = p.max_dbz || 50;

        [
          { r: rM * 2.4, d: dbz * 0.3, o: 0.14 },
          { r: rM * 1.9, d: dbz * 0.5, o: 0.22 },
          { r: rM * 1.4, d: dbz * 0.7, o: 0.32 },
          { r: rM * 0.9, d: dbz * 0.88, o: 0.48 },
          { r: rM * 0.45, d: dbz, o: 0.65 },
        ].forEach(ring => {
          const c = L.circle([cLat, cLng], {
            radius: ring.r,
            color: 'transparent',
            fillColor: dbzToColor(ring.d),
            fillOpacity: ring.o,
            interactive: false,
          }).addTo(map);
          extraLayersRef.current.push(c);
        });
      });
    }

    // ── Storm Polygon Outlines ──
    if (activeLayers.includes('Storm Objects')) {
      const layer = L.geoJSON(geoData, {
        style: (feature) => {
          const c = severityColor(feature.properties?.severity || 'LOW');
          const isSel = feature.properties?.id === selectedStormId;
          const isFore = feature.properties?.is_forecast;
          return {
            color: isFore ? '#c084fc' : c.fill,
            fillColor: isFore ? 'rgba(192, 132, 252, 0.08)' : 'transparent',
            weight: isSel ? 3.5 : 2,
            dashArray: isFore ? '5, 5' : (isSel ? null : '6, 4'),
            opacity: 0.85,
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => onStormSelect?.(feature.properties?.id));
        }
      }).addTo(map);
      geoLayerRef.current = layer;
    }

    // ── Trajectory, Uncertainty Cones & Storm Markers ──
    if (activeLayers.includes('Track & Forecast')) {
      features.forEach((feature, idx) => {
        const p = feature.properties;
        const coords = feature.geometry?.coordinates?.[0];
        if (!coords || coords.length < 3) return;

        const lats = coords.map(c => c[1]);
        const lngs = coords.map(c => c[0]);
        const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const center = L.latLng(cLat, cLng);
        const sc = severityColor(p.severity || 'LOW');
        const num = p.id?.replace('storm_', '').replace(/^0+/, '') || (idx + 1);

        // Glowing Marker with Storm Number
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:30px;height:30px;border-radius:50%;
            background:${sc.fill};border:2.5px solid #fff;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:800;color:#fff;
            box-shadow:0 0 16px ${sc.glow}, 0 0 28px ${sc.glow};
            cursor:pointer;font-family:Inter,system-ui,sans-serif;
          ">${num}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker(center, { icon, zIndexOffset: 1000 }).addTo(map);
        marker.on('click', () => onStormSelect?.(p.id));
        marker.bindTooltip(
          `<div style="font-family:Inter,sans-serif;min-width:170px">
            <div style="font-weight:700;color:#fff;font-size:13px">${p.name || p.id}</div>
            <div style="color:#9ca3af;font-size:11px;margin-bottom:4px">${p.hazard_type || 'Storm'} &bull; ${p.lifecycle || ''}</div>
            <div style="color:${sc.fill};font-weight:700;font-size:12px">${p.severity} &bull; ${p.max_dbz?.toFixed(1)} dBZ</div>
            <div style="color:#cbd5e1;font-size:11px;margin-top:2px">Speed: ${p.motion?.speed_kmh?.toFixed(0) || '?'} km/h &bull; ${p.area_km2?.toFixed(0) || '?'} km²</div>
            ${p.nearest_target ? `<div style="color:#38bdf8;font-size:10px;margin-top:3px;font-weight:600">Target: ${p.nearest_target} (ETA ~${p.eta_minutes || 30}m)</div>` : ''}
            ${p.is_forecast ? `<div style="color:#c084fc;font-size:10px;margin-top:2px;font-style:italic">DGMR Neural AI Forecast</div>` : ''}
          </div>`,
          { className: 'custom-tooltip', direction: 'right', offset: [18, 0] }
        );
        extraLayersRef.current.push(marker);

        // Trajectory and Forecast Cone
        if (p.motion && p.motion.speed_kmh > 0) {
          const h = 1.5; // 1.5 hour projection
          let dLat, dLng;
          if (p.motion.north_kmh !== undefined && p.motion.east_kmh !== undefined) {
            dLat = (p.motion.north_kmh * h) / 111;
            dLng = (p.motion.east_kmh * h) / (111 * Math.cos(cLat * Math.PI / 180));
          } else {
            const dr = (90 - (p.motion.direction_degrees || 45)) * Math.PI / 180;
            const d = p.motion.speed_kmh * h;
            dLat = (d * Math.sin(dr)) / 111;
            dLng = (d * Math.cos(dr)) / (111 * Math.cos(cLat * Math.PI / 180));
          }
          const target = [cLat + dLat, cLng + dLng];

          // Uncertainty Fan / Cone
          const fanS = 0.18 * (p.is_forecast ? 1.4 : 1.0);
          const fan = L.polygon([
            center,
            [target[0] + fanS * 0.7, target[1] + fanS],
            [target[0] - fanS * 0.7, target[1] - fanS * 0.5]
          ], {
            color: p.is_forecast ? '#c084fc' : sc.fill,
            fillColor: p.is_forecast ? '#c084fc' : sc.fill,
            fillOpacity: 0.12,
            weight: 1,
            dashArray: '4, 4',
            interactive: false,
          }).addTo(map);
          extraLayersRef.current.push(fan);

          // Centerline dashed trajectory
          const traj = L.polyline([center, target], {
            color: '#ffffff',
            weight: 2,
            dashArray: '6, 6',
            opacity: 0.75,
            interactive: false,
          }).addTo(map);
          extraLayersRef.current.push(traj);

          // Target marker
          const end = L.circleMarker(target, {
            radius: 5,
            fillColor: p.is_forecast ? '#c084fc' : sc.fill,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.95,
            interactive: false,
          }).addTo(map);
          extraLayersRef.current.push(end);
        }
      });
    }

    // Auto-fit once to Switzerland bounds
    if (!hasFittedRef.current && features.length > 0) {
      const allCoords = [];
      features.forEach(f => (f.geometry?.coordinates?.[0] || []).forEach(c => allCoords.push([c[1], c[0]])));
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60], maxZoom: 9 });
        hasFittedRef.current = true;
      }
    }

    return () => {
      if (geoLayerRef.current) {
        map.removeLayer(geoLayerRef.current);
        geoLayerRef.current = null;
      }
      extraLayersRef.current.forEach(l => map.removeLayer(l));
      extraLayersRef.current = [];
    };
  }, [geoData, selectedStormId, activeLayers]);

  const layers = [
    { name: 'Radar', icon: <Activity size={14} /> },
    { name: 'Satellite (IR)', icon: <Satellite size={14} /> },
    { name: 'Lightning', icon: <Zap size={14} /> },
    { name: 'NWP (CAPE)', icon: <Cloud size={14} /> },
    { name: 'Storm Objects', icon: <Target size={14} /> },
    { name: 'Track & Forecast', icon: <MapIcon size={14} /> },
    { name: 'Impact Layer', icon: <Layers size={14} /> },
  ];

  const isNow = frameIndex === nowFrameIndex;
  const isForecast = frameIndex > nowFrameIndex;
  const offsetMin = (frameIndex - nowFrameIndex) * 5;

  const timeLabel = isNow
    ? 'NOW'
    : isForecast
    ? `+${offsetMin}m`
    : `${offsetMin}m`;

  const timeProgress = totalFrames > 1 ? (frameIndex / (totalFrames - 1)) * 100 : 0;
  const nowPercent = totalFrames > 1 ? (nowFrameIndex / (totalFrames - 1)) * 100 : 50;

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />

      {/* Top Map Toolbar: Full-width wrapper with pointer-events-none so left & right never block each other */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none gap-2">
        {/* Top Left Controls */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0 flex-wrap">
          <div className="flex items-center gap-2 bg-[#111622]/90 backdrop-blur border border-blue-500/40 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Switzerland (MeteoSwiss / DGMR AI)</span>
            <span className="sm:hidden">Switzerland</span>
          </div>

          {isForecast ? (
            <div className="flex items-center gap-1.5 bg-purple-900/60 backdrop-blur border border-purple-500/50 text-purple-300 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg animate-pulse">
              <Sparkles size={13} className="text-purple-400" />
              <span>DGMR (+{offsetMin}m)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-blue-900/40 backdrop-blur border border-blue-500/40 text-blue-300 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg">
              <Radio size={13} className="text-blue-400" />
              <span>{isNow ? 'Doppler (Live)' : `Doppler (${offsetMin}m)`}</span>
            </div>
          )}

          {/* Collapsible Layer Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border shadow-lg transition-all ${
                showLayers
                  ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/20'
                  : 'bg-[#111622]/90 backdrop-blur text-gray-300 border-gray-700/60 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Layers size={13} />
              <span>Layers ({activeLayers.length})</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${showLayers ? 'rotate-180' : ''}`} />
            </button>

            {showLayers && (
              <div className="absolute top-full left-0 mt-1.5 bg-[#111622]/95 backdrop-blur-md border border-gray-700/70 rounded-xl p-2 w-[180px] shadow-2xl z-50 animate-in fade-in duration-150">
                <div className="text-[10px] text-gray-400 font-semibold px-2 py-1 uppercase tracking-wider">Map Layers</div>
                <div className="flex flex-col gap-1">
                  {layers.map((layer, idx) => {
                    const isActive = activeLayers.includes(layer.name);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleLayer(layer.name)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-all ${
                          isActive ? 'text-blue-400 bg-[#1e293b]' : 'text-gray-400 hover:bg-[#1e293b]/50 hover:text-white'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                            isActive ? 'bg-blue-500 text-white' : 'text-gray-500 border border-gray-600'
                          }`}
                        >
                          {isActive && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        {layer.icon}
                        {layer.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Right Controls: Complete Timeline Player */}
        <div className="flex items-center gap-2 pointer-events-auto shrink min-w-0 max-w-[440px]">
          <div className="flex items-center gap-2 bg-[#111622]/95 backdrop-blur border border-gray-700/60 px-3 py-1.5 rounded-xl text-xs shadow-2xl w-full">

          {/* NOW Button */}
          <button
            onClick={() => setFrameIndex(nowFrameIndex)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 border ${
              isNow
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-[#182030] text-gray-400 border-gray-700 hover:text-white hover:bg-gray-800'
            }`}
            title="Jump to current observation time (T+0 NOW)"
          >
            <Clock size={12} className={isNow ? 'animate-spin' : ''} />
            NOW
          </button>

          {/* Current Frame Status Badge */}
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 min-w-[58px] text-center ${
              isNow
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isForecast
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
            }`}
          >
            {timeLabel}
          </span>

          {/* Step Back */}
          <button
            onClick={() => setFrameIndex(Math.max(0, frameIndex - 1))}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 hover:bg-gray-800 rounded-lg"
            title="Step Back 5 min"
          >
            <SkipBack size={13} />
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shrink-0 shadow-lg ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-400 shadow-red-500/40'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40'
            }`}
            title={isPlaying ? 'Pause Animation' : 'Play 38-Frame Radar Loop'}
          >
            {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
          </button>

          {/* Step Forward */}
          <button
            onClick={() => setFrameIndex(Math.min(totalFrames - 1, frameIndex + 1))}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 hover:bg-gray-800 rounded-lg"
            title="Step Forward 5 min"
          >
            <SkipForward size={13} />
          </button>

          {/* Dual-Zone Clickable Timeline Slider */}
          <div
            className="flex-1 h-3 bg-gray-800/90 rounded-full relative mx-1 cursor-pointer group border border-gray-700/50"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setFrameIndex(Math.max(0, Math.min(totalFrames - 1, Math.round(pct * (totalFrames - 1)))));
            }}
          >
            {/* Zone background: Past vs Future gradient */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-900/30 rounded-l-full"
              style={{ width: `${nowPercent}%` }}
              title="Observed Radar History (-95m to T+0)"
            />
            <div
              className="absolute right-0 top-0 bottom-0 bg-purple-900/30 rounded-r-full"
              style={{ width: `${100 - nowPercent}%` }}
              title="DGMR AI Forecast Nowcast (+5m to +90m)"
            />

            {/* Active filled progress track */}
            <div
              className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-200 ${
                isForecast
                  ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
                  : 'bg-gradient-to-r from-blue-600 to-blue-400'
              }`}
              style={{ width: `${timeProgress}%` }}
            />

            {/* NOW Marker line (at frame 19) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-400 -translate-x-1/2 z-10 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              style={{ left: `${nowPercent}%` }}
              title="T+0 NOW"
            />

            {/* Slider Handle / Thumb */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-xl group-hover:scale-125 transition-transform duration-100 z-20 ${
                isNow
                  ? 'bg-emerald-400 ring-2 ring-emerald-500'
                  : isForecast
                  ? 'bg-purple-500 ring-2 ring-purple-400'
                  : 'bg-blue-400 ring-2 ring-blue-500'
              }`}
              style={{ left: `${timeProgress}%` }}
            />
          </div>

          <span className="text-gray-400 shrink-0 text-[11px] font-mono w-[65px] text-right">
            {frameIndex + 1}/{totalFrames} ({isForecast ? 'AI' : 'OBS'})
          </span>
        </div>
      </div>
    </div>


      {/* Zoom Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-[400] flex flex-col gap-1 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-1 shadow-lg">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <div className="h-[1px] w-full bg-gray-700" />
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Reflectivity (dBZ) Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-3 shadow-xl">
        <div className="text-xs text-gray-300 mb-2 font-medium flex justify-between">
          <span>Reflectivity (dBZ)</span>
          <span className="text-[10px] text-gray-400">{isForecast ? 'DGMR Predicted' : 'Doppler Observed'}</span>
        </div>
        <div className="flex gap-0.5 mb-1">
          <div className="flex-1 h-3 rounded-l bg-blue-900" />
          <div className="flex-1 h-3 bg-blue-600" />
          <div className="flex-1 h-3 bg-green-500" />
          <div className="flex-1 h-3 bg-yellow-400" />
          <div className="flex-1 h-3 bg-orange-500" />
          <div className="flex-1 h-3 bg-red-600" />
          <div className="flex-1 h-3 rounded-r bg-purple-600" />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-medium w-[220px]">
          <span>0</span><span>15</span><span>25</span><span>35</span><span>45</span><span>55</span><span>65+</span>
        </div>
      </div>
    </div>
  );
}
