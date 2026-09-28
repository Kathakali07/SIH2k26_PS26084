import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function WeatherMap({ activeMapLayer, isMapEnlarged, onToggleMapEnlarge }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tempLayerRef = useRef(null);
  const humLayerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-25.2744, 133.7751],
        zoom: 5,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Base Esri map matching the visual style in the image (no labels, dark)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, USGS | Esri, Garmin, FAO, NOAA',
        maxZoom: 16
      }).addTo(map);

      // We'll use L.svgOverlay to create a geographically-bound linear gradient 
      // that matches the exact colors in your screenshot.
      const bounds = [[-8, 110], [-45, 155]];
      
      const svgElementTemp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElementTemp.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      svgElementTemp.setAttribute('viewBox', "0 0 100 100");
      svgElementTemp.innerHTML = `
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#8a2020" /> <!-- Deep crimson -->
            <stop offset="25%" stop-color="#b83f27" /> <!-- Orange/red -->
            <stop offset="45%" stop-color="#d68d37" /> <!-- Orange/yellow -->
            <stop offset="65%" stop-color="#b6a15b" /> <!-- Dusty yellow/green -->
            <stop offset="85%" stop-color="#698b67" /> <!-- Dusty green -->
            <stop offset="100%" stop-color="#2c6778" /> <!-- Blue/teal -->
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#tempGradient)" />
      `;
      
      const svgElementHum = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElementHum.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      svgElementHum.setAttribute('viewBox', "0 0 100 100");
      svgElementHum.innerHTML = `
        <defs>
          <linearGradient id="humGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4c1d95" /> 
            <stop offset="40%" stop-color="#7e22ce" />
            <stop offset="100%" stop-color="#0284c7" /> 
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#humGradient)" />
      `;

      tempLayerRef.current = L.svgOverlay(svgElementTemp, bounds, { opacity: 0.65, interactive: false });
      humLayerRef.current = L.svgOverlay(svgElementHum, bounds, { opacity: 0.5, interactive: false });

      // Add initial layer based on state
      if (activeMapLayer === 'temperature') {
        tempLayerRef.current.addTo(map);
      } else {
        humLayerRef.current.addTo(map);
      }

      const cities = [
        { name: 'Sydney', coords: [-33.8688, 151.2093] },
        { name: 'Melbourne', coords: [-37.8136, 144.9631] },
        { name: 'Brisbane', coords: [-27.4698, 153.0251] },
        { name: 'Adelaide', coords: [-34.9285, 138.6007] },
        { name: 'Perth', coords: [-31.9505, 115.8605] },
        { name: 'Darwin', coords: [-12.4634, 130.8456] },
        { name: 'Alice Springs', coords: [-23.6980, 133.8807] },
        { name: 'Hobart', coords: [-42.8821, 147.3272] },
        { name: 'Canberra', coords: [-35.2809, 149.1300] },
        { name: 'Cairns', coords: [-16.9186, 145.7781] }
      ];

      cities.forEach(city => {
        const marker = L.circleMarker(city.coords, {
          radius: 4,
          fillColor: '#ffffff',
          color: '#000000',
          weight: 1,
          opacity: 0.7,
          fillOpacity: 1
        }).addTo(map);
        marker.bindTooltip(city.name, { 
          className: 'bg-transparent border-none text-white text-[11px] map-tooltip',
          direction: 'right',
          permanent: true,
          offset: [6, 0]
        });
      });
      
      // Random smaller dots to mimic weather stations
      for(let i=0; i<100; i++) {
         L.circleMarker([
            -10 - Math.random() * 35,
            110 + Math.random() * 45
         ], {
           radius: 1.5,
           fillColor: '#ffffff',
           color: '#ffffff',
           weight: 0,
           fillOpacity: 0.7
         }).addTo(map);
      }

      mapInstanceRef.current = map;

      // Handle map resizing automatically
      observerRef.current = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observerRef.current.observe(mapContainerRef.current);
    }
    
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run only on mount

  // Watch for activeMapLayer changes to toggle the overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && tempLayerRef.current && humLayerRef.current) {
      if (activeMapLayer === 'temperature') {
        if (map.hasLayer(humLayerRef.current)) map.removeLayer(humLayerRef.current);
        if (!map.hasLayer(tempLayerRef.current)) map.addLayer(tempLayerRef.current);
      } else {
        if (map.hasLayer(tempLayerRef.current)) map.removeLayer(tempLayerRef.current);
        if (!map.hasLayer(humLayerRef.current)) map.addLayer(humLayerRef.current);
      }
    }
  }, [activeMapLayer]);

  // When map enlarges/shrinks, ensure leaflet re-calculates dimensions after transition
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [isMapEnlarged]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {/* Top right buttons */}
      <div className="absolute top-3 right-3 z-[400] flex gap-1">
        <button 
          onClick={onToggleMapEnlarge}
          title={isMapEnlarged ? "Collapse Map" : "Enlarge Map"}
          className="bg-[#0f172a] p-1.5 border border-cyan-800 rounded text-cyan-500 hover:bg-gray-800 transition-colors shadow-lg"
        >
          {isMapEnlarged ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          )}
        </button>
      </div>
      {/* Attribution overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#1e1e1e]/80 p-2 text-[10px] text-gray-300 z-[400]">
        Data Source <span className="text-blue-400">NOAA GFS</span> • Amy Barnes, Esri Australia<br/>
        Always refer to the Bureau of Meteorology for official weather forecasts!
      </div>
    </div>
  );
}
