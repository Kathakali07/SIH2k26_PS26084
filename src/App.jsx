import React, { useState } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('Landing Page');
  const [settingsTab, setSettingsTab] = useState('General');

  if (activeTab === 'Landing Page') {
    return <LandingPage onEnterApp={() => setActiveTab('Live Nowcast')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Live Nowcast':
        return (
          <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
            <div className="flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
              <div className="flex-[3] relative rounded-xl overflow-hidden border border-gray-800/60 shadow-lg shadow-black/20">
                 <MainMap />
              </div>
              <div className="flex-[1.2] flex gap-3 overflow-hidden min-h-0 shrink-0">
                 <BottomPanel />
              </div>
            </div>
            <div className="w-[320px] flex-shrink-0 flex flex-col gap-3 overflow-hidden min-h-0">
               <RightSidebar />
            </div>
          </div>
        );
      case 'Storm Objects':
        return <StormObjectDetail />;
      case 'Hazard Forecast':
        return <HazardForecast />;
      case 'Impact Risk':
        return <ImpactRisk />;
      case 'Storm Interactions':
        return <StormInteractions />;
      case 'Multiple Futures':
        return <MultipleFutures />;
      case 'Historical Replay':
        return <HistoricalReplay />;
      case 'Data & Sensors':
        return <DataSensors />;
      case 'Alerts':
        return <Alerts />;
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
