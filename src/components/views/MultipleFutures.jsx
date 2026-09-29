import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function MultipleFutures() {
  const histogramData = [
    { time: '30', freq: 5 },
    { time: '32', freq: 12 },
    { time: '34', freq: 25 },
    { time: '36', freq: 45 },
    { time: '38', freq: 70 },
    { time: '40', freq: 95 },
    { time: '42', freq: 110 },
    { time: '44', freq: 85 },
    { time: '46', freq: 50 },
    { time: '48', freq: 30 },
    { time: '50', freq: 15 },
    { time: '52', freq: 5 },
  ];

  return (
    <div className="flex-1 flex gap-3 h-full min-h-0">
      {/* Left Map Area */}
      <div className="flex-[2] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col p-4">
        <h2 className="text-lg font-bold text-gray-200 mb-2 relative z-10">16 Possible Futures (Cell A)</h2>
        
        {/* Map Area */}
        <div className="flex-1 relative border border-gray-800/50 rounded-lg overflow-hidden bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Clouds_over_the_Atlantic_Ocean.jpg')] bg-cover bg-center before:absolute before:inset-0 before:bg-[#0a0d14]/80 before:z-0">
          
          <div className="absolute right-4 top-4 text-[10px] text-gray-400 flex flex-col gap-1.5 z-10 bg-[#111622]/80 p-2 rounded backdrop-blur">
            <div className="flex items-center gap-2"><div className="w-4 h-[1px] bg-purple-500"></div> Ensemble members</div>
            <div className="flex items-center gap-2"><div className="w-4 h-2 bg-purple-500/20 rounded-sm border border-purple-500/50"></div> 80% interval</div>
            <div className="flex items-center gap-2"><div className="w-4 h-[1px] border-t border-dashed border-gray-300"></div> Deterministic (median)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-gray-400 flex items-center justify-center"><div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div></div> Current position</div>
          </div>

          <svg width="100%" height="100%" className="absolute inset-0 z-10">
             {/* 80% area */}
             <path d="M 200 400 C 300 350, 450 150, 650 100 L 650 350 C 450 300, 300 450, 200 400 Z" fill="rgba(168, 85, 247, 0.15)" stroke="rgba(168, 85, 247, 0.3)" />
             
             {/* Ensemble paths */}
             {Array.from({length: 16}).map((_, i) => (
                <path key={i} d={`M 200 400 Q ${400 + (Math.random()-0.5)*100} ${250 + (Math.random()-0.5)*100} 650 ${150 + i*15}`} fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1" />
             ))}

             {/* Deterministic */}
             <path d="M 200 400 Q 425 275 650 225" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />

             {/* Current pos */}
             <circle cx="200" cy="400" r="4" fill="none" stroke="white" strokeWidth="1.5" />
             <circle cx="200" cy="400" r="1.5" fill="white" />
             
             <text x="200" y="420" fill="#d1d5db" fontSize="12" fontWeight="bold" textAnchor="middle">Kolkata</text>
          </svg>
          
          <div className="absolute bottom-4 left-4 flex flex-col items-center z-10">
            <div className="w-24 h-[1px] bg-gray-400 mb-1"></div>
            <span className="text-[10px] text-gray-400">20 km</span>
          </div>
        </div>
      </div>

      {/* Right Area */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
         {/* Histogram */}
         <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Arrival Time Distribution</h3>
            
            <div className="flex justify-end gap-6 mb-2">
               <div className="flex flex-col items-end">
                 <span className="text-gray-500 text-xs">Median</span>
                 <span className="text-blue-400 font-bold text-xl">42 min</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-gray-500 text-xs">80% interval</span>
                 <span className="text-gray-300 font-medium">31 - 55 min</span>
               </div>
            </div>

            <div className="flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="time" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Arrival time (minutes)', position: 'insideBottom', offset: -5, fill: '#718096', fontSize: 10 }} />
                  <YAxis stroke="#718096" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#718096', fontSize: 10, dy: 20 }} />
                  <Bar dataKey="freq" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Scenario Snapshots */}
         <div className="bg-[#111622] rounded-xl border border-gray-800/60 p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Scenario Snapshots (Reflectivity at +60 min)</h3>
            <div className="flex gap-2 justify-between">
               {[1, 2, 3, 4, 5].map((item, i) => (
                 <div key={i} className="flex-1 aspect-square rounded-lg bg-[#0a0d14] border border-gray-700/50 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-yellow-500 to-red-600 mix-blend-screen opacity-70" style={{ transform: `scale(${1 + Math.random()*0.5}) translate(${Math.random()*20-10}%, ${Math.random()*20-10}%)`}}></div>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-1 h-1 bg-white rounded-full"></div>
                   </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
