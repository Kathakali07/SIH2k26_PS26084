import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Settings, LogOut } from 'lucide-react';

export default function Header({ setActiveTab, setSettingsTab }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="w-full h-[70px] flex items-center justify-between px-6 bg-[#070b14] border-b border-gray-800/50 shrink-0 relative z-[500]">
      <div className="flex items-center gap-8">
        {/* Logo Area */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('Landing Page')}
        >
          <div className="w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors">
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
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search location (city, airport, village...)" 
            className="w-[280px] bg-[#111622] text-sm text-gray-300 placeholder-gray-500 rounded-full py-2 pl-10 pr-4 border border-gray-700/50 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-medium text-red-500">Live</span>
        </div>
        
        <div className="text-xs text-gray-400 font-medium flex items-center gap-2 relative">
          29 Sep 2026, 14:32 IST
          
          <div className="relative ml-2" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-blue-900/50 hover:bg-blue-800/80 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold transition-colors shadow-lg cursor-pointer"
            >
              SN
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#111622] rounded-xl border border-gray-700 shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]">
                <div className="px-4 py-2 border-b border-gray-800 mb-1">
                  <p className="text-sm font-medium text-gray-200">Subhasis Nandi</p>
                  <p className="text-xs text-gray-500 truncate">admin@meteorology.gov</p>
                </div>
                
                <button 
                  onClick={() => {
                    if (setSettingsTab) setSettingsTab('Account');
                    setActiveTab('Settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2133] hover:text-white transition-colors"
                >
                  <User size={14} /> My Profile
                </button>
                
                <button 
                  onClick={() => {
                    if (setSettingsTab) setSettingsTab('Account');
                    setActiveTab('Settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2133] hover:text-white transition-colors"
                >
                  <Settings size={14} /> Account Settings
                </button>
                
                <div className="h-[1px] bg-gray-800 my-1 w-full"></div>
                
                <button 
                  onClick={() => {
                    setActiveTab('Landing Page');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
