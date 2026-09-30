import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Play, Pause, Sparkles, Clock, Compass, Layers, Plus, Minus } from 'lucide-react';

export default function MultipleFutures({ storms = [], setActiveTab, selectedStormId }) {
  const currentStorm = storms.map(s => s.properties).find(s => s.id === selectedStormId) || storms[0]?.properties || {
    name: 'Alpine Supercell',
    max_dbz: 74,
    motion: { speed_kmh: 38 },
    nearest_target: 'Zurich Airport & Gotthard'
  };

  const [activeSnapshot, setActiveSnapshot] = useState(2); // +45 min
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const histogramData = [
    { time: '25m', count: 8 },
    { time: '30m', count: 22 },
    { time: '35m', count: 54 },
    { time: '40m', count: 96 },
    { time: '42m', count: 120 },
    { time: '45m', count: 88 },
    { time: '50m', count: 48 },
    { time: '55m', count: 24 },
    { time: '60m', count: 10 },
  ];

  const snapshots = [
    { label: '+15 min', time: '22:35 UTC', dbz: '74 dBZ', status: 'Peak Core' },
    { label: '+30 min', time: '22:50 UTC', dbz: '73 dBZ', status: 'Hail Corridor' },
    { label: '+45 min', time: '23:05 UTC', dbz: '71 dBZ', status: 'Lake Lucerne Basin' },
    { label: '+60 min', time: '23:20 UTC', dbz: '68 dBZ', status: 'Zurich Approach' },
    { label: '+75 min', time: '23:35 UTC', dbz: '64 dBZ', status: 'Precipitation Peak' },
    { label: '+90 min', time: '23:50 UTC', dbz: '58 dBZ', status: 'Dissipation Phase' },
  ];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [47.10, 8.55], // Central Switzerland
        zoom: 9,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: [[41.0, 1.0], [52.5, 16.0]],
        maxBoundsViscosity: 0.8,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 6,
        maxZoom: 18,
        noWrap: true,
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

  // Plot 16 Stochastic Ensemble Members on Swiss Terrain
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const origin = [46.75, 8.60]; // Gotthard / Uri
    const target = [47.45, 8.56]; // Zurich Airport

    // 80% Confidence Envelope Polygon
    const plumePolygon = [
      origin,
      [46.90, 8.40],
      [47.15, 8.35],
      [47.48, 8.42],
      [47.52, 8.70],
      [47.25, 8.80],
      [47.00, 8.85],
      origin,
    ];

    L.polygon(plumePolygon, {
      color: 'rgba(168, 85, 247, 0.45)',
      fillColor: 'rgba(168, 85, 247, 0.16)',
      weight: 1.5,
    }).bindTooltip('<b>80% Confidence Dispersion Envelope</b>', { className: 'custom-tooltip' }).addTo(group);

    // 16 Stochastic Ensemble Realizations
    const spreads = [
      [-0.14, 0.02], [-0.11, 0.04], [-0.09, 0.01], [-0.07, 0.05],
      [-0.05, 0.03], [-0.03, -0.01], [-0.01, 0.02], [0.00, 0.00],
      [0.02, -0.02], [0.04, 0.01], [0.06, -0.03], [0.08, 0.02],
      [0.10, -0.01], [0.12, -0.04], [0.15, 0.00], [0.18, -0.02]
    ];

    spreads.forEach(([dLng, dLat], idx) => {
      const midLat = (origin[0] + target[0]) / 2 + dLat * 0.5;
      const midLng = (origin[1] + target[1]) / 2 + dLng * 0.6;
      const endLat = target[0] + dLat;
      const endLng = target[1] + dLng;

      L.polyline([origin, [midLat, midLng], [endLat, endLng]], {
        color: idx % 2 === 0 ? 'rgba(192, 132, 252, 0.7)' : 'rgba(168, 85, 247, 0.5)',
        weight: 1.6,
      }).addTo(group);
    });

    // Deterministic Centerline Track (Median)
    L.polyline([origin, [47.10, 8.58], target], {
      color: '#ffffff',
      weight: 2.8,
      dashArray: '5 4',
    }).bindTooltip('<b>Deterministic Mean Track</b> (Median)', { className: 'custom-tooltip' }).addTo(group);

    // Origin Marker (Gotthard)
    L.circleMarker(origin, {
      radius: 8,
      color: '#ffffff',
      fillColor: '#ef4444',
      fillOpacity: 1,
      weight: 2,
    })
      .bindTooltip('<b>Storm Origin: Gotthard Pass</b><br>T+0 Current Position', {
        permanent: true,
        direction: 'left',
        className: 'custom-tooltip',
        offset: [-10, 0],
      })
      .addTo(group);

    // Target Marker (Zurich Airport)
    L.circleMarker(target, {
      radius: 8,
      color: '#ffffff',
      fillColor: '#3b82f6',
      fillOpacity: 1,
      weight: 2,
    })
      .bindTooltip('<b>Target: Zurich Airport (ZRH)</b><br>Median ETA: 42 min', {
        permanent: true,
        direction: 'right',
        className: 'custom-tooltip',
        offset: [10, 0],
      })
      .addTo(group);
    // Active Forecast Waypoint Marker at Selected Snapshot Time (+15m to +90m)
    const snapMinutes = [15, 30, 45, 60, 75, 90][activeSnapshot] || 45;
    const t = snapMinutes / 90;
    const snapLat = origin[0] + (target[0] - origin[0]) * t;
    const snapLon = origin[1] + (target[1] - origin[1]) * t;
    const snapDbz = Math.max(54, 74 - Math.round(activeSnapshot * 3.2));

    L.circleMarker([snapLat, snapLon], {
      radius: 10,
      color: '#ffffff',
      fillColor: '#c084fc',
      fillOpacity: 1,
      weight: 2.5,
    })
      .bindTooltip(`<b>Forecast (+${snapMinutes}m): ${snapDbz} dBZ</b><br>${snapshots[activeSnapshot]?.status}`, {
        permanent: true,
        direction: 'top',
        className: 'custom-tooltip',
        offset: [0, -12],
      })
      .addTo(group);

    // Reflectivity halo around the projected position
    L.circle([snapLat, snapLon], {
      radius: Math.max(8000, 22000 - activeSnapshot * 1500),
      color: 'rgba(168, 85, 247, 0.5)',
      fillColor: 'rgba(168, 85, 247, 0.25)',
      fillOpacity: 0.3,
      weight: 1.5,
    }).addTo(group);

  }, [activeSnapshot]);

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0 select-none">
      {/* Top Main Section */}
      <div className="flex-[3] flex gap-3 min-h-0">
        {/* Left Map View with 16 DGMR Ensemble Members (REAL LEAFLET MAP) */}
        <div className="flex-[2.4] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col shadow-xl">
          {/* Leaflet map container */}
          <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />

          {/* Top Bar Header Overlay */}
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-auto">
            <div className="bg-[#111622]/90 backdrop-blur border border-gray-700/60 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-100">
                16 Possible Futures: {currentStorm.name || 'Alpine Supercell'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                DeepMind DGMR Neural Model
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-16 z-[400] text-[10px] text-gray-300 flex items-center gap-3 bg-[#111622]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-700/60 shadow">
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-[1.5px] bg-purple-400"></div> Ensemble member</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-purple-500/20 border border-purple-500/50 rounded-sm"></div> 80% interval</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-[1.5px] border-t border-dashed border-white"></div> Deterministic (median)</div>
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
        </div>

        {/* Right Arrival Time Distribution Histogram */}
        <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold mb-1">Arrival Time Probability</span>
            <h3 className="text-sm font-bold text-gray-100">Zurich International Airport (ZRH)</h3>

            <div className="flex items-baseline gap-3 my-3 p-3 rounded-lg bg-[#182030]/80 border border-gray-800">
              <div>
                <span className="text-[10px] text-gray-400 block">Median ETA</span>
                <span className="text-2xl font-black text-blue-400">42 min</span>
              </div>
              <div className="border-l border-gray-700 pl-3">
                <span className="text-[10px] text-gray-400 block">80% Confidence Window</span>
                <span className="text-sm font-bold text-gray-200">31 – 55 min</span>
              </div>
            </div>

            {/* Distribution Bar Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b14', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                    formatter={(val) => [`${val} ensemble runs`, 'Simulations']}
                  />
                  <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-800 pt-2">
            Based on <strong>16 Monte Carlo latent samples</strong> drawn from the DGMR neural prior distribution.
          </div>
        </div>
      </div>

      {/* Bottom Scenario Snapshots (+15m to +90m) */}
      <div className="h-[130px] bg-[#111622] rounded-xl border border-gray-800/60 p-3 flex flex-col justify-between shrink-0 shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">
              DGMR AI Forecast Scenario Progression
            </span>
            <span className="text-[10px] text-gray-500 font-mono">(Simulated Reflectivity Snapshots)</span>
          </div>
          <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
            <Sparkles size={12} /> Deep Generative Radar Output
          </span>
        </div>

        {/* 6 Snapshot Thumbnails */}
        <div className="grid grid-cols-6 gap-2 flex-1">
          {snapshots.map((snap, i) => (
            <div
              key={i}
              onClick={() => setActiveSnapshot(i)}
              className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                activeSnapshot === i
                  ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-900/30'
                  : 'bg-[#182030]/50 border-gray-800/80 hover:bg-[#1f293d]'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">{snap.label}</span>
                <span className="text-[10px] text-amber-400 font-bold">{snap.dbz}</span>
              </div>
              <div className="h-6 w-full rounded bg-[#0a0d14] relative overflow-hidden flex items-center justify-center my-1">
                <div
                  className="w-10 h-10 rounded-full blur-md opacity-80"
                  style={{
                    background: i < 3 ? 'radial-gradient(circle, #ef4444, #f59e0b)' : 'radial-gradient(circle, #f59e0b, #3b82f6)',
                    transform: `translateX(${i * 6 - 15}px)`
                  }}
                />
              </div>
              <div className="text-[10px] text-gray-400 truncate">{snap.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
