import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Radio,
  Satellite,
  Zap,
  Cpu,
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Database,
  Terminal,
  UploadCloud,
} from 'lucide-react-native';

export default function SensorsScreen({
  radarActive = true,
  onToggleRadar,
  onResetSystem,
  apiBase = 'https://sih2k26-ps26084.onrender.com',
}) {
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestionResult, setIngestionResult] = useState(null);

  const handleIngestPreset = async (preset, source_name) => {
    setIngesting(true);
    try {
      const res = await fetch(`${apiBase}/api/ingest/radar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset, source_name }),
      });
      const data = await res.json();
      setIngestionResult(data);
    } catch (e) {
      setIngestionResult({
        status: 'error',
        message: e.message || 'Ingestion failed',
      });
    } finally {
      setIngesting(false);
    }
  };

  const handleRadarPress = async () => {
    setLoading(true);
    try {
      await onToggleRadar();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPress = async () => {
    setLoading(true);
    try {
      await onResetSystem();
    } finally {
      setLoading(false);
    }
  };

  const sensors = [
    {
      name: 'MeteoSwiss Doppler Rad4Alps Composite',
      type: 'Polarimetric C-Band (5 Stations)',
      offline: !radarActive,
      latency: radarActive ? '2.5 min' : 'OFFLINE',
      resolution: '1.0 km / 5 min sweep',
      icon: Radio,
    },
    {
      name: 'EUMETSAT Meteosat SEVIRI Satellite',
      type: 'Geostationary Thermal IR & WV',
      offline: false,
      latency: '15 min',
      resolution: '3.0 km IR pixel',
      icon: Satellite,
    },
    {
      name: 'EUCLID Total Lightning Network',
      type: 'Time-of-Arrival (TOA) Sensors',
      offline: false,
      latency: 'Real-time (<10s)',
      resolution: '500m stroke accuracy',
      icon: Zap,
    },
    {
      name: 'COSMO-1E Numerical Weather Prediction',
      type: 'NWP Convection-Permitting Model',
      offline: false,
      latency: '3-hour cycle',
      resolution: '1.1 km terrain-following',
      icon: Cpu,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Sensor Feeds & Fallback Resilience</Text>
        <Text style={styles.subtitle}>
          Interactive demonstration of multi-sensor resilience when ground Doppler radar drops offline
        </Text>
      </View>

      {/* Interactive Outage Simulation Box */}
      <View style={styles.interactiveCard}>
        <Text style={styles.cardHeaderTitle}>HARDWARE FAILURE SIMULATION CONSOLE</Text>
        <Text style={styles.cardHeaderSub}>
          Tap below to test how the ClimaX DGMR pipeline dynamically adapts uncertainty bounds
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              !radarActive ? styles.actionBtnOffline : styles.actionBtnSimulate,
            ]}
            onPress={handleRadarPress}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : !radarActive ? (
              <RotateCcw size={16} color="#ffffff" style={{ marginRight: 6 }} />
            ) : (
              <AlertOctagon size={16} color="#ffffff" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.actionBtnText}>
              {!radarActive ? 'Restore Doppler Radar' : 'Simulate Radar Outage'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetPress}
            disabled={loading}
            activeOpacity={0.7}
          >
            <RotateCcw size={14} color="#94a3b8" style={{ marginRight: 5 }} />
            <Text style={styles.resetBtnText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Live Fallback Warning Banner */}
        {!radarActive && (
          <View style={styles.alertBanner}>
            <AlertOctagon size={18} color="#ef4444" style={{ marginRight: 8, marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>RADAR SENSOR OUTAGE ACTIVE</Text>
              <Text style={styles.alertBody}>
                Pipeline has switched to <Text style={styles.boldWhite}>DGMR Neural Fallback</Text>.
                Uncertainty polygons expanded by <Text style={styles.boldWhite}>2.5x</Text> using
                Satellite IR & Lightning proxies.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 1-Tap National Radar Ingestion Engine */}
      <View style={styles.ingestionCard}>
        <View style={styles.ingestionHeader}>
          <Database size={15} color="#38bdf8" style={{ marginRight: 6 }} />
          <Text style={styles.cardHeaderTitle}>RADAR SCAN INGESTION PIPELINE</Text>
        </View>
        <Text style={styles.cardHeaderSub}>
          Simulate direct radar sweep ingestion into the DGMR neural nowcasting pipeline:
        </Text>

        <View style={styles.presetCol}>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleIngestPreset('meteoswiss_rad4alps', 'MeteoSwiss Rad4Alps Composite')}
            disabled={ingesting}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.presetTitle}>MeteoSwiss Rad4Alps</Text>
              <Text style={styles.presetSub}>5 C-Band Radars • 1.0 km • Alpine grid</Text>
            </View>
            <Text style={styles.presetAction}>INGEST</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleIngestPreset('imd_kolkata_doppler', 'IMD Kolkata S-Band Doppler (DWR)')}
            disabled={ingesting}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.presetTitle}>IMD Kolkata Doppler</Text>
              <Text style={styles.presetSub}>India Met Dept DWR • 250 km radius</Text>
            </View>
            <Text style={[styles.presetAction, { color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }]}>INGEST</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleIngestPreset('noaa_nexrad_volume', 'NOAA NEXRAD WSR-88D Level-II')}
            disabled={ingesting}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.presetTitle}>NOAA NEXRAD Volume</Text>
              <Text style={styles.presetSub}>Super-Res Base Reflectivity</Text>
            </View>
            <Text style={[styles.presetAction, { color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }]}>INGEST</Text>
          </TouchableOpacity>
        </View>

        {ingesting && (
          <View style={styles.ingestingRow}>
            <ActivityIndicator size="small" color="#38bdf8" style={{ marginRight: 8 }} />
            <Text style={styles.ingestingText}>Processing 4D DGMR Tensor...</Text>
          </View>
        )}

        {ingestionResult && (
          <View style={styles.telemetryBox}>
            <View style={styles.telemetryHeader}>
              <CheckCircle2 size={13} color="#10b981" style={{ marginRight: 5 }} />
              <Text style={styles.telemetryTitle}>
                {ingestionResult.status === 'success' ? 'Scan Ingested & DGMR Tensor Ready' : 'Ingestion Response'}
              </Text>
            </View>
            <Text style={styles.telemetryBody}>
              {ingestionResult.message || JSON.stringify(ingestionResult, null, 2)}
            </Text>
            {ingestionResult.dgmr_input_tensor && (
              <View style={styles.tensorBadge}>
                <Text style={styles.tensorBadgeText}>
                  Tensor: [1, 4, 1, 256, 256] • Horizon: 90m (18 frames)
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Sensor Ingestion Feeds List */}
      <Text style={styles.sectionHeader}>METEOROLOGICAL TELEMETRY STATUS</Text>

      {sensors.map((sensor, idx) => {
        const IconComponent = sensor.icon;
        const isOffline = sensor.offline;

        return (
          <View key={idx} style={styles.sensorCard}>
            <View style={styles.sensorTop}>
              <View
                style={[
                  styles.sensorIconBox,
                  { backgroundColor: isOffline ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' },
                ]}
              >
                <IconComponent
                  size={18}
                  color={isOffline ? '#ef4444' : '#10b981'}
                />
              </View>

              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{sensor.name}</Text>
                <Text style={styles.sensorType}>{sensor.type}</Text>
              </View>

              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: isOffline ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' },
                ]}
              >
                {isOffline ? (
                  <XCircle size={10} color="#ef4444" style={{ marginRight: 3 }} />
                ) : (
                  <CheckCircle2 size={10} color="#10b981" style={{ marginRight: 3 }} />
                )}
                <Text
                  style={[
                    styles.statusTagText,
                    { color: isOffline ? '#ef4444' : '#10b981' },
                  ]}
                >
                  {isOffline ? 'OFFLINE' : 'ONLINE'}
                </Text>
              </View>
            </View>

            <View style={styles.sensorMetricsRow}>
              <View style={styles.sensorMetric}>
                <Text style={styles.metricKey}>INGESTION LATENCY</Text>
                <Text style={styles.metricVal}>{sensor.latency}</Text>
              </View>
              <View style={styles.sensorDivider} />
              <View style={styles.sensorMetric}>
                <Text style={styles.metricKey}>SPATIAL RESOLUTION</Text>
                <Text style={styles.metricVal}>{sensor.resolution}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060b17',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerBox: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
  },
  interactiveCard: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  cardHeaderSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionBtnSimulate: {
    backgroundColor: '#dc2626',
  },
  actionBtnOffline: {
    backgroundColor: '#16a34a',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  alertBanner: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  alertBody: {
    fontSize: 10,
    color: '#fca5a5',
    lineHeight: 14,
  },
  boldWhite: {
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sensorCard: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  sensorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sensorIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
  },
  sensorType: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusTagText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  sensorMetricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 7,
  },
  sensorMetric: {
    flex: 1,
  },
  metricKey: {
    fontSize: 7,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 1,
  },
  metricVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  sensorDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 8,
  },
  ingestionCard: {
    backgroundColor: '#0c1322',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 20,
  },
  ingestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetCol: {
    marginTop: 10,
    gap: 8,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070b14',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
  },
  presetTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  presetSub: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 1,
  },
  presetAction: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  ingestingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ingestingText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  telemetryBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  telemetryTitle: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  telemetryBody: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
  },
  tensorBadge: {
    backgroundColor: '#070b14',
    padding: 4,
    borderRadius: 4,
    marginTop: 6,
  },
  tensorBadgeText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
