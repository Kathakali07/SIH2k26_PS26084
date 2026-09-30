import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Polygon,
  G,
  Text as SvgText,
  Line,
} from 'react-native-svg';
import TimelineControl from '../components/TimelineControl';
import StormBottomSheet from '../components/StormBottomSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = Math.max(340, Math.min(460, SCREEN_WIDTH * 1.15));

// Switzerland geographic bounds
const SWISS_BOUNDS = {
  minLon: 5.96,
  maxLon: 10.49,
  minLat: 45.6,
  maxLat: 47.81,
};

// Coordinate to SVG screen pixel conversion
function projectToSvg(lon, lat, width, height) {
  const x = ((lon - SWISS_BOUNDS.minLon) / (SWISS_BOUNDS.maxLon - SWISS_BOUNDS.minLon)) * width;
  const y = height - ((lat - SWISS_BOUNDS.minLat) / (SWISS_BOUNDS.maxLat - SWISS_BOUNDS.minLat)) * height;
  return { x, y };
}

// Major Swiss reference cities
const CITIES = [
  { name: 'Zurich', lon: 8.54, lat: 47.37 },
  { name: 'Bern', lon: 7.44, lat: 46.95 },
  { name: 'Lucerne', lon: 8.30, lat: 47.05 },
  { name: 'Basel', lon: 7.59, lat: 47.56 },
  { name: 'Geneva', lon: 6.14, lat: 46.20 },
  { name: 'Gotthard', lon: 8.61, lat: 46.55 },
];

