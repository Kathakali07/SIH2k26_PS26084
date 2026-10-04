import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Zap, CloudHail, Wind, CloudRain } from 'lucide-react';

export default function HazardForecast() {
  const [activeTab, setActiveTab] = useState('Lightning');
  const [activeTime, setActiveTime] = useState('Next 6 Hours');

  const getChartData = (type) => {
    // Generate different fake data based on type
    const base = type === 'Lightning' ? 50 : type === 'Hail' ? 30 : type === 'Downburst' ? 40 : 60;
    return [
      { time: 'Now', prob: base - 30 > 0 ? base - 30 : 5 },
      { time: '1h', prob: base - 5 },
      { time: '2h', prob: base + 20 },
      { time: '3h', prob: base + 15 },
      { time: '4h', prob: base - 10 },
      { time: '5h', prob: base - 25 > 0 ? base - 25 : 10 },
      { time: '6h', prob: base - 40 > 0 ? base - 40 : 5 },
    ];
  };

  const currentData = getChartData(activeTab);

  const getIcon = (type) => {
    switch (type) {
      case 'Lightning': return <Zap size={20} />;
      case 'Hail': return <CloudHail size={20} />;
      case 'Downburst': return <Wind size={20} />;
      case 'Extreme Rain': return <CloudRain size={20} />;
      default: return <Zap size={20} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0">
      {/* Top Tabs */}
      <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-gray-800/60">
        {['Overview', 'Lightning', 'Hail', 'Downburst', 'Extreme Rain'].map((tab, i) => (
          <button 
            key={i} 
            onClick={() => tab !== 'Overview' && setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Main Map Area */}
        <div className="flex-[2.5] relative bg-[#0a0d14] rounded-xl border border-gray-800/60 overflow-hidden flex flex-col group">
           {/* Time Tabs */}
           <div className="absolute top-4 left-4 z-10 flex bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg overflow-hidden text-sm">
             {['Next 6 Hours', 'Now', '1h', '2h', '3h', '4h', '5h', '6h'].map((t,i) => (
               <button 
                 key={i} 
                 onClick={() => setActiveTime(t)}
                 className={`px-3 py-1.5 transition-colors border-r border-gray-700 last:border-0 ${activeTime === t ? 'bg-gray-800 text-blue-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
               >
                 {t}
               </button>
             ))}
           </div>

           {/* Map fake content */}
           <div 
             className="absolute inset-0 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"
             style={{
               backgroundImage: `radial-gradient(ellipse at center, ${
                 activeTab === 'Lightning' ? 'rgba(220,38,38,0.4) 0%, rgba(234,179,8,0.2) 50%, transparent 100%' :
                 activeTab === 'Hail' ? 'rgba(59,130,246,0.4) 0%, rgba(168,85,247,0.2) 50%, transparent 100%' :
                 activeTab === 'Downburst' ? 'rgba(249,115,22,0.4) 0%, rgba(234,179,8,0.2) 50%, transparent 100%' :
                 'rgba(16,185,129,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 100%'
               })`
             }}
           >
             {/* Fake cities */}
             <div className="absolute top-1/2 left-1/3 text-xs text-gray-300 font-medium">Ranchi</div>
             <div className="absolute top-[60%] right-1/3 text-xs text-gray-300 font-medium">Bhubaneswar</div>
           </div>

           {/* Legend */}
           <div className="absolute bottom-4 left-4 bg-[#111622]/90 backdrop-blur border border-gray-700/50 rounded-lg p-3 w-[200px]">
             <div className="text-xs text-gray-300 mb-2 font-medium">{activeTab} Probability</div>
             <div className={`w-full h-2 rounded-full mb-1 bg-gradient-to-r ${
                 activeTab === 'Lightning' ? 'from-blue-900 via-purple-600 to-red-600' :
                 activeTab === 'Hail' ? 'from-green-900 via-blue-600 to-purple-600' :
                 activeTab === 'Downburst' ? 'from-blue-900 via-yellow-600 to-orange-600' :
                 'from-gray-900 via-teal-600 to-blue-600'
             }`}></div>
             <div className="flex justify-between text-[10px] text-gray-500">
               <span>Low</span><span>High</span>
             </div>
           </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col gap-6">
           <div>
             <h2 className="text-lg font-semibold text-gray-200 mb-4">{activeTab} Forecast</h2>
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'Lightning' ? 'bg-red-500/20 text-red-400' :
                    activeTab === 'Hail' ? 'bg-purple-500/20 text-purple-400' :
                    activeTab === 'Downburst' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                }`}>
                  {getIcon(activeTab)}
                </div>
                <div>
                  <div className={`font-bold text-lg ${
                    activeTab === 'Lightning' ? 'text-red-400' :
                    activeTab === 'Hail' ? 'text-purple-400' :
                    activeTab === 'Downburst' ? 'text-orange-400' :
                    'text-blue-400'
                  }`}>{activeTab === 'Hail' ? 'Moderate Risk' : 'High Risk'}</div>
                  <div className="text-sm text-gray-400">{activeTab === 'Hail' ? '30-50%' : '60-80%'} probability</div>
                </div>
             </div>
           </div>

           <div className="h-[150px] flex flex-col">
             <h3 className="text-sm font-semibold text-gray-300 mb-2">Probability over time</h3>
             <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                    <XAxis dataKey="time" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#718096" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <Area 
                      type="monotone" 
                      dataKey="prob" 
                      stroke={activeTab === 'Lightning' ? '#ef4444' : activeTab === 'Hail' ? '#a855f7' : activeTab === 'Downburst' ? '#f97316' : '#3b82f6'} 
                      strokeWidth={2} 
                      fill="url(#colorProb)" 
                      fillOpacity={1} 
                      animationDuration={500}
                    />
                    <defs>
                      <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeTab === 'Lightning' ? '#ef4444' : activeTab === 'Hail' ? '#a855f7' : activeTab === 'Downburst' ? '#f97316' : '#3b82f6'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={activeTab === 'Lightning' ? '#ef4444' : activeTab === 'Hail' ? '#a855f7' : activeTab === 'Downburst' ? '#f97316' : '#3b82f6'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>

           <div>
             <h3 className="text-sm font-semibold text-gray-300 mb-3">Key Indicators</h3>
             <div className="flex flex-col gap-3 text-sm">
               <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Peak Rate (current)</span><span className="text-gray-200">{activeTab === 'Lightning' ? '180/min' : activeTab === 'Hail' ? '30 mm/h' : '45 mm/h'}</span></div>
               <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Trend</span><span className={activeTab === 'Hail' ? 'text-yellow-400' : 'text-red-400'}>{activeTab === 'Hail' ? '+15%' : '+45%'}</span></div>
               <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Top height</span><span className="text-gray-200">12 km</span></div>
               <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">CAPE</span><span className="text-gray-200">2200 J/kg</span></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
