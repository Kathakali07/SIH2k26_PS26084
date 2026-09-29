import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ChevronDown, Play, Pause, Plus, Minus, Layers, Satellite, Zap, Cloud, Target, Activity, Map as MapIcon } from 'lucide-react';

export default function MainMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [activeLayers, setActiveLayers] = useState(['Storm Objects']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(25); // 0 to 100

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => 
      prev.includes(layerName) 
        ? prev.filter(l => l !== layerName)
        : [...prev, layerName]
    );
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 84.5], // Center of the area shown in image (India/Bangladesh)
        zoom: 6,
        zoomControl: false,
      });

      // Dark theme map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      const cities = [
        { name: 'Lucknow', coords: [26.8467, 80.9462] },
        { name: 'Patna', coords: [25.5941, 85.1376] },
        { name: 'Ranchi', coords: [23.3441, 85.3096] },
        { name: 'Kolkata', coords: [22.5726, 88.3639] },
        { name: 'Bhubaneswar', coords: [20.2961, 85.8245] },
        { name: 'Visakhapatnam', coords: [17.6868, 83.2185] },
        { name: 'Raipur', coords: [21.2514, 81.6296] }
      ];

      cities.forEach(city => {
        const marker = L.circleMarker(city.coords, {
          radius: 2,
          fillColor: '#9ca3af',
          color: 'transparent',
        }).addTo(map);
        marker.bindTooltip(city.name, { 
          className: 'bg-transparent border-none text-gray-300 text-xs map-tooltip shadow-none',
          direction: 'right',
          permanent: true,
          offset: [5, 0]
        });
      });

      L.marker([23.6850, 90.3563], {
        icon: L.divIcon({
          className: 'text-gray-400/50 font-bold text-sm tracking-[0.2em] whitespace-nowrap bg-transparent border-none',
          html: 'BANGLADESH',
          iconSize: [100, 20]
        })
      }).addTo(map);

      const storm1 = [25.5, 83.5]; // Cell 3
      const storm2 = [23.5, 87.5]; // Cell 1
      const storm3 = [19.5, 84.5]; // Cell 2

      const addStorm = (coords, num, color, label, targetCoords) => {
        const icon = L.divIcon({
          className: 'bg-transparent',
          html: `
            <div class="relative flex items-center justify-center w-[120px] h-[120px] -ml-[60px] -mt-[60px]">
               <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/80 via-yellow-500/40 to-transparent rounded-full mix-blend-screen blur-md"></div>
               <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-red-500/80 to-transparent rounded-full scale-50"></div>
               <div class="w-5 h-5 bg-${color}-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white z-10 hover:scale-125 transition-transform cursor-pointer shadow-lg">${num}</div>
               <svg class="absolute inset-0 w-full h-full text-white pointer-events-none" style="overflow:visible">
                 <path d="M60,60 L${(targetCoords[1]-coords[1])*100+60},${(coords[0]-targetCoords[0])*100+60}" stroke="white" stroke-width="1.5" stroke-dasharray="4 4" />
               </svg>
            </div>
          `,
          iconSize: [0, 0]
        });
        L.marker(coords, { icon }).addTo(map);

        L.polygon([
           coords,
           [targetCoords[0] + 0.8, targetCoords[1] + 0.2],
           [targetCoords[0] - 0.8, targetCoords[1] - 0.2]
        ], {
           color: label === '3' ? '#ef4444' : label === '1' ? '#eab308' : '#f97316',
           fillColor: label === '3' ? '#ef4444' : label === '1' ? '#eab308' : '#f97316',
           fillOpacity: 0.15,
           weight: 1,
           dashArray: '5, 5'
        }).addTo(map);
      };

      addStorm(storm1, '3', 'red', '3', [25.0, 88.0]);
      addStorm(storm2, '1', 'yellow', '1', [22.0, 91.0]);
      addStorm(storm3, '2', 'orange', '2', [18.5, 87.0]);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const layers = [
    { name: 'Radar', icon: <Activity size={14} /> },
    { name: 'Satellite (IR)', icon: <Satellite size={14} /> },
    { name: 'Lightning', icon: <Zap size={14} /> },
    { name: 'NWP (CAPE)', icon: <Cloud size={14} /> },
    { name: 'Storm Objects', icon: <Target size={14} /> },
    { name: 'Track & Forecast', icon: <MapIcon size={14} /> },
    { name: 'Impact Layer', icon: <Layers size={14} /> },
  ];

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />
      
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button className="flex items-center gap-2 bg-[#111622]/90 backdrop-blur border border-gray-700/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-[#1e293b] hover:text-white transition-colors">
            India <ChevronDown size={14} className="text-gray-500" />
          </button>
          <button className="flex items-center gap-2 bg-[#111622]/90 backdrop-blur border border-gray-700/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-[#1e293b] hover:text-white transition-colors">
            Reflectivity (dBZ) <ChevronDown size={14} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-[#111622]/90 backdrop-blur border border-gray-700/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm pointer-events-auto w-[350px]">
          <span className="text-blue-400 font-medium shrink-0">Now</span>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors shrink-0"
          >
            {isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <div 
            className="flex-1 h-2 bg-gray-700 rounded-full relative mx-2 cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              setTimelineProgress(Math.max(0, Math.min(100, percent)));
            }}
          >
            <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-75" style={{ width: `${timelineProgress}%` }}></div>
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 border-2 border-white rounded-full group-hover:scale-125 transition-transform duration-75"
              style={{ left: `${timelineProgress}%` }}
            ></div>
          </div>
          
          <span className="text-gray-400 shrink-0">+ 6 hours</span>
        </div>
      </div>

      {/* Map Layers Menu */}
      <div className="absolute top-16 left-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-xl p-2 w-[180px]">
        <div className="flex flex-col gap-1">
          {layers.map((layer, idx) => {
            const isActive = activeLayers.includes(layer.name);
            return (
              <button 
                key={idx}
                onClick={() => toggleLayer(layer.name)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-all ${
                  isActive 
                    ? 'text-blue-400 bg-[#1e293b]' 
                    : 'text-gray-300 hover:bg-[#1e293b]/50 hover:text-white'
                }`}
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-gray-500 border border-gray-600'}`}>
                  {isActive ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : null}
                </div>
                {layer.icon}
                {layer.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-[400] flex flex-col gap-1 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-1">
        <button 
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
        <div className="h-[1px] w-full bg-gray-700"></div>
        <button 
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-3">
        <div className="text-xs text-gray-300 mb-2 font-medium">Reflectivity (dBZ)</div>
        <div className="w-[200px] h-3 rounded bg-gradient-to-r from-blue-900 via-green-500 to-red-600 mb-1"></div>
        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
          <span>0</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>60</span><span>70</span>
        </div>
      </div>

    </div>
  );
}