export default function NowcastScreen({
  storms = [],
  selectedStormId,
  setSelectedStormId,
  frameIndex,
  setFrameIndex,
  totalFrames,
  nowFrameIndex,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  radarActive = true,
  onNavigateToHazards,
}) {
  const selectedStorm = storms.find((s) => s.id === selectedStormId);
  const uncertaintyScale = radarActive ? 1.0 : 2.5;

  return (
    <View style={styles.container}>
      {/* Map View Area */}
      <View style={styles.mapContainer}>
        <Svg width={SCREEN_WIDTH} height={MAP_HEIGHT}>
          {/* Dark Radar Background */}
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={MAP_HEIGHT} fill="#060b17" />

          {/* Grid lines */}
          {[1, 2, 3, 4].map((i) => (
            <Line
              key={`h-${i}`}
              x1="0"
              y1={(MAP_HEIGHT / 5) * i}
              x2={SCREEN_WIDTH}
              y2={(MAP_HEIGHT / 5) * i}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
          ))}
          {[1, 2, 3].map((i) => (
            <Line
              key={`v-${i}`}
              x1={(SCREEN_WIDTH / 4) * i}
              y1="0"
              x2={(SCREEN_WIDTH / 4) * i}
              y2={MAP_HEIGHT}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
          ))}

          {/* Radar range rings centered in Switzerland */}
          <Circle
            cx={SCREEN_WIDTH * 0.52}
            cy={MAP_HEIGHT * 0.48}
            r={SCREEN_WIDTH * 0.22}
            stroke="rgba(56, 189, 248, 0.12)"
            strokeWidth="1"
            fill="none"
          />
          <Circle
            cx={SCREEN_WIDTH * 0.52}
            cy={MAP_HEIGHT * 0.48}
            r={SCREEN_WIDTH * 0.38}
            stroke="rgba(56, 189, 248, 0.08)"
            strokeWidth="1"
            fill="none"
          />

          {/* Reference cities & landmark labels */}
          {CITIES.map((city, cIdx) => {
            const pt = projectToSvg(city.lon, city.lat, SCREEN_WIDTH, MAP_HEIGHT);
            return (
              <G key={cIdx}>
                <Circle cx={pt.x} cy={pt.y} r="2.5" fill="#64748b" />
                <SvgText
                  x={pt.x + 5}
                  y={pt.y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="600"
                >
                  {city.name}
                </SvgText>
              </G>
            );
          })}

          {/* Render Active Storm Polygons */}
          {storms.map((storm) => {
            const isSelected = storm.id === selectedStormId;
            const pt = projectToSvg(storm.position.lon, storm.position.lat, SCREEN_WIDTH, MAP_HEIGHT);
            const radius = Math.max(16, Math.sqrt(storm.area_km2 || 300) * 1.1) * (uncertaintyScale > 1 ? 1.3 : 1);

            // Severity color
            const stormColor =
              storm.severity === 'EXTREME'
                ? '#e11d48'
                : storm.severity === 'HIGH'
                ? '#f97316'
                : '#eab308';

            // Uncertainty expanded outer cone
            const outerRadius = radius * uncertaintyScale;

            return (
              <G key={storm.id}>
                {/* Expanded Uncertainty Ring */}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={outerRadius}
                  fill={radarActive ? `${stormColor}12` : 'rgba(239, 68, 68, 0.22)'}
                  stroke={radarActive ? `${stormColor}33` : '#ef4444'}
                  strokeWidth={radarActive ? '1' : '1.5'}
                  strokeDasharray={radarActive ? undefined : '3,3'}
                />

                {/* Core Intensity Ring */}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={radius}
                  fill={`${stormColor}40`}
                  stroke={stormColor}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                />

                {/* Centroid Bullseye */}
                <Circle cx={pt.x} cy={pt.y} r="4" fill={stormColor} />
                <Circle cx={pt.x} cy={pt.y} r="2" fill="#ffffff" />

                {/* Velocity vector line */}
                {storm.speed_kmh && (
                  <Line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x + Math.sin((storm.direction * Math.PI) / 180) * 26}
                    y2={pt.y - Math.cos((storm.direction * Math.PI) / 180) * 26}
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}

                {/* Storm Name & Peak dBZ Tag */}
                <SvgText
                  x={pt.x}
                  y={pt.y - radius - 6}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {storm.name}
                </SvgText>
                <SvgText
                  x={pt.x}
                  y={pt.y - radius + 5}
                  fill={stormColor}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {storm.max_dbz} dBZ
                </SvgText>
              </G>
            );
          })}
        </Svg>

        {/* Transparent touch buttons over each storm for instant mobile interaction */}
        {storms.map((storm) => {
          const pt = projectToSvg(storm.position.lon, storm.position.lat, SCREEN_WIDTH, MAP_HEIGHT);
          return (
            <TouchableOpacity
              key={`touch-${storm.id}`}
              style={[
                styles.stormHitArea,
                {
                  left: pt.x - 32,
                  top: pt.y - 32,
                },
              ]}
              onPress={() => setSelectedStormId(storm.id === selectedStormId ? null : storm.id)}
              activeOpacity={0.7}
            />
          );
        })}

        {/* Legend Overlay at top right of map */}
        <View style={styles.mapLegend}>
          <Text style={styles.legendTitle}>RADAR dBZ</Text>
          <View style={styles.legendBar}>
            <View style={[styles.legendStep, { backgroundColor: '#10b981' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#eab308' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#f97316' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#e11d48' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#d946ef' }]} />
          </View>
          <View style={styles.legendLabels}>
            <Text style={styles.legendText}>35</Text>
            <Text style={styles.legendText}>50</Text>
            <Text style={styles.legendText}>65+</Text>
          </View>
        </View>

        {/* Region context badge */}
        <View style={styles.regionBadge}>
          <Text style={styles.regionText}>SWISS ALPS • RAD4ALPS</Text>
        </View>
      </View>

      {/* Docked Timeline Controls at bottom of map */}
      <TimelineControl
        frameIndex={frameIndex}
        setFrameIndex={setFrameIndex}
        totalFrames={totalFrames}
        nowFrameIndex={nowFrameIndex}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
      />

      {/* Selected Storm Detail Bottom Sheet */}
      {selectedStorm && (
        <StormBottomSheet
          storm={selectedStorm}
          onClose={() => setSelectedStormId(null)}
          onNavigateToHazards={onNavigateToHazards}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060b17',
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  stormHitArea: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    zIndex: 10,
  },
  mapLegend: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(10, 15, 29, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 6,
    width: 86,
  },
  legendTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  legendBar: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 2,
  },
  legendStep: {
    flex: 1,
    height: '100%',
  },
  legendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#64748b',
  },
  regionBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(10, 15, 29, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  regionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
});
