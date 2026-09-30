import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, {
  Rect,
  Circle,
  G,
  Text as SvgText,
  Line,
} from 'react-native-svg';
import TimelineControl from '../components/TimelineControl';
import StormBottomSheet from '../components/StormBottomSheet';
import InteractiveLeafletMap from '../components/InteractiveLeafletMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Switzerland geographic bounds
const SWISS_BOUNDS = {
  minLon: 5.96,
  maxLon: 10.49,
  minLat: 45.6,
  maxLat: 47.81,
};

function projectToSvg(lon, lat, width, height) {
  const x = ((lon - SWISS_BOUNDS.minLon) / (SWISS_BOUNDS.maxLon - SWISS_BOUNDS.minLon)) * width;
  const y = height - ((lat - SWISS_BOUNDS.minLat) / (SWISS_BOUNDS.maxLat - SWISS_BOUNDS.minLat)) * height;
  return { x, y };
}

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

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      {/* Map View Area (Fills entire available height) */}
      <View style={styles.mapContainer}>
        {isWeb ? (
          // Real Interactive Leaflet GIS Map on Web (OpenStreetMap Dark-Tiles + pan + zoom)
          <InteractiveLeafletMap
            storms={storms}
            selectedStormId={selectedStormId}
            onStormSelect={(id) => setSelectedStormId(id)}
            radarActive={radarActive}
            frameIndex={frameIndex}
          />
        ) : (
          // Responsive SVG Canvas Fallback for native devices
          <View style={styles.svgFallbackWrapper}>
            <Svg width="100%" height="100%" viewBox={`0 0 ${SCREEN_WIDTH} 420`}>
              <Rect x="0" y="0" width={SCREEN_WIDTH} height={420} fill="#060b17" />

              {/* Grid Lines */}
              {[1, 2, 3].map((i) => (
                <Line
                  key={`h-${i}`}
                  x1="0"
                  y1={105 * i}
                  x2={SCREEN_WIDTH}
                  y2={105 * i}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Radar Rings */}
              <Circle
                cx={SCREEN_WIDTH * 0.52}
                cy={210}
                r={SCREEN_WIDTH * 0.25}
                stroke="rgba(56, 189, 248, 0.15)"
                strokeWidth="1"
                fill="none"
              />
              <Circle
                cx={SCREEN_WIDTH * 0.52}
                cy={210}
                r={SCREEN_WIDTH * 0.42}
                stroke="rgba(56, 189, 248, 0.08)"
                strokeWidth="1"
                fill="none"
              />

              {/* Swiss Cities */}
              {CITIES.map((city, cIdx) => {
                const pt = projectToSvg(city.lon, city.lat, SCREEN_WIDTH, 420);
                return (
                  <G key={cIdx}>
                    <Circle cx={pt.x} cy={pt.y} r="3" fill="#64748b" />
                    <SvgText
                      x={pt.x + 6}
                      y={pt.y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="700"
                    >
                      {city.name}
                    </SvgText>
                  </G>
                );
              })}

              {/* Storm Cells */}
              {storms.map((storm) => {
                const pt = projectToSvg(storm.position.lon, storm.position.lat, SCREEN_WIDTH, 420);
                const radius = Math.max(18, Math.sqrt(storm.area_km2 || 300) * 1.1);
                const stormColor =
                  storm.severity === 'EXTREME'
                    ? '#ef4444'
                    : storm.severity === 'HIGH'
                    ? '#f97316'
                    : '#eab308';

                return (
                  <G key={storm.id}>
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={radius * uncertaintyScale}
                      fill={radarActive ? `${stormColor}15` : 'rgba(239, 68, 68, 0.2)'}
                      stroke={radarActive ? `${stormColor}40` : '#ef4444'}
                      strokeWidth={radarActive ? '1' : '1.5'}
                      strokeDasharray={radarActive ? undefined : '3,3'}
                    />
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={radius}
                      fill={`${stormColor}45`}
                      stroke={stormColor}
                      strokeWidth="2"
                    />
                    <Circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" />

                    <SvgText
                      x={pt.x}
                      y={pt.y - radius - 6}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {storm.name}
                    </SvgText>
                    <SvgText
                      x={pt.x}
                      y={pt.y - radius + 6}
                      fill={stormColor}
                      fontSize="10"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {storm.max_dbz} dBZ
                    </SvgText>
                  </G>
                );
              })}
            </Svg>

            {/* Tap targets for fallback */}
            {storms.map((storm) => {
              const pt = projectToSvg(storm.position.lon, storm.position.lat, SCREEN_WIDTH, 420);
              return (
                <TouchableOpacity
                  key={`t-${storm.id}`}
                  style={[styles.stormHitArea, { left: pt.x - 30, top: pt.y - 30 }]}
                  onPress={() => setSelectedStormId(storm.id === selectedStormId ? null : storm.id)}
                />
              );
            })}
          </View>
        )}

        {/* Floating Map Legend (Top Right) */}
        <View style={styles.mapLegend}>
          <Text style={styles.legendTitle}>RADAR dBZ</Text>
          <View style={styles.legendBar}>
            <View style={[styles.legendStep, { backgroundColor: '#22c55e' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#eab308' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#f97316' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#ef4444' }]} />
            <View style={[styles.legendStep, { backgroundColor: '#d946ef' }]} />
          </View>
          <View style={styles.legendLabels}>
            <Text style={styles.legendText}>35</Text>
            <Text style={styles.legendText}>50</Text>
            <Text style={styles.legendText}>65+</Text>
          </View>
        </View>

        {/* Region context badge (Top Left) */}
        <View style={styles.regionBadge}>
          <Text style={styles.regionText}>SWISS ALPS • RAD4ALPS</Text>
        </View>
      </View>

      {/* Docked Timeline Controls at bottom */}
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

      {/* Slide-Up Bottom Sheet when a storm is selected */}
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
  svgFallbackWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  stormHitArea: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 10,
  },
  mapLegend: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(10, 15, 29, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: 7,
    width: 92,
    zIndex: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 4,
    textAlign: 'center',
  },
  legendBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
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
    left: 64, // Positioned beside hamburger button
    backgroundColor: 'rgba(10, 15, 29, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  regionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
});
