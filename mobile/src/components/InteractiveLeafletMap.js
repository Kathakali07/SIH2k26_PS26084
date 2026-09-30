import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

let NativeWebView = null;
if (Platform.OS !== 'web') {
  try {
    NativeWebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('Native WebView resolution:', e.message);
  }
}

/**
 * Returns severity color tokens for convective storm cell rendering.
 * @param {string} severity
 * @returns {{ fill: string, glow: string }}
 */
function getSeverityColor(severity) {
  if (severity === 'HIGH' || severity === 'EXTREME') {
    return { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.65)' };
  }
  if (severity === 'MODERATE') {
    return { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.65)' };
  }
  return { fill: '#3b82f6', glow: 'rgba(59, 130, 246, 0.65)' };
}

/**
 * Maps radar reflectivity (dBZ) to standardized palette RGBA values.
 * @param {number} dbz
 * @returns {string}
 */
function getDbzColor(dbz) {
  if (dbz >= 65) return 'rgba(168, 85, 247, 0.75)';
  if (dbz >= 55) return 'rgba(239, 68, 68, 0.70)';
  if (dbz >= 45) return 'rgba(249, 115, 22, 0.60)';
  if (dbz >= 35) return 'rgba(234, 179, 8, 0.50)';
  if (dbz >= 25) return 'rgba(34, 197, 94, 0.40)';
  if (dbz >= 15) return 'rgba(59, 130, 246, 0.30)';
  return 'rgba(30, 64, 175, 0.15)';
}

/**
 * Generates the self-contained Leaflet HTML template for native WebView execution.
 * @returns {string}
 */
function getStaticNativeLeafletHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: #060b17;
      overflow: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .custom-tooltip {
      background: rgba(10, 15, 29, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6) !important;
      color: #ffffff !important;
      padding: 8px 10px !important;
      font-size: 11px !important;
    }
    .custom-tooltip::before {
      border-right-color: rgba(10, 15, 29, 0.95) !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {
      center: [46.82, 8.23],
      zoom: 8,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-tiles',
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var currentLayers = [];

    function severityColor(sev) {
      if (sev === 'HIGH' || sev === 'EXTREME') return { fill: '#ef4444', glow: 'rgba(239,68,68,0.65)' };
      if (sev === 'MODERATE') return { fill: '#f59e0b', glow: 'rgba(245,158,11,0.65)' };
      return { fill: '#3b82f6', glow: 'rgba(59,130,246,0.65)' };
    }

    function dbzToColor(dbz) {
      if (dbz >= 65) return 'rgba(168, 85, 247, 0.75)';
      if (dbz >= 55) return 'rgba(239, 68, 68, 0.70)';
      if (dbz >= 45) return 'rgba(249, 115, 22, 0.60)';
      if (dbz >= 35) return 'rgba(234, 179, 8, 0.50)';
      if (dbz >= 25) return 'rgba(34, 197, 94, 0.40)';
      if (dbz >= 15) return 'rgba(59, 130, 246, 0.30)';
      return 'rgba(30, 64, 175, 0.15)';
    }

    window.updateMapLayers = function(payload) {
      if (!payload) return;
      var storms = payload.storms || [];
      var selectedStormId = payload.selectedStormId;
      var radarActive = payload.radarActive !== false;
      var uncertaintyScale = radarActive ? 1.0 : 2.5;

      currentLayers.forEach(function(l) {
        try { map.removeLayer(l); } catch(e){}
      });
      currentLayers = [];

      storms.forEach(function(storm, idx) {
        var pos = storm.position;
        if (!pos || !pos.lat || !pos.lon) return;

        var center = L.latLng(pos.lat, pos.lon);
        var isSel = storm.id === selectedStormId;
        var sc = severityColor(storm.severity);
        var peakDbz = storm.max_dbz || 55;
        var num = (storm.id || '').replace('storm_', '').replace(/^0+/, '') || (idx + 1);

        var span = Math.sqrt(storm.area_km2 || 300) / 111;
        var rM = Math.max(span * 111 * 1000 / 2, 7000);

        [
          { r: rM * 2.4, d: peakDbz * 0.3, o: 0.14 },
          { r: rM * 1.9, d: peakDbz * 0.5, o: 0.22 },
          { r: rM * 1.4, d: peakDbz * 0.7, o: 0.32 },
          { r: rM * 0.9, d: peakDbz * 0.88, o: 0.48 },
          { r: rM * 0.45, d: peakDbz, o: 0.65 },
        ].forEach(function(ring) {
          var c = L.circle(center, {
            radius: ring.r,
            color: 'transparent',
            fillColor: dbzToColor(ring.d),
            fillOpacity: ring.o,
            interactive: false
          }).addTo(map);
          currentLayers.push(c);
        });

        if (storm.geometry && storm.geometry.coordinates) {
          var poly = L.geoJSON({
            type: 'Feature',
            geometry: storm.geometry,
            properties: storm
          }, {
            style: function() {
              return {
                color: storm.is_forecast ? '#c084fc' : sc.fill,
                fillColor: storm.is_forecast ? 'rgba(192, 132, 252, 0.08)' : 'transparent',
                weight: isSel ? 3.5 : 2,
                dashArray: storm.is_forecast ? '5, 5' : (isSel ? null : '6, 4'),
                opacity: 0.85
              };
            }
          }).addTo(map);

          poly.on('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'storm_select', id: storm.id }));
            }
          });
          currentLayers.push(poly);
        }

        var speed = (storm.motion && storm.motion.speed_kmh) || storm.speed_kmh || 0;
        if (speed > 0) {
          var h = 1.5;
          var dLat, dLng;
          if (storm.motion && storm.motion.north_kmh !== undefined && storm.motion.east_kmh !== undefined) {
            dLat = (storm.motion.north_kmh * h) / 111;
            dLng = (storm.motion.east_kmh * h) / (111 * Math.cos(pos.lat * Math.PI / 180));
          } else {
            var dir = (storm.motion && storm.motion.direction_degrees) || storm.direction || 45;
            var dr = (90 - dir) * Math.PI / 180;
            var d = speed * h;
            dLat = (d * Math.sin(dr)) / 111;
            dLng = (d * Math.cos(dr)) / (111 * Math.cos(pos.lat * Math.PI / 180));
          }
          var target = [pos.lat + dLat, pos.lon + dLng];

          var fanS = 0.18 * (storm.is_forecast ? 1.4 : 1.0) * uncertaintyScale;
          var fan = L.polygon([
            center,
            [target[0] + fanS * 0.7, target[1] + fanS],
            [target[0] - fanS * 0.7, target[1] - fanS * 0.5]
          ], {
            color: storm.is_forecast ? '#c084fc' : sc.fill,
            fillColor: storm.is_forecast ? '#c084fc' : sc.fill,
            fillOpacity: 0.12,
            weight: 1,
            dashArray: '4, 4',
            interactive: false
          }).addTo(map);
          currentLayers.push(fan);

          var traj = L.polyline([center, target], {
            color: '#ffffff',
            weight: 2,
            dashArray: '6, 6',
            opacity: 0.75,
            interactive: false
          }).addTo(map);
          currentLayers.push(traj);

          var end = L.circleMarker(target, {
            radius: 5,
            fillColor: storm.is_forecast ? '#c084fc' : sc.fill,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.95,
            interactive: false
          }).addTo(map);
          currentLayers.push(end);
        }

        var icon = L.divIcon({
          className: '',
          html: '<div style="width:30px;height:30px;border-radius:50%;background:' + sc.fill + ';border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;box-shadow:0 0 16px ' + sc.glow + ', 0 0 28px ' + sc.glow + ';cursor:pointer;font-family:Inter,system-ui,sans-serif;">' + num + '</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        var marker = L.marker(center, { icon: icon, zIndexOffset: 1000 }).addTo(map);
        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'storm_select', id: storm.id }));
          }
        });

        var tooltipHtml = '<div style="font-family:Inter,sans-serif;min-width:170px">' +
          '<div style="font-weight:700;color:#fff;font-size:13px">' + (storm.name || storm.id) + '</div>' +
          '<div style="color:#9ca3af;font-size:11px;margin-bottom:4px">' + (storm.hazard_type || 'Storm') + ' &bull; ' + (storm.lifecycle || '') + '</div>' +
          '<div style="color:' + sc.fill + ';font-weight:700;font-size:12px">' + storm.severity + ' &bull; ' + (storm.max_dbz ? storm.max_dbz.toFixed(1) : '') + ' dBZ</div>' +
          '<div style="color:#cbd5e1;font-size:11px;margin-top:2px">Speed: ' + (storm.speed_kmh ? storm.speed_kmh.toFixed(0) : '?') + ' km/h &bull; ' + (storm.area_km2 ? storm.area_km2.toFixed(0) : '?') + ' km²</div>' +
          (storm.nearest_target ? '<div style="color:#38bdf8;font-size:10px;margin-top:3px;font-weight:600">Target: ' + storm.nearest_target + ' (ETA ~' + (storm.eta_minutes || 30) + 'm)</div>' : '') +
          (storm.is_forecast ? '<div style="color:#c084fc;font-size:10px;margin-top:2px;font-style:italic">DGMR Neural AI Forecast</div>' : '') +
          '</div>';

        marker.bindTooltip(tooltipHtml, { className: 'custom-tooltip', direction: 'right', offset: [18, 0] });
        currentLayers.push(marker);
      });
    };

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_ready' }));
    }
  </script>
