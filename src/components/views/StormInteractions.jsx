import React from 'react';

export default function StormInteractions() {
  return (
    <div className="flex-1 bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden relative">
      <h2 className="absolute top-4 left-4 text-xl font-bold text-gray-200 z-10 bg-[#111622]/80 px-4 py-2 rounded-lg backdrop-blur">Storm Interaction Graph</h2>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-xl p-4 w-[250px] text-sm">
         <div className="flex flex-col gap-3">
           <div className="flex items-center gap-3"><div className="w-8 h-[2px] bg-white relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 border-l-[6px] border-l-white border-y-[4px] border-y-transparent"></div></div><span className="text-gray-300">Movement Direction</span></div>
           <div className="flex items-center gap-3"><div className="w-8 h-[2px] border-t-2 border-dashed border-gray-500 relative"></div><span className="text-gray-300">Interaction</span></div>
           <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-gray-300">Possible Merger</span></div>
           <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-gray-300">Splitting</span></div>
           <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-gray-300">New Cell Formation</span></div>
         </div>
      </div>

      {/* Map Background */}
      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Clouds_over_the_Atlantic_Ocean.jpg')] opacity-10 bg-cover bg-center mix-blend-luminosity"></div>

      {/* Graph Area */}
      <div className="absolute inset-0 flex items-center justify-center">
         <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
            {/* Arrows */}
            <path d="M 400 350 Q 500 250 600 250" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
            <path d="M 400 350 Q 550 500 700 550" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
            <path d="M 700 550 Q 750 450 800 450" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
            
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
              </marker>
            </defs>

            {/* Labels for interactions */}
            <g transform="translate(480, 260)">
              <rect x="0" y="0" width="120" height="40" rx="4" fill="#eab308" fillOpacity="0.2" stroke="#eab308" strokeOpacity="0.5" />
              <text x="60" y="16" fill="#fde047" fontSize="10" textAnchor="middle" fontWeight="bold">Possible merger</text>
              <text x="60" y="30" fill="#fde047" fontSize="10" textAnchor="middle">in 40-60 min</text>
            </g>

            <g transform="translate(680, 570)">
               <rect x="0" y="0" width="130" height="24" rx="4" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeOpacity="0.5" />
               <text x="65" y="16" fill="#86efac" fontSize="10" textAnchor="middle" fontWeight="bold">New cell formation likely</text>
            </g>
         </svg>

         {/* Nodes rendered as absolute divs for better styling */}
         {/* Cell A */}
         <div className="absolute top-[350px] left-[350px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 via-yellow-500/50 to-transparent border border-red-500/50 flex items-center justify-center">
               <div className="w-4 h-4 rounded-full border-2 border-white bg-red-500"></div>
            </div>
            <div className="mt-2 text-center">
              <div className="font-bold text-gray-200">Cell A</div>
              <div className="text-xs text-red-400">Mature</div>
            </div>
         </div>

         {/* Cell B */}
         <div className="absolute top-[250px] left-[650px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 via-yellow-500/30 to-transparent border border-orange-500/50 flex items-center justify-center">
               <div className="w-4 h-4 rounded-full border-2 border-white bg-orange-500"></div>
            </div>
            <div className="mt-2 text-center">
              <div className="font-bold text-gray-200">Cell B</div>
              <div className="text-xs text-orange-400">Developing</div>
            </div>
         </div>

         {/* Cell C */}
         <div className="absolute top-[550px] left-[700px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500 via-blue-500/30 to-transparent border border-green-500/50 flex items-center justify-center">
               <div className="w-4 h-4 rounded-full border-2 border-white bg-green-500"></div>
            </div>
            <div className="mt-2 text-center">
              <div className="font-bold text-gray-200">Cell C</div>
              <div className="text-xs text-green-400">Initiating</div>
            </div>
         </div>

         {/* Cell D */}
         <div className="absolute top-[450px] left-[850px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-60">
            <div className="w-12 h-12 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-gray-500/30 to-transparent border border-blue-500/50 flex items-center justify-center">
               <div className="w-3 h-3 rounded-full border border-white bg-gray-500"></div>
            </div>
            <div className="mt-2 text-center">
              <div className="font-bold text-gray-200">Cell D</div>
              <div className="text-xs text-gray-500">Dissipating</div>
            </div>
         </div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex flex-col items-center">
        <div className="w-24 h-[1px] bg-gray-400 mb-1"></div>
        <span className="text-[10px] text-gray-400">50 km</span>
      </div>
    </div>
  );
}
