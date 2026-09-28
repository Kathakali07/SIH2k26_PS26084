import { useState } from 'react';

const LOCATIONS = [
  { city: 'Adelaide', speed1: '7 knots', speed2: '13 km/h', dir: 'SW', temp: '13°C', min: '10°C', max: '14°C', hum: '78%' },
  { city: 'Albany', speed1: '13 knots', speed2: '25 km/h', dir: 'NE', temp: '13°C', min: '13°C', max: '16°C', hum: '81%' },
  { city: 'Alexandra', speed1: '9 knots', speed2: '16 km/h', dir: 'SW', temp: '9°C', min: '4°C', max: '10°C', hum: '84%' },
  { city: 'Alice Springs', speed1: '16 knots', speed2: '29 km/h', dir: 'SE', temp: '11°C', min: '5°C', max: '14°C', hum: '44%' },
  { city: 'Anglesea', speed1: '15 knots', speed2: '28 km/h', dir: 'SW', temp: '12°C', min: '10°C', max: '13°C', hum: '71%' },
  { city: 'Ararat', speed1: '11 knots', speed2: '21 km/h', dir: 'SW', temp: '10°C', min: '6°C', max: '11°C', hum: '85%' },
  { city: 'Armidale', speed1: '10 knots', speed2: '19 km/h', dir: 'W', temp: '7°C', min: '-3°C', max: '8°C', hum: '60%' },
  { city: 'Ballarat', speed1: '8 knots', speed2: '15 km/h', dir: 'SW', temp: '8°C', min: '5°C', max: '9°C', hum: '93%' },
  { city: 'Batemans Bay', speed1: '3 knots', speed2: '6 km/h', dir: 'W', temp: '14°C', min: '5°C', max: '16°C', hum: '45%' },
];

const HOURLY_DATA = LOCATIONS.map(loc => ({
  city: loc.city,
  hours: [
    { time: 'Now', temp: loc.temp },
    { time: '+1h', temp: `${parseInt(loc.temp) + 1}°C` },
    { time: '+2h', temp: `${parseInt(loc.temp) + 1}°C` },
    { time: '+3h', temp: `${parseInt(loc.temp)}°C` },
    { time: '+4h', temp: `${parseInt(loc.temp) - 1}°C` },
  ]
}));

export default function LocationList() {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="border-y border-gray-500 py-1 mb-1">
        <h2 className="text-center text-lg text-gray-200 font-light">
          {activeTab === 'current' ? 'Current Forecast per Location' : 'Hourly Forecast per Location'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'current' ? LOCATIONS.map((loc, i) => (
          <div key={i} className="flex items-center py-2.5 border-b border-gray-600/40 hover:bg-white/5 cursor-pointer">
            <div className="w-[100px] text-sm text-gray-200 pl-2">{loc.city}</div>
            
            <div className="w-12 flex justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 7L7 17M17 7v4M17 7h-4" />
                <circle cx="6" cy="18" r="2" fill="currentColor"/>
              </svg>
            </div>
            
            <div className="flex flex-col text-xs text-right w-16 leading-tight">
              <span className="text-white">{loc.speed1}</span>
              <span className="text-white">{loc.speed2}</span>
              <span className="text-[9px] text-gray-400 mt-0.5">Wind</span>
            </div>
            
            <div className="w-8 text-sm font-bold text-white text-center ml-2">{loc.dir}</div>
            
            <div className="w-px h-10 bg-gray-600 mx-2"></div>
            
            <div className="flex flex-col w-12 text-center">
              <span className="text-xl font-normal text-white">{loc.temp}</span>
              <span className="text-[9px] text-gray-400">Temperature</span>
            </div>
            
            <div className="flex flex-col text-[10px] w-16 text-right justify-center leading-tight">
              <span className="text-gray-300">Min: <span className="text-blue-300">{loc.min}</span></span>
              <span className="text-gray-300">Max: <span className="text-red-300">{loc.max}</span></span>
            </div>
            
            <div className="w-px h-10 bg-gray-600 mx-2"></div>
            
            <div className="flex flex-col w-12 text-center">
              <span className="text-lg text-[#9b66cc] font-medium">{loc.hum}</span>
              <span className="text-[9px] text-gray-400">Humidity</span>
            </div>
          </div>
        )) : HOURLY_DATA.map((loc, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-gray-600/40 hover:bg-white/5 cursor-pointer pl-2 pr-4">
            <div className="w-[100px] text-sm text-gray-200">{loc.city}</div>
            <div className="flex-1 flex justify-between ml-4">
              {loc.hours.map((hour, j) => (
                <div key={j} className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400">{hour.time}</span>
                  <span className="text-sm text-white font-medium mt-1">{hour.temp}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 pt-2 border-t border-gray-500 mt-1 shrink-0">
        <button 
          onClick={() => setActiveTab('current')}
          className={`text-[11px] font-medium pb-1 px-1 border-b-2 ${
            activeTab === 'current' ? 'text-white border-[#20b2aa]' : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          Current Forecast
        </button>
        <button 
          onClick={() => setActiveTab('hourly')}
          className={`text-[11px] font-medium pb-1 px-1 border-b-2 ${
            activeTab === 'hourly' ? 'text-white border-[#20b2aa]' : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          Hourly Forecast
        </button>
      </div>
    </div>
  );
}
