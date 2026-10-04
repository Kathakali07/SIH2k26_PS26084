import React from 'react';
import { ChevronRight, Zap, CloudHail, Wind, CloudRain, MapPin, Plane, Car, Home, PlusSquare, Settings } from 'lucide-react';

export default function RightSidebar({ setActiveTab, storms, selectedStormId, onStormSelect }) {
  // Derive storm cards from live API data
  const activeStorms = (storms || []).map((s, i) => {
    const p = s.properties;
    const sev = p.severity || 'LOW';
    const colorMap = {
      HIGH: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', num: 'bg-red-500 text-white' },
      MODERATE: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', num: 'bg-orange-400 text-black' },
      LOW: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', num: 'bg-blue-400 text-black' },
    };
    const colors = colorMap[sev] || colorMap.LOW;
    return {
      id: p.id,
      name: p.name || p.id,
      severity: sev,
      hazard: p.hazard_type || 'Unknown',
      speed: p.motion?.speed_kmh?.toFixed(0) + ' km/h' || '—',
      direction: p.motion?.direction_degrees?.toFixed(0) + '°' || '—',
      maxDbz: p.max_dbz?.toFixed(1) || '—',
      area: p.area_km2?.toFixed(0) + ' km²' || '—',
      lifecycle: p.lifecycle || '—',
      eta: p.eta_utc ? new Date(p.eta_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      badgeClass: colors.badge,
      numClass: colors.num,
    };
  });

  // Derive hazard forecast from best (highest severity) storm
  const bestStorm = storms?.length ? storms.reduce((a, b) => {
    const order = { HIGH: 3, MODERATE: 2, LOW: 1 };
    return (order[a.properties.severity] || 0) >= (order[b.properties.severity] || 0) ? a : b;
  }).properties : null;

  const hazardForecast = bestStorm?.hazards ? [
    { icon: <Zap size={16} className="text-blue-400" />, name: 'Lightning', prob: bestStorm.hazards.lightning },
    { icon: <CloudHail size={16} className="text-blue-300" />, name: 'Hail', prob: bestStorm.hazards.hail },
    { icon: <Wind size={16} className="text-blue-200" />, name: 'Downburst', prob: bestStorm.hazards.downburst },
    { icon: <CloudRain size={16} className="text-blue-500" />, name: 'Extreme Rain', prob: bestStorm.hazards.extreme_rain },
  ] : [];

  const riskLabel = (prob) => {
    if (prob >= 0.6) return { text: 'High', cls: 'text-red-400' };
    if (prob >= 0.3) return { text: 'Moderate', cls: 'text-orange-400' };
    return { text: 'Low', cls: 'text-green-400' };
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">

      {/* Active Storms */}
      <div className="bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-200">Active Storms ({activeStorms.length})</h3>
          <button
            onClick={() => setActiveTab && setActiveTab('Storm Objects')}
            className="text-xs text-blue-400 flex items-center hover:text-blue-300 transition-colors"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {activeStorms.length === 0 && (
            <div className="text-xs text-gray-500 text-center py-4">No active storms detected</div>
          )}
          {activeStorms.slice(0, 5).map((storm, idx) => {
            const isSelected = selectedStormId === storm.id;
            return (
              <div
                key={idx}
                onClick={() => {
                  onStormSelect?.(storm.id);
                  setActiveTab && setActiveTab('Storm Objects');
                }}
                className={`group flex items-center gap-3 rounded-lg p-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#20293f] border-blue-500/80 shadow-md shadow-blue-500/20'
                    : 'bg-[#1a2133] border-gray-700/50 hover:bg-[#20293f] hover:border-blue-500/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${storm.numClass}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-blue-400' : 'text-gray-200 group-hover:text-blue-400'}`}>
                      {storm.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ml-2 shrink-0 ${storm.badgeClass}`}>
                      {storm.severity}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <div className="flex flex-col">
                      <span>{storm.hazard} &bull; {storm.lifecycle}</span>
                      <span>ETA: <span className="text-gray-300">{storm.eta}</span></span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span>{storm.maxDbz} dBZ</span>
                      <span className="text-gray-300">{storm.speed}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Hazard Forecast */}
      {hazardForecast.length > 0 && (
        <div
          className="bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex-shrink-0 cursor-pointer hover:border-blue-500/50 transition-colors group"
          onClick={() => setActiveTab && setActiveTab('Hazard Forecast')}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">Hazard Forecast (Next 6 Hours)</h3>
            <ChevronRight size={14} className="text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {hazardForecast.map((hazard, idx) => {
              const risk = riskLabel(hazard.prob);
              return (
                <div key={idx} className="flex flex-col items-center bg-[#1a2133] rounded-lg p-2 border border-gray-700/50">
                  <div className="mb-2">{hazard.icon}</div>
                  <span className="text-[10px] text-gray-400 text-center leading-tight mb-1">{hazard.name}</span>
                  <span className={`text-[10px] font-bold ${risk.cls}`}>{risk.text}</span>
                  <span className="text-[10px] text-gray-500">{(hazard.prob * 100).toFixed(0)}%</span>
                  {/* Real sparkline */}
                  <svg viewBox="0 0 40 10" className={`w-full h-3 mt-1 stroke-current fill-none ${risk.cls}`} preserveAspectRatio="none">
                    <path d={`M0,${10 - hazard.prob * 10} Q10,${5 - hazard.prob * 3} 20,${8 - hazard.prob * 6} T40,${10 - hazard.prob * 10}`} strokeWidth="1.5" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impact Risk */}
      <div
        className="bg-[#111622] rounded-xl border border-gray-800/60 p-4 flex-1 min-h-[180px] flex flex-col cursor-pointer hover:border-blue-500/50 transition-colors group"
        onClick={() => setActiveTab && setActiveTab('Impact Risk')}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">Impact Risk (Monitored Area)</h3>
          <ChevronRight size={14} className="text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin size={14} /> Storm Region
          </div>
          {bestStorm && (
            <span className={`text-xs px-2 py-1 rounded border ${
              bestStorm.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              bestStorm.severity === 'MODERATE' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
              'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>{bestStorm.severity} Risk</span>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2.5">
          {bestStorm?.indicators && (
            <>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400"><Zap size={14} /> Lightning Rate</div>
                <span className="text-gray-200">{bestStorm.indicators.lightning_rate_flashes_min} fl/min</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400"><CloudRain size={14} /> VIL</div>
                <span className="text-gray-200">{bestStorm.indicators.vil_kg_m2} kg/m²</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400"><Wind size={14} /> Wind Shear</div>
                <span className="text-gray-200">{bestStorm.indicators.shear_ms} m/s</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400"><Settings size={14} /> CAPE</div>
                <span className="text-gray-200">{bestStorm.indicators.cape_jkg} J/kg</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400"><Home size={14} /> Echo Top</div>
                <span className="text-gray-200">{bestStorm.indicators.echo_top_km} km</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
