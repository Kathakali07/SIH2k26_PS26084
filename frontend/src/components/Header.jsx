import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronRight, X } from 'lucide-react';

export default function Header({ setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const swissLocations = [
    { name: 'Zurich Airport (ZRH)', tab: 'Impact Risk', desc: 'Runway downburst & shear risk (~35m ETA)' },
    { name: 'Gotthard Pass & Tunnel', tab: 'Storm Objects', desc: 'Active 74 dBZ Alpine Supercell Core' },
    { name: 'Lake Lucerne & Schwyz Basin', tab: 'Hazard Forecast', desc: 'Flash flood & large hail threat corridor' },
    { name: 'EuroAirport Basel-Mulhouse', tab: 'Hazard Forecast', desc: 'Jura frontal cluster convergence' },
    { name: 'Bern Hub & Inselspital', tab: 'Impact Risk', desc: 'Regional medical & transport node' },
    { name: 'Lugano & Ticino Valleys', tab: 'Storm Interactions', desc: 'Low-level inflow moisture feed' },
  ];

  const filteredLocations = swissLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (loc) => {
    setSearchQuery(loc.name);
    setIsSearchFocused(false);
    if (setActiveTab) {
      setActiveTab(loc.tab);
    }
  };

  return (
    <div className="w-full h-[52px] flex items-center justify-between px-6 bg-[#070b14] border-b border-gray-800/50 shrink-0 relative z-[500] select-none animate-fade-up">
      <div className="flex items-center gap-8">
        {/* Logo Area */}
        <div 
          className="flex items-center gap-3 cursor-pointer group hover:-translate-y-0.5 transition-transform duration-300"
          onClick={() => setActiveTab('Landing Page')}
        >
          <div className="w-8 h-8 text-blue-500 group-hover:scale-110 group-hover:rotate-90 group-hover:text-blue-400 transition-all duration-500 animate-pulse-glow">
            {/* Custom Star/Asterisk Logo */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 24l-2.5-8.5L1 12l8.5-2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white group-hover:text-blue-50 transition-colors">ClimaX</h1>
            <p className="text-[10px] text-gray-400 font-medium">Convective Nowcasting System</p>
          </div>
        </div>
        
        {/* Subtitle */}
        <div className="hidden md:block pl-6 border-l border-gray-800">
          <h2 className="text-sm font-medium text-gray-200">From Storms to Safer Tomorrows</h2>
          <p className="text-[11px] text-gray-500">AI-powered nowcasting for thunderstorms, hail and cloudbursts</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Interactive Swiss Location Search */}
        <div className="relative" ref={searchRef}>
          <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search Swiss location (Zurich, Gotthard, Basel...)" 
            className="w-[225px] bg-[#111622] text-xs text-gray-200 placeholder-gray-500 rounded-full py-2 pl-10 pr-8 border border-gray-700/60 focus:outline-none focus:border-blue-500/80 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={13} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 top-full mt-2 w-[255px] bg-[#111622]/95 backdrop-blur-md rounded-xl border border-gray-700/80 shadow-2xl p-2 z-[9999] animate-in fade-in duration-150">
              <div className="text-[10px] text-gray-400 font-bold px-2 py-1 uppercase tracking-wider">
                Swiss Monitored Nodes ({filteredLocations.length})
              </div>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto custom-scrollbar">
                {filteredLocations.length === 0 ? (
                  <div className="text-xs text-gray-500 p-3 text-center">No matching locations</div>
                ) : (
                  filteredLocations.map((loc, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectLocation(loc)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1a2133] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-gray-200 group-hover:text-blue-300 block">{loc.name}</span>
                          <span className="text-[10px] text-gray-400">{loc.desc}</span>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-gray-600 group-hover:text-blue-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-emerald-400">Live</span>
        </div>
        
        {/* Demo timestamp */}
        <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
          <span className="font-mono text-gray-300">20:45 UTC</span>
          <span className="text-gray-500 text-[11px]">(22:45 CEST Switzerland)</span>
        </div>
      </div>
    </div>
  );
}
