// src/components/GISMap.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function GISMap({ threats, selectedThreat, onSelectThreat }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      // Initialize map centered around Kolkata/Monsoon track
      const map = L.map(mapContainerRef.current, {
        center: [22.65, 88.35],
        zoom: 11,
        zoomControl: false
      });

      // CartoDB Dark Matter basemap (essential for radar contrast)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-draw polygons whenever threats or selections change
  useEffect(() => {
    if (!layersGroupRef.current) return;
    layersGroupRef.current.clearLayers();

    threats.forEach(threat => {
      const isSelected = selectedThreat?.id === threat.id;
      const isCloudburst = threat.type === 'CLOUDBURST';
      const color = isCloudburst ? '#ef4444' : '#f59e0b';

      const polygon = L.polygon(threat.coordinates, {
        color: color,
        weight: isSelected ? 3 : 1.5,
        fillColor: color,
        fillOpacity: isSelected ? 0.45 : 0.25,
        dashArray: isCloudburst ? null : '4, 4'
      });

      polygon.on('click', () => onSelectThreat(threat));
      polygon.bindTooltip(`<b>${threat.id}</b> - ${threat.type}<br/>Reflectivity: ${threat.dbz} dBZ`, {
        className: 'bg-zinc-900 text-white border-zinc-700 text-xs px-2 py-1 rounded shadow-lg',
        sticky: true
      });

      layersGroupRef.current.addLayer(polygon);
    });
  }, [threats, selectedThreat, onSelectThreat]);

  // Pan to selected threat
  useEffect(() => {
    if (selectedThreat && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedThreat.coordinates[0], 12, { duration: 1 });
    }
  }, [selectedThreat]);

  return <div ref={mapContainerRef} className="w-full h-full bg-zinc-950" />;
}
