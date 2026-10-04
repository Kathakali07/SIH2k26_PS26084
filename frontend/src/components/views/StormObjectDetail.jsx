import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Activity, Satellite, Zap } from 'lucide-react';

export default function StormObjectDetail() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeLayer, setActiveLayer] = useState('Radar');

  return (
    <div className="flex-1 flex flex-col gap-3 h-full">
      {/* Top Bar for Detail */}
      <div className="flex items-center justify-between bg-[#111622] rounded-xl border border-gray-800/60 p-3">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Back to Map
          </button>
          <div className="h-6 w-[1px] bg-gray-700"></div>
          <h2 className="text-lg font-bold text-gray-200">Storm Cell A</h2>
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-xs">Severe</span>
          <span className="text-sm text-gray-400 ml-2">Lifecycle Stage: <span className="text-gray-200">Mature</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Last updated: 29 Sep 2026, 14:32 IST</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-800 text-gray-400 transition-colors"><ChevronLeft size={16} /> Previous</button>
            <button className="p-1 rounded hover:bg-gray-800 text-gray-400 transition-colors">Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['Overview', 'Forecast', 'Hazards', 'Interactions', 'Impact', 'Environment'].map((tab, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-[#111622] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800/60'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Map Area */}
        <div className="flex-[3] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-xl p-2 flex flex-col gap-2">
             <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"><input type="radio" checked={activeLayer === 'Radar'} onChange={() => setActiveLayer('Radar')} className="accent-blue-500" /> <Activity size={14}/> Radar</label>
             <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"><input type="radio" checked={activeLayer === 'Satellite'} onChange={() => setActiveLayer('Satellite')} className="accent-blue-500" /> <Satellite size={14}/> Satellite</label>
             <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"><input type="radio" checked={activeLayer === 'Lightning'} onChange={() => setActiveLayer('Lightning')} className="accent-blue-500" /> <Zap size={14}/> Lightning</label>
          </div>
          <div className="flex-1 relative">
            {/* Fake Storm Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64 transition-transform duration-1000 ease-in-out">
                <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${activeLayer === 'Lightning' ? 'from-white via-purple-500/50' : activeLayer === 'Satellite' ? 'from-gray-300 via-gray-600/50' : 'from-red-600/80 via-yellow-500/40'} to-transparent rounded-full mix-blend-screen blur-md transition-colors duration-500`}></div>
                <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${activeLayer === 'Lightning' ? 'from-white via-white/80' : activeLayer === 'Satellite' ? 'from-white via-gray-300/80' : 'from-white via-red-500/80'} to-transparent rounded-full scale-50 transition-colors duration-500`}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                
                {/* Track line */}
                <svg className="absolute inset-0 w-[500px] h-[500px] -ml-[118px] -mt-[118px] pointer-events-none" style={{overflow:'visible'}}>
                   <path d="M 250 250 L 400 150" stroke="white" strokeWidth="2" strokeDasharray="5 5" fill="none" />
                </svg>
              </div>
            </div>
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-300 mb-2">{activeLayer === 'Lightning' ? 'Flash Density' : activeLayer === 'Satellite' ? 'Cloud Top Temp' : 'Reflectivity (dBZ)'}</div>
              <div className={`w-[200px] h-3 rounded bg-gradient-to-r ${activeLayer === 'Lightning' ? 'from-purple-900 via-purple-500 to-white' : activeLayer === 'Satellite' ? 'from-blue-900 via-gray-500 to-white' : 'from-blue-900 via-green-500 to-red-600'} mb-1`}></div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>0</span><span>70</span>
              </div>
            </div>
            {/* Scale */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center">
              <div className="w-16 h-[1px] bg-gray-400 mb-1"></div>
              <span className="text-[10px] text-gray-400">20 km</span>
            </div>
          </div>
        </div>

        {/* Right Info Area */}
        <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4">
           <h3 className="text-sm font-semibold text-gray-200 mb-4">{activeTab} Details</h3>
           {activeTab === 'Overview' && (
             <div className="flex flex-col gap-3 text-sm animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Location</span><span className="text-gray-200">25.62° N, 85.14° E</span></div>
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Area</span><span className="text-gray-200">320 km²</span></div>
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Max dBZ</span><span className="text-gray-200">62</span></div>
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Top Height</span><span className="text-gray-200">12 km</span></div>
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Speed</span><span className="text-gray-200">38 km/h</span></div>
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Direction</span><span className="text-gray-200">NE (45°)</span></div>
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Lightning Rate</span><span className="text-gray-200">180/min</span></div>
               <div className="flex justify-between hover:bg-gray-800/50 p-1 rounded transition-colors"><span className="text-gray-500">Growth Rate</span><span className="text-green-400">+22%/10min</span></div>
             </div>
           )}
           {activeTab !== 'Overview' && (
             <div className="flex h-[80%] items-center justify-center text-gray-500 animate-in fade-in duration-500">
               {activeTab} data loading...
             </div>
           )}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="h-[90px] flex gap-3 shrink-0">
         <div className="flex-[3] bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-200 mb-2">Lifecycle Timeline</h3>
            <div className="flex-1 relative flex items-center px-8">
               <div className="absolute left-12 right-12 h-1 bg-gray-700 rounded-full"></div>
               <div className="absolute left-12 w-2/3 h-1 bg-blue-500 rounded-full transition-all duration-1000"></div>
               
               <div className="flex justify-between w-full relative z-10">
                 <div className="flex flex-col items-center gap-2 group cursor-pointer">
                   <div className="w-3 h-3 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                   <span className="text-xs text-gray-400 group-hover:text-gray-300">Initiating</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 group cursor-pointer">
                   <div className="w-3 h-3 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                   <span className="text-xs text-gray-400 group-hover:text-gray-300">Developing</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 group cursor-pointer">
                   <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-[#111622] group-hover:scale-125 transition-transform"></div>
                   <span className="text-xs text-blue-400 font-bold">Mature</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 group cursor-pointer">
                   <div className="w-3 h-3 rounded-full bg-gray-600 group-hover:scale-150 transition-transform"></div>
                   <span className="text-xs text-gray-500 group-hover:text-gray-400">Dissipating</span>
                 </div>
               </div>
            </div>
         </div>
         <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-2 flex flex-col cursor-pointer group">
            <h3 className="text-[11px] font-semibold text-gray-400 mb-1 group-hover:text-gray-300 transition-colors">Current Frame (14:32 IST)</h3>
            <div className="flex-1 bg-[#0a0d14] rounded-lg overflow-hidden relative">
               {/* Tiny radar view */}
               <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-yellow-500/50 to-red-600/80 mix-blend-screen scale-150 group-hover:scale-125 transition-transform duration-700"></div>
            </div>
         </div>
      </div>
    </div>
  );
}
