import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { GitBranch, Sparkles, CheckCircle2, TrendingUp, Layers } from 'lucide-react-native';

const ENSEMBLE_MEMBERS = [
  { id: 'M-01', weight: 14.5, trait: 'Core Intensification (+4 dBZ)', bias: 'NE Vector' },
  { id: 'M-02', weight: 12.0, trait: 'Bifurcation / Cell Splitting', bias: 'Alpine Crest' },
  { id: 'M-03', weight: 10.5, trait: 'Steady-State Supercell', bias: 'Lucerne Pass' },
  { id: 'M-04', weight: 9.8, trait: 'Accelerated Forward Motion', bias: 'Zurich Corridor' },
  { id: 'M-05', weight: 8.5, trait: 'Downburst Bow Echo', bias: 'Gotthard Ridge' },
  { id: 'M-06', weight: 7.2, trait: 'Precipitation Core Merger', bias: 'Central Plateau' },
  { id: 'M-07', weight: 6.5, trait: 'Secondary Cell Initiation', bias: 'Bernese Crest' },
  { id: 'M-08', weight: 5.5, trait: 'Dry Air Entrainment', bias: 'South Slope' },
  { id: 'M-09', weight: 5.0, trait: 'Linear Squall Consolidation', bias: 'Jura Arc' },
  { id: 'M-10', weight: 4.5, trait: 'Delayed Dissipation', bias: 'Aare Valley' },
  { id: 'M-11', weight: 4.0, trait: 'Localized Microburst Pulse', bias: 'Lake Basin' },
  { id: 'M-12', weight: 3.5, trait: 'Low-Level Inflow Surge', bias: 'Rhine Gap' },
  { id: 'M-13', weight: 2.5, trait: 'Hail Core Extrusion', bias: 'Alpine Spine' },
  { id: 'M-14', weight: 2.2, trait: 'Slow Advection / High Rain', bias: 'Urban Core' },
  { id: 'M-15', weight: 2.0, trait: 'Topographic Deflection', bias: 'High Pass' },
  { id: 'M-16', weight: 1.8, trait: 'Rapid Dissipation', bias: 'Valley Floor' },
];

export default function EnsembleScreen() {
  const [selectedMember, setSelectedMember] = useState('M-01');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <View style={styles.badgeRow}>
          <View style={styles.modelBadge}>
            <Sparkles size={11} color="#a855f7" style={{ marginRight: 4 }} />
            <Text style={styles.modelBadgeText}>DeepMind DGMR Spatiotemporal GAN</Text>
          </View>
        </View>
        <Text style={styles.title}>16-Member Generative Ensemble</Text>
        <Text style={styles.subtitle}>
          Stochastic latent sampling quantifies forecast uncertainty without deterministic smoothing
        </Text>
      </View>

      {/* Uncertainty Horizon Dispersion Meter */}
      <View style={styles.dispersionCard}>
        <Text style={styles.dispersionTitle}>TRAJECTORY DIVERGENCE HORIZONS</Text>

        <View style={styles.horizonRow}>
          <Text style={styles.horizonLabel}>T+30m</Text>
          <View style={styles.horizonTrack}>
            <View style={[styles.horizonFill, { width: '25%', backgroundColor: '#10b981' }]} />
          </View>
          <Text style={[styles.horizonValue, { color: '#10b981' }]}>High Certainty (±4 km)</Text>
        </View>

        <View style={styles.horizonRow}>
          <Text style={styles.horizonLabel}>T+60m</Text>
          <View style={styles.horizonTrack}>
            <View style={[styles.horizonFill, { width: '60%', backgroundColor: '#f59e0b' }]} />
          </View>
          <Text style={[styles.horizonValue, { color: '#f59e0b' }]}>Moderate Spread (±12 km)</Text>
        </View>

        <View style={styles.horizonRow}>
          <Text style={styles.horizonLabel}>T+90m</Text>
          <View style={styles.horizonTrack}>
            <View style={[styles.horizonFill, { width: '85%', backgroundColor: '#a855f7' }]} />
          </View>
          <Text style={[styles.horizonValue, { color: '#a855f7' }]}>Multi-Future Plume (±22 km)</Text>
        </View>
      </View>

      {/* 16 Members Scrollable List */}
      <Text style={styles.sectionHeader}>STOCHASTIC REALIZATIONS (TOTAL WEIGHT: 100%)</Text>

      {ENSEMBLE_MEMBERS.map((member) => {
        const isSelected = selectedMember === member.id;

        return (
          <TouchableOpacity
            key={member.id}
            style={[styles.memberCard, isSelected && styles.memberCardSelected]}
            onPress={() => setSelectedMember(member.id)}
            activeOpacity={0.7}
          >
            <View style={styles.memberTop}>
              <View style={styles.memberIdCol}>
                <View
                  style={[
                    styles.idCircle,
                    isSelected ? styles.idCircleSelected : styles.idCircleNormal,
                  ]}
                >
                  <Text
                    style={[
                      styles.idText,
                      isSelected ? styles.idTextSelected : styles.idTextNormal,
                    ]}
                  >
                    {member.id}
                  </Text>
                </View>
                <View>
                  <Text style={styles.traitText}>{member.trait}</Text>
                  <Text style={styles.biasText}>Trajectory Bias: {member.bias}</Text>
                </View>
              </View>

              <View style={styles.weightCol}>
                <Text style={styles.weightText}>{member.weight}%</Text>
                <Text style={styles.weightLabel}>Weight</Text>
              </View>
            </View>

            {/* Probability Progress Line */}
            <View style={styles.weightTrack}>
              <View
                style={[
                  styles.weightFill,
                  { width: `${member.weight * 6}%` },
                  isSelected && { backgroundColor: '#a855f7' },
                ]}
              />
            </View>
          </TouchableOpacity>
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
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modelBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#d8b4fe',
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
  dispersionCard: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  dispersionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  horizonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  horizonLabel: {
    width: 44,
    fontSize: 10,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  horizonTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  horizonFill: {
    height: '100%',
    borderRadius: 3,
  },
  horizonValue: {
    fontSize: 9,
    fontWeight: '700',
    width: 130,
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  memberCard: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memberCardSelected: {
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  memberTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberIdCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  idCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCircleNormal: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  idCircleSelected: {
    backgroundColor: '#a855f7',
  },
  idText: {
    fontSize: 10,
    fontWeight: '800',
  },
  idTextNormal: {
    color: '#94a3b8',
  },
  idTextSelected: {
    color: '#ffffff',
  },
  traitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  biasText: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  weightCol: {
    alignItems: 'flex-end',
  },
  weightText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
    fontVariant: ['tabular-nums'],
  },
  weightLabel: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: '600',
  },
  weightTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  weightFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 1.5,
  },
});
