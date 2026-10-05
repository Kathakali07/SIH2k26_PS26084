import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {
  Map,
  CloudRain,
  AlertTriangle,
  Building2,
  GitBranch,
  Radio,
  BellRing,
  Settings,
  X,
  Zap,
  Activity,
  Layers,
  RotateCcw,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

export default function DrawerMenu({
  visible,
  onClose,
  activeScreen,
  onSelectScreen,
  radarActive = true,
  apiBase = '',
}) {
  const navSections = [
    {
      title: 'CORE NOWCASTING',
      items: [
        {
          id: 'Live Nowcast',
          label: 'Live Radar & AI Map',
          subLabel: '0–90m Swiss convective loop',
          icon: Map,
          color: '#3b82f6',
        },
        {
          id: 'Storm Cells',
          label: 'Storm Intelligence',
          subLabel: 'Tracked kinematic cells & dBZ',
          icon: Activity,
          color: '#38bdf8',
        },
        {
          id: 'Hazard Matrix',
          label: 'Severe Hazard Matrix',
          subLabel: 'Hail, squall, microburst, lightning',
          icon: AlertTriangle,
          color: '#f59e0b',
        },
        {
          id: 'Storm Interactions',
          label: 'Storm Interactions',
          subLabel: 'GNN graph, mergers & cold pools',
          icon: Zap,
          color: '#eab308',
        },
      ],
    },
    {
      title: 'IMPACT & ENSEMBLE',
      items: [
        {
          id: 'Impact Risk',
          label: 'Critical Infrastructure',
          subLabel: 'Airports, highways, dynamic ETAs',
          icon: Building2,
          color: '#ef4444',
        },
        {
          id: 'Multiple Futures',
          label: '16-Member Ensemble',
          subLabel: 'DGMR probabilistic divergence',
          icon: GitBranch,
          color: '#a855f7',
        },
        {
          id: 'Historical Replay',
          label: 'Historical Replay',
          subLabel: 'PySTEPS benchmark vs DGMR AI',
          icon: RotateCcw,
          color: '#38bdf8',
        },
      ],
    },
    {
      title: 'OPERATIONS & DEFENSE',
      items: [
        {
          id: 'Data & Sensors',
          label: 'Sensor Resilience',
          subLabel: 'Doppler outage & neural fallback',
          icon: Radio,
          color: '#10b981',
          badge: !radarActive ? 'FALLBACK' : 'ONLINE',
          badgeColor: !radarActive ? '#ef4444' : '#10b981',
        },
        {
          id: 'Emergency Alerts',
          label: 'CAP v1.2 Civil Alerts',
          subLabel: 'NDMA early warning broadcasts',
          icon: BellRing,
          color: '#ec4899',
        },
        {
          id: 'Settings',
          label: 'Settings & Server',
          subLabel: 'API endpoint & preferences',
          icon: Settings,
          color: '#94a3b8',
        },
      ],
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer Slide-in Container */}
        <View style={styles.drawerContainer}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.drawerBrand}>
              <View style={styles.logoBadge}>
                <Zap size={20} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.drawerTitle}>ClimaX Mobile</Text>
                <Text style={styles.drawerSub}>SIH 2026 • PS26084</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Navigation Items List */}
          <ScrollView
            style={styles.drawerScroll}
            contentContainerStyle={styles.drawerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {navSections.map((section, sIdx) => (
              <View key={sIdx} style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                {section.items.map((item) => {
                  const isActive = activeScreen === item.id;
                  const IconComponent = item.icon;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.navItem, isActive && styles.navItemActive]}
                      onPress={() => {
                        onSelectScreen(item.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.navIconContainer,
                          { backgroundColor: `${item.color}18` },
                          isActive && { backgroundColor: `${item.color}35` },
                        ]}
                      >
                        <IconComponent size={18} color={item.color} />
                      </View>

                      <View style={styles.navTextContainer}>
                        <View style={styles.navLabelRow}>
                          <Text
                            style={[
                              styles.navLabel,
                              isActive && styles.navLabelActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.badge && (
                            <View
                              style={[
                                styles.itemBadge,
                                { backgroundColor: `${item.badgeColor}22`, borderColor: `${item.badgeColor}55` },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.itemBadgeText,
                                  { color: item.badgeColor },
                                ]}
                              >
                                {item.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.navSubLabel} numberOfLines={1}>
                          {item.subLabel}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Drawer Footer with active API status */}
          <View style={styles.drawerFooter}>
            <View style={styles.serverStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: radarActive ? '#10b981' : '#ef4444' },
                ]}
              />
              <Text style={styles.serverText} numberOfLines={1}>
                {apiBase ? apiBase.replace('https://', '').replace('http://', '') : 'Local Simulation'}
              </Text>
            </View>
            <Text style={styles.versionText}>v0.4.0 Mobile Edition</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#0c1222',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 48,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  drawerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  drawerSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1.0,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 3,
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  navIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  navTextContainer: {
    flex: 1,
  },
  navLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  navLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  itemBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  itemBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  navSubLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  drawerFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#080d19',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  serverText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
    flexShrink: 1,
  },
  versionText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '600',
  },
});
