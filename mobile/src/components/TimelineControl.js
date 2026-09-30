import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react-native';

export default function TimelineControl({
  frameIndex,
  setFrameIndex,
  totalFrames = 38,
  nowFrameIndex = 19,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
}) {
  const isForecast = frameIndex >= nowFrameIndex;
  const timeOffset = isForecast
    ? `+${(frameIndex - nowFrameIndex) * 5}m`
    : `-${(nowFrameIndex - frameIndex) * 5}m`;

  const handleStepBack = () => {
    setIsPlaying(false);
    setFrameIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setFrameIndex((prev) => Math.min(totalFrames - 1, prev + 1));
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 400 ? 200 : prev === 200 ? 800 : 400));
  };

  const speedLabel = playbackSpeed === 200 ? '2x' : playbackSpeed === 800 ? '0.5x' : '1x';

  return (
    <View style={styles.container}>
      {/* Top Status & Timestamp Indicator */}
      <View style={styles.statusRow}>
        <View style={styles.timeTag}>
          <Clock size={12} color={isForecast ? '#38bdf8' : '#34d399'} style={{ marginRight: 4 }} />
          <Text style={[styles.timeText, { color: isForecast ? '#38bdf8' : '#34d399' }]}>
            {frameIndex === nowFrameIndex ? 'T+0 (NOW)' : `T${timeOffset}`}
          </Text>
        </View>

        <Text style={styles.modeBadgeText}>
          {isForecast ? 'DGMR 18-Frame AI Forecast' : 'MeteoSwiss Doppler History'}
        </Text>

        <TouchableOpacity style={styles.speedButton} onPress={handleToggleSpeed} activeOpacity={0.7}>
          <Text style={styles.speedText}>{speedLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Touch-Friendly Frame Progress Scrubber */}
      <View style={styles.trackContainer}>
        {/* Visual split line at NOW frame */}
        <View style={styles.trackBackground}>
          <View
            style={[
              styles.observedSegment,
              { width: `${(nowFrameIndex / totalFrames) * 100}%` },
            ]}
          />
          <View
            style={[
              styles.forecastSegment,
              { width: `${((totalFrames - nowFrameIndex) / totalFrames) * 100}%` },
            ]}
          />
        </View>

        {/* Current Playhead indicator */}
        <View
          style={[
            styles.playhead,
            {
              left: `${(frameIndex / (totalFrames - 1)) * 96}%`,
              backgroundColor: isForecast ? '#38bdf8' : '#10b981',
            },
          ]}
        />
      </View>

      {/* Control Buttons Row */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={handleStepBack}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SkipBack size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={handleTogglePlay}
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={18} color="#ffffff" />
          ) : (
            <Play size={18} color="#ffffff" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stepButton}
          onPress={handleStepForward}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SkipForward size={16} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.frameCounter}>
          <Text style={styles.frameCounterText}>
            Frame {frameIndex + 1}/{totalFrames}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0f1d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  speedButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  speedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  trackContainer: {
    height: 12,
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  trackBackground: {
    height: 4,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  observedSegment: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
  },
  forecastSegment: {
    backgroundColor: 'rgba(56, 189, 248, 0.5)',
  },
  playhead: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 16,
  },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  playButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  frameCounter: {
    position: 'absolute',
    right: 0,
  },
  frameCounterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    fontVariant: ['tabular-nums'],
  },
});
