import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import TimelineControl from '../components/TimelineControl';
import StormBottomSheet from '../components/StormBottomSheet';
import InteractiveLeafletMap from '../components/InteractiveLeafletMap';

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

  return (
    <View style={styles.container}>
      {/* Primary Map Viewport */}
      <View style={styles.mapContainer}>
        <InteractiveLeafletMap
          storms={storms}
          selectedStormId={selectedStormId}
          onStormSelect={(id) => setSelectedStormId(id)}
          radarActive={radarActive}
          frameIndex={frameIndex}
        />

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
    backgroundColor: '#060b17',
    minHeight: 380,
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
