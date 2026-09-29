import React from 'react';
import { Home, CloudLightning, ShieldAlert, AlertTriangle, Zap, Activity, History, Database, Bell, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { icon: <Home size={18} />, label: 'Live Nowcast' },
    { icon: <CloudLightning size={18} />, label: 'Storm Objects' },
    { icon: <ShieldAlert size={18} />, label: 'Hazard Forecast' },
    { icon: <AlertTriangle size={18} />, label: 'Impact Risk' },
    { icon: <Zap size={18} />, label: 'Storm Interactions' },
    { icon: <Activity size={18} />, label: 'Multiple Futures' },
    { icon: <History size={18} />, label: 'Historical Replay' },
    { icon: <Database size={18} />, label: 'Data & Sensors' },
    { icon: <Bell size={18} />, label: 'Alerts' },
    { icon: <Settings size={18} />, label: 'Settings' },
  ];

  const systemStatus = [
    { label: 'Radar', status: 'Online', color: 'bg-green-500' },
    { label: 'Satellite', status: 'Online', color: 'bg-green-500' },
    { label: 'Lightning', status: 'Online', color: 'bg-green-500' },
    { label: 'NWP', status: 'Online', color: 'bg-green-500' },
    { label: 'Data Fusion', status: 'Healthy', color: 'bg-blue-500' },
  ];

  return (
    <div className="w-[240px] flex-shrink-0 flex flex-col justify-between h-full bg-[#070b14]">
      <div className="flex flex-col gap-1 pr-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(item.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-[#1e293b] text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111622]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="pr-3 pb-2 mt-4 shrink-0">
        <div className="bg-[#111622] rounded-xl p-4 border border-gray-800/60">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">System Status</h3>
          <div className="flex flex-col gap-2">
            {systemStatus.map((sys, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${sys.color}`}></div>
                  {sys.label}
                </div>
                <span className="text-gray-500">{sys.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
