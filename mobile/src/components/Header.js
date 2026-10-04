import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Menu, Zap, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react-native';

export default function Header({
  activeScreen,
  onOpenDrawer,
  radarActive = true,
  frameIndex = 19,
  onRefresh,
}) {
  const isForecast = frameIndex >= 19;
  const timeOffset = isForecast ? `+${(frameIndex - 19) * 5}m` : `-${(19 - frameIndex) * 5}m`;

  return (
    <View style={styles.safeHeader}>
      <View style={styles.container}>
        {/* Left: Hamburger Button */}
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={onOpenDrawer}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Menu size={22} color="#ffffff" />
        </TouchableOpacity>

        {/* Center: Branding & Active View Title */}
        <View style={styles.titleContainer}>
          <View style={styles.brandRow}>
            <Zap size={15} color="#3b82f6" style={{ marginRight: 4 }} />
            <Text style={styles.brandText}>ClimaX</Text>
            <View style={[styles.badge, isForecast ? styles.badgeAi : styles.badgeObs]}>
              <Text style={styles.badgeText}>{isForecast ? `DGMR ${timeOffset}` : `RADAR ${timeOffset}`}</Text>
            </View>
          </View>
          <Text style={styles.subTitleText} numberOfLines={1}>
            {activeScreen}
          </Text>
        </View>

        {/* Right: Sensor Status & Refresh Button */}
        <View style={styles.rightActions}>
          <View style={[styles.sensorDot, radarActive ? styles.sensorOnline : styles.sensorOffline]}>
            {radarActive ? (
              <ShieldCheck size={12} color="#10b981" />
            ) : (
              <AlertTriangle size={12} color="#ef4444" />
            )}
          </View>

          {onRefresh && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <RefreshCw size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Radar outage banner if sensor is killed */}
      {!radarActive && (
        <View style={styles.outageBanner}>
          <AlertTriangle size={13} color="#fca5a5" style={{ marginRight: 5 }} />
          <Text style={styles.outageText}>
            Radar Sensor Offline • DGMR Neural Fallback Active (2.5x Cone)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    backgroundColor: '#0a0f1d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 10,
    zIndex: 100,
  },
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAi: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  badgeObs: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#93c5fd',
    letterSpacing: 0.3,
  },
  subTitleText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sensorDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sensorOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outageBanner: {
    backgroundColor: 'rgba(153, 27, 27, 0.45)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outageText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fca5a5',
  },
});