</body>
</html>
  `;
}

/**
 * Mobile Interactive GIS Map Component
 * Provides responsive Leaflet geospatial rendering across Web and Native platforms.
 */
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
  const webViewRef = useRef(null);
  const isWebViewReadyRef = useRef(false);

  const staticHtml = useMemo(() => getStaticNativeLeafletHtml(), []);

  // Web Leaflet Instance Initialization
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (!document.getElementById('leaflet-css-bundle')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-bundle';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

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
        width: 100% !important;
        height: 100% !important;
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
      .custom-tooltip {
        background: rgba(10, 15, 29, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6) !important;
        color: #ffffff !important;
        padding: 8px 10px !important;
        font-size: 11px !important;
      }
      .custom-tooltip::before {
        border-right-color: rgba(10, 15, 29, 0.95) !important;
      }
    `;

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
            center: [46.82, 8.23],
            zoom: 8,
            zoomControl: true,
            attributionControl: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            className: 'dark-tiles',
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          mapInstanceRef.current = map;

          [100, 300, 700].forEach((ms) => {
            setTimeout(() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
              }
            }, ms);
          });
        } catch (err) {
          console.warn('Leaflet map initialization notice:', err);
        }
      }
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Web Layer Updates: Preserves viewport zoom and center during timeline scrubbing
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapInstanceRef.current || typeof window === 'undefined') {
      return;
    }

    const L = require('leaflet');
    const map = mapInstanceRef.current;

    layersRef.current.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch (e) {}
    });
    layersRef.current = [];

    const uncertaintyScale = radarActive ? 1.0 : 2.5;

    storms.forEach((storm, idx) => {
      const pos = storm.position;
      if (!pos || !pos.lat || !pos.lon) return;

      const center = L.latLng(pos.lat, pos.lon);
      const isSel = storm.id === selectedStormId;
      const sc = getSeverityColor(storm.severity);
      const peakDbz = storm.max_dbz || 55;
      const num = storm.id?.replace('storm_', '').replace(/^0+/, '') || (idx + 1);

      // Radar Concentric Heatmap Rings
      const span = Math.sqrt(storm.area_km2 || 300) / 111;
      const rM = Math.max((span * 111 * 1000) / 2, 7000);

      [
        { r: rM * 2.4, d: peakDbz * 0.3, o: 0.14 },
        { r: rM * 1.9, d: peakDbz * 0.5, o: 0.22 },
        { r: rM * 1.4, d: peakDbz * 0.7, o: 0.32 },
        { r: rM * 0.9, d: peakDbz * 0.88, o: 0.48 },
        { r: rM * 0.45, d: peakDbz, o: 0.65 },
      ].forEach((ring) => {
        const circle = L.circle(center, {
          radius: ring.r,
          color: 'transparent',
          fillColor: getDbzColor(ring.d),
          fillOpacity: ring.o,
          interactive: false,
        }).addTo(map);
        layersRef.current.push(circle);
      });

      // Storm Object Polygon Boundaries
      if (storm.geometry && storm.geometry.coordinates) {
        const poly = L.geoJSON(
          {
            type: 'Feature',
            geometry: storm.geometry,
            properties: storm,
          },
          {
            style: () => ({
              color: storm.is_forecast ? '#c084fc' : sc.fill,
              fillColor: storm.is_forecast ? 'rgba(192, 132, 252, 0.08)' : 'transparent',
              weight: isSel ? 3.5 : 2,
              dashArray: storm.is_forecast ? '5, 5' : (isSel ? null : '6, 4'),
              opacity: 0.85,
            }),
          }
        ).addTo(map);

        poly.on('click', () => onStormSelect?.(storm.id));
        layersRef.current.push(poly);
      }

      // Forward Trajectory & Uncertainty Fan
      const speed = storm.motion?.speed_kmh ?? storm.speed_kmh ?? 0;
      if (speed > 0) {
        const h = 1.5;
        let dLat, dLng;
        if (storm.motion?.north_kmh !== undefined && storm.motion?.east_kmh !== undefined) {
          dLat = (storm.motion.north_kmh * h) / 111;
          dLng = (storm.motion.east_kmh * h) / (111 * Math.cos((pos.lat * Math.PI) / 180));
        } else {
          const dir = storm.motion?.direction_degrees ?? storm.direction ?? 45;
          const dr = ((90 - dir) * Math.PI) / 180;
          const d = speed * h;
          dLat = (d * Math.sin(dr)) / 111;
          dLng = (d * Math.cos(dr)) / (111 * Math.cos((pos.lat * Math.PI) / 180));
        }
        const target = [pos.lat + dLat, pos.lon + dLng];

        const fanS = 0.18 * (storm.is_forecast ? 1.4 : 1.0) * uncertaintyScale;
        const fan = L.polygon(
          [
            center,
            [target[0] + fanS * 0.7, target[1] + fanS],
            [target[0] - fanS * 0.7, target[1] - fanS * 0.5],
          ],
          {
            color: storm.is_forecast ? '#c084fc' : sc.fill,
            fillColor: storm.is_forecast ? '#c084fc' : sc.fill,
            fillOpacity: 0.12,
            weight: 1,
            dashArray: '4, 4',
            interactive: false,
          }
        ).addTo(map);
        layersRef.current.push(fan);

        const traj = L.polyline([center, target], {
          color: '#ffffff',
          weight: 2,
          dashArray: '6, 6',
          opacity: 0.75,
          interactive: false,
        }).addTo(map);
        layersRef.current.push(traj);

        const end = L.circleMarker(target, {
          radius: 5,
          fillColor: storm.is_forecast ? '#c084fc' : sc.fill,
          color: '#fff',
          weight: 2,
          fillOpacity: 0.95,
          interactive: false,
        }).addTo(map);
        layersRef.current.push(end);
      }

      // Storm Center Indicator Badge
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: ${sc.fill};
          border: 2.5px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #fff;
          box-shadow: 0 0 16px ${sc.glow}, 0 0 28px ${sc.glow};
          cursor: pointer;
          font-family: Inter, system-ui, sans-serif;
        ">${num}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker(center, { icon, zIndexOffset: 1000 }).addTo(map);
      marker.on('click', () => onStormSelect?.(storm.id));

      const tooltipHtml = `
        <div style="font-family:Inter,sans-serif;min-width:170px">
          <div style="font-weight:700;color:#fff;font-size:13px">${storm.name || storm.id}</div>
          <div style="color:#9ca3af;font-size:11px;margin-bottom:4px">${storm.hazard_type || 'Storm'} &bull; ${storm.lifecycle || ''}</div>
          <div style="color:${sc.fill};font-weight:700;font-size:12px">${storm.severity} &bull; ${storm.max_dbz ? storm.max_dbz.toFixed(1) : ''} dBZ</div>
          <div style="color:#cbd5e1;font-size:11px;margin-top:2px">Speed: ${storm.speed_kmh ? storm.speed_kmh.toFixed(0) : '?'} km/h &bull; ${storm.area_km2 ? storm.area_km2.toFixed(0) : '?'} km²</div>
          ${storm.nearest_target ? `<div style="color:#38bdf8;font-size:10px;margin-top:3px;font-weight:600">Target: ${storm.nearest_target} (ETA ~${storm.eta_minutes || 30}m)</div>` : ''}
          ${storm.is_forecast ? `<div style="color:#c084fc;font-size:10px;margin-top:2px;font-style:italic">DGMR Neural AI Forecast</div>` : ''}
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        className: 'custom-tooltip',
        direction: 'right',
        offset: [18, 0],
      });

      layersRef.current.push(marker);
    });
  }, [storms, selectedStormId, radarActive, frameIndex]);

  // Native Mobile Dynamic Layer Dispatcher
  useEffect(() => {
    if (Platform.OS === 'web' || !NativeWebView || !isWebViewReadyRef.current) {
      return;
    }

    const payload = JSON.stringify({
      storms,
      selectedStormId,
      radarActive,
    });

    const script = `
      if (window.updateMapLayers) {
        window.updateMapLayers(${payload});
      }
      true;
    `;

    webViewRef.current?.injectJavaScript(script);
  }, [storms, selectedStormId, radarActive, frameIndex]);

  const handleNativeMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'map_ready') {
        isWebViewReadyRef.current = true;
        const payload = JSON.stringify({
          storms,
          selectedStormId,
          radarActive,
        });
        webViewRef.current?.injectJavaScript(`
          if (window.updateMapLayers) {
            window.updateMapLayers(${payload});
          }
          true;
        `);
      } else if (msg.type === 'storm_select') {
        onStormSelect?.(msg.id);
      }
    } catch (e) {}
  };

  if (Platform.OS !== 'web' && NativeWebView) {
    return (
      <View style={styles.nativeContainer}>
        <NativeWebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: staticHtml }}
          style={styles.webView}
          onMessage={handleNativeMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
        />
      </View>
    );
  }

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    minHeight: 380,
    backgroundColor: '#060b17',
    overflow: 'hidden',
  },
  mapView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    minHeight: 380,
    backgroundColor: '#060b17',
  },
  nativeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 380,
    backgroundColor: '#060b17',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#060b17',
  },
});
