import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  Award,
  Activity,
  Layers,
  CheckCircle,
  Clock,
  ShieldCheck,
  Zap,
  Target,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReplayScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameStep, setFrameStep] = useState(19); // 0 to 37

  // Playback timer loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setFrameStep((prev) => (prev >= 37 ? 0 : prev + 1));
      }, 450);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Frame timestamp computation
  const baseMinutes = 20 * 60 + 45 + frameStep * 5;
  const h = Math.floor(baseMinutes / 60) % 24;
  const m = baseMinutes % 60;
  const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} UTC`;
  const isForecastFrame = frameStep >= 20;

  // Normalized progress & trajectory
  const t = frameStep / 37;
  const currentLat = (46.40 + (47.15 - 46.40) * t).toFixed(2);
  const currentLon = (8.15 + (9.05 - 8.15) * t).toFixed(2);

  const aiDbz = isForecastFrame
    ? Math.max(50, 74 - (frameStep - 19) * 0.8).toFixed(0)
    : '74';
  const trueDbz = isForecastFrame
    ? Math.max(48, 74 - (frameStep - 19) * 0.9).toFixed(0)
    : '74';

  const csiProgress = isForecastFrame
    ? Math.max(0.68, 0.82 - (frameStep - 19) * 0.007).toFixed(2)
    : '0.84';
  const agreementPct = isForecastFrame
    ? Math.max(86, 96 - (frameStep - 19) * 0.5).toFixed(1)
    : '98.5';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title & Case Study Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerBadge}>
          <Activity size={14} color="#60a5fa" />
          <Text style={styles.headerBadgeText}>HISTORICAL BENCHMARK SUITE</Text>
        </View>
        <Text style={styles.caseTitle}>Swiss Alpine Supercell & Derecho</Text>
        <Text style={styles.caseSubtitle}>
          PySTEPS & MeteoSwiss Benchmark Validation &bull; Event #2024-CH-07
        </Text>
      </View>

      {/* Replay Playback & Scrubbing Controller */}
      <View style={styles.controllerCard}>
        <View style={styles.controllerTopRow}>
          <TouchableOpacity
            style={[styles.playBtn, isPlaying ? styles.pauseBtn : styles.playBtnActive]}
            onPress={() => setIsPlaying(!isPlaying)}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <>
                <Pause size={16} color="#fff" />
                <Text style={styles.playBtnText}>Pause Replay</Text>
              </>
            ) : (
              <>
                <Play size={16} color="#fff" fill="#fff" />
                <Text style={styles.playBtnText}>Play Benchmark</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setIsPlaying(false);
              setFrameStep(19);
            }}
          >
            <RotateCcw size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Time display & Status tag */}
        <View style={styles.timeRow}>
          <View style={styles.timeTag}>
            <Clock size={12} color="#94a3b8" />
            <Text style={styles.timeTagText}>{timeStr}</Text>
          </View>
          <View
            style={[
              styles.statusTag,
              isForecastFrame ? styles.statusForecast : styles.statusTruth,
            ]}
          >
            <Text
              style={[
                styles.statusTagText,
                isForecastFrame ? styles.statusForecastText : styles.statusTruthText,
              ]}
            >
              {isForecastFrame
                ? `DGMR AI Forecast (+${(frameStep - 19) * 5}m)`
                : `Observed Doppler Ground Truth`}
            </Text>
          </View>
        </View>

        {/* Timeline Bar with Frame Dots */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineBar}>
            <View
              style={[
                styles.timelineObserved,
                { width: `${(Math.min(frameStep, 19) / 37) * 100}%` },
              ]}
            />
            {frameStep > 19 && (
              <View
                style={[
                  styles.timelinePredicted,
                  {
                    left: `${(19 / 37) * 100}%`,
                    width: `${((frameStep - 19) / 37) * 100}%`,
                  },
                ]}
              />
            )}
            <View
              style={[styles.scrubberThumb, { left: `${(frameStep / 37) * 100}%` }]}
            />
          </View>
        </View>

        {/* Quick Stepper Buttons */}
        <View style={styles.stepButtonsRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setFrameStep((p) => Math.max(0, p - 1))}
          >
            <Text style={styles.stepBtnText}>-5 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stepBtn, frameStep === 19 && styles.stepBtnActive]}
            onPress={() => setFrameStep(19)}
          >
            <Text style={[styles.stepBtnText, frameStep === 19 && styles.stepBtnActiveText]}>
              T=0 (Now)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setFrameStep((p) => Math.min(37, p + 1))}
          >
            <Text style={styles.stepBtnText}>+5 min</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dual Real-Time Comparison: DGMR AI vs Ground-Truth Truth */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionHeader}>DUAL REPLAY SYNCHRONIZATION</Text>

        <View style={styles.dualCardContainer}>
          {/* DGMR AI Card */}
          <View style={[styles.modelCard, styles.aiCard]}>
            <View style={styles.modelHeader}>
              <View style={[styles.dotIndicator, { backgroundColor: '#a855f7' }]} />
              <Text style={styles.aiTitle}>DGMR DeepMind AI</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Core Intensity</Text>
              <Text style={[styles.metricValue, { color: '#c084fc' }]}>{aiDbz} dBZ</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Predicted Center</Text>
              <Text style={styles.coordValue}>{currentLat}°N, {currentLon}°E</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Advection Method</Text>
              <Text style={styles.pillText}>Generative ResNet</Text>
            </View>
          </View>

          {/* MeteoSwiss Truth Card */}
          <View style={[styles.modelCard, styles.truthCard]}>
            <View style={styles.modelHeader}>
              <View style={[styles.dotIndicator, { backgroundColor: '#38bdf8' }]} />
              <Text style={styles.truthTitle}>MeteoSwiss Ground Truth</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Observed Core</Text>
              <Text style={[styles.metricValue, { color: '#38bdf8' }]}>{trueDbz} dBZ</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Radar Origin</Text>
              <Text style={styles.coordValue}>Albis & Plaine Morte</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Verification Status</Text>
              <Text style={[styles.pillText, { color: '#34d399' }]}>Calibrated</Text>
            </View>
          </View>
        </View>

        {/* Agreement Delta Meter */}
        <View style={styles.agreementCard}>
          <View style={styles.agreementHeader}>
            <Text style={styles.agreementLabel}>Model Agreement & Spatial Fidelity</Text>
            <Text style={styles.agreementValue}>{agreementPct}%</Text>
          </View>
          <View style={styles.agreementTrack}>
            <View style={[styles.agreementFill, { width: `${agreementPct}%` }]} />
          </View>
          <Text style={styles.agreementSub}>
            Dynamic lead-time CSI @ 35 dBZ: <Text style={{ color: '#34d399', fontWeight: 'bold' }}>{csiProgress}</Text> (PySTEPS baseline: 0.54)
          </Text>
        </View>
      </View>

      {/* Quantitative Verification Metrics Table */}
      <View style={styles.metricsCard}>
        <View style={styles.metricsCardHeader}>
          <Award size={18} color="#f59e0b" />
          <Text style={styles.metricsCardTitle}>VERIFICATION METRICS BENCHMARK</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Critical Success Index (CSI @ 35 dBZ)</Text>
          <Text style={[styles.tableVal, { color: '#34d399' }]}>0.74 (+18%)</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Probability of Detection (POD)</Text>
          <Text style={[styles.tableVal, { color: '#60a5fa' }]}>0.82</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>False Alarm Ratio (FAR)</Text>
          <Text style={[styles.tableVal, { color: '#f87171' }]}>0.18 (-32%)</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Continuous Ranked Probability (CRPS)</Text>
          <Text style={[styles.tableVal, { color: '#c084fc' }]}>1.12 mm/h</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Early Warning Advance Notice Gain</Text>
          <Text style={[styles.tableVal, { color: '#f59e0b' }]}>+34 Minutes</Text>
        </View>

        <View style={styles.notesBox}>
          <ShieldCheck size={14} color="#34d399" />
          <Text style={styles.notesText}>
            DGMR achieves superior convective cell preservation through mountainous Alpine topography compared to classical optical flow methods which suffer from rapid numerical diffusion.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060b17',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#111622',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.7)',
    marginBottom: 16,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60a5fa',
    letterSpacing: 0.8,
  },
  caseTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  caseSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  controllerCard: {
    backgroundColor: '#0d1322',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginBottom: 16,
  },
  controllerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  playBtnActive: {
    backgroundColor: '#2563eb',
  },
  pauseBtn: {
    backgroundColor: '#ef4444',
  },
  playBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  resetBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeTagText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusTruth: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  statusForecast: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTruthText: {
    color: '#38bdf8',
  },
  statusForecastText: {
    color: '#c084fc',
  },
  timelineContainer: {
    marginVertical: 8,
  },
  timelineBar: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  timelineObserved: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#38bdf8',
    borderRadius: 4,
  },
  timelinePredicted: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#a855f7',
    borderRadius: 4,
  },
  scrubberThumb: {
    position: 'absolute',
    top: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginLeft: -9,
  },
  stepButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stepBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  stepBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  stepBtnText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  stepBtnActiveText: {
    color: '#60a5fa',
  },
  comparisonSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  dualCardContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 10,
  },
  modelCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  aiCard: {
    backgroundColor: '#131127',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  truthCard: {
    backgroundColor: '#0c1626',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiTitle: {
    color: '#c084fc',
    fontSize: 13,
    fontWeight: 'bold',
  },
  truthTitle: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  coordValue: {
    fontSize: 11,
    color: '#e2e8f0',
    fontFamily: 'monospace',
  },
  pillText: {
    fontSize: 10,
    color: '#c084fc',
    fontWeight: '600',
  },
  agreementCard: {
    backgroundColor: '#111622',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  agreementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  agreementLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  agreementValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#34d399',
    fontFamily: 'monospace',
  },
  agreementTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  agreementFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  agreementSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  metricsCard: {
    backgroundColor: '#111622',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.7)',
  },
  metricsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metricsCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tableLabel: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
  },
  tableVal: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  notesBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  notesText: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
    flex: 1,
  },
});
