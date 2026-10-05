import React from 'react';
import { Home, CloudLightning, ShieldAlert, AlertTriangle, Zap, Activity, History, Database, Bell, Smartphone, Download } from 'lucide-react';

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
  ];

  const systemStatus = [
    { label: 'Radar', status: 'Online', color: 'bg-green-500' },
    { label: 'Satellite', status: 'Online', color: 'bg-green-500' },
    { label: 'Lightning', status: 'Online', color: 'bg-green-500' },
    { label: 'NWP', status: 'Online', color: 'bg-green-500' },
    { label: 'Data Fusion', status: 'Healthy', color: 'bg-blue-500' },
  ];

  return (
    <div className="w-[180px] flex-shrink-0 flex flex-col justify-between h-full bg-[#070b14] animate-fade-up delay-100">
      <div className="flex flex-col gap-1 pr-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(item.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-[color,background-color,border-color,transform,box-shadow] duration-150 ${
                isActive 
                  ? 'bg-[#1e293b] text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.15)] translate-x-1' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111622] hover:translate-x-1 hover:shadow-[0_0_10px_rgba(37,99,235,0.1)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="pr-3 pb-2 mt-4 shrink-0 flex flex-col gap-2.5">
        {/* Android App Download Banner */}
        <a
          href="https://github.com/Kathakali07/SIH2k26_PS26084/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#111622] to-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all duration-200 group"
          title="Download ClimaX Android App (APK Release)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone size={13} className="text-emerald-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-gray-200 group-hover:text-emerald-300 transition-colors truncate">Android App</span>
              <span className="text-[9px] text-emerald-400/80 font-mono">v1.0 APK</span>
            </div>
          </div>
          <Download size={12} className="text-emerald-400 opacity-70 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all shrink-0 ml-1" />
        </a>

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
