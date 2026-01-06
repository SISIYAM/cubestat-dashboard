"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateSensorData } from "@/lib/mockSensor";
import LineChart from "@/components/LineChart";
import RadialProgress from "@/components/RadialProgress";
import TripleAxisCard from "@/components/TripleAxisCard";
import StatCard from "@/components/StatCard";

export default function Dashboard() {
  const [data, setData] = useState(generateSensorData());
  const [tempHist, setTempHist] = useState([]);
  const [pressHist, setPressHist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const id = setInterval(() => {
      const d = generateSensorData();
      setData(d);
      setTempHist((p) => [...p.slice(-25), d.temperature]);
      setPressHist((p) => [...p.slice(-25), d.pressure]);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation */}
        <nav
          className={`flex justify-end transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              🌍 Sensors
            </Link>
            <Link
              href="/eps"
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg font-medium text-sm border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all duration-300 hover:scale-105"
            >
              ⚡ EPS Board
            </Link>
          </div>
        </nav>

        {/* Header */}
        <div
          className={`text-center transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            🌍 Sensor Hub Dashboard
          </h1>
          <p className="text-zinc-400 text-lg">
            Real-time environmental monitoring system
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">
              Live Data Stream
            </span>
          </div>
        </div>

        {/* ENVIRONMENT SECTION */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-blue-400">🌡️</span>
              Environmental Sensors
            </h2>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-48"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-400 font-medium">
                    BME Temperature
                  </p>
                  <p className="text-3xl font-bold text-orange-400">
                    {data.temperature.toFixed(2)} °C
                  </p>
                </div>
                <div className="text-2xl">🌡️</div>
              </div>
              <LineChart
                data={tempHist}
                color="#f97316"
                gradientColor="#ea580c"
              />
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>Last 25 readings</span>
                <span>Live</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group flex flex-col items-center justify-center">
              <div className="mb-4 text-center">
                <p className="text-sm text-zinc-400 font-medium mb-2">
                  Atmospheric Humidity
                </p>
                <div className="text-2xl mb-4">💧</div>
              </div>
              <RadialProgress value={data.humidity} color="#06b6d4" />
            </div>

            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-400 font-medium">
                    Atmospheric Pressure
                  </p>
                  <p className="text-3xl font-bold text-purple-400">
                    {data.pressure.toFixed(1)} hPa
                  </p>
                </div>
                <div className="text-2xl">⚡</div>
              </div>
              <LineChart
                data={pressHist}
                color="#a855f7"
                gradientColor="#9333ea"
              />
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>Last 25 readings</span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* MOTION SECTION */}
        <div
          className={`transition-all duration-1000 delay-400 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-green-400">📱</span>
              Motion & Orientation
            </h2>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-56"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <TripleAxisCard title="Accelerometer" data={data.acc} unit="g" />
            <TripleAxisCard title="Magnetometer" data={data.mag} unit="µT" />
            <TripleAxisCard title="Gyroscope" data={data.gyro} unit="°/s" />
          </div>
        </div>

        {/* GAS + AIR SECTION */}
        <div
          className={`transition-all duration-1000 delay-600 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-red-400">🔬</span>
              Air Quality & Gas Sensors
            </h2>
            <div className="h-1 bg-gradient-to-r from-red-500 to-pink-400 rounded-full w-64"></div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <StatCard
              label="Gas Resistance"
              value={data.gas.toFixed(2)}
              unit="KΩ"
              icon="⚗️"
              color="#ef4444"
            />
            <StatCard
              label="UV Index (Raw)"
              value={data.uv}
              icon="☀️"
              color="#f59e0b"
            />
            <StatCard
              label="RED Gas"
              value={data.red}
              icon="🔴"
              color="#dc2626"
            />
            <StatCard
              label="NOX Gas"
              value={data.nox}
              icon="💨"
              color="#7c3aed"
            />
          </div>
        </div>

        {/* GPS SECTION */}
        <div
          className={`transition-all duration-1000 delay-800 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-cyan-400">🗺️</span>
              Location & Navigation
            </h2>
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full w-52"></div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <div className="text-cyan-400 text-2xl mb-2">📍</div>
                <p className="text-sm text-zinc-400 mb-1">Latitude</p>
                <p className="text-xl font-mono font-bold text-cyan-400">
                  {data.gps.lat}
                </p>
              </div>

              <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <div className="text-blue-400 text-2xl mb-2">📍</div>
                <p className="text-sm text-zinc-400 mb-1">Longitude</p>
                <p className="text-xl font-mono font-bold text-blue-400">
                  {data.gps.lng}
                </p>
              </div>

              <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <div className="text-green-400 text-2xl mb-2">📡</div>
                <p className="text-sm text-zinc-400 mb-1">Satellites</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xl font-bold text-green-400">
                    {data.gps.sats}
                  </p>
                  <div className="flex gap-1">
                    {[...Array(Math.min(data.gps.sats, 5))].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center py-8 transition-all duration-1000 delay-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full border border-zinc-700/50">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm text-zinc-400">
              Data updates every 2 seconds
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
