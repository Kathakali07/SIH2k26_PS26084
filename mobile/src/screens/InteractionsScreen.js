import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  GitBranch,
  Merge,
  PlusCircle,
  Wind,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Activity,
  Layers,
} from 'lucide-react-native';
import InteractiveLeafletMap from '../components/InteractiveLeafletMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INTERACTIONS = [
  {
    id: 'merger',
    title: 'Elevated Cell Merger Risk (>70%)',
    source: 'Bernese Core Cell (68 dBZ)',
    target: 'Alpine Supercell (74 dBZ)',
    location: 'Lake Lucerne / Schwyz Basin',
    eta: '40–60 min',
    severity: 'EXTREME',
    icon: Merge,
    color: '#ef4444',
    description:
      'Convergent velocity vectors indicate high probability of cell collision. Post-merger radar core predicted to exceed 75 dBZ with severe hail potential.',
  },
  {
    id: 'outflow',
    title: 'Cold Pool Outflow Boundary',
    source: 'Alpine Supercell Downdraft',
    target: 'Zurich Basin Secondary Trigger',
    location: 'Central Plateau / Limmat Valley',
    eta: '~45 min',
    severity: 'HIGH',
    icon: Wind,
    color: '#f59e0b',
    description:
      'Dense evaporatively-cooled outflow boundary propagating northwest at 38 km/h. Will trigger rapid convective initiation in high-CAPE moisture reservoir.',
  },
  {
    id: 'inflow',
    title: 'Orographic Inflow Moisture Feed',
    source: 'Ticino Southern Feeder (61 dBZ)',
    target: 'Alpine Supercell Main Core',
    location: 'Gotthard South Flank',
    eta: 'Active Now',
    severity: 'ACTIVE',
    icon: PlusCircle,
    color: '#38bdf8',
    description:
      'Strong southerly low-level jet funneling moist Mediterranean air through Ticino valley pass, sustaining supercell updraft longevity.',
  },
];

export default function InteractionsScreen({ storms = [] }) {
  const [selectedInteraction, setSelectedInteraction] = useState('merger');

  const activeItem = INTERACTIONS.find((i) => i.id === selectedInteraction) || INTERACTIONS[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerBox}>
        <View style={styles.badgeRow}>
          <View style={styles.gnnBadge}>
            <GitBranch size={11} color="#8b5cf6" style={{ marginRight: 4 }} />
            <Text style={styles.gnnBadgeText}>Graph Neural Network (GNN)</Text>
          </View>
        </View>
        <Text style={styles.title}>Dynamic Storm Interaction Graph</Text>
        <Text style={styles.subtitle}>
          Models cell-to-cell kinematic convergence, cold-pool boundaries, and merger probabilities
        </Text>
      </View>

      {/* Interaction Cards Selector */}
      <Text style={styles.sectionHeader}>IDENTIFIED STORM INTERACTIONS ({INTERACTIONS.length})</Text>

      {INTERACTIONS.map((item) => {
        const IconComponent = item.icon;
        const isSelected = selectedInteraction === item.id;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.interactionCard,
              isSelected && { borderColor: item.color, backgroundColor: '#131c2e' },
            ]}
            onPress={() => setSelectedInteraction(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                <IconComponent size={18} color={item.color} />
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
              <View style={[styles.sevTag, { backgroundColor: `${item.color}20`, borderColor: `${item.color}50` }]}>
                <Text style={[styles.sevText, { color: item.color }]}>{item.severity}</Text>
              </View>
            </View>

            <View style={styles.vectorRow}>
              <Text style={styles.vectorCell}>{item.source}</Text>
              <ArrowRight size={14} color="#64748b" style={{ marginHorizontal: 6 }} />
              <Text style={styles.vectorCell}>{item.target}</Text>
            </View>

            <Text style={styles.descText}>{item.description}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.footerLabel}>Expected Horizon: <Text style={styles.footerValue}>{item.eta}</Text></Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* GNN Reasoning Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Activity size={16} color="#8b5cf6" style={{ marginRight: 6 }} />
          <Text style={styles.summaryTitle}>GNN Mesoscale Kinematic Reasoning</Text>
        </View>
        <Text style={styles.summaryBody}>
          Unlike traditional persistence extrapolation, our Graph Neural Network models convective cells as interacting nodes with dynamic edge weights computed from velocity convergence, radar reflectivity gradients, and cold-pool buoyancy.
        </Text>
      </View>
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
    paddingBottom: 36,
  },
  headerBox: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  gnnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  gnnBadgeText: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  sectionHeader: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  interactionCard: {
    backgroundColor: '#0c1322',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleCol: {
    flex: 1,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  sevTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sevText: {
    fontSize: 10,
    fontWeight: '800',
  },
  vectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080d1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a2336',
  },
  vectorCell: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  descText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    color: '#64748b',
    fontSize: 11,
  },
  footerValue: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#0c1322',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    padding: 14,
    marginTop: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryTitle: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
});
