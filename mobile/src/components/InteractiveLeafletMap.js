import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export default function InteractiveLeafletMap({
  storms = [],
  selectedStormId,
  onStormSelect,
  radarActive = true,
  frameIndex = 19,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    // Only run in Web environment
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // 1. Inject Leaflet CSS dynamically if not already loaded
    if (!document.getElementById('leaflet-css-bundle')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-bundle';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // 2. Inject Dark Map and Pulse Styles (Exact same as web frontend)
    let style = document.getElementById('leaflet-dark-theme-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'leaflet-dark-theme-style';
      document.head.appendChild(style);
    }
    style.innerHTML = `
      .leaflet-container {
        background: #060b17 !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .dark-tiles {
        filter: invert(1) hue-rotate(200deg) brightness(0.7) contrast(1.1) saturate(0.3) !important;
      }
      .leaflet-overlay-pane,
      .leaflet-marker-pane,
      .leaflet-tooltip-pane,
      .leaflet-popup-pane,
      .leaflet-shadow-pane {
        filter: none !important;
      }
      .custom-storm-tooltip {
        background: rgba(10, 15, 29, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6) !important;
        color: #ffffff !important;
        padding: 8px 10px !important;
      }
      .custom-storm-tooltip::before {
        border-right-color: rgba(10, 15, 29, 0.95) !important;
      }
      .storm-marker-glow {
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.4);
        animation: stormPulseAnim 2s infinite ease-in-out;
      }
      @keyframes stormPulseAnim {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;

    // 3. Initialize Leaflet Map Instance
    const L = require('leaflet');
    const container =
      mapContainerRef.current || document.getElementById('leaflet-mobile-container');

    if (container) {
      if (container._leaflet_id && !mapInstanceRef.current) {
        delete container._leaflet_id;
      }

      if (!mapInstanceRef.current) {
        try {
          const map = L.map(container, {
            center: [46.82, 8.23], // Center of Switzerland
            zoom: 8,
            zoomControl: true,
            attributionControl: false,
          });

          // Free OpenStreetMap Tiles with .dark-tiles filter (Zero API Key, zero watermark - exact same as web frontend MainMap.jsx)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            className: 'dark-tiles',
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          mapInstanceRef.current = map;

          // Invalidate size after layout settles
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 250);
        } catch (err) {
          console.warn('Leaflet map initialization notice:', err);
        }
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers when storms, frameIndex, or radarActive changes
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapInstanceRef.current || typeof window === 'undefined') {
      return;
    }

    const L = require('leaflet');
    const map = mapInstanceRef.current;

    // Remove previous dynamic layers
    layersRef.current.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch (e) {}
    });
    layersRef.current = [];

    const uncertaintyScale = radarActive ? 1.0 : 2.5;

    // Helper: dBZ to RGBA Color
    const dbzToColor = (dbz) => {
      if (dbz >= 65) return 'rgba(217, 70, 239, 0.75)'; // Magenta
      if (dbz >= 55) return 'rgba(239, 68, 68, 0.70)';  // Red
      if (dbz >= 45) return 'rgba(249, 115, 22, 0.65)'; // Orange
      if (dbz >= 35) return 'rgba(234, 179, 8, 0.55)';  // Yellow
      return 'rgba(34, 197, 94, 0.40)';                 // Green
    };

    // Render each storm cell on the Leaflet map
    storms.forEach((storm, idx) => {
      const pos = storm.position;
      if (!pos || !pos.lat || !pos.lon) return;

      const center = L.latLng(pos.lat, pos.lon);
      const isSelected = storm.id === selectedStormId;
      const baseArea = storm.area_km2 || 300;
      const radiusM = Math.max(9000, Math.sqrt(baseArea) * 1100);
      const peakDbz = storm.max_dbz || 60;

      const sevColor =
        storm.severity === 'EXTREME'
          ? '#ef4444'
          : storm.severity === 'HIGH'
          ? '#f97316'
          : '#eab308';

      // 1. Concentric Radar Heatmap Rings
      [
        { r: radiusM * 2.2, d: peakDbz * 0.45, o: 0.18 },
        { r: radiusM * 1.6, d: peakDbz * 0.65, o: 0.30 },
        { r: radiusM * 1.0, d: peakDbz * 0.85, o: 0.48 },
        { r: radiusM * 0.5, d: peakDbz, o: 0.72 },
      ].forEach((ring) => {
        const circle = L.circle(center, {
          radius: ring.r,
          color: 'transparent',
          fillColor: dbzToColor(ring.d),
          fillOpacity: ring.o,
          interactive: false,
        }).addTo(map);
        layersRef.current.push(circle);
      });

      // 2. Uncertainty Expansion Cone (widens 2.5x during radar outage)
      const outerRing = L.circle(center, {
        radius: radiusM * 2.2 * uncertaintyScale,
        color: radarActive ? sevColor : '#ef4444',
        fillColor: radarActive ? sevColor : '#ef4444',
        fillOpacity: radarActive ? 0.05 : 0.18,
        weight: radarActive ? 1 : 2,
        dashArray: radarActive ? '4, 4' : '3, 3',
        interactive: false,
      }).addTo(map);
      layersRef.current.push(outerRing);

      // 3. Forward Velocity Trajectory Vector
      if (storm.speed_kmh && storm.speed_kmh > 0) {
        const headingRad = ((90 - (storm.direction || 45)) * Math.PI) / 180;
        const forwardDistanceKm = (storm.speed_kmh * 1.0); // 1 hour projection
        const dLat = (forwardDistanceKm * Math.sin(headingRad)) / 111.0;
        const dLon =
          (forwardDistanceKm * Math.cos(headingRad)) /
          (111.0 * Math.cos((pos.lat * Math.PI) / 180));

        const targetPos = L.latLng(pos.lat + dLat, pos.lon + dLon);

        // Trajectory line
        const vectorLine = L.polyline([center, targetPos], {
          color: '#ffffff',
          weight: 2,
          dashArray: '6, 6',
          opacity: 0.8,
          interactive: false,
        }).addTo(map);
        layersRef.current.push(vectorLine);

        // Arrow head marker at target
        const targetMarker = L.circleMarker(targetPos, {
          radius: 5,
          color: '#ffffff',
          fillColor: sevColor,
          fillOpacity: 1,
          weight: 2,
          interactive: false,
        }).addTo(map);
        layersRef.current.push(targetMarker);
      }

      // 4. Glowing Numbered Storm Marker
      const stormNumber = idx + 1;
      const markerHtml = `
        <div class="${isSelected ? 'storm-marker-glow' : ''}" style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${sevColor};
          border: 2.5px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
          box-shadow: 0 0 14px ${sevColor}, 0 2px 8px rgba(0,0,0,0.6);
          cursor: pointer;
        ">
          ${stormNumber}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(center, { icon: customIcon, zIndexOffset: 1000 }).addTo(map);

      // Tooltip
      marker.bindTooltip(
        `
        <div style="font-family: system-ui, sans-serif; min-width: 150px;">
          <div style="font-weight: 800; font-size: 13px; color: #ffffff;">${storm.name}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 3px;">
            ${storm.hazard_type} &bull; ${storm.lifecycle || 'Mature'}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: ${sevColor};">
            ${storm.severity} &bull; ${storm.max_dbz} dBZ
          </div>
          <div style="font-size: 10px; color: #cbd5e1; margin-top: 3px;">
            Speed: ${storm.speed_kmh} km/h &bull; ${storm.area_km2} km²
          </div>
          ${
            storm.nearest_target
              ? `<div style="font-size: 10px; font-weight: 700; color: #38bdf8; margin-top: 2px;">
                  Target: ${storm.nearest_target} (ETA ~${storm.eta_minutes}m)
                </div>`
              : ''
          }
        </div>
      `,
        {
          className: 'custom-storm-tooltip',
          direction: 'top',
          offset: [0, -18],
        }
      );

      // On click marker
      marker.on('click', () => {
        onStormSelect?.(storm.id);
      });

      layersRef.current.push(marker);
    });
  }, [storms, selectedStormId, radarActive, frameIndex]);

  return (
    <View style={styles.container}>
      <View
        ref={mapContainerRef}
        nativeID="leaflet-mobile-container"
        style={styles.mapView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#060b17',
    overflow: 'hidden',
  },
  mapView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#060b17',
  },
});
