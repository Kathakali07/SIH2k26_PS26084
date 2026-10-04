import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const generateData = () => {
  const tempCurve = [
    11,10.5,10,10.2,9.5,9.2,9.5,10,10.5,11.5,12.5,13.5,14,14.2,14.3,13.8,13.2,12.5,12,11.8,
    11.5,11,11,11,11.2,10.8,10.5,10,9.5,9.2,9.2,9.5,10.5,11.5,12.5,12.8,12.2,11.5,11.2,11,
    10.8,10.5,10,10.2,10.5,11,11.3,11.5,11.8,12,11.8,11.5,10.5
  ];
  const humCurve = tempCurve.map(t => 100 - (t - 9) * 10 + (Math.random() * 5 - 2.5));

  return tempCurve.map((temp, i) => {
    let time = '';
    if (i === 0) time = 'Jun 10';
    else if (i === 6) time = '06:00';
    else if (i === 12) time = '12:00';
    else if (i === 18) time = '18:00';
    else if (i === 24) time = 'Jun 11';
    else if (i === 30) time = '06:00';
    else if (i === 36) time = '12:00';
    else if (i === 42) time = '18:00';
    else if (i === 48) time = 'Jun 12';
    else if (i === 54) time = '06:00';
    
    return {
      time,
      temp,
      hum: Math.round(humCurve[i]),
      index: i
    };
  });
};

export default function TemperatureChart({ activeMapLayer, setActiveMapLayer }) {
  const data = useMemo(() => generateData(), []);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="border-y border-gray-500 py-1 mb-2">
        <h3 className="text-center text-lg text-gray-200 font-light">
          {activeMapLayer === 'temperature' ? 'Temperature for Adelaide' : 'Humidity for Adelaide'}
        </h3>
      </div>
      
      <div className="flex-1 min-h-[100px] mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#444" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: '#555' }} 
              interval={0}
              tick={{fill: '#aaa'}}
            />
            <YAxis 
              domain={activeMapLayer === 'temperature' ? [9, 15] : [40, 100]} 
              stroke="#888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: '#555' }}
              ticks={activeMapLayer === 'temperature' ? [9, 10, 11, 12, 13, 14, 15] : [40, 50, 60, 70, 80, 90, 100]}
              tickFormatter={(val) => activeMapLayer === 'temperature' ? `${val}°C` : `${val}%`}
              tick={{fill: '#aaa'}}
            />
            <Tooltip 
              cursor={{fill: '#333'}}
              contentStyle={{ backgroundColor: '#222', border: '1px solid #555', borderRadius: '4px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => activeMapLayer === 'temperature' ? [`${value}°C`, 'Temperature'] : [`${value}%`, 'Humidity']}
            />
            <Bar 
              dataKey={activeMapLayer === 'temperature' ? "temp" : "hum"} 
              fill={activeMapLayer === 'temperature' ? "#ffffff" : "#a855f7"} 
              barSize={8}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex gap-4 pt-2 border-t border-gray-500 mt-2 shrink-0 relative">
        <button 
          onClick={() => setActiveMapLayer('temperature')}
          className={`relative text-[11px] font-medium pb-1 px-1 transition-colors duration-300 ${
            activeMapLayer === 'temperature' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Temperature Forecast
          {activeMapLayer === 'temperature' && (
            <motion.div layoutId="tempUnderline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#20b2aa]" />
          )}
        </button>
        <button 
          onClick={() => setActiveMapLayer('humidity')}
          className={`relative text-[11px] font-medium pb-1 px-1 transition-colors duration-300 ${
            activeMapLayer === 'humidity' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Humidity Forecast
          {activeMapLayer === 'humidity' && (
            <motion.div layoutId="tempUnderline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#20b2aa]" />
          )}
        </button>
      </div>
    </div>
  );
}
