import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ArrowRight, Zap, Merge, GitFork, PlusCircle, AlertCircle, ShieldAlert, Plus, Minus, Info } from 'lucide-react';

export default function StormInteractions({ storms = [], setActiveTab }) {
  const [selectedInteraction, setSelectedInteraction] = useState('merger');
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
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

  // Update Storm Interaction Graph on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Storm Nodes
    const nodes = [
      { id: 'alpine', name: 'Alpine Supercell', dbz: 74, status: 'Mature', lat: 46.75, lon: 8.60, color: '#ef4444', r: 35 },
      { id: 'bernese', name: 'Bernese Core Cell', dbz: 68, status: 'Developing', lat: 46.70, lon: 7.72, color: '#f59e0b', r: 25 },
      { id: 'jura', name: 'Jura Frontal Cluster', dbz: 61, status: 'Active', lat: 47.30, lon: 7.25, color: '#eab308', r: 20 },
      { id: 'ticino', name: 'Ticino Southern Feeder', dbz: 61, status: 'Inflow', lat: 46.22, lon: 8.90, color: '#3b82f6', r: 18 },
    ];

    // Interaction Vectors
    // Vector 1: Bernese Core -> Alpine Supercell (Merger)
    L.polyline([[46.70, 7.72], [46.75, 8.60]], {
      color: '#f59e0b',
      weight: 3.5,
      dashArray: '6 6',
    })
      .bindTooltip('<b>Elevated Cell Merger Risk (&gt;70%)</b><br>Convergence in 40–60 min over Lake Lucerne', {
        permanent: true,
        className: 'custom-tooltip',
      })
      .addTo(group);

    // Vector 2: Ticino -> Alpine Supercell (Warm moist inflow)
    L.polyline([[46.22, 8.90], [46.75, 8.60]], {
      color: '#ffffff',
      weight: 2.5,
      dashArray: '5 4',
    })
      .bindTooltip('<b>Low-Level Inflow Feed</b><br>Orographic moisture ascent', {
        permanent: false,
        className: 'custom-tooltip',
      })
      .addTo(group);

    // Vector 3: Outflow toward Zurich (New Secondary Initiation)
    L.polyline([[46.75, 8.60], [47.38, 8.55]], {
      color: '#22c55e',
      weight: 3,
      dashArray: '5 5',
    })
      .bindTooltip('<b>Cold Pool Outflow Boundary</b><br>Triggering new secondary cell near Zurich', {
        permanent: true,
        className: 'custom-tooltip',
      })
      .addTo(group);

    // Vector 4: Jura -> Basel
    L.polyline([[47.30, 7.25], [47.56, 7.59]], {
      color: '#94a3b8',
      weight: 2,
      dashArray: '4 4',
    })
      .bindTooltip('<b>Linear Propagation</b> toward Basel Rhine', {
        permanent: false,
        className: 'custom-tooltip',
      })
      .addTo(group);

    // Secondary Initiation Node (Zurich Basin)
    L.circleMarker([47.38, 8.55], {
      radius: 9,
      color: '#ffffff',
      fillColor: '#22c55e',
      fillOpacity: 0.9,
      weight: 2,
    })
      .bindTooltip('<b>New Initiation Trigger: Zurich Basin</b><br>Expected initiation in ~45 min', {
        permanent: true,
        direction: 'right',
        className: 'custom-tooltip',
        offset: [10, 0],
      })
      .addTo(group);

    // Plot Cell Nodes
    nodes.forEach(n => {
      // Glow circle
      L.circle([n.lat, n.lon], {
        radius: n.r * 800,
        color: n.color,
        fillColor: n.color,
        fillOpacity: 0.25,
        weight: 1.5,
      }).addTo(group);

      // Core Marker
      L.circleMarker([n.lat, n.lon], {
        radius: 8,
        color: '#ffffff',
        fillColor: n.color,
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(`<b>${n.name}</b><br>${n.status} • ${n.dbz} dBZ`, {
          permanent: true,
          direction: 'top',
          className: 'custom-tooltip',
          offset: [0, -10],
        })
        .addTo(group);
    });

  }, []);

  return (
    <div className="flex-1 bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden relative flex flex-col shadow-xl select-none">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />

      {/* Top Header */}
      <div className="absolute top-4 left-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/60 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3">
        <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider">Storm Interaction Graph</h2>
        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-mono">
          Swiss Alpine Radar Network
        </span>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-72 z-[400] flex flex-col gap-1 bg-[#111622]/90 backdrop-blur border border-gray-700/60 rounded-lg p-1 shadow-lg">
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

      {/* Legend & Details Panel */}
      <div className="absolute top-4 right-4 z-[400] bg-[#111622]/95 backdrop-blur border border-gray-700/60 rounded-xl p-3.5 w-[260px] text-xs shadow-2xl">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-2.5">Dynamics Legend</span>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
            <span className="text-gray-300 font-medium">Cell Merger Risk (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
            <span className="text-gray-300 font-medium">Secondary Initiation Trigger</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></div>
            <span className="text-gray-300">Orographic Inflow Feed</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-gray-800 text-[11px] text-gray-400 leading-relaxed">
          The <strong>Bernese Core</strong> and <strong>Alpine Supercell</strong> are on convergent trajectories. Merger will intensify radar core to <strong>&gt;75 dBZ</strong>.
        </div>
      </div>
    </div>
  );
}
