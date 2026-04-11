import { useEffect, useState } from 'react';

export default function HealthDial({ score, size = 160 }) {
  const [offset, setOffset] = useState(250);
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Use a 220 degree arc
  const arcLength = (220 / 360) * circumference;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const progress = Math.max(0, Math.min(100, score)) / 100;
      setOffset(arcLength - (progress * arcLength));
    }, 100);
    return () => clearTimeout(timer);
  }, [score, arcLength]);

  const getColor = () => {
    if (score < 40) return '#EF4444'; // red
    if (score < 70) return '#F59E0B'; // amber
    return '#10B981'; // green
  };

  return (
    <div className="relative flex flex-col items-center justify-center font-mono" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="rotate-[-200deg]">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#1E293B"
          strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center top-[40%]">
        <span style={{ color: getColor() }} className="text-3xl font-bold">{score}</span>
        <span className="text-[10px] text-muted -mt-1 font-display uppercase">Score</span>
      </div>
    </div>
  );
}
