import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function BottomPanel() {
  const [activeCell, setActiveCell] = useState('Cell A');

  const intensityData = [
    { time: 'Now', observed: 35, median: 35, range: [30, 40] },
    { time: '1h', median: 45, range: [35, 55] },
    { time: '2h', median: 58, range: [45, 70] },
    { time: '3h', median: 65, range: [50, 75] },
    { time: '4h', median: 60, range: [45, 75] },
    { time: '5h', median: 45, range: [30, 60] },
    { time: '6h', median: 30, range: [20, 45] },
  ];

  const cells = ['Cell A', 'Cell B', 'Cell C'];

  return (
    <div className="w-full h-full flex gap-3">
      
      {/* Storm Evolution */}
      <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col hover:border-gray-600 transition-colors">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Storm Evolution</h3>
        <div className="flex gap-2 mb-3">
          {cells.map((cell, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCell(cell)}
              className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 border transition-all duration-300 ${activeCell === cell ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 scale-105' : 'bg-transparent text-gray-500 border-gray-700/50 hover:bg-gray-800 hover:text-gray-300'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
              {cell}
            </button>
          ))}
        </div>
        <div className="flex gap-4 flex-1">
          <div className="w-[140px] rounded-lg overflow-hidden border border-gray-700/50 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-yellow-500 to-red-600 opacity-80 mix-blend-screen group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 border-[0.5px] border-white/20 m-4 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-1 text-xs content-start">
            <span className="text-gray-500">Lifecycle Stage</span><span className="text-gray-200 text-right">Mature</span>
            <span className="text-gray-500">Area</span><span className="text-gray-200 text-right">320 km²</span>
            <span className="text-gray-500">Max dBZ</span><span className="text-gray-200 text-right">{activeCell === 'Cell A' ? '62' : activeCell === 'Cell B' ? '54' : '68'}</span>
            <span className="text-gray-500">Top Height</span><span className="text-gray-200 text-right">12 km</span>
            <span className="text-gray-500">Speed</span><span className="text-gray-200 text-right">38 km/h</span>
            <span className="text-gray-500">Direction</span><span className="text-gray-200 text-right">NE (45°)</span>
            <span className="text-gray-500">Lightning Rate</span><span className="text-gray-200 text-right">180/min</span>
            <span className="text-gray-500">Growth Rate</span><span className={`text-right ${activeCell === 'Cell C' ? 'text-red-400' : 'text-green-400'}`}>{activeCell === 'Cell C' ? '+35%/10min' : '+22%/10min'}</span>
          </div>
        </div>
      </div>

      {/* Multiple Possible Futures */}
      <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col relative overflow-hidden hover:border-gray-600 transition-colors">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Multiple Possible Futures ({activeCell})</h3>
        <div className="absolute right-4 top-10 text-[10px] text-gray-400 flex flex-col gap-1.5 z-10 bg-[#111622]/80 p-1.5 rounded backdrop-blur">
          <div className="flex items-center gap-2"><div className="w-4 h-[1px] border-t border-dashed border-gray-300"></div> Deterministic</div>
          <div className="flex items-center gap-2"><div className="w-4 h-[1px] bg-purple-500"></div> Ensemble members</div>
          <div className="flex items-center gap-2"><div className="w-4 h-2 bg-purple-500/20 rounded-sm"></div> 80% interval</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-gray-400 flex items-center justify-center"><div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div></div> Current position</div>
        </div>
        
        <div className="flex-1 relative rounded border border-gray-800/50 bg-[#0a0d14] overflow-hidden group">
           {/* Abstract Plume Visualization using SVG */}
           <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 group-hover:scale-105 transition-transform duration-1000">
             {/* Map background generic */}
             <path d="M 0 50 Q 20 60 40 40 T 100 30" stroke="#1f2937" fill="none" strokeWidth="0.5" />
             <path d="M 20 100 Q 30 70 60 60 T 100 80" stroke="#1f2937" fill="none" strokeWidth="0.5" />
             
             {/* Plume 80% interval area */}
             <path d="M 20 70 C 40 60, 60 30, 95 20 L 95 80 C 60 70, 40 80, 20 70 Z" fill="rgba(168, 85, 247, 0.15)" className="animate-pulse" />
             
             {/* Ensemble members */}
             <path d="M 20 70 Q 50 55 90 25" stroke="rgba(168, 85, 247, 0.4)" fill="none" strokeWidth="0.5" />
             <path d="M 20 70 Q 45 65 92 35" stroke="rgba(168, 85, 247, 0.4)" fill="none" strokeWidth="0.5" />
             <path d="M 20 70 Q 55 70 90 50" stroke="rgba(168, 85, 247, 0.4)" fill="none" strokeWidth="0.5" />
             <path d="M 20 70 Q 50 80 85 75" stroke="rgba(168, 85, 247, 0.4)" fill="none" strokeWidth="0.5" />
             
             {/* Deterministic */}
             <path d="M 20 70 Q 50 65 95 45" stroke="#fff" fill="none" strokeWidth="1" strokeDasharray="2 2" />
             
             {/* Current Position */}
             <circle cx="20" cy="70" r="1.5" fill="none" stroke="#fff" strokeWidth="0.5" />
             <circle cx="20" cy="70" r="0.5" fill="#fff" />
             <text x="20" y="80" fill="#6b7280" fontSize="4" textAnchor="middle">Kolkata</text>
             
             {/* Scale bar */}
             <line x1="75" y1="90" x2="95" y2="90" stroke="#6b7280" strokeWidth="0.5" />
             <text x="85" y="88" fill="#6b7280" fontSize="3" textAnchor="middle">50 km</text>
           </svg>
        </div>
      </div>

      {/* Intensity Forecast */}
      <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col relative hover:border-gray-600 transition-colors">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Intensity Forecast (Next 6 Hours)</h3>
        
        <div className="absolute right-4 top-3 text-[10px] text-gray-400 flex flex-col gap-1 z-10 items-end bg-[#111622]/80 p-1.5 rounded backdrop-blur">
          <div className="flex items-center gap-2"><div className="w-4 h-[1px] border-t border-dashed border-yellow-500"></div> Max dBZ (median)</div>
          <div className="flex items-center gap-2"><div className="w-4 h-2 bg-yellow-600/20 rounded-sm"></div> 80% interval</div>
          <div className="flex items-center gap-2"><div className="w-4 h-[1px] bg-blue-400"></div> Observed</div>
        </div>

        <div className="flex-1 mt-4 cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intensityData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis dataKey="time" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#718096" fontSize={10} tickLine={false} axisLine={false} domain={[0, 80]} tickCount={5} label={{ value: 'dBZ', angle: -90, position: 'insideLeft', fill: '#718096', fontSize: 10, dy: 10 }} />
              
              <Area type="monotone" dataKey="range" stroke="none" fill="#ca8a04" fillOpacity={0.15} animationDuration={1000} />
              <Line type="monotone" dataKey="median" stroke="#eab308" strokeWidth={1.5} strokeDasharray="3 3" dot={false} animationDuration={1000} />
              <Line type="monotone" dataKey="observed" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2, fill: '#60a5fa' }} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
