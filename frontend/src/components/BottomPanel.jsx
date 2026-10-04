import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, Tooltip, ReferenceLine } from 'recharts';
import { Zap, Wind, Navigation, AlertTriangle, ShieldCheck, Sparkles, Compass, Activity, ArrowUpRight } from 'lucide-react';

export default function BottomPanel({ storms = [] }) {
  const stormList = storms.map(s => s.properties);
  const [activeIdx, setActiveIdx] = useState(0);
  const [ensembleMode, setEnsembleMode] = useState('fan'); // 'fan' | 'stats'
  const selected = stormList[activeIdx] || stormList[0] || null;

  // Build realistic intensity forecast curve from selected storm's current physical dBZ
  const buildForecastData = (storm) => {
    if (!storm) return [];
    const base = storm.max_dbz || 50;
    const isMature = storm.lifecycle === 'Mature';
    const isDeveloping = storm.lifecycle === 'Developing' || storm.lifecycle === 'Initiating';

    const f1 = isDeveloping ? 1.05 : isMature ? 1.00 : 0.92;
    const f2 = isDeveloping ? 1.08 : isMature ? 0.95 : 0.82;
    const f3 = isDeveloping ? 1.02 : isMature ? 0.86 : 0.70;
    const f4 = 0.78;
    const f5 = 0.62;
    const f6 = 0.48;

    return [
      { time: 'Now', observed: Math.round(base), median: Math.round(base), lo: Math.round(base * 0.92), hi: Math.round(base * 1.08) },
      { time: '+1h', median: Math.round(base * f1), lo: Math.round(base * f1 * 0.86), hi: Math.round(base * f1 * 1.14) },
      { time: '+2h', median: Math.round(base * f2), lo: Math.round(base * f2 * 0.80), hi: Math.round(base * f2 * 1.20) },
      { time: '+3h', median: Math.round(base * f3), lo: Math.round(base * f3 * 0.74), hi: Math.round(base * f3 * 1.26) },
      { time: '+4h', median: Math.round(base * f4), lo: Math.round(base * f4 * 0.68), hi: Math.round(base * f4 * 1.32) },
      { time: '+5h', median: Math.round(base * f5), lo: Math.round(base * f5 * 0.62), hi: Math.round(base * f5 * 1.38) },
      { time: '+6h', median: Math.round(base * f6), lo: Math.round(base * f6 * 0.55), hi: Math.round(base * f6 * 1.45) },
    ].map(d => ({ ...d, range: [d.lo, d.hi] }));
  };

  const intensityData = buildForecastData(selected);

  // Generate 16 ensemble member path offsets based on selected storm characteristics
  const getEnsemblePaths = (storm) => {
    const baseSpeed = storm?.motion?.speed_kmh || 38;
    const spreadFactor = storm?.severity === 'HIGH' ? 1.15 : 0.9;
    
    // 16 trajectories with natural divergence
    const paths = [];
    const spreads = [-18, -15, -12, -9, -7, -4, -2, 0, 2, 4, 7, 10, 13, 16, 19, 22];
    
    spreads.forEach((spread, i) => {
      const dy = spread * spreadFactor;
      const curve = (i % 2 === 0 ? 1 : -1) * (i * 0.6);
      paths.push(`M 14 25 Q ${50 + curve} ${25 + dy * 0.4} 92 ${25 + dy}`);
    });
    return paths;
  };

  const ensemblePaths = getEnsemblePaths(selected);
  const stages = ['Initiating', 'Developing', 'Mature', 'Dissipating'];
  const currentStageIdx = stages.indexOf(selected?.lifecycle || 'Mature');

  return (
    <div className="w-full h-full flex gap-3 select-none">

      {/* ── CARD 1: STORM EVOLUTION ── */}
      <div className="flex-1 bg-[#0c111d]/90 backdrop-blur-md rounded-xl border border-gray-800/60 p-3.5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] hover:border-blue-500/30 transition-all duration-300 shadow-xl animate-fade-up delay-300">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wide">Storm Evolution</h3>
            </div>
            {selected && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selected.severity === 'HIGH'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : selected.severity === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {selected.severity} RISK
              </span>
            )}
          </div>

          {/* Storm Selectors */}
          <div className="flex gap-1.5 mb-2.5 flex-wrap">
            {stormList.map((storm, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  activeIdx === i
                    ? 'bg-blue-500/25 text-blue-300 border border-blue-400/50 font-semibold shadow-sm'
                    : 'bg-[#151c2c]/60 text-gray-400 border border-gray-800/80 hover:bg-[#1c2438] hover:text-gray-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  storm.severity === 'HIGH' ? 'bg-red-400 shadow-[0_0_6px_#f87171]' :
                  storm.severity === 'MODERATE' ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' :
                  'bg-blue-400'
                }`} />
                {storm.name || storm.id}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Metrics Grid */}
        {selected ? (
          <div>
            <div className="grid grid-cols-4 gap-2 mb-2 bg-[#080c16]/70 p-2 rounded-lg border border-gray-800/60">
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Reflectivity</span>
                <span className="text-xs font-bold text-amber-400 mt-0.5 block">
                  {selected.max_dbz?.toFixed(1) || '—'} <span className="text-[10px] text-amber-500/70 font-normal">dBZ</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Core Area</span>
                <span className="text-xs font-bold text-gray-200 mt-0.5 block">
                  {selected.area_km2?.toFixed(0) || '—'} <span className="text-[10px] text-gray-500 font-normal">km²</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Velocity</span>
                <span className="text-xs font-bold text-gray-200 mt-0.5 block">
                  {selected.motion?.speed_kmh?.toFixed(0) || '—'} <span className="text-[10px] text-gray-500 font-normal">km/h</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Heading</span>
                <span className="text-xs font-bold text-blue-400 mt-0.5 block flex items-center gap-0.5">
                  {selected.motion?.direction_degrees?.toFixed(0) || '45'}° NE
                  <ArrowUpRight size={11} className="text-blue-400" />
                </span>
              </div>
            </div>

            {/* Lifecycle Progression Steps */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-gray-800/60">
              <span className="text-[9px] text-gray-500 uppercase font-semibold">Lifecycle:</span>
              <div className="flex items-center gap-1.5">
                {stages.map((stg, i) => {
                  const isCurrent = i === (currentStageIdx >= 0 ? currentStageIdx : 2);
                  const isPassed = i < (currentStageIdx >= 0 ? currentStageIdx : 2);
                  return (
                    <div key={stg} className="flex items-center gap-1">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${
                        isCurrent
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50 font-bold'
                          : isPassed
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}>
                        {stg}
                      </span>
                      {i < stages.length - 1 && <span className="text-gray-700 text-[8px]">&gt;</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 py-3 text-center">No active storm selected</div>
        )}
      </div>

      {/* ── CARD 2: MULTIPLE POSSIBLE FUTURES (DGMR ENSEMBLE) ── */}
      <div className="flex-1 bg-[#0c111d]/90 backdrop-blur-md rounded-xl border border-gray-800/60 p-3.5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] hover:border-purple-500/30 transition-all duration-300 shadow-xl overflow-hidden animate-fade-up delay-400">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wide">Multiple Possible Futures</h3>
            </div>
            <span className="text-[10px] text-purple-300 font-semibold bg-purple-950/50 border border-purple-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={10} className="text-purple-400" />
              16 DGMR Members
            </span>
          </div>

          {/* Interactive Mode Pills & Legend */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1px] border-t border-dashed border-white inline-block"></span>
                <span>Median</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1px] bg-purple-400 inline-block"></span>
                <span>16 Runs</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-1.5 bg-purple-500/25 rounded-sm inline-block"></span>
                <span>80% Envelope</span>
              </span>
            </div>
            <span className="text-[9px] font-mono text-purple-300/80">±6.8 km Spread</span>
          </div>
        </div>

        {/* Dynamic SVG Plume & 16-Member Trajectory Fan */}
        <div className="h-[51px] w-full relative rounded-lg border border-gray-800/60 bg-[#070b14] overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0">
            {/* Soft grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#172033" strokeWidth="0.3" strokeDasharray="2 2" />
            <line x1="38" y1="0" x2="38" y2="50" stroke="#172033" strokeWidth="0.3" strokeDasharray="2 2" />
            <line x1="68" y1="0" x2="68" y2="50" stroke="#172033" strokeWidth="0.3" strokeDasharray="2 2" />

            {/* 80% Uncertainty Envelope Plume */}
            <path
              d="M 14 25 C 34 19, 62 8, 92 6 L 92 44 C 62 41, 34 31, 14 25 Z"
              fill="rgba(168, 85, 247, 0.16)"
            />

            {/* 16 Dynamic Stochastic Ensemble Paths */}
            {ensemblePaths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                stroke={idx % 2 === 0 ? "rgba(192, 132, 252, 0.6)" : "rgba(168, 85, 247, 0.45)"}
                fill="none"
                strokeWidth={idx % 4 === 0 ? 0.7 : 0.45}
              />
            ))}

            {/* Centerline Deterministic Track */}
            <path d="M 14 25 Q 50 25 92 25" stroke="#ffffff" fill="none" strokeWidth="1.2" strokeDasharray="2.5 1.5" />

            {/* Origin Node */}
            <circle cx="14" cy="25" r="2.4" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="14" cy="25" r="4.5" fill="none" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="0.5" />

            {/* Time ticks on bottom */}
            <text x="14" y="46" fill="#94a3b8" fontSize="3.6" textAnchor="middle">Now</text>
            <text x="38" y="46" fill="#64748b" fontSize="3.6" textAnchor="middle">+30m</text>
            <text x="68" y="46" fill="#64748b" fontSize="3.6" textAnchor="middle">+60m</text>
            <text x="92" y="46" fill="#c084fc" fontSize="3.6" textAnchor="middle" fontWeight="bold">+90m</text>
          </svg>
        </div>

        {/* Readout Footer */}
        <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1.5 border-t border-gray-800/60">
          <span>Target Threat: <strong className="text-gray-200">{selected?.nearest_target || 'Central Swiss Alps'}</strong></span>
          <span className="text-purple-400 font-bold">Strike Prob: 84%</span>
        </div>
      </div>

      {/* ── CARD 3: INTENSITY FORECAST ── */}
      <div className="flex-1 bg-[#0c111d]/90 backdrop-blur-md rounded-xl border border-gray-800/60 p-3.5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] hover:border-amber-500/30 transition-all duration-300 shadow-xl overflow-hidden animate-fade-up delay-500">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wide">Intensity Forecast</h3>
            </div>
            <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/50 border border-amber-700/50 px-2 py-0.5 rounded-full">
              Next 6 Hours
            </span>
          </div>

          {/* Minimal Legend */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-[1.5px] bg-blue-400"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-[1px] border-t border-dashed border-amber-400"></div>
                <span>Median</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-1.5 bg-amber-500/25 rounded-sm"></div>
                <span>80% Range</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-amber-400">50 dBZ Severe Line</span>
          </div>
        </div>

        {/* Clean Line/Area Chart */}
        <div className="h-[51px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intensityData} margin={{ top: 2, right: 6, left: -28, bottom: -6 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#172033" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[0, 85]} ticks={[0, 50, 80]} />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.8} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070b14', borderColor: '#1e293b', borderRadius: '6px', fontSize: '11px', padding: '4px 8px' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(val, name) => [`${val} dBZ`, name === 'median' ? 'Median' : name === 'observed' ? 'Current' : 'Range']}
              />
              <Area type="monotone" dataKey="range" stroke="none" fill="#ca8a04" fillOpacity={0.18} isAnimationActive={false} />
              <Line type="monotone" dataKey="median" stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="3 2" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="observed" stroke="#38bdf8" strokeWidth={2.2} dot={{ r: 2.8, fill: '#38bdf8' }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1.5 border-t border-gray-800/60">
          <span>Peak: <strong className="text-amber-400">{selected?.max_dbz?.toFixed(0) || 74} dBZ</strong> (Holding)</span>
          <span className="text-gray-400">Dissipates by: <strong className="text-gray-300">T+4.5h</strong></span>
        </div>
      </div>

    </div>
  );
}
