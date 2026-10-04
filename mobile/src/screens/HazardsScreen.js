import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  AlertTriangle,
  Zap,
  CloudRain,
  Wind,
  ShieldAlert,
  Flame,
} from 'lucide-react-native';

export default function HazardsScreen({ storms = [] }) {
  // Aggregate highest hazards across all active cells
  const maxLightning = Math.max(...storms.map((s) => s.hazards?.lightning || 0.6), 0.75);
  const maxHail = Math.max(...storms.map((s) => s.hazards?.hail || 0.5), 0.68);
  const maxRain = Math.max(...storms.map((s) => s.hazards?.extreme_rain || 0.7), 0.88);
  const maxDownburst = Math.max(...storms.map((s) => s.hazards?.downburst || 0.4), 0.62);

  const hazardCards = [
    {
      title: 'Flash Cloudburst & Rain Rate',
      icon: CloudRain,
      prob: Math.round(maxRain * 100),
      severity: 'CRITICAL',
      color: '#38bdf8',
      metrics: [
        { label: 'Max Rate', value: '72 mm/hr' },
        { label: 'Peak VIL', value: '54 kg/m²' },
        { label: 'Runoff Risk', value: 'High' },
      ],
      advisory: 'Flash flood danger in steep Alpine catchments and urban drainage networks.',
    },
    {
      title: 'Severe Hail Potential',
      icon: Flame,
      prob: Math.round(maxHail * 100),
      severity: 'WARNING',
      color: '#f43f5e',
      metrics: [
        { label: 'Est. Diameter', value: '2.5 – 4.0 cm' },
        { label: 'Echo Top', value: '13.8 km' },
        { label: 'Crop Risk', value: 'Extreme' },
      ],
      advisory: 'Severe property and vehicle body damage expected. Move vehicles under cover.',
    },
    {
      title: 'Microburst & Squall Winds',
      icon: Wind,
      prob: Math.round(maxDownburst * 100),
      severity: 'WARNING',
      color: '#a855f7',
      metrics: [
        { label: 'Peak Gusts', value: '98 km/h' },
        { label: 'DCAPE', value: '1150 J/kg' },
        { label: 'Shear Index', value: 'Severe' },
      ],
      advisory: 'Aviation low-level wind shear alert active. Construction crane ops suspended.',
    },
    {
      title: 'Intense Lightning Grid',
      icon: Zap,
      prob: Math.round(maxLightning * 100),
      severity: 'ACTIVE',
      color: '#eab308',
      metrics: [
        { label: 'Flash Rate', value: '44 /min' },
        { label: 'Stroke Peak', value: '62 kA' },
        { label: 'Grid Strike', value: 'High' },
      ],
      advisory: 'Substation lightning arrestor alert. Outdoor sports events must pause.',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Severe Hazard Matrix</Text>
        <Text style={styles.subtitle}>
          Multivariate classification derived from radar reflectivity, VIL, and NWP thermodynamic indices
        </Text>
      </View>

      {hazardCards.map((card, idx) => {
        const IconComponent = card.icon;

        return (
          <View key={idx} style={styles.card}>
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={styles.titleGroup}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${card.color}18`, borderColor: `${card.color}35` },
                  ]}
                >
                  <IconComponent size={18} color={card.color} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={[styles.probText, { color: card.color }]}>
                    {card.prob}% Risk Probability
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.sevBadge,
                  { backgroundColor: `${card.color}22`, borderColor: `${card.color}55` },
                ]}
              >
                <Text style={[styles.sevText, { color: card.color }]}>
                  {card.severity}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.probTrack}>
              <View
                style={[
                  styles.probFill,
                  { width: `${card.prob}%`, backgroundColor: card.color },
                ]}
              />
            </View>

            {/* Quantitative Metrics Row */}
            <View style={styles.metricsRow}>
              {card.metrics.map((m, mIdx) => (
                <View key={mIdx} style={styles.metricCell}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricVal}>{m.value}</Text>
                </View>
              ))}
            </View>

            {/* Civil Advisory */}
            <View style={styles.advisoryBox}>
              <ShieldAlert size={12} color="#94a3b8" style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={styles.advisoryText}>{card.advisory}</Text>
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
  card: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  probText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  sevBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sevText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  probTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  probFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 9,
    padding: 8,
    marginBottom: 10,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  advisoryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    padding: 8,
  },
  advisoryText: {
    fontSize: 10,
    color: '#94a3b8',
    flex: 1,
    lineHeight: 14,
  },
});
