import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const directionData = [
  { time: 'Jun 10', val: 220 },
  { time: '12:00', val: 240 },
  { time: 'Jun 11', val: 190 },
  { time: '12:00', val: 220 },
  { time: 'Jun 12', val: 210 },
  { time: '12:00', val: 200 },
  { time: '', val: 160 },
];

const speedData = [
  { time: 'Jun 10', val: 14 },
  { time: '12:00', val: 11 },
  { time: 'Jun 11', val: 14 },
  { time: '12:00', val: 17 },
  { time: 'Jun 12', val: 18 },
  { time: '12:00', val: 13 },
  { time: '', val: 5 },
];

export default function WindCharts({ type }) {
  const isDirection = type === 'direction';
  const data = isDirection ? directionData : speedData;
  
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="border-y border-gray-500 py-1 mb-2">
        <h3 className="text-center text-lg text-gray-200 font-light">
          {isDirection ? 'Wind Direction for Adelaide' : 'Wind Speed for Adelaide'}
        </h3>
      </div>
      
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#444" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: '#555' }} 
              tick={{fill: '#aaa'}}
            />
            <YAxis 
              domain={isDirection ? [0, 400] : [0, 20]} 
              stroke="#888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: '#555' }}
              ticks={isDirection ? [0, 100, 200, 300, 400] : [0, 5, 10, 15, 20]}
              tickFormatter={(val) => isDirection ? `${val}°` : `${val} km/h`}
              tick={{fill: '#aaa'}}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', border: '1px solid #555', borderRadius: '4px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#aaa' }}
            />
            <Line 
              type={isDirection ? "monotone" : "linear"} 
              dataKey="val" 
              stroke="#ffffff" 
              strokeWidth={1.5} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
