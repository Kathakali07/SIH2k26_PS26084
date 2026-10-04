import React from 'react';
import { Play } from 'lucide-react';
import EarthGlobe from './EarthGlobe';

export default function LandingPage({ onEnterApp }) {
  return (
    <div className="min-h-screen w-full bg-[#02050a] text-white flex flex-col font-sans overflow-x-hidden relative">
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050a] via-transparent to-[#02050a] z-10"></div>
        {/* Placeholder for Earth background */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 animate-float"></div>
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 text-blue-500 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 animate-pulse-glow">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 24l-2.5-8.5L1 12l8.5-2.5z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wide group-hover:text-blue-400 transition-colors duration-300">ClimaX</span>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-300">
          <a href="#" className="text-white hover:-translate-y-0.5 hover:text-blue-400 transition-all duration-300">Features</a>
          <a href="#" className="hover:text-white hover:-translate-y-0.5 hover:text-blue-400 transition-all duration-300">Live Map</a>
          <a href="#" className="hover:text-white hover:-translate-y-0.5 hover:text-blue-400 transition-all duration-300">Our Impact</a>
          <a href="#" className="hover:text-white hover:-translate-y-0.5 hover:text-blue-400 transition-all duration-300">About</a>
          <a href="#" className="hover:text-white hover:-translate-y-0.5 hover:text-blue-400 transition-all duration-300">Contact Us</a>
        </div>
        <button 
          onClick={onEnterApp}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:scale-105 transition-all duration-300"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-20 flex-1 flex flex-row items-center justify-between px-16 w-full max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-bold leading-tight mb-6 animate-fade-up">
            From Storms <br/>
            <span className="text-blue-400">to Safer Tomorrows</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl animate-fade-up delay-100">
            AI-powered convective nowcasting for thunderstorms, hail, downbursts and cloudbursts.
          </p>
          <div className="flex gap-4 animate-fade-up delay-200">
            <button 
              onClick={onEnterApp}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300 group"
            >
              View Live Nowcast <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="bg-[#111622]/80 backdrop-blur border border-gray-700 hover:bg-[#1e293b]/90 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:border-gray-500 hover:-translate-y-1 transition-all duration-300 group">
              <Play fill="currentColor" size={16} className="group-hover:text-blue-400 transition-colors" /> Watch Demo
            </button>
          </div>
        </div>
        <div className="hidden lg:flex flex-1 justify-end items-center relative animate-fade-up delay-400">
          <EarthGlobe />
        </div>
      </main>

      {/* Bottom Features */}
      <div className="relative z-20 px-16 pb-12 flex gap-6">
        {[
          { icon: '🌩️', title: 'Storm-as-an-Object\nIntelligence' },
          { icon: '📊', title: 'Multiple Possible\nFutures' },
          { icon: '🎯', title: 'Hazard-Specific\nForecasting' },
          { icon: '🗺️', title: 'Impact Risk\nAssessment' }
        ].map((feat, i) => (
          <div 
            key={i} 
            className="flex-1 bg-[#111622]/60 backdrop-blur-md border border-gray-800/60 p-6 rounded-2xl hover:bg-[#111622]/90 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] hover:border-blue-500/30 transition-all duration-300 group animate-fade-up"
            style={{ animationDelay: `${300 + i * 100}ms` }}
          >
            <div className="text-3xl mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 origin-bottom-left">{feat.icon}</div>
            <h3 className="text-sm font-semibold text-gray-200 whitespace-pre-line leading-snug group-hover:text-blue-200 transition-colors">{feat.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
