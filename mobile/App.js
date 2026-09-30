import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import Header from './src/components/Header';
import DrawerMenu from './src/components/DrawerMenu';

import NowcastScreen from './src/screens/NowcastScreen';
import StormsScreen from './src/screens/StormsScreen';
import HazardsScreen from './src/screens/HazardsScreen';
import ImpactScreen from './src/screens/ImpactScreen';
import EnsembleScreen from './src/screens/EnsembleScreen';
import SensorsScreen from './src/screens/SensorsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import {
  DEFAULT_API_BASE,
  generateLocalFallbackScenario,
} from './src/config/api';

const TOTAL_FRAMES = 38;
const NOW_FRAME_INDEX = 19;

export default function App() {
  const [activeScreen, setActiveScreen] = useState('Live Nowcast');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [offlineMode, setOfflineMode] = useState(false);

  const [frameIndex, setFrameIndex] = useState(NOW_FRAME_INDEX);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(400);

  const [radarActive, setRadarActive] = useState(true);
  const [selectedStormId, setSelectedStormId] = useState(null);
  const [scenarioData, setScenarioData] = useState(() =>
    generateLocalFallbackScenario(NOW_FRAME_INDEX, true)
  );

  // Fetch or compute scenario for the current frame
  useEffect(() => {
    if (offlineMode) {
      setScenarioData(generateLocalFallbackScenario(frameIndex, radarActive));
      return;
    }

    const controller = new AbortController();
    const fetchUrl = `${apiBase}/api/scenario?frame_index=${frameIndex}`;

    fetch(fetchUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.features) {
          setScenarioData(data);
          if (data.sensors && data.sensors.radar) {
            setRadarActive(data.sensors.radar.available);
          }
        } else {
          // If shape is different, fall back to local computation
          setScenarioData(generateLocalFallbackScenario(frameIndex, radarActive));
        }
      })
      .catch(() => {
        // Fallback gracefully on network error
        setScenarioData(generateLocalFallbackScenario(frameIndex, radarActive));
      });

    return () => controller.abort();
  }, [frameIndex, apiBase, offlineMode, radarActive]);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % TOTAL_FRAMES);
    }, playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Toggle Radar Failure Handler
  const handleToggleRadar = async () => {
    const nextState = !radarActive;
    setRadarActive(nextState);

    if (!offlineMode) {
      try {
        await fetch(`${apiBase}/api/kill-radar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: nextState }),
        });
      } catch (e) {
        // Handled via local state
      }
    }
  };

  // Reset System Handler
  const handleResetSystem = async () => {
    setRadarActive(true);
    setFrameIndex(NOW_FRAME_INDEX);

    if (!offlineMode) {
      try {
        await fetch(`${apiBase}/api/reset-demo`, { method: 'POST' });
      } catch (e) {
        // Handled via local state
      }
    }
  };

  const storms = scenarioData?.features || [];

  const handleNavigateToHazards = (stormId) => {
    setSelectedStormId(stormId);
    setActiveScreen('Hazard Matrix');
  };

  const handleSelectOnMap = (stormId) => {
    setSelectedStormId(stormId);
    setActiveScreen('Live Nowcast');
  };

  // Render the current active screen
  const renderScreen = () => {
    switch (activeScreen) {
      case 'Live Nowcast':
        return (
          <NowcastScreen
            storms={storms}
            selectedStormId={selectedStormId}
            setSelectedStormId={setSelectedStormId}
            frameIndex={frameIndex}
            setFrameIndex={setFrameIndex}
            totalFrames={TOTAL_FRAMES}
            nowFrameIndex={NOW_FRAME_INDEX}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            radarActive={radarActive}
            onNavigateToHazards={handleNavigateToHazards}
          />
        );
      case 'Storm Cells':
        return (
          <StormsScreen
            storms={storms}
            onSelectOnMap={handleSelectOnMap}
          />
        );
      case 'Hazard Matrix':
        return <HazardsScreen storms={storms} />;
      case 'Impact Risk':
        return <ImpactScreen storms={storms} />;
      case 'Multiple Futures':
        return <EnsembleScreen />;
      case 'Data & Sensors':
        return (
          <SensorsScreen
            radarActive={radarActive}
            onToggleRadar={handleToggleRadar}
            onResetSystem={handleResetSystem}
          />
        );
      case 'Emergency Alerts':
        return <AlertsScreen />;
      case 'Settings':
        return (
          <SettingsScreen
            apiBase={apiBase}
            onSaveApiBase={setApiBase}
            offlineMode={offlineMode}
            setOfflineMode={setOfflineMode}
          />
        );
      default:
        return (
          <NowcastScreen
            storms={storms}
            selectedStormId={selectedStormId}
            setSelectedStormId={setSelectedStormId}
            frameIndex={frameIndex}
            setFrameIndex={setFrameIndex}
            totalFrames={TOTAL_FRAMES}
            nowFrameIndex={NOW_FRAME_INDEX}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            radarActive={radarActive}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <ExpoStatusBar style="light" />

      {/* Mobile Top Header with Hamburger Menu */}
      <Header
        activeScreen={activeScreen}
        onOpenDrawer={() => setDrawerVisible(true)}
        radarActive={radarActive}
        frameIndex={frameIndex}
        onRefresh={() => setFrameIndex((prev) => prev)}
      />

      {/* Main View Area */}
      <View style={styles.mainView}>{renderScreen()}</View>

      {/* Slide-over Hamburger Navigation Drawer */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        radarActive={radarActive}
        apiBase={offlineMode ? 'Offline Simulation' : apiBase}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#060b17',
  },
  mainView: {
    flex: 1,
  },
});
