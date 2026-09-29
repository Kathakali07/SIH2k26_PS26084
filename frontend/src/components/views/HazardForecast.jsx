import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceDot } from 'recharts';
import { Zap, CloudHail, Wind, CloudRain, ShieldAlert, Clock, MapPin, Plus, Minus } from 'lucide-react';

export default function HazardForecast({ storms = [], setActiveTab }) {
  const [activeHazard, setActiveHazard] = useState('Extreme Rain');
  const [activeTime, setActiveTime] = useState('+3h');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hazardLayerRef = useRef(null);

  const timeStepMap = {
    'Now': 0,
    '+1h': 1,
    '+2h': 2,
    '+3h': 3,
    '+4h': 4,
    '+5h': 5,
    '+6h': 6,
    'Next 6 Hours': 'all',
  };
  const step = timeStepMap[activeTime] ?? 3;
  const isCumulative = step === 'all';
  const numericStep = typeof step === 'number' ? step : 3;

  const hazardConfigs = {
    'Lightning': {
      icon: <Zap size={18} className="text-amber-400" />,
      color: 'amber',
      probText: `${Math.max(15, Math.round(85 - numericStep * 11))}% Strike Threat (${Math.max(8, Math.round(52 - numericStep * 7.5))} fl/min)`,
      severity: numericStep <= 2 ? 'HIGH' : numericStep <= 4 ? 'MODERATE' : 'LOW',
      badgeClass: numericStep <= 2 ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      base: 75,
      unit: 'flashes/min',
      metric1: `Current Flash Rate: ${Math.max(8, Math.round(52 - numericStep * 7.5))} fl/min`,
      metric2: `Lightning Risk Zone: ${numericStep === 0 ? 'Uri / Gotthard Pass' : numericStep === 1 ? 'Lake Lucerne & Schwyz' : numericStep === 2 ? 'Zug & Zurich South' : numericStep === 3 ? 'Zurich Basin & Runway Approaches' : numericStep === 4 ? 'Winterthur Corridor' : 'Lake Constance Basin'}`,
      metric4: `Atmospheric CAPE: ${Math.max(400, Math.round(1850 - numericStep * 240))} J/kg`,
    },
    'Hail': {
      icon: <CloudHail size={18} className="text-cyan-400" />,
      color: 'cyan',
      probText: `${Math.max(10, Math.round(75 - numericStep * 11))}% Severe Hail Risk (${Math.max(0.5, (3.5 - numericStep * 0.45)).toFixed(1)} cm)`,
      severity: numericStep <= 1 ? 'HIGH' : numericStep <= 3 ? 'MODERATE' : 'LOW',
      badgeClass: numericStep <= 1 ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      base: 65,
      unit: '% Probability',
      metric1: `Max Hail Nucleus: ${Math.max(0.5, (3.5 - numericStep * 0.45)).toFixed(1)} cm diameter`,
      metric2: `Hail Swath Position: ${numericStep === 0 ? 'Gotthard Ridge' : numericStep === 1 ? 'Lake Lucerne Perimeter' : numericStep === 2 ? 'Zug & Zurich Oberland' : numericStep === 3 ? 'Greater Zurich Region' : 'Winterthur & Eastward'}`,
      metric4: `Freezing Level: ${Math.max(3200, Math.round(3850 - numericStep * 90))} m MSL`,
    },
    'Downburst': {
      icon: <Wind size={18} className="text-blue-400" />,
      color: 'blue',
      probText: `${Math.max(15, Math.round(65 - numericStep * 8))}% Wind Shear Risk (Gusts: ${Math.max(55, Math.round(98 - numericStep * 5.5))} km/h)`,
      severity: numericStep <= 2 ? 'HIGH' : 'MODERATE',
      badgeClass: numericStep <= 2 ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      base: 55,
      unit: 'km/h Gusts',
      metric1: `Peak Gust Potential: ${Math.max(55, Math.round(98 - numericStep * 5.5))} km/h`,
      metric2: `Shear Location: ${numericStep <= 1 ? 'Alpine Valley Inflow Channels' : numericStep <= 3 ? 'Zurich Airport (ZRH) Crosswinds' : 'Lowland Plateau Gust Front'}`,
      metric4: `DCAPE Energy: ${Math.max(300, Math.round(780 - numericStep * 75))} J/kg`,
    },
    'Extreme Rain': {
      icon: <CloudRain size={18} className="text-emerald-400" />,
      color: 'emerald',
      probText: isCumulative
        ? 'Cumulative 6-Hour Precipitation Swath (>50–90 mm)'
        : `${Math.max(20, Math.round(92 - numericStep * 11))}% Cloudburst Flood Risk (${Math.max(18, Math.round(65 - numericStep * 6.8))} mm/h)`,
      severity: numericStep <= 2 ? 'HIGH' : numericStep <= 4 ? 'MODERATE' : 'LOW',
      badgeClass: numericStep <= 2 ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      base: 82,
      unit: 'mm/h Rain Rate',
      metric1: `Active Rain Rate: ${isCumulative ? 'Max 65 mm/h (Peak)' : `${Math.max(18, Math.round(65 - numericStep * 6.8))} mm/h`}`,
      metric2: `Active Inundation Basin: ${isCumulative ? 'Reuss, Aare & Limmat Corridors' : numericStep === 0 ? 'Reuss Catchment (Gotthard)' : numericStep === 1 ? 'Lake Lucerne & Schwyz Catchment' : numericStep === 2 ? 'Zug & Sihltal Basin' : numericStep === 3 ? 'Limmat & Glatt Basin (Zurich Metro)' : numericStep === 4 ? 'Winterthur Catchment' : 'Thur & St. Gallen Basin'}`,
      metric4: `Precipitable Water: ${Math.max(24, Math.round(42 - numericStep * 2.8))} mm`,
    },
  };

  const cfg = hazardConfigs[activeHazard] || hazardConfigs['Extreme Rain'];

  const chartData = [
    { time: 'Now', prob: cfg.base, stepNum: 0 },
    { time: '+1h', prob: Math.min(95, Math.round(cfg.base * 1.08)), stepNum: 1 },
    { time: '+2h', prob: Math.min(98, Math.round(cfg.base * 1.15)), stepNum: 2 },
    { time: '+3h', prob: Math.round(cfg.base * 1.05), stepNum: 3 },
    { time: '+4h', prob: Math.round(cfg.base * 0.88), stepNum: 4 },
    { time: '+5h', prob: Math.round(cfg.base * 0.65), stepNum: 5 },
    { time: '+6h', prob: Math.round(cfg.base * 0.40), stepNum: 6 },
  ];

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.90, 8.45], // Switzerland center
        zoom: 8,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        className: 'dark-tiles',
      }).addTo(map);

      hazardLayerRef.current = L.layerGroup().addTo(map);
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

  // Update Hazard Layers on map dynamically when activeHazard or activeTime changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = hazardLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // ── 1. Calculate dynamic storm positions at time step ──
    const stormsAtTime = [];

    if (isCumulative) {
      // Show full trajectories across Switzerland for all 4 storms
      const track1 = [
        [46.75, 8.60], [46.91, 8.82], [47.07, 9.04], [47.23, 9.26],
        [47.39, 9.48], [47.55, 9.70], [47.71, 9.92]
      ];
      L.polyline(track1, { color: '#ef4444', weight: 3, dashArray: '6 4' })
        .bindTooltip('<b>Alpine Supercell 6-Hour Swath</b>', { className: 'custom-tooltip' })
        .addTo(group);

      const track2 = [
        [46.70, 7.72], [46.84, 7.90], [46.98, 8.08], [47.12, 8.26],
        [47.26, 8.44], [47.40, 8.62], [47.54, 8.80]
      ];
      L.polyline(track2, { color: '#f59e0b', weight: 2.5, dashArray: '5 5' })
        .bindTooltip('<b>Bernese Core 6-Hour Swath</b>', { className: 'custom-tooltip' })
        .addTo(group);

      // Current positions
      stormsAtTime.push(
        { name: 'Alpine Supercell (74 dBZ - Origin)', lat: 46.75, lon: 8.60, color: '#ef4444' },
        { name: 'Bernese Core (68 dBZ - Origin)', lat: 46.70, lon: 7.72, color: '#f59e0b' },
        { name: 'Jura Cluster (61 dBZ)', lat: 47.30, lon: 7.25, color: '#eab308' },
        { name: 'Ticino Feeder (61 dBZ)', lat: 46.22, lon: 8.90, color: '#3b82f6' }
      );
    } else {
      // Step 0..6: Calculate exact position along the forward propagation vector
      const alpLat = 46.75 + numericStep * 0.16;
      const alpLon = 8.60 + numericStep * 0.22;
      const alpDbz = Math.max(38, Math.round(74 - numericStep * 5.2));
      stormsAtTime.push({
        name: `Alpine Supercell (${alpDbz} dBZ @ ${activeTime})`,
        lat: alpLat,
        lon: alpLon,
        color: alpDbz >= 65 ? '#ef4444' : alpDbz >= 50 ? '#f59e0b' : '#eab308'
      });

      const berLat = 46.70 + numericStep * 0.14;
      const berLon = 7.72 + numericStep * 0.18;
      const berDbz = Math.max(35, Math.round(68 - numericStep * 4.8));
      stormsAtTime.push({
        name: `Bernese Core (${berDbz} dBZ @ ${activeTime})`,
        lat: berLat,
        lon: berLon,
        color: berDbz >= 60 ? '#f59e0b' : '#3b82f6'
      });

      const jurLat = 47.30 + numericStep * 0.11;
      const jurLon = 7.25 + numericStep * 0.19;
      const jurDbz = Math.max(32, Math.round(61 - numericStep * 4.2));
      stormsAtTime.push({
        name: `Jura Cluster (${jurDbz} dBZ @ ${activeTime})`,
        lat: jurLat,
        lon: jurLon,
        color: '#eab308'
      });

      if (numericStep <= 2) {
        const ticLat = 46.22 + numericStep * 0.20;
        const ticLon = 8.90 - numericStep * 0.08;
        const ticDbz = Math.max(45, Math.round(61 - numericStep * 5.5));
        stormsAtTime.push({
          name: `Ticino Feeder (${ticDbz} dBZ @ ${activeTime})`,
          lat: ticLat,
          lon: ticLon,
          color: '#3b82f6'
        });
      }
    }

    // Render Storm Markers
    stormsAtTime.forEach(s => {
      L.circleMarker([s.lat, s.lon], {
        radius: 8,
        color: '#ffffff',
        fillColor: s.color,
        fillOpacity: 1,
        weight: 2,
      })
      .bindTooltip(`<b>${s.name}</b>`, { permanent: true, direction: 'top', className: 'custom-tooltip', offset: [0, -10] })
      .addTo(group);
    });

    // ── 2. DYNAMIC HAZARD OVERLAYS ──
    const alpCurrentLat = 46.75 + (isCumulative ? 2 : numericStep) * 0.16;
    const alpCurrentLon = 8.60 + (isCumulative ? 2 : numericStep) * 0.22;
    const berCurrentLat = 46.70 + (isCumulative ? 2 : numericStep) * 0.14;
    const berCurrentLon = 7.72 + (isCumulative ? 2 : numericStep) * 0.18;

    if (activeHazard === 'Extreme Rain') {
      if (isCumulative) {
        // Full 6-hour continuous inundation corridor
        const fullSwath = [
          [46.40, 8.10], [46.65, 8.40], [47.05, 8.35], [47.38, 8.42],
          [47.60, 8.70], [47.75, 9.30], [47.50, 9.45], [47.10, 9.00],
          [46.65, 8.85], [46.35, 8.45]
        ];
        L.polygon(fullSwath, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.28,
          weight: 2,
        }).bindTooltip('<b>Cumulative 6-Hour Precipitation Swath (&gt;50–90 mm)</b><br>Central Alpine Corridor', { className: 'custom-tooltip' }).addTo(group);
      } else {
        // Dynamic shifting catchment polygons centered on moving storm cores
        const currentRainRate = Math.max(18, Math.round(65 - numericStep * 6.8));
        
        // Primary Catchment (Alpine Supercell core)
        const poly1 = [
          [alpCurrentLat - 0.18, alpCurrentLon - 0.15],
          [alpCurrentLat + 0.18, alpCurrentLon - 0.08],
          [alpCurrentLat + 0.15, alpCurrentLon + 0.18],
          [alpCurrentLat - 0.15, alpCurrentLon + 0.14],
        ];
        L.polygon(poly1, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.38,
          weight: 2.5,
        }).bindTooltip(`<b>Extreme Rain Core: ${currentRainRate} mm/h</b><br>Lead Time: ${activeTime}`, { permanent: true, className: 'custom-tooltip' }).addTo(group);

        // Secondary Catchment (Bernese Core)
        const poly2 = [
          [berCurrentLat - 0.14, berCurrentLon - 0.12],
          [berCurrentLat + 0.14, berCurrentLon - 0.06],
          [berCurrentLat + 0.12, berCurrentLon + 0.14],
          [berCurrentLat - 0.12, berCurrentLon + 0.10],
        ];
        L.polygon(poly2, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.25,
          weight: 1.5,
        }).bindTooltip(`<b>Secondary Runoff: ${Math.round(currentRainRate * 0.8)} mm/h</b><br>Lead Time: ${activeTime}`, { className: 'custom-tooltip' }).addTo(group);
      }

    } else if (activeHazard === 'Hail') {
      if (isCumulative) {
        // Full 6-hour severe hail corridor
        const hailSwath = [
          [46.45, 8.20], [46.60, 8.55], [47.05, 8.35], [47.35, 8.55],
          [47.55, 8.85], [47.45, 9.15], [47.00, 8.90], [46.45, 8.45]
        ];
        L.polygon(hailSwath, {
          color: '#06b6d4',
          fillColor: '#06b6d4',
          fillOpacity: 0.30,
          weight: 2,
        }).bindTooltip('<b>Cumulative 6-Hour Severe Hail Swath (&gt;2–3.5cm)</b>', { className: 'custom-tooltip' }).addTo(group);
      } else {
        const hailSize = Math.max(0.5, (3.5 - numericStep * 0.45)).toFixed(1);
        
        // Dynamic hail footprint moving with the storm
        L.circle([alpCurrentLat, alpCurrentLon], {
          radius: Math.max(10000, 24000 - numericStep * 2000),
          color: '#06b6d4',
          fillColor: '#06b6d4',
          fillOpacity: 0.35,
          weight: 2,
        }).bindTooltip(`<b>Hail Threat Envelope (${hailSize} cm)</b><br>Lead Time: ${activeTime}`, { className: 'custom-tooltip' }).addTo(group);

        // Core Nucleus
        L.circle([alpCurrentLat, alpCurrentLon], {
          radius: Math.max(4000, 11000 - numericStep * 1200),
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.55,
          weight: 2,
        }).bindTooltip(`<b>Large Hail Nucleus: ${hailSize} cm</b><br>Lead Time: ${activeTime}`, { permanent: true, className: 'custom-tooltip' }).addTo(group);
      }

    } else if (activeHazard === 'Lightning') {
      const flashRate = isCumulative ? 52 : Math.max(8, Math.round(52 - numericStep * 7.5));
      const radius = isCumulative ? 45000 : Math.max(16000, 35000 - numericStep * 3000);

      L.circle([alpCurrentLat, alpCurrentLon], {
        radius: radius,
        color: '#eab308',
        fillColor: '#eab308',
        fillOpacity: 0.32,
        weight: 1.8,
        dashArray: '5 5',
      }).bindTooltip(`<b>Flash Density Core (${flashRate} fl/min)</b><br>Lead Time: ${activeTime}`, { permanent: true, className: 'custom-tooltip' }).addTo(group);

      if (!isCumulative) {
        L.circle([berCurrentLat, berCurrentLon], {
          radius: radius * 0.8,
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.22,
          weight: 1.5,
          dashArray: '5 5',
        }).bindTooltip(`<b>Secondary Lightning Core (${Math.round(flashRate * 0.65)} fl/min)</b>`, { className: 'custom-tooltip' }).addTo(group);
      }

    } else if (activeHazard === 'Downburst') {
      const gustKmh = isCumulative ? 98 : Math.max(55, Math.round(98 - numericStep * 5.5));
      
      // Wind microburst radius tracking with the supercell
      L.circle([alpCurrentLat, alpCurrentLon], {
        radius: Math.max(12000, 26000 - numericStep * 1800),
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.30,
        weight: 2,
        dashArray: '4 4',
      }).bindTooltip(`<b>Peak Downburst Gust: ${gustKmh} km/h</b><br>Lead Time: ${activeTime}`, { permanent: true, className: 'custom-tooltip' }).addTo(group);

      // Airport proximity alert if approaching Zurich Airport
      if (numericStep === 3 || isCumulative) {
        L.circleMarker([47.45, 8.56], {
          radius: 8,
          color: '#ffffff',
          fillColor: '#ef4444',
          fillOpacity: 1,
          weight: 2,
        }).bindTooltip('<b>Zurich Airport (ZRH) Runway Wind Shear Warning!</b><br>Gust potential: 85-98 km/h', { permanent: true, className: 'custom-tooltip' }).addTo(group);
      }
    }

  }, [activeHazard, activeTime, step, isCumulative, numericStep]);

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0 select-none">
      {/* Top Hazard Tabs */}
      <div className="flex items-center justify-between bg-[#111622] p-2.5 rounded-xl border border-gray-800/60 shrink-0 shadow-lg">
        <div className="flex items-center gap-2">
          {Object.keys(hazardConfigs).map((hz) => (
            <button
              key={hz}
              onClick={() => setActiveHazard(hz)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeHazard === hz
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#182030]/60 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700/50'
              }`}
            >
              {hazardConfigs[hz].icon}
              {hz}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
          <Clock size={13} className="text-blue-400" />
          <span>Valid: <strong>29 Sep 2026, 20:45–02:45 UTC (Switzerland)</strong></span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Regional Swiss Hazard Map (REAL LEAFLET MAP) */}
        <div className="flex-[2.6] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col shadow-lg">
          {/* Leaflet map container */}
          <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />

          {/* Time Selector: Now, +1h, +2h, +3h, +4h, +5h, +6h, Next 6 Hours */}
          <div className="absolute top-4 left-4 z-[400] flex bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-lg overflow-hidden text-xs shadow-xl">
            {['Next 6 Hours', 'Now', '+1h', '+2h', '+3h', '+4h', '+5h', '+6h'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTime(t)}
                className={`px-3 py-1.5 transition-colors border-r border-gray-800 last:border-0 cursor-pointer ${
                  activeTime === t ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                {t}
              </button>
            ))}
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

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-lg p-2.5 shadow-xl">
            <div className="text-[10px] text-gray-300 mb-1 font-medium">{activeHazard} Risk ({activeTime})</div>
            <div className="w-44 h-2.5 rounded bg-gradient-to-r from-blue-900 via-green-500 via-yellow-400 via-red-600 to-purple-600 mb-1" />
            <div className="flex justify-between text-[9px] text-gray-400 font-mono">
              <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
            </div>
          </div>
        </div>

        {/* Right Hazard Metrics & Forecast Panel */}
        <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wide flex items-center gap-1.5">
                {cfg.icon} {activeHazard} ({activeTime})
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.badgeClass}`}>
                {cfg.severity} RISK
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#182030]/60 border border-gray-800 mb-3">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Lead-Time Projection: {activeTime}</span>
              <span className="text-sm font-bold text-white block mt-0.5 leading-snug">{cfg.probText}</span>
            </div>

            {/* Probability Trend Chart */}
            <div className="mb-3">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Probability Curve Over 6h Horizon</span>
              <div className="h-28 w-full bg-[#0a0d14] rounded-lg border border-gray-800/80 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 50, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#070b14', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                      formatter={(val) => [`${val}%`, 'Hazard Risk']}
                    />
                    <Area type="monotone" dataKey="prob" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.2} />
                    {!isCumulative && (
                      <ReferenceDot
                        x={activeTime}
                        y={chartData.find(d => d.time === activeTime)?.prob || 75}
                        r={4.5}
                        fill="#38bdf8"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Meteorological Indicators */}
          <div className="flex flex-col gap-1.5 text-xs border-t border-gray-800 pt-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Forecast Indicators ({activeTime})</span>
            <div className="flex justify-between py-1 border-b border-gray-800/50 text-gray-300">
              <span className="text-gray-400">{cfg.metric1.split(':')[0]}</span>
              <strong className="text-white">{cfg.metric1.split(':')[1]}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/50 text-gray-300">
              <span className="text-gray-400">{cfg.metric2.split(':')[0]}</span>
              <strong className="text-white truncate max-w-[170px] text-right">{cfg.metric2.split(':')[1]}</strong>
            </div>
            <div className="flex justify-between py-1 text-gray-300">
              <span className="text-gray-400">{cfg.metric4.split(':')[0]}</span>
              <strong className="text-blue-400">{cfg.metric4.split(':')[1]}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
