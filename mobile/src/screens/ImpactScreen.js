import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  Building2,
  Plane,
  Truck,
  Ship,
  Clock,
  Navigation,
  ShieldAlert,
} from 'lucide-react-native';

const TARGETS = [
  {
    id: 'target_01',
    name: 'Zurich Airport (ZRH)',
    category: 'Aviation Hub',
    icon: Plane,
    distance_km: 18.4,
    eta_min: 24,
    severity: 'EXTREME',
    advancing_storm: 'Alpine Supercell',
    speed: '46 km/h',
    action: 'Ground-stop advisory for runway 28. Refueling operations halted.',
  },
  {
    id: 'target_02',
    name: 'Gotthard Highway A2 (North Portal)',
    category: 'Trans-Alpine Freight',
    icon: Truck,
    distance_km: 12.1,
    eta_min: 15,
    severity: 'HIGH',
    advancing_storm: 'Bernese Core Cell',
    speed: '38 km/h',
    action: 'Heavy rain & debris flow risk. Speed restriction lowered to 60 km/h.',
  },
  {
    id: 'target_03',
    name: 'Lake Lucerne Ferry & Waterfront',
    category: 'Marine Transit',
    icon: Ship,
    distance_km: 8.5,
    eta_min: 11,
    severity: 'EXTREME',
    advancing_storm: 'Alpine Supercell',
    speed: '48 km/h',
    action: 'Violent squall warning issued. Commercial and leisure passenger ferries docked.',
  },
  {
    id: 'target_04',
    name: 'Basel EuroAirport (BSL)',
    category: 'Commercial Aviation',
    icon: Plane,
    distance_km: 29.8,
    eta_min: 35,
    severity: 'MODERATE',
    advancing_storm: 'Jura Frontal Cluster',
    speed: '52 km/h',
    action: 'Monitor linear squall line approach. Lightning warning standby active.',
  },
];

export default function ImpactScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Critical Infrastructure Exposure</Text>
        <Text style={styles.subtitle}>
          Real-time spherical Haversine distances & dynamic approach vectors to high-value assets
        </Text>
      </View>

      {TARGETS.map((target) => {
        const IconComponent = target.icon;
        const sevColor =
          target.severity === 'EXTREME'
            ? '#ef4444'
            : target.severity === 'HIGH'
            ? '#f97316'
            : '#eab308';

        return (
          <View key={target.id} style={styles.card}>
            {/* Header row */}
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <IconComponent size={18} color="#38bdf8" />
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.targetName}>{target.name}</Text>
                <Text style={styles.category}>{target.category}</Text>
              </View>
              <View
                style={[
                  styles.sevBadge,
                  { backgroundColor: `${sevColor}22`, borderColor: `${sevColor}55` },
                ]}
              >
                <Text style={[styles.sevText, { color: sevColor }]}>
                  {target.severity}
                </Text>
              </View>
            </View>

            {/* Distance & ETA Row */}
            <View style={styles.statsStrip}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Text style={styles.statValue}>{target.distance_km} km</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>ARRIVAL ETA</Text>
                <View style={styles.etaRow}>
                  <Clock size={12} color="#38bdf8" style={{ marginRight: 3 }} />
                  <Text style={[styles.statValue, { color: '#38bdf8' }]}>
                    ~{target.eta_min} min
                  </Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>APPROACH</Text>
                <Text style={styles.statValue}>{target.speed}</Text>
              </View>
            </View>

            {/* Advancing Cell Tag */}
            <View style={styles.stormThreatRow}>
              <Navigation size={12} color="#94a3b8" style={{ marginRight: 5 }} />
              <Text style={styles.threatText}>
                Advancing cell: <Text style={styles.threatHighlight}>{target.advancing_storm}</Text>
              </Text>
            </View>

            {/* Actionable Civil Defense Guideline */}
            <View style={styles.actionBox}>
              <ShieldAlert size={12} color="#fca5a5" style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={styles.actionText}>{target.action}</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleCol: {
    flex: 1,
  },
  targetName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  category: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
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
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stormThreatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  threatText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  threatHighlight: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    padding: 8,
  },
  actionText: {
    fontSize: 10,
    color: '#fca5a5',
    flex: 1,
    lineHeight: 14,
  },
});
