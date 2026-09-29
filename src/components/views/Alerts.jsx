import React, { useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, Zap, CloudHail, Wind, CheckCircle2, Filter, Search } from 'lucide-react';

export default function Alerts() {
  const [activeFilter, setActiveFilter] = useState('All');

  const alerts = [
    { id: 'ALT-104', type: 'Extreme Rain', location: 'Kolkata (North)', time: '10 min ago', severity: 'Critical', status: 'Active', icon: <AlertTriangle size={18} />, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'ALT-103', type: 'Lightning Strike', location: 'Ranchi Suburbs', time: '45 min ago', severity: 'High', status: 'Active', icon: <Zap size={18} />, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { id: 'ALT-102', type: 'Severe Hail', location: 'Bhubaneswar', time: '2 hours ago', severity: 'High', status: 'Resolved', icon: <CloudHail size={18} />, color: 'text-gray-500', bgColor: 'bg-gray-800' },
    { id: 'ALT-101', type: 'Downburst', location: 'Patna Airport', time: '5 hours ago', severity: 'Moderate', status: 'Resolved', icon: <Wind size={18} />, color: 'text-gray-500', bgColor: 'bg-gray-800' },
    { id: 'SYS-042', type: 'System', location: 'Radar Node 4', time: '1 day ago', severity: 'Warning', status: 'Active', icon: <ShieldAlert size={18} />, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  ];

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return alert.status === 'Active';
    if (activeFilter === 'Resolved') return alert.status === 'Resolved';
    if (activeFilter === 'Critical') return alert.severity === 'Critical' || alert.severity === 'High';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-4 h-full min-h-0">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#111622] p-4 rounded-xl border border-gray-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Bell size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-gray-200">Alert Center</h2>
            <p className="text-xs text-gray-500">Manage and monitor automated early warnings</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              className="w-[200px] bg-[#0a0d14] text-sm text-gray-300 placeholder-gray-600 rounded-full py-1.5 pl-9 pr-4 border border-gray-700/50 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
            Create Rule
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
         {/* Main List */}
         <div className="flex-[2.5] flex flex-col gap-3 min-h-0">
            {/* Filters */}
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 mr-2 text-gray-500 text-sm"><Filter size={14} /> Filter:</div>
               {['All', 'Active', 'Critical', 'Resolved'].map((filter, i) => (
                 <button 
                   key={i} 
                   onClick={() => setActiveFilter(filter)}
                   className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeFilter === filter ? 'bg-blue-600 text-white' : 'bg-[#111622] border border-gray-800/60 text-gray-400 hover:text-white'}`}
                 >
                   {filter}
                 </button>
               ))}
            </div>

            {/* Alert Items */}
            <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
               {filteredAlerts.map((alert, i) => (
                 <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-[#1a2133] ${alert.status === 'Active' ? 'border-gray-700/50 bg-[#0a0d14]' : 'border-gray-800/30 bg-[#0a0d14]/50 opacity-60'}`}>
                    <div className={`p-2.5 rounded-lg ${alert.bgColor} ${alert.color} shrink-0`}>
                      {alert.icon}
                    </div>
                    
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-semibold ${alert.status === 'Active' ? 'text-gray-200' : 'text-gray-400'}`}>{alert.type}</h3>
                          <span className="text-xs text-gray-500 font-mono">{alert.time}</span>
                       </div>
                       
                       <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1"><span className="text-gray-500">ID:</span> {alert.id}</span>
                          <span className="flex items-center gap-1"><span className="text-gray-500">Location:</span> {alert.location}</span>
                       </div>

                       <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                             alert.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                             alert.severity === 'High' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                             alert.severity === 'Warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                             'bg-gray-800 border-gray-700 text-gray-400'
                          }`}>
                            {alert.severity} Severity
                          </span>
                          
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                            alert.status === 'Active' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 bg-gray-800'
                          }`}>
                            {alert.status === 'Active' ? <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div> : <CheckCircle2 size={10} />}
                            {alert.status}
                          </span>
                       </div>
                    </div>
                    
                    {alert.status === 'Active' && (
                      <button className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded transition-colors shrink-0">
                        Acknowledge
                      </button>
                    )}
                 </div>
               ))}
            </div>
         </div>

         {/* Right Sidebar Stats */}
         <div className="flex-[1] flex flex-col gap-4 min-h-0">
            <div className="bg-[#111622] rounded-xl border border-gray-800/60 p-4">
               <h3 className="text-sm font-semibold text-gray-200 mb-4">Alert Summary</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-red-400">1</span>
                    <span className="text-[10px] text-red-500/80 uppercase tracking-wider">Critical</span>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-orange-400">2</span>
                    <span className="text-[10px] text-orange-500/80 uppercase tracking-wider">High Risk</span>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex flex-col items-center justify-center col-span-2">
                    <span className="text-2xl font-bold text-blue-400">4</span>
                    <span className="text-[10px] text-blue-500/80 uppercase tracking-wider">Total Active Alerts</span>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex flex-col">
               <h3 className="text-sm font-semibold text-gray-200 mb-3">Notification Channels</h3>
               <div className="flex flex-col gap-2">
                 <div className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded transition-colors">
                   <div className="flex items-center gap-2 text-sm text-gray-300">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div> SMS Gateway
                   </div>
                   <span className="text-xs text-green-400">Connected</span>
                 </div>
                 <div className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded transition-colors">
                   <div className="flex items-center gap-2 text-sm text-gray-300">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div> Email Server
                   </div>
                   <span className="text-xs text-green-400">Connected</span>
                 </div>
                 <div className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded transition-colors">
                   <div className="flex items-center gap-2 text-sm text-gray-300">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Webhook API
                   </div>
                   <span className="text-xs text-red-400">Failing</span>
                 </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
