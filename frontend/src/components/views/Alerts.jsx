import React, { useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, Zap, CloudHail, Wind, CheckCircle2, Filter, Search, MapPin, Radio, Send, Eye, Check } from 'lucide-react';

export default function Alerts({ storms = [], setActiveTab }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [alertList, setAlertList] = useState([
    {
      id: 'ALT-CH-201',
      type: 'Flash Flood & Cloudburst',
      location: 'Uri / Gotthard Alpine Corridor',
      time: '5 min ago',
      severity: 'Critical',
      status: 'Active',
      impact: 'Gotthard Highway A2 & Rail Infrastructure',
      action: 'Issue Level 4 Flash Flood Warning',
      icon: <AlertTriangle size={18} />,
      color: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400 border border-red-500/40',
      dispatched: false,
    },
    {
      id: 'ALT-CH-202',
      type: 'Severe Supercell & Large Hail',
      location: 'Lake Lucerne & Schwyz Basin',
      time: '12 min ago',
      severity: 'Critical',
      status: 'Active',
      impact: 'Lakeside settlements & electrical substations',
      action: 'Civil Protection Siren Alert Triggered',
      icon: <CloudHail size={18} />,
      color: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400 border border-red-500/40',
      dispatched: true,
    },
    {
      id: 'ALT-CH-203',
      type: 'Downburst & Wind Shear',
      location: 'Zurich Airport (ZRH) Approaches',
      time: '28 min ago',
      severity: 'High',
      status: 'Active',
      impact: 'Aviation traffic & runway operations',
      action: 'Advisory: Impose 30-min ground hold',
      icon: <Wind size={18} />,
      color: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      dispatched: false,
    },
    {
      id: 'ALT-CH-204',
      type: 'Linear Frontal Convection',
      location: 'Jura Mountains toward Basel',
      time: '45 min ago',
      severity: 'Moderate',
      status: 'Active',
      impact: 'Freight routes & Rhine navigation',
      action: 'Monitor radar reflectivity growth rate',
      icon: <Zap size={18} />,
      color: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      dispatched: false,
    },
    {
      id: 'ALT-CH-200',
      type: 'Pre-frontal Inflow Thunderstorm',
      location: 'Ticino / Lake Maggiore Valleys',
      time: '1h 30m ago',
      severity: 'High',
      status: 'Resolved',
      impact: 'Southern mountain slopes',
      action: 'Passed into dissipating stage',
      icon: <CheckCircle2 size={18} />,
      color: 'text-gray-400',
      badge: 'bg-gray-800 text-gray-400 border border-gray-700',
      dispatched: true,
    },
  ]);

  const handleDispatch = (id, actionText) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, dispatched: true } : a));
    setToastMessage(`CAP Broadcast Transmitted: ${actionText} sent to Swiss Polyalert & Cantonal civil services.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAcknowledge = (id) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    setToastMessage(`Alert ${id} marked as acknowledged & resolved.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAlerts = alertList.filter(a => {
    if (activeFilter === 'Active' && a.status !== 'Active') return false;
    if (activeFilter === 'Critical' && a.severity !== 'Critical') return false;
    if (activeFilter === 'Resolved' && a.status !== 'Resolved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = a.type.toLowerCase().includes(q) ||
                    a.location.toLowerCase().includes(q) ||
                    a.impact.toLowerCase().includes(q) ||
                    a.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-3 h-full min-h-0 select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-2xl animate-in slide-in-from-top-2 duration-200 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#111622] p-3 rounded-xl border border-gray-800/60 shrink-0 shadow-lg gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wide">
              Swiss Civil Alert & Early Warning Center
            </h2>
            <p className="text-[11px] text-gray-400">Common Alerting Protocol (CAP v1.2) multi-hazard early warning dispatcher</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts (Uri, Zurich, Hail...)"
            className="w-full bg-[#0a0d14] text-xs text-gray-200 placeholder-gray-500 rounded-lg pl-8 pr-3 py-1.5 border border-gray-700/60 focus:outline-none focus:border-blue-500/60"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {['All', 'Active', 'Critical', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#182030] text-gray-400 hover:text-white border border-gray-700/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Alert Cards List */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#111622] rounded-xl border border-gray-800">
            No matching civil alerts found for "{searchQuery}".
          </div>
        ) : (
          filteredAlerts.map((a) => (
            <div
              key={a.id}
              className="p-3.5 rounded-xl bg-[#111622] border border-gray-800/80 hover:border-gray-700 transition-all flex items-center justify-between shadow-md"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-lg bg-[#0a0d14] border border-gray-800 ${a.color}`}>
                  {a.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">{a.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${a.badge}`}>
                      {a.severity.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-gray-500">&bull; {a.time}</span>
                    {a.dispatched && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 flex items-center gap-1">
                        <Check size={10} /> DISPATCHED
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{a.type}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-1">
                    <MapPin size={12} />
                    <span>{a.location}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Target Impact: <strong className="text-gray-300">{a.impact}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-right flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold ${a.status === 'Active' ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}>
                    ● {a.status.toUpperCase()}
                  </span>
                  {a.status === 'Active' && (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                      title="Acknowledge alert"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('Live Nowcast')}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40 px-2.5 py-1 rounded transition-colors"
                  >
                    <Eye size={12} /> View on Map
                  </button>

                  <button
                    onClick={() => handleDispatch(a.id, a.action)}
                    className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded border transition-all cursor-pointer font-medium ${
                      a.dispatched
                        ? 'bg-emerald-900/30 text-emerald-300 border-emerald-600/40'
                        : 'bg-red-600/20 text-red-300 border-red-500/40 hover:bg-red-600/30 hover:border-red-400'
                    }`}
                  >
                    <Send size={11} />
                    {a.dispatched ? 'Re-broadcast CAP' : a.action}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
