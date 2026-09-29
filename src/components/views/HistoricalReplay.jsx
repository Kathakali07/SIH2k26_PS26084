import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronDown } from 'lucide-react';

export default function HistoricalReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(33); // Start at 33% (14:00 to 20:00 -> roughly 16:00)

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0">
      
      {/* Top Controls */}
      <div className="flex items-center gap-6 bg-[#111622] p-3 rounded-xl border border-gray-800/60 shrink-0">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Select Event</span>
          <button className="flex items-center justify-between w-[250px] bg-[#0a0d14] border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-gray-200 hover:bg-[#1a2133] transition-colors">
            <span className="truncate">Kolkata Thunderstorm<br/><span className="text-[10px] text-gray-500">12 May 2024, 14:00 IST</span></span>
            <ChevronDown size={14} className="text-gray-500 shrink-0" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-4 border-l border-gray-800 pl-6">
          <button 
            onClick={() => {
              if (progress >= 100) setProgress(0);
              setIsPlaying(!isPlaying);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-[90px] justify-center"
          >
            {isPlaying ? <><Pause fill="currentColor" size={14} /> Pause</> : <><Play fill="currentColor" size={14} /> Play</>}
          </button>
          
          <div className="flex-1 relative flex flex-col justify-center">
             <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono">
               <span>14:00</span>
               <span className="text-blue-400 font-bold">{Math.floor(14 + (progress/100)*6).toString().padStart(2, '0')}:{Math.floor(((progress/100)*6 % 1)*60).toString().padStart(2, '0')}</span>
               <span>20:00</span>
             </div>
             <div 
               className="h-2 w-full bg-gray-800 rounded-full relative cursor-pointer group"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const p = ((e.clientX - rect.left) / rect.width) * 100;
                 setProgress(Math.max(0, Math.min(100, p)));
               }}
             >
               <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-75" style={{ width: `${progress}%` }}></div>
               <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full group-hover:scale-125 transition-transform duration-75" style={{ left: `${progress}%` }}></div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
         {/* Split Maps */}
         <div className="flex-[3] flex gap-3 min-w-0">
            {/* Prediction */}
            <div className="flex-1 relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col group">
              <div className="absolute top-4 left-4 z-10 text-sm font-bold text-gray-200 bg-[#111622]/80 px-3 py-1.5 rounded-lg backdrop-blur">
                Prediction (At 14:00 IST)
              </div>
              <div className="flex-1 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Clouds_over_the_Atlantic_Ocean.jpg')] bg-cover bg-center opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div 
                   className="w-48 h-48 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/70 via-yellow-500/40 to-transparent blur-md transition-transform duration-75"
                   style={{ transform: `translate(${progress}px, ${-progress/2}px) scale(${1 + progress/200})` }}
                 ></div>
              </div>
              <div className="absolute bottom-16 right-4 text-xs font-bold text-gray-300">Kolkata</div>
              
              <div className="absolute bottom-4 left-4 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-2">
                <div className="text-[10px] text-gray-300 mb-1">Reflectivity (dBZ)</div>
                <div className="w-[150px] h-2 rounded bg-gradient-to-r from-blue-900 via-green-500 to-red-600 mb-1"></div>
                <div className="flex justify-between text-[8px] text-gray-500">
                  <span>0</span><span>70</span>
                </div>
              </div>
            </div>

            {/* Actual */}
            <div className="flex-1 relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col group">
              <div className="absolute top-4 left-4 z-10 text-sm font-bold text-gray-200 bg-[#111622]/80 px-3 py-1.5 rounded-lg backdrop-blur">
                Actual (Observed)
              </div>
              <div className="flex-1 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Clouds_over_the_Atlantic_Ocean.jpg')] bg-cover bg-center opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center translate-x-4 -translate-y-2">
                 <div 
                   className="w-40 h-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/90 via-yellow-500/50 to-transparent blur-sm transition-transform duration-75"
                   style={{ transform: `translate(${progress*1.1}px, ${-progress/1.8}px) scale(${1 + progress/180})` }}
                 ></div>
              </div>
              <div className="absolute bottom-16 right-4 text-xs font-bold text-gray-300">Kolkata</div>
              
              <div className="absolute bottom-4 left-4 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-2">
                <div className="text-[10px] text-gray-300 mb-1">Reflectivity (dBZ)</div>
                <div className="w-[150px] h-2 rounded bg-gradient-to-r from-blue-900 via-green-500 to-red-600 mb-1"></div>
                <div className="flex justify-between text-[8px] text-gray-500">
                  <span>0</span><span>70</span>
                </div>
              </div>
            </div>
         </div>

         {/* Right Metrics */}
         <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-200 mb-6">Verification Metrics</h3>
            
            <div className="flex flex-col gap-4 text-sm flex-1">
              <div className="flex justify-between items-center"><span className="text-gray-400">POD</span><span className="text-gray-200 font-mono transition-all">{(0.82 - (Math.random()*0.02 * (isPlaying?1:0))).toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">FAR</span><span className="text-gray-200 font-mono transition-all">{(0.18 + (Math.random()*0.02 * (isPlaying?1:0))).toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">CSI</span><span className="text-gray-200 font-mono transition-all">{(0.71 - (Math.random()*0.02 * (isPlaying?1:0))).toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">CRPS</span><span className="text-gray-200 font-mono transition-all">{(0.24 + (Math.random()*0.01 * (isPlaying?1:0))).toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">Brier Skill</span><span className="text-green-400 font-mono transition-all">{(0.63 - (Math.random()*0.01 * (isPlaying?1:0))).toFixed(2)}</span></div>
            </div>

            <div className="mt-auto bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 group">
               <h4 className="text-xs font-bold text-blue-400 mb-1 group-hover:text-blue-300 transition-colors">No Future Data Leakage</h4>
               <p className="text-[10px] text-gray-400">Uses only data available at the forecast time.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
