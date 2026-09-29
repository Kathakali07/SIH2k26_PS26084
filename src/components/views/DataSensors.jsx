import React, { useState } from 'react';
import { Activity, Satellite, Zap, Cloud, Map as MapIcon, Database, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function DataSensors() {
  const [activeTab, setActiveTab] = useState('Sensor Status');
  const [failedSensors, setFailedSensors] = useState([]);

  const toggleFail = (sensorName) => {
    setFailedSensors(prev => 
      prev.includes(sensorName)
        ? prev.filter(s => s !== sensorName)
        : [...prev, sensorName]
    );
  };

  const initialSensors = [
    { name: 'DWR Radar', icon: <Activity size={16}/>, type: 'radar' },
    { name: 'Satellite (INSAT)', icon: <Satellite size={16}/>, type: 'satellite' },
    { name: 'Lightning Network', icon: <Zap size={16}/>, type: 'lightning' },
    { name: 'NWP (IMD-GFS)', icon: <Cloud size={16}/>, type: 'model' },
    { name: 'AWS / Surface Obs.', icon: <MapIcon size={16}/>, type: 'surface' },
    { name: 'Data Fusion', icon: <Database size={16}/>, type: 'fusion' },
  ];

  const sensors = initialSensors.map(s => {
    const isFailed = failedSensors.includes(s.type);
    
    // Cascading failure for fusion if multiple fail
    const isFusionFailed = s.type === 'fusion' && failedSensors.length >= 2;
    const finalFailed = isFailed || isFusionFailed;

    return {
      ...s,
      status: finalFailed ? (s.type === 'fusion' ? 'Degraded' : 'Offline') : (s.type === 'fusion' ? 'Healthy' : 'Online'),
      time: finalFailed ? 'Stale (12m)' : (s.type === 'fusion' ? '2.3 s' : '14:32 IST'),
      quality: finalFailed ? 'Poor' : 'Good',
      bars: finalFailed ? 1 : (s.type === 'fusion' ? (failedSensors.length === 1 ? 3 : 5) : 5),
      color: finalFailed ? 'text-red-500' : (s.type === 'fusion' ? 'text-blue-500' : 'text-green-500'),
      bgIcon: finalFailed ? 'bg-red-500' : 'bg-green-500'
    };
  });

  return (
    <div className="flex-1 flex flex-col gap-4 h-full min-h-0">
      
      {/* Top Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-800 pb-2">
        {['Sensor Status', 'Data Sources', 'Model Settings', 'Alert Settings'].map((tab, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium pb-2 border-b-2 -mb-[9px] transition-colors ${activeTab === tab ? 'text-blue-400 border-blue-500' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-4 bg-[#111622] rounded-xl border border-gray-800/60 p-6 overflow-y-auto custom-scrollbar">
         
         <div className="flex-1">
            <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-gray-500 mb-4 px-2 uppercase tracking-wider">
               <div>Sensor Status</div>
               <div>Status</div>
               <div>Last Update</div>
               <div>Data Quality</div>
            </div>
            
            <div className="flex flex-col gap-2">
               {sensors.map((s, i) => (
                 <div key={i} className={`grid grid-cols-4 gap-4 items-center border p-3 rounded-lg text-sm transition-all duration-500 ${s.status === 'Offline' || s.status === 'Degraded' ? 'bg-red-900/10 border-red-900/30' : 'bg-[#1a2133] border-gray-700/50'}`}>
                   <div className="flex items-center gap-3 text-gray-300">
                     <div className={s.status === 'Offline' ? 'text-red-400' : 'text-gray-400'}>{s.icon}</div>
                     {s.name}
                   </div>
                   
                   <div className="flex items-center gap-2">
                     {s.type === 'fusion' ? (
                       s.status === 'Degraded' ? <AlertOctagon size={14} className={s.color} /> : <CheckCircle size={14} className={s.color} />
                     ) : (
                       <div className={`w-2 h-2 rounded-full ${s.bgIcon} ${s.status === 'Offline' ? 'animate-pulse' : ''}`}></div>
                     )}
                     <span className={`${s.color} font-medium`}>{s.status}</span>
                   </div>
                   
                   <div className={`${s.status === 'Offline' ? 'text-red-400' : 'text-gray-400'} font-mono text-xs transition-colors`}>{s.time}</div>
                   
                   <div className="flex items-center justify-between pr-4">
                     <span className={s.status === 'Offline' || s.status === 'Degraded' ? 'text-red-400 font-bold' : 'text-green-400'}>{s.quality}</span>
                     <div className="flex items-end gap-0.5 h-3">
                       {[1,2,3,4,5].map(b => (
                         <div key={b} className={`w-1.5 rounded-sm transition-colors duration-500 ${b <= s.bars ? (s.status === 'Offline' || s.status === 'Degraded' ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-700'} ${b===1?'h-1':b===2?'h-1.5':b===3?'h-2':b===4?'h-2.5':'h-3'}`}></div>
                       ))}
                     </div>
                   </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Bottom Area */}
         <div className="flex gap-6 mt-4 pt-6 border-t border-gray-800">
            <div className="flex-1">
               <h3 className="text-sm font-semibold text-gray-200 mb-4">Observability & Reliability</h3>
               <div className="flex gap-8">
                 <div className="flex flex-col gap-2 flex-1">
                   <div className="flex justify-between text-xs"><span className="text-gray-400">Radar Coverage</span><span className="text-gray-200">{failedSensors.includes('radar') ? '15%' : '92%'}</span></div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                     <div className={`h-full transition-all duration-1000 ${failedSensors.includes('radar') ? 'bg-red-500 w-[15%]' : 'bg-blue-500 w-[92%]'}`}></div>
                   </div>
                 </div>
                 <div className="flex flex-col gap-2 flex-1">
                   <div className="flex justify-between text-xs"><span className="text-gray-400">Data Age</span><span className="text-gray-200">{failedSensors.length > 0 ? '> 12 min' : '2-5 min'}</span></div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                     <div className={`h-full transition-all duration-1000 ${failedSensors.length > 0 ? 'bg-red-500 w-[80%]' : 'bg-green-500 w-[10%]'}`}></div>
                   </div>
                 </div>
                 <div className="flex flex-col gap-2 flex-1">
                   <div className="flex justify-between text-xs"><span className="text-gray-400">Missing Sensors</span><span className="text-gray-200">{failedSensors.length}</span></div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                     <div className={`h-full transition-all duration-1000 ${failedSensors.length > 0 ? 'bg-red-500' : 'bg-gray-600'}`} style={{ width: `${(failedSensors.length / 5) * 100}%` }}></div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="w-[300px] bg-red-900/10 border border-red-900/30 rounded-lg p-3">
               <h3 className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Simulate Sensor Failure <span className="text-gray-500 text-[10px]">(Demo)</span></h3>
               <div className="flex gap-2">
                 <button 
                   onClick={() => toggleFail('radar')}
                   className={`flex-1 text-xs py-1.5 rounded transition-colors ${failedSensors.includes('radar') ? 'bg-red-600 text-white' : 'bg-[#1a2133] hover:bg-gray-800 text-gray-300 border border-gray-700'}`}
                 >
                   Fail Radar
                 </button>
                 <button 
                   onClick={() => toggleFail('satellite')}
                   className={`flex-1 text-xs py-1.5 rounded transition-colors ${failedSensors.includes('satellite') ? 'bg-red-600 text-white' : 'bg-[#1a2133] hover:bg-gray-800 text-gray-300 border border-gray-700'}`}
                 >
                   Fail Satellite
                 </button>
                 <button 
                   onClick={() => toggleFail('lightning')}
                   className={`flex-1 text-xs py-1.5 rounded transition-colors ${failedSensors.includes('lightning') ? 'bg-red-600 text-white' : 'bg-[#1a2133] hover:bg-gray-800 text-gray-300 border border-gray-700'}`}
                 >
                   Fail Lightning
                 </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
