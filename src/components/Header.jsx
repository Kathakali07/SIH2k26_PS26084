import { useState, useRef, useEffect } from 'react';
import { Snowflake, Map as MapIcon, MapPin, ChevronDown, Search, Clock, Settings, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CITIES = [
  'Adelaide', 'Albany', 'Alexandra', 'Alice Springs', 
  'Anglesea', 'Ararat', 'Armidale', 'Ballarat', 'Batemans Bay'
];

export default function Header({ activeMapLayer, setActiveMapLayer, isMapEnlarged, onToggleMapEnlarge }) {
  const [selectedCity, setSelectedCity] = useState('Adelaide');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <header className="h-16 bg-gradient-to-r from-[#111111] via-[#2a2a2a] to-[#111111] flex items-center justify-between px-4 shrink-0 border-b border-[#333] gap-4">
      
      {/* Left: Logo & Title */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2 shrink-0 cursor-pointer"
      >
        <Snowflake className="h-6 w-6 text-white" />
        <span className="text-lg font-light text-white tracking-wide whitespace-nowrap">Weather Dashboard</span>
      </motion.div>
      
      {/* Center: Search & Clock */}
      <div className="flex-1 flex items-center justify-start xl:justify-center gap-4 min-w-0">
         <div className="relative flex items-center bg-[#191919] border border-gray-600 rounded-full px-3 py-1.5 w-full max-w-[280px] focus-within:border-[#0ea5e9] focus-within:shadow-[0_0_8px_rgba(14,165,233,0.3)] transition-all shrink group hover:border-gray-400">
           <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0 group-hover:text-gray-300 transition-colors" />
           <input 
             type="text" 
             placeholder="Search city..." 
             className="bg-transparent border-none outline-none text-[12px] text-gray-200 placeholder-gray-500 w-full min-w-0"
           />
         </div>
         <div className="hidden lg:flex items-center gap-1.5 text-gray-300 shrink-0">
           <Clock className="h-4 w-4 text-gray-400" />
           <span className="text-[11px] font-medium tracking-wide text-gray-400">{formattedDate}</span>
           <span className="text-[11px] font-bold text-white">{formattedTime}</span>
         </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center justify-end gap-4 shrink-0">
        
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <motion.button 
            whileHover={{ scale: 1.1, color: '#ffffff' }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 transition-colors p-1"
          >
            <Bell className="h-4 w-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, color: '#ffffff', rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 transition-all duration-300 p-1"
          >
            <Settings className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Location Dropdown */}
        <div className="relative flex items-center gap-1.5 shrink-0" ref={dropdownRef}>
          <MapPin className="h-4 w-4 text-gray-400" />
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex flex-col cursor-pointer leading-tight group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-[9px] text-gray-400 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Location</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-200 group-hover:text-white transition-colors">{selectedCity}</span>
              <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-white' : 'group-hover:text-gray-300'}`} />
            </div>
          </motion.div>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 w-40 bg-[#1e1e1e] border border-gray-600 rounded shadow-2xl z-50 py-1"
              >
                {CITIES.map(city => (
                  <div 
                    key={city}
                    className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-[#2a2a2a] transition-colors ${city === selectedCity ? 'text-[#0ea5e9] font-medium bg-white/5' : 'text-gray-300'}`}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {city}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Map Layers & Enlarge */}
        <div className="flex items-center gap-2 border-l border-gray-600 pl-4 shrink-0">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white transition-colors group p-1"
            onClick={onToggleMapEnlarge}
            title="Toggle Map Fullscreen"
          >
            <MapIcon className={`h-4 w-4 transition-colors ${isMapEnlarged ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`} />
          </motion.div>
          <div className="flex items-center border border-gray-600 rounded overflow-hidden shrink-0">
            <button 
              onClick={() => setActiveMapLayer('temperature')}
              className={`px-2 py-1 text-[10px] font-medium transition-colors hover:bg-white/10 ${
                activeMapLayer === 'temperature' ? 'bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]' : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
              }`}
            >
              Temp
            </button>
            <button 
              onClick={() => setActiveMapLayer('humidity')}
              className={`px-2 py-1 text-[10px] font-medium transition-colors hover:bg-white/10 ${
                activeMapLayer === 'humidity' ? 'bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]' : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
              }`}
            >
              Hum
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
