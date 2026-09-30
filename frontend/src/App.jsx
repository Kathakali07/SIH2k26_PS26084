import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainMap from './components/MainMap';
import RightSidebar from './components/RightSidebar';
import BottomPanel from './components/BottomPanel';

// Views
import LandingPage from './components/views/LandingPage';
import StormObjectDetail from './components/views/StormObjectDetail';
import HazardForecast from './components/views/HazardForecast';
import ImpactRisk from './components/views/ImpactRisk';
import StormInteractions from './components/views/StormInteractions';
import MultipleFutures from './components/views/MultipleFutures';
import HistoricalReplay from './components/views/HistoricalReplay';
import DataSensors from './components/views/DataSensors';
import Alerts from './components/views/Alerts';
import SettingsView from './components/views/SettingsView';

const API_BASE = import.meta.env.VITE_API_BASE ?? (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
const TOTAL_FRAMES = 38;
const NOW_FRAME_INDEX = 19; // Frame 19 is T+0 'NOW' (dividing observed from DGMR forecast)

export default function App() {
  const [activeTab, setActiveTab] = useState('Landing Page');
  const [settingsTab, setSettingsTab] = useState('General');
  const [geoData, setGeoData] = useState(null);
  const [selectedStormId, setSelectedStormId] = useState(null);
  const [frameIndex, setFrameIndex] = useState(NOW_FRAME_INDEX);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(400); // 400ms per frame for smooth radar loop

  // Fetch GeoJSON for the current frame
  useEffect(() => {
    fetch(`${API_BASE}/api/nowcast/live?frame_index=${frameIndex}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to fetch storm data:', err));
  }, [frameIndex]);

  // Animation loop: advance frame smoothly when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % TOTAL_FRAMES);
    }, playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  if (activeTab === 'Landing Page') {
    return <LandingPage onEnterApp={() => setActiveTab('Live Nowcast')} />;
  }

  const storms = geoData?.features || [];

  const renderContent = () => {
    switch (activeTab) {
      case 'Live Nowcast':
        return (
          <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
            <div className="flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
              <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-800/60 shadow-lg shadow-black/20 min-h-[320px]">
                <MainMap
                  geoData={geoData}
                  onStormSelect={setSelectedStormId}
                  selectedStormId={selectedStormId}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  frameIndex={frameIndex}
                  setFrameIndex={setFrameIndex}
                  totalFrames={TOTAL_FRAMES}
                  nowFrameIndex={NOW_FRAME_INDEX}
                  playbackSpeed={playbackSpeed}
                  setPlaybackSpeed={setPlaybackSpeed}
                />
              </div>
              <div className="h-[195px] flex gap-3 overflow-hidden shrink-0">
                <BottomPanel storms={storms} />
              </div>
            </div>
            <div className="w-[320px] flex-shrink-0 flex flex-col gap-3 overflow-hidden min-h-0">
              <RightSidebar
                setActiveTab={setActiveTab}
                storms={storms}
                selectedStormId={selectedStormId}
                onStormSelect={setSelectedStormId}
              />
            </div>
          </div>
        );
      case 'Storm Objects':
        return <StormObjectDetail storms={storms} setActiveTab={setActiveTab} selectedStormId={selectedStormId} onStormSelect={setSelectedStormId} />;
      case 'Hazard Forecast':
        return <HazardForecast storms={storms} setActiveTab={setActiveTab} />;
      case 'Impact Risk':
        return (
          <ImpactRisk
            storms={storms}
            setActiveTab={setActiveTab}
            frameIndex={frameIndex}
            setFrameIndex={setFrameIndex}
            nowFrameIndex={NOW_FRAME_INDEX}
            totalFrames={TOTAL_FRAMES}
          />
        );
      case 'Storm Interactions':
        return <StormInteractions storms={storms} setActiveTab={setActiveTab} />;
      case 'Multiple Futures':
        return <MultipleFutures storms={storms} setActiveTab={setActiveTab} selectedStormId={selectedStormId} />;
      case 'Historical Replay':
        return <HistoricalReplay setActiveTab={setActiveTab} />;
      case 'Data & Sensors':
        return <DataSensors setActiveTab={setActiveTab} />;
      case 'Alerts':
        return <Alerts storms={storms} setActiveTab={setActiveTab} />;
      case 'Settings':
        return <SettingsView activeTab={settingsTab} setActiveTab={setSettingsTab} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {activeTab} - Coming Soon
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-[#070b14] text-gray-300 flex flex-col font-sans overflow-hidden select-none">
      <Header setActiveTab={setActiveTab} setSettingsTab={setSettingsTab} />
      <div className="flex-1 flex overflow-hidden p-3 gap-3 min-h-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
