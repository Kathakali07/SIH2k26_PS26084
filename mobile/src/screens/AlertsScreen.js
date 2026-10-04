import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert as NativeAlert,
} from 'react-native';
import {
  BellRing,
  AlertTriangle,
  Radio,
  Share2,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react-native';

const SAMPLE_ALERTS = [
  {
    id: 'CAP-2026-CH-0481',
    event: 'Severe Thunderstorm & Large Hail Warning',
    headline: 'High-Reflectivity Supercell Core (>70 dBZ) Approaching Gotthard Pass',
    urgency: 'Immediate',
    severity: 'Extreme',
    certainty: 'Observed / High',
    effective: 'Valid until T+60 min (21:45 UTC)',
    areas: ['Canton of Uri', 'Central Lucerne', 'Schwyz Alpine Highway A2'],
    instructions:
      'Avoid high-altitude passes. Park vehicles under sturdy cover. Secure loose outdoor objects immediately.',
  },
  {
    id: 'CAP-2026-CH-0482',
    event: 'Flash Cloudburst & Urban Drainage Flood Watch',
    headline: 'Rapid Convective Initiation with Rain Rates Exceeding 70 mm/hr',
    urgency: 'Expected',
    severity: 'Severe',
    certainty: 'Likely (84%)',
    effective: 'Valid until T+90 min (22:15 UTC)',
    areas: ['Bernese Oberland', 'Interlaken Catchment'],
    instructions:
      'Stay away from culverts, creek banks, and mountain streams. Do not enter basements during peak rainfall.',
  },
];

export default function AlertsScreen() {
  const [broadcasted, setBroadcasted] = useState(false);

  const handleBroadcastSim = (id) => {
    setBroadcasted(true);
    setTimeout(() => {
      NativeAlert.alert(
        'CAP v1.2 Broadcast Dispatched',
        `Alert payload ${id} successfully formatted into OASIS CAP v1.2 XML and transmitted to the National Alert Gateway.`,
        [{ text: 'OK', onPress: () => setBroadcasted(false) }]
      );
    }, 400);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <View style={styles.badgeRow}>
          <View style={styles.capBadge}>
            <Radio size={11} color="#ec4899" style={{ marginRight: 4 }} />
            <Text style={styles.capBadgeText}>OASIS CAP v1.2 Standard</Text>
          </View>
        </View>
        <Text style={styles.title}>Civil Defense & Alerts</Text>
        <Text style={styles.subtitle}>
          Automated multi-hazard emergency warnings formatted for national alert gateways & siren grids
        </Text>
      </View>

      {SAMPLE_ALERTS.map((alert) => {
        const isExtreme = alert.severity === 'Extreme';

        return (
          <View key={alert.id} style={styles.alertCard}>
            {/* Header */}
            <View style={styles.alertHeader}>
              <View style={styles.alertTitleRow}>
                <AlertTriangle
                  size={16}
                  color={isExtreme ? '#ef4444' : '#f97316'}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.alertEvent}>{alert.event}</Text>
              </View>

              <View
                style={[
                  styles.severityPill,
                  {
                    backgroundColor: isExtreme ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                    borderColor: isExtreme ? 'rgba(239, 68, 68, 0.5)' : 'rgba(249, 115, 22, 0.5)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.severityPillText,
                    { color: isExtreme ? '#ef4444' : '#f97316' },
                  ]}
                >
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Headline */}
            <Text style={styles.headlineText}>{alert.headline}</Text>

            {/* Alert metadata chips */}
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Clock size={11} color="#64748b" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{alert.effective}</Text>
              </View>
            </View>

            {/* Target Zones */}
            <View style={styles.zonesBox}>
              <MapPin size={12} color="#38bdf8" style={{ marginRight: 5, marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.zonesLabel}>IMPACTED REGIONS:</Text>
                <Text style={styles.zonesText}>{alert.areas.join(' • ')}</Text>
              </View>
            </View>

            {/* Protective Action Instructions */}
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>CIVIL DEFENSE ADVISORY:</Text>
              <Text style={styles.instructionsText}>{alert.instructions}</Text>
            </View>

            {/* Action Bar */}
            <TouchableOpacity
              style={styles.broadcastBtn}
              onPress={() => handleBroadcastSim(alert.id)}
              activeOpacity={0.8}
            >
              <Radio size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.broadcastBtnText}>Dispatch CAP Broadcast (Simulate)</Text>
            </TouchableOpacity>
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
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  capBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  capBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f472b6',
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
  alertCard: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  alertEvent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
    flexShrink: 1,
  },
  severityPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  severityPillText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    lineHeight: 16,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '600',
  },
  zonesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  zonesLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  zonesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc',
  },
  instructionsBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    padding: 9,
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  instructionsText: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
  },
  broadcastBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 9,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
