// components/RadialProgress.js
"use client";

import { useEffect, useState } from "react";

export default function RadialProgress({
  value,
  size = 120,
  strokeWidth = 12,
  color = "#3b82f6",
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const r = (size - strokeWidth) / 2 - 5;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = c - (animatedValue / 100) * c;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  const glowId = `glow-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color + "80"} />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-30"
        />

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Inner glow */}
        <circle
          cx={center}
          cy={center}
          r={r - strokeWidth}
          fill="none"
          stroke={color}
          strokeWidth="1"
          className="opacity-20"
        />
      </svg>

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white drop-shadow-lg">
          {Math.round(animatedValue)}%
        </span>
        <span className="text-xs text-gray-400 mt-1">Humidity</span>
      </div>
    </div>
  );
}
