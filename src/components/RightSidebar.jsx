import React from 'react';
import { ChevronRight, Zap, CloudHail, Wind, CloudRain, MapPin, Plane, Car, Home, PlusSquare, Settings } from 'lucide-react';

export default function RightSidebar({ setActiveTab }) {
  const activeStorms = [
    { id: '1', name: 'Cell A', distance: '42 km', eta: '42 min', speed: '38 km/h', severity: 'Severe', color: 'bg-red-500/20 text-red-400 border-red-500/30', numColor: 'bg-yellow-400 text-black' },
    { id: '2', name: 'Cell B', distance: '120 km', eta: '1 h 20 min', speed: '45 km/h', severity: 'Moderate', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', numColor: 'bg-orange-400 text-black' },
    { id: '3', name: 'Cell C', distance: '210 km', eta: '2 h 15 min', speed: '52 km/h', severity: 'Extreme', color: 'bg-rose-900/40 text-rose-400 border-rose-500/30', numColor: 'bg-red-500 text-white' },
  ];

  const hazardForecast = [
    { icon: <Zap size={16} className="text-blue-400" />, name: 'Lightning', risk: 'High', prob: '60-80%', color: 'text-red-400' },
    { icon: <CloudHail size={16} className="text-blue-300" />, name: 'Hail', risk: 'Moderate', prob: '30-50%', color: 'text-orange-400' },
    { icon: <Wind size={16} className="text-blue-200" />, name: 'Downburst', risk: 'High', prob: '50-70%', color: 'text-red-400' },
    { icon: <CloudRain size={16} className="text-blue-500" />, name: 'Extreme Rain', risk: 'High', prob: '60-80%', color: 'text-red-400' },
  ];

  const impactRisks = [
    { icon: <Plane size={14} />, name: 'Airport', risk: 'High', color: 'text-red-400' },
    { icon: <Car size={14} />, name: 'Road Network', risk: 'Moderate', color: 'text-orange-400' },
    { icon: <Home size={14} />, name: 'Nearby Villages', risk: 'High', color: 'text-red-400' },
    { icon: <PlusSquare size={14} />, name: 'Hospitals', risk: 'Moderate', color: 'text-orange-400' },
    { icon: <Settings size={14} />, name: 'Critical Infrastructure', risk: 'High', color: 'text-red-400' },
  ];

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
      
      {/* Active Storms */}
      <div className="bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-200">Active Storms (6)</h3>
          <button 
            onClick={() => setActiveTab && setActiveTab('Storm Objects')}
            className="text-xs text-blue-400 flex items-center hover:text-blue-300 transition-colors"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {activeStorms.map((storm, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveTab && setActiveTab('Storm Objects')}
              className="group flex items-center gap-3 bg-[#1a2133] rounded-lg p-2 border border-gray-700/50 hover:bg-[#20293f] hover:border-blue-500/50 transition-all cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${storm.numColor}`}>
                {storm.id}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors">{storm.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${storm.color}`}>
                    {storm.severity}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <div className="flex flex-col">
                    <span>Distance: <span className="text-gray-300">{storm.distance}</span></span>
                    <span>ETA: <span className="text-gray-300">{storm.eta}</span></span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span>Speed</span>
                    <span className="text-gray-300">{storm.speed}</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-[#0a0d14] rounded overflow-hidden">
                {/* Fake Radar Thumbnail */}
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-green-600 to-red-600 opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
              </div>
              <ChevronRight size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Hazard Forecast */}
      <div 
        className="bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex-shrink-0 cursor-pointer hover:border-blue-500/50 transition-colors group"
        onClick={() => setActiveTab && setActiveTab('Hazard Forecast')}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">Hazard Forecast (Next 6 Hours)</h3>
          <ChevronRight size={14} className="text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {hazardForecast.map((hazard, idx) => (
            <div key={idx} className="flex flex-col items-center bg-[#1a2133] rounded-lg p-2 border border-gray-700/50">
              <div className="mb-2">{hazard.icon}</div>
              <span className="text-[10px] text-gray-400 text-center leading-tight mb-1">{hazard.name}</span>
              <span className={`text-[10px] font-bold ${hazard.color}`}>{hazard.risk}</span>
              <span className="text-[10px] text-gray-500">{hazard.prob}</span>
              {/* Fake Sparkline */}
              <svg viewBox="0 0 40 10" className="w-full h-3 mt-1 stroke-current text-blue-500 fill-none" preserveAspectRatio="none">
                <path d="M0,8 Q5,2 10,6 T20,4 T30,7 T40,3" strokeWidth="1.5" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Risk */}
      <div 
        className="bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex-1 min-h-[200px] flex flex-col cursor-pointer hover:border-blue-500/50 transition-colors group"
        onClick={() => setActiveTab && setActiveTab('Impact Risk')}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">Impact Risk (Selected Area)</h3>
          <ChevronRight size={14} className="text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin size={14} /> Kolkata (City)
          </div>
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2 py-1 rounded">High Risk</span>
        </div>
        
        <div className="flex gap-4 flex-1">
          <div className="flex-1 flex flex-col gap-2.5">
            {impactRisks.map((risk, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  {risk.icon} {risk.name}
                </div>
                <span className={`font-medium ${risk.color}`}>{risk.risk}</span>
              </div>
            ))}
          </div>
          <div className="w-[120px] rounded-lg overflow-hidden relative border border-gray-700/50">
            {/* Fake Map Thumbnail */}
            <div className="absolute inset-0 bg-[#0a0d14]">
              {/* Fake roads and heat */}
              <div className="w-full h-full opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 via-orange-500/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute inset-0 border border-red-500/30 m-2 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
