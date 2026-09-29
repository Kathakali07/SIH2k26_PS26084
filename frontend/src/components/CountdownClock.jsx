// src/components/CountdownClock.jsx
import { useState, useEffect } from 'react';

export default function CountdownClock({ initialSeconds }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const isCritical = secondsLeft < 1800; // Under 30 minutes

  return (
    <div className={`font-mono text-xs font-semibold px-2 py-1 rounded border ${
      isCritical 
        ? 'bg-red-950/60 border-red-500/50 text-red-400 animate-pulse' 
        : 'bg-zinc-800 border-zinc-700 text-amber-400'
    }`}>
      ETA: {formatTime(secondsLeft)}
    </div>
  );
}
