import React, { useState } from 'react';
import { Plane, Car, Home, PlusSquare, Settings, MapPin, AlertTriangle } from 'lucide-react';

export default function ImpactRisk() {
  const [activeTab, setActiveTab] = useState('Overview');

  const assetsMap = {
    'Overview': [
      { icon: <Plane size={14}/>, name: 'Airport', risk: 'High', color: 'text-red-400' },
      { icon: <Car size={14}/>, name: 'Major Roads', risk: 'Moderate', color: 'text-orange-400' },
      { icon: <Home size={14}/>, name: 'Nearby Villages', risk: 'High', color: 'text-red-400' },
      { icon: <PlusSquare size={14}/>, name: 'Hospitals', risk: 'Moderate', color: 'text-orange-400' },
      { icon: <Settings size={14}/>, name: 'Power Infrastructure', risk: 'High', color: 'text-red-400' },
    ],
    'Airports': [
      { icon: <Plane size={14}/>, name: 'Netaji Subhas Chandra Bose', risk: 'High', color: 'text-red-400' },
      { icon: <Plane size={14}/>, name: 'Behala Airport', risk: 'Moderate', color: 'text-orange-400' },
    ],
    'Road Network': [
      { icon: <Car size={14}/>, name: 'NH-12 (North-South)', risk: 'Extreme', color: 'text-purple-400' },
      { icon: <Car size={14}/>, name: 'Kalyani Expressway', risk: 'High', color: 'text-red-400' },
      { icon: <Car size={14}/>, name: 'NH-16 (West)', risk: 'Moderate', color: 'text-orange-400' },
    ],
    'Villages': [
      { icon: <Home size={14}/>, name: 'Rajarhat Rural', risk: 'High', color: 'text-red-400' },
      { icon: <Home size={14}/>, name: 'Baruipur Area', risk: 'High', color: 'text-red-400' },
    ],
    'Hospitals': [
      { icon: <PlusSquare size={14}/>, name: 'Apollo Gleneagles', risk: 'Moderate', color: 'text-orange-400' },
      { icon: <PlusSquare size={14}/>, name: 'AMRI Salt Lake', risk: 'Moderate', color: 'text-orange-400' },
    ],
    'Critical Infrastructure': [
      { icon: <Settings size={14}/>, name: 'CESC Power Grid', risk: 'High', color: 'text-red-400' },
      { icon: <Settings size={14}/>, name: 'Water Treatment Plant', risk: 'Moderate', color: 'text-orange-400' },
    ]
  };

  const assets = assetsMap[activeTab] || assetsMap['Overview'];

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0">
      {/* Top Tabs */}
      <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-gray-800/60">
        {['Overview', 'Airports', 'Road Network', 'Villages', 'Hospitals', 'Critical Infrastructure'].map((tab, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Main Map Area */}
        <div className="flex-[2.5] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden">
           {/* Map fake content */}
           <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Clouds_over_the_Atlantic_Ocean.jpg')] opacity-20 bg-cover bg-center"></div>
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/60 via-orange-500/40 to-transparent scale-150 transition-colors duration-1000"></div>
           
           {/* Markers */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold flex flex-col items-center">
             <div className="w-4 h-4 bg-white rounded-full mb-1 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
             Kolkata
           </div>
           
           {(activeTab === 'Overview' || activeTab === 'Airports') && (
             <div className="absolute top-[40%] left-[40%] w-6 h-6 bg-purple-500/80 rounded-full flex items-center justify-center border-2 border-white text-white cursor-pointer hover:scale-125 transition-transform"><Plane size={12}/></div>
           )}
           {(activeTab === 'Overview' || activeTab === 'Hospitals') && (
             <div className="absolute top-[60%] left-[60%] w-6 h-6 bg-orange-500/80 rounded-full flex items-center justify-center border-2 border-white text-white cursor-pointer hover:scale-125 transition-transform"><PlusSquare size={12}/></div>
           )}
           {(activeTab === 'Overview' || activeTab === 'Critical Infrastructure') && (
             <div className="absolute top-[35%] left-[55%] w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center border-2 border-white text-white cursor-pointer hover:scale-125 transition-transform"><Settings size={12}/></div>
           )}

           {/* Legend */}
           <div className="absolute bottom-4 left-4 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-3 w-[300px]">
             <div className="text-xs text-gray-300 mb-2 font-medium">Impact Risk Level</div>
             <div className="w-full h-3 rounded bg-gradient-to-r from-blue-900 via-green-500 via-yellow-500 to-red-600 mb-1"></div>
             <div className="flex justify-between text-[10px] text-gray-500">
               <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
             </div>
           </div>
           <div className="absolute bottom-4 right-4 flex flex-col items-center">
             <div className="w-16 h-[1px] bg-gray-400 mb-1"></div>
             <span className="text-[10px] text-gray-400">20 km</span>
           </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
           
           <div className="flex items-center justify-between border-b border-gray-800 pb-4">
             <div className="flex items-center gap-2 text-gray-200 font-semibold">
               <div className="bg-gray-800 p-1.5 rounded-lg"><Home size={16}/></div> Kolkata (City)
             </div>
             <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded font-medium text-xs">High Risk</span>
           </div>

           <div className="flex flex-col gap-3">
             <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Overall Risk</span><span className="text-red-400 font-medium text-sm">High</span></div>
             <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Lightning Risk</span><span className="text-red-400 font-medium text-sm">High</span></div>
             <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Hail Risk</span><span className="text-orange-400 font-medium text-sm">Moderate</span></div>
             <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Downburst Risk</span><span className="text-red-400 font-medium text-sm">High</span></div>
             <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Extreme Rain Risk</span><span className="text-red-400 font-medium text-sm">High</span></div>
           </div>

           <div>
             <h3 className="text-sm font-semibold text-gray-200 mb-4">{activeTab === 'Overview' ? 'Key Assets at Risk' : `${activeTab} at Risk`}</h3>
             <div className="flex flex-col gap-3">
               {assets.map((asset, i) => (
                 <div key={i} className="flex justify-between items-center bg-[#1a2133] hover:bg-[#20293f] p-2.5 rounded-lg border border-gray-700/50 transition-colors cursor-pointer">
                   <div className="flex items-center gap-3 text-sm text-gray-300">
                     <div className="text-gray-400">{asset.icon}</div>
                     {asset.name}
                   </div>
                   <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                     asset.risk === 'Extreme' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                     asset.risk === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                   }`}>{asset.risk}</span>
                 </div>
               ))}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
