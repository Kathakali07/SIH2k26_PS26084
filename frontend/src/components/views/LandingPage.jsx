import React from 'react';
import { Play, ArrowRight, ShieldCheck, Zap, BarChart2, Activity } from 'lucide-react';

export default function LandingPage({ onEnterApp }) {
  return (
    <div className="h-screen w-screen bg-[#02050a] text-white flex flex-col font-sans overflow-hidden relative select-none">
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050a] via-transparent to-[#02050a] z-10"></div>
        {/* Earth & Alpine Satellite background */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterApp}>
          <div className="w-8 h-8 text-blue-500">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 24l-2.5-8.5L1 12l8.5-2.5z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-wide">ClimaX</span>
            <span className="text-[10px] text-blue-400 font-mono block -mt-1">PRAMAAN-X DGMR</span>
          </div>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-300">
          <button onClick={onEnterApp} className="text-white hover:text-blue-400 transition-colors">Home</button>
          <button onClick={onEnterApp} className="hover:text-blue-400 transition-colors">Live Map</button>
          <button onClick={onEnterApp} className="hover:text-blue-400 transition-colors">DGMR Ensemble</button>
          <button onClick={onEnterApp} className="hover:text-blue-400 transition-colors">Impact Risk</button>
          <button onClick={onEnterApp} className="hover:text-blue-400 transition-colors">About</button>
        </div>
        <button 
          onClick={onEnterApp}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          Launch Nowcast
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-20 flex-1 flex flex-col justify-center px-16 max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-500/40 rounded-full px-3.5 py-1 text-xs text-blue-300 w-fit mb-4 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          DeepMind DGMR Neural Convective Nowcasting System &bull; Swiss Radar Composite
        </div>

        <h1 className="text-6xl font-extrabold leading-tight mb-5 tracking-tight">
          From Storms <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            to Safer Tomorrows
          </span>
        </h1>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl leading-relaxed">
          Operational deep generative AI nowcasting for severe thunderstorms, large hail, destructive downbursts, and flash cloudbursts with spatio-temporal uncertainty quantification.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onEnterApp}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/40 cursor-pointer text-sm"
          >
            Launch Live Nowcast <ArrowRight size={16} />
          </button>
          <button 
            onClick={onEnterApp}
            className="bg-[#111622]/80 backdrop-blur border border-gray-700 hover:bg-[#1e293b]/80 text-white px-7 py-3.5 rounded-full font-semibold flex items-center gap-2 transition-all cursor-pointer text-sm"
          >
            <Play fill="currentColor" size={14} className="text-blue-400" /> Enter Interactive Demo
          </button>
        </div>
      </main>

      {/* Bottom Features */}
      <div className="relative z-20 px-16 pb-10 flex gap-4">
        {[
          { icon: '🌩️', title: 'Storm-as-an-Object\nTracking', desc: 'Objectified cell kinematics & lifecycle stages' },
          { icon: '🔮', title: 'Multiple Possible\nFutures', desc: '16 DGMR Monte Carlo generative ensemble tracks' },
          { icon: '🎯', title: 'Hazard-Specific\nForecasting', desc: 'Discrete probabilities for Hail, Rain, Shear & Lightning' },
          { icon: '🛡️', title: 'Impact Risk &\nCritical Assets', desc: 'Vulnerability mapping for airports, highways & dams' }
        ].map((feat, i) => (
          <div 
            key={i} 
            onClick={onEnterApp}
            className="flex-1 bg-[#111622]/70 backdrop-blur-md border border-gray-800/80 p-5 rounded-2xl hover:bg-[#161e30] hover:border-blue-500/40 transition-all cursor-pointer group shadow-lg"
          >
            <div className="text-2xl mb-2">{feat.icon}</div>
            <h3 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors whitespace-pre-line leading-tight">
              {feat.title}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
