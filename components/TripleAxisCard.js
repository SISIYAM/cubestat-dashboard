// components/TripleAxisCard.js
"use client";

export default function TripleAxisCard({ title, data, unit }) {
  const axisColors = {
    x: { color: "#ef4444", bg: "bg-red-500/20", border: "border-red-500/30" },
    y: {
      color: "#22c55e",
      bg: "bg-green-500/20",
      border: "border-green-500/30",
    },
    z: { color: "#3b82f6", bg: "bg-blue-500/20", border: "border-blue-500/30" },
  };

  const formatValue = (value) => {
    return typeof value === "number" ? value.toFixed(2) : value;
  };

  const getIntensity = (value) => {
    const absValue = Math.abs(parseFloat(value) || 0);
    return Math.min(absValue / 10, 1); // Normalize to 0-1 range
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
        <p className="font-bold text-lg text-white">{title}</p>
      </div>

      <div className="space-y-3">
        {Object.entries(data).map(([axis, value]) => {
          const axisConfig = axisColors[axis.toLowerCase()];
          const intensity = getIntensity(value);

          return (
            <div
              key={axis}
              className={`flex items-center justify-between p-3 rounded-lg ${axisConfig.bg} border ${axisConfig.border} backdrop-blur-sm transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{
                    backgroundColor: axisConfig.color,
                    boxShadow: `0 0 10px ${axisConfig.color}40`,
                  }}
                ></div>
                <span className="font-semibold text-white uppercase tracking-wider">
                  {axis}:
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-white">
                  {formatValue(value)}
                </span>
                <span className="text-sm text-gray-400">{unit}</span>

                {/* Intensity bar */}
                <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden ml-2">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${intensity * 100}%`,
                      backgroundColor: axisConfig.color,
                      boxShadow: `0 0 6px ${axisConfig.color}60`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex px-3 py-1 bg-zinc-800 rounded-full border border-zinc-600">
          <span className="text-xs text-gray-400">Real-time sensor data</span>
        </div>
      </div>
    </div>
  );
}
