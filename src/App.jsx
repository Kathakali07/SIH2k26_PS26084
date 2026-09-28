import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import LocationList from './components/LocationList';
import WindCharts from './components/WindCharts';
import WeatherMap from './components/WeatherMap';
import TemperatureChart from './components/TemperatureChart';

export default function App() {
  const [activeMapLayer, setActiveMapLayer] = useState('temperature');
  const [isMapEnlarged, setIsMapEnlarged] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8 }}
      className="h-screen w-screen bg-[#1e1e1e] text-gray-300 flex flex-col font-sans overflow-hidden"
    >
      <Header 
        activeMapLayer={activeMapLayer} 
        setActiveMapLayer={setActiveMapLayer}
        isMapEnlarged={isMapEnlarged}
        onToggleMapEnlarge={() => setIsMapEnlarged(!isMapEnlarged)}
      />
      <div className="flex-1 p-3 flex gap-4 overflow-hidden relative">
        {/* Left Column */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          className={`w-[480px] flex-shrink-0 flex flex-col overflow-hidden transition-opacity duration-300 ${isMapEnlarged ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
        >
          <LocationList />
        </motion.div>
        
        {/* Middle and Right Columns Container */}
        <div className={`flex-1 flex flex-col gap-4 overflow-hidden transition-all duration-300 ${isMapEnlarged ? 'w-full ml-[496px]' : ''}`}>
          {/* Top Half: Wind and Map */}
          <div className={`flex gap-4 min-h-0 transition-all duration-300 ${isMapEnlarged ? 'flex-1' : 'flex-[55]'}`}>
            {/* Middle Column: Wind Charts */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
              className={`w-[45%] flex flex-col gap-4 transition-opacity duration-300 ${isMapEnlarged ? 'opacity-0 pointer-events-none hidden' : ''}`}
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                <WindCharts type="direction" />
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <WindCharts type="speed" />
              </div>
            </motion.div>
            
            {/* Right Column: Weather Map */}
            {/* We use a wrapper to preserve flex layout when not enlarged, 
                and switch to 'fixed inset-0' to cover the exact full screen ratio when enlarged */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
              className={`overflow-hidden border border-gray-600 rounded-sm bg-[#222] transition-all duration-300 ease-in-out ${isMapEnlarged ? 'fixed inset-0 z-[9999] w-screen h-screen' : 'relative flex-1'}`}
            >
              <WeatherMap 
                activeMapLayer={activeMapLayer} 
                isMapEnlarged={isMapEnlarged}
                onToggleMapEnlarge={() => setIsMapEnlarged(!isMapEnlarged)}
              />
            </motion.div>
          </div>
          
          {/* Bottom Half: Temperature Bar Chart */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
            className={`flex-[45] flex-shrink-0 flex flex-col overflow-hidden transition-opacity duration-300 ${isMapEnlarged ? 'hidden opacity-0 pointer-events-none' : ''}`}
          >
             <TemperatureChart 
               activeMapLayer={activeMapLayer}
               setActiveMapLayer={setActiveMapLayer}
             />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
