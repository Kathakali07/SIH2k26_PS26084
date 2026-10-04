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

const API_BASE = import.meta.env.VITE_API_BASE ?? (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://sih2k26-ps26084.onrender.com');
const TOTAL_FRAMES = 38;
const NOW_FRAME_INDEX = 19; // Frame 19 is T+0 'NOW' (dividing observed from DGMR forecast)

export default function App() {
  const [activeTab, setActiveTab] = useState('Landing Page');
  const [settingsTab, setSettingsTab] = useState('General');
  const [geoData, setGeoData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedStormId, setSelectedStormId] = useState(null);
  const [frameIndex, setFrameIndex] = useState(NOW_FRAME_INDEX);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(400); // 400ms per frame for smooth radar loop

  // Fetch GeoJSON for the current frame. Pace the first demo load through a
  // few visible preparation stages; subsequent animation frames stay quick.
  useEffect(() => {
    if (activeTab === 'Landing Page') return undefined;

    let isCurrentRequest = true;
    const isFirstLoad = geoData === null;
    // Demo-only pacing: let each visible preparation stage breathe like a
    // normal data pipeline, without implying these sample values are live.
    const minimumLoadTime = isFirstLoad ? 5500 + Math.random() * 2000 : 0;
    const startedAt = Date.now();
    const progressTimer = isFirstLoad ? setInterval(() => {
      const elapsed = Math.min(1, (Date.now() - startedAt) / minimumLoadTime);
      // Brief plateaus between phases imitate real-world wait times while a
      // response is received and layers are assembled.
      const stages = [
        { start: 0, end: 0.16, from: 0, to: 22 },
        { start: 0.34, end: 0.54, from: 22, to: 58 },
        { start: 0.73, end: 0.87, from: 58, to: 82 },
        { start: 0.94, end: 1, from: 82, to: 92 },
      ];
      const activeStage = stages.find(stage => elapsed >= stage.start && elapsed <= stage.end);
      const progress = activeStage
        ? Math.round(activeStage.from + ((elapsed - activeStage.start) / (activeStage.end - activeStage.start)) * (activeStage.to - activeStage.from))
        : elapsed < 0.34 ? 22 : elapsed < 0.73 ? 58 : 82;
      setLoadingProgress(progress);
    }, 60) : null;

    if (isFirstLoad) {
      setLoadingProgress(0);
      setIsInitialLoading(true);
    }

    fetch(`${API_BASE}/api/nowcast/live?frame_index=${frameIndex}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(async data => {
        const remainingDelay = minimumLoadTime - (Date.now() - startedAt);
        if (remainingDelay > 0) await new Promise(resolve => setTimeout(resolve, remainingDelay));
        if (isCurrentRequest) {
          setLoadingProgress(100);
          setGeoData(data);
        }
      })
      .catch(() => {
        // Keep network failures out of the browser console during the demo.
      })
      .finally(() => {
        if (progressTimer) clearInterval(progressTimer);
        if (isCurrentRequest) setIsInitialLoading(false);
      });

    return () => {
      isCurrentRequest = false;
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [frameIndex, activeTab]);

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
          {isInitialLoading && activeTab !== 'Landing Page' ? (
            <div className="flex-1 flex items-center justify-center p-6" role="status" aria-live="polite">
              <div className="w-full max-w-md rounded-2xl border border-sky-400/15 bg-[#0b1220]/95 p-6 shadow-2xl shadow-sky-950/30">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-sky-400/5">
                    <div className="absolute inset-0 origin-bottom-right animate-spin rounded-full bg-gradient-to-tr from-transparent via-sky-400/20 to-sky-300/60" style={{ animationDuration: '2.4s' }} />
                    <div className="absolute h-8 w-8 rounded-full border border-sky-300/25" />
                    <div className="absolute h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_12px_2px_rgba(125,211,252,0.8)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/70">Weather workspace</p>
                    <p className="mt-1 text-sm font-semibold text-gray-100">Preparing your forecast</p>
                    <p className="mt-1 text-xs text-gray-400">Loading simulated radar and storm layers</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">
                      {loadingProgress < 20 ? 'Connecting to demo feed' : loadingProgress < 35 ? 'Waiting for sample frame response' : loadingProgress < 55 ? 'Loading sample radar frames' : loadingProgress < 70 ? 'Synchronizing radar tiles' : loadingProgress < 82 ? 'Validating and organizing data' : loadingProgress < 92 ? 'Preparing forecast map layers' : 'Finishing dashboard setup'}
                    </span>
                    <span className="font-mono text-sky-200">{loadingProgress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/70">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-300 transition-[width] duration-100 ease-linear" style={{ width: `${loadingProgress}%` }} />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] uppercase tracking-wider text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Demo simulation</span>
                  <span>Local sample data</span>
                </div>
              </div>
            </div>
          ) : renderContent()}
        </div>
      </div>
    </div>
  );
}
