import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Navigation, Activity, Clock, ShieldAlert, ArrowRight } from 'lucide-react-native';

export default function StormBottomSheet({ storm, onClose, onNavigateToHazards }) {
  if (!storm) return null;

  const severityColor =
    storm.severity === 'EXTREME'
      ? '#ef4444'
      : storm.severity === 'HIGH'
      ? '#f97316'
      : '#eab308';

  return (
    <View style={styles.sheetContainer}>
      {/* Drag handle */}
      <View style={styles.handleBar} />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.severityBadge, { backgroundColor: `${severityColor}22`, borderColor: `${severityColor}66` }]}>
              <Text style={[styles.severityText, { color: severityColor }]}>
                {storm.severity}
              </Text>
            </View>
            <Text style={styles.hazardType}>{storm.hazard_type || 'Thunderstorm'}</Text>
          </View>
          <Text style={styles.stormName}>{storm.name || storm.id}</Text>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Key Metric Chips Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PEAK INTENSITY</Text>
          <Text style={[styles.metricValue, { color: '#f43f5e' }]}>
            {storm.max_dbz ?? 65} <Text style={styles.unitText}>dBZ</Text>
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>TRACK VELOCITY</Text>
          <Text style={styles.metricValue}>
            {storm.speed_kmh ?? 45} <Text style={styles.unitText}>km/h</Text>
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>CELL COVERAGE</Text>
          <Text style={styles.metricValue}>
            {storm.area_km2 ?? 380} <Text style={styles.unitText}>km²</Text>
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>LIFECYCLE</Text>
          <Text style={[styles.metricValue, { color: '#38bdf8' }]}>
            {storm.lifecycle || 'Mature'}
          </Text>
        </View>
      </View>

      {/* Target Arrival Impact Banner */}
      <View style={styles.targetBanner}>
        <View style={styles.targetIcon}>
          <Clock size={16} color="#38bdf8" />
        </View>
        <View style={styles.targetInfo}>
          <Text style={styles.targetLabel}>IMPACT TARGET ETA</Text>
          <Text style={styles.targetName}>
            {storm.nearest_target || 'Central Swiss Corridor'}
          </Text>
        </View>
        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>~{storm.eta_minutes ?? 25} min</Text>
        </View>
      </View>

      {/* CTA Button */}
      {onNavigateToHazards && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onNavigateToHazards(storm.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>View Full Hazard Breakdown</Text>
          <ArrowRight size={15} color="#ffffff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0c1324',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hazardType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  stormName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 8,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  unitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 10,
    padding: 9,
    marginBottom: 10,
  },
  targetIcon: {
    marginRight: 8,
  },
  targetInfo: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 0.4,
  },
  targetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  etaBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  etaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
