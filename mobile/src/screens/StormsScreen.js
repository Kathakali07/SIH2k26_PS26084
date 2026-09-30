import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Activity,
  Zap,
  CloudRain,
  Wind,
  Navigation,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react-native';

export default function StormsScreen({ storms = [], onSelectOnMap }) {
  const [expandedId, setExpandedId] = useState(storms[0]?.id || null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Tracked Convective Cells</Text>
        <Text style={styles.subtitle}>
          Storm-as-an-Object (SAO) kinematic state extracted via OpenCV & Hungarian tracking
        </Text>
      </View>

      {storms.map((storm) => {
        const isExpanded = expandedId === storm.id;
        const severityColor =
          storm.severity === 'EXTREME'
            ? '#ef4444'
            : storm.severity === 'HIGH'
            ? '#f97316'
            : '#eab308';

        return (
          <View key={storm.id} style={styles.stormCard}>
            {/* Clickable Card Header */}
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleExpand(storm.id)}
              activeOpacity={0.7}
            >
              <View style={styles.headerLeft}>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: `${severityColor}22`, borderColor: `${severityColor}66` },
                    ]}
                  >
                    <Text style={[styles.severityText, { color: severityColor }]}>
                      {storm.severity}
                    </Text>
                  </View>
                  <Text style={styles.hazardType}>{storm.hazard_type}</Text>
                </View>
                <Text style={styles.stormName}>{storm.name}</Text>
              </View>

              <View style={styles.headerRight}>
                <View style={styles.dbzBadge}>
                  <Text style={styles.dbzValue}>{storm.max_dbz}</Text>
                  <Text style={styles.dbzUnit}>dBZ</Text>
                </View>
                {isExpanded ? (
                  <ChevronUp size={18} color="#94a3b8" />
                ) : (
                  <ChevronDown size={18} color="#94a3b8" />
                )}
              </View>
            </TouchableOpacity>

            {/* Quick Metrics Strip */}
            <View style={styles.quickMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Speed</Text>
                <Text style={styles.metricVal}>{storm.speed_kmh} km/h</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Heading</Text>
                <Text style={styles.metricVal}>{storm.direction}° NE</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Coverage</Text>
                <Text style={styles.metricVal}>{storm.area_km2} km²</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Lifecycle</Text>
                <Text style={[styles.metricVal, { color: '#38bdf8' }]}>
                  {storm.lifecycle}
                </Text>
              </View>
            </View>

            {/* Expanded Detailed Hazard Breakdown */}
            {isExpanded && (
              <View style={styles.expandedSection}>
                <Text style={styles.breakdownTitle}>HAZARD PROBABILITY METRICS</Text>

                {/* Lightning */}
                <View style={styles.hazardRow}>
                  <View style={styles.hazardLabelCol}>
                    <Zap size={14} color="#eab308" style={{ marginRight: 6 }} />
                    <Text style={styles.hazardName}>Total Lightning</Text>
                  </View>
                  <View style={styles.hazardBarTrack}>
                    <View
                      style={[
                        styles.hazardBarFill,
                        {
                          width: `${(storm.hazards?.lightning || 0.8) * 100}%`,
                          backgroundColor: '#eab308',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.hazardPct}>
                    {Math.round((storm.hazards?.lightning || 0.8) * 100)}%
                  </Text>
                </View>

                {/* Hail */}
                <View style={styles.hazardRow}>
                  <View style={styles.hazardLabelCol}>
                    <Activity size={14} color="#f43f5e" style={{ marginRight: 6 }} />
                    <Text style={styles.hazardName}>Severe Hail (&gt;2cm)</Text>
                  </View>
                  <View style={styles.hazardBarTrack}>
                    <View
                      style={[
                        styles.hazardBarFill,
                        {
                          width: `${(storm.hazards?.hail || 0.6) * 100}%`,
                          backgroundColor: '#f43f5e',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.hazardPct}>
                    {Math.round((storm.hazards?.hail || 0.6) * 100)}%
                  </Text>
                </View>

                {/* Cloudburst */}
                <View style={styles.hazardRow}>
                  <View style={styles.hazardLabelCol}>
                    <CloudRain size={14} color="#38bdf8" style={{ marginRight: 6 }} />
                    <Text style={styles.hazardName}>Flash Cloudburst</Text>
                  </View>
                  <View style={styles.hazardBarTrack}>
                    <View
                      style={[
                        styles.hazardBarFill,
                        {
                          width: `${(storm.hazards?.extreme_rain || 0.85) * 100}%`,
                          backgroundColor: '#38bdf8',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.hazardPct}>
                    {Math.round((storm.hazards?.extreme_rain || 0.85) * 100)}%
                  </Text>
                </View>

                {/* Downburst */}
                <View style={styles.hazardRow}>
                  <View style={styles.hazardLabelCol}>
                    <Wind size={14} color="#a855f7" style={{ marginRight: 6 }} />
                    <Text style={styles.hazardName}>Microburst Gusts</Text>
                  </View>
                  <View style={styles.hazardBarTrack}>
                    <View
                      style={[
                        styles.hazardBarFill,
                        {
                          width: `${(storm.hazards?.downburst || 0.7) * 100}%`,
                          backgroundColor: '#a855f7',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.hazardPct}>
                    {Math.round((storm.hazards?.downburst || 0.7) * 100)}%
                  </Text>
                </View>

                {/* Jump to Map Button */}
                {onSelectOnMap && (
                  <TouchableOpacity
                    style={styles.jumpButton}
                    onPress={() => onSelectOnMap(storm.id)}
                    activeOpacity={0.8}
                  >
                    <MapPin size={14} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.jumpText}>Highlight on Live Radar Map</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
  },
  stormCard: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
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
    fontSize: 8,
    fontWeight: '800',
  },
  hazardType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  stormName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dbzBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  dbzValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f43f5e',
    fontVariant: ['tabular-nums'],
  },
  dbzUnit: {
    fontSize: 7,
    fontWeight: '800',
    color: '#fda4af',
  },
  quickMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e2e8f0',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  expandedSection: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  breakdownTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  hazardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  hazardLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 130,
  },
  hazardName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  hazardBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  hazardBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hazardPct: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    width: 32,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  jumpButton: {
    marginTop: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 9,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60a5fa',
  },
});
