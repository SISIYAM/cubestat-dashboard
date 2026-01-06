// components/StatCard.js
"use client";

import { useEffect, useState } from "react";

export default function StatCard({
  label,
  value,
  unit,
  icon,
  color = "#3b82f6",
  channel,
  sublabel,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const numericValue = parseFloat(value) || 0;
    const duration = 1000;
    const steps = 50;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = increment * step;

      if (step >= steps) {
        setDisplayValue(numericValue);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val) => {
    if (typeof val === "string") return val;
    return val % 1 === 0 ? val.toString() : val.toFixed(2);
  };

  const getStatusColor = () => {
    const numValue = parseFloat(value) || 0;
    if (label.includes("Gas")) {
      return numValue > 50 ? "#ef4444" : numValue > 25 ? "#f59e0b" : "#22c55e";
    }
    return color;
  };

  const statusColor = getStatusColor();

  return (
    <div className="group relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-zinc-600">
      {/* Animated background glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(45deg, ${statusColor}20, transparent)`,
        }}
      ></div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{
            backgroundColor: statusColor,
            boxShadow: `0 0 10px ${statusColor}60`,
          }}
        ></div>
      </div>

      {/* Icon */}
      {icon && (
        <div className="mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: statusColor + "20" }}
          >
            <span style={{ color: statusColor }}>{icon}</span>
          </div>
        </div>
      )}

      {/* Channel label */}
      {channel && (
        <p className="text-xs text-zinc-500 mb-1 font-medium">{channel}</p>
      )}

      {/* Label */}
      <p className="text-sm text-zinc-400 mb-1 font-medium tracking-wide">
        {label}
      </p>

      {/* Sublabel */}
      {sublabel && <p className="text-xs text-zinc-500 mb-2">{sublabel}</p>}

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <p
          className={`text-3xl font-bold transition-all duration-300 ${
            isAnimating ? "scale-110" : "scale-100"
          }`}
          style={{ color: statusColor }}
        >
          {formatValue(displayValue)}
        </p>
        {unit && (
          <span className="text-lg text-zinc-500 font-medium">{unit}</span>
        )}
      </div>

      {/* Progress bar for gas readings */}
      {label.includes("Gas") && (
        <div className="mt-4">
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 rounded-full"
              style={{
                width: `${Math.min(
                  ((parseFloat(value) || 0) / 100) * 100,
                  100
                )}%`,
                backgroundColor: statusColor,
                boxShadow: `0 0 8px ${statusColor}50`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
