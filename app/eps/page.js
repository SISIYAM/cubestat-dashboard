"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateEpsSensorData } from "@/lib/mockEpsSensor";
import LineChart from "@/components/LineChart";
import StatCard from "@/components/StatCard";

export default function EpsDashboard() {
  const [data, setData] = useState(generateEpsSensorData());
  const [cell1TempHist, setCell1TempHist] = useState([]);
  const [cell2TempHist, setCell2TempHist] = useState([]);
  const [cell3TempHist, setCell3TempHist] = useState([]);
  const [cell4TempHist, setCell4TempHist] = useState([]);
  const [epsTempHist, setEpsTempHist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const id = setInterval(() => {
      const d = generateEpsSensorData();
      setData(d);
      setCell1TempHist((p) => [...p.slice(-25), d.batteryCell1Temp]);
      setCell2TempHist((p) => [...p.slice(-25), d.batteryCell2Temp]);
      setCell3TempHist((p) => [...p.slice(-25), d.batteryCell3Temp]);
      setCell4TempHist((p) => [...p.slice(-25), d.batteryCell4Temp]);
      setEpsTempHist((p) => [...p.slice(-25), d.epsBoardTemp]);
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
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg font-medium text-sm border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all duration-300 hover:scale-105"
            >
              🌍 Sensors
            </Link>
            <Link
              href="/eps"
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400 bg-clip-text text-transparent mb-2">
            ⚡ EPS Board Dashboard
          </h1>
          <p className="text-zinc-400 text-lg">
            Electrical Power System Monitoring
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">
              Live Data Stream
            </span>
          </div>
        </div>

        {/* BATTERY TEMPERATURE SECTION */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-orange-400">🔋</span>
              Battery Cell Temperatures
            </h2>
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-400 rounded-full w-64"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Channel 0: Battery Cell 1 */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Channel 0
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 1 Temperature
                  </p>
                  <p className="text-3xl font-bold text-orange-400">
                    {data.batteryCell1Temp.toFixed(2)} °C
                  </p>
                </div>
                <div className="text-2xl">🔋</div>
              </div>
              <LineChart
                data={cell1TempHist}
                color="#f97316"
                gradientColor="#ea580c"
              />
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>Last 25 readings</span>
                <span>Live</span>
              </div>
            </div>

            {/* Channel 1: Battery Cell 2 */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Channel 1
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 2 Temperature
                  </p>
                  <p className="text-3xl font-bold text-amber-400">
                    {data.batteryCell2Temp.toFixed(2)} °C
                  </p>
                </div>
                <div className="text-2xl">🔋</div>
              </div>
              <LineChart
                data={cell2TempHist}
                color="#f59e0b"
                gradientColor="#d97706"
              />
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>Last 25 readings</span>
                <span>Live</span>
              </div>
            </div>

            {/* Channel 7: Battery Cell 3 */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Channel 7
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 3 Temperature
                  </p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {data.batteryCell3Temp.toFixed(2)} °C
                  </p>
                </div>
                <div className="text-2xl">🔋</div>
              </div>
              <LineChart
                data={cell3TempHist}
                color="#facc15"
                gradientColor="#eab308"
              />
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>Last 25 readings</span>
                <span>Live</span>
              </div>
            </div>

            {/* Channel 8: Battery Cell 4 */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Channel 8
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 4 Temperature
                  </p>
                  <p className="text-3xl font-bold text-red-400">
                    {data.batteryCell4Temp.toFixed(2)} °C
                  </p>
                </div>
                <div className="text-2xl">🔋</div>
              </div>
              <LineChart
                data={cell4TempHist}
                color="#f87171"
                gradientColor="#ef4444"
              />
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>Last 25 readings</span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* EPS BOARD TEMPERATURE SECTION */}
        <div
          className={`transition-all duration-1000 delay-300 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-cyan-400">🌡️</span>
              EPS Board Temperature
            </h2>
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full w-56"></div>
          </div>

          <div className="grid lg:grid-cols-1 gap-6">
            {/* Channel 6: EPS Board Temperature */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Channel 6
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    EPS Board Temperature
                  </p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {data.epsBoardTemp.toFixed(2)} °C
                  </p>
                </div>
                <div className="text-2xl">🌡️</div>
              </div>
              <LineChart
                data={epsTempHist}
                color="#06b6d4"
                gradientColor="#0891b2"
              />
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>Last 25 readings</span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* SOLAR PANEL CURRENTS SECTION */}
        <div
          className={`transition-all duration-1000 delay-400 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-yellow-400">☀️</span>
              Solar Panel Currents
            </h2>
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full w-52"></div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <StatCard
              label="Solar Panel X+ Current"
              value={data.solarXPlusCurrent.toFixed(2)}
              unit="mA"
              icon="☀️"
              color="#facc15"
              channel="Channel 2"
            />
            <StatCard
              label="Solar Panel X− Current"
              value={data.solarXMinusCurrent.toFixed(2)}
              unit="mA"
              icon="☀️"
              color="#f59e0b"
              channel="Channel 3"
            />
            <StatCard
              label="Solar Panel Y+ Current"
              value={data.solarYPlusCurrent.toFixed(2)}
              unit="mA"
              icon="☀️"
              color="#fbbf24"
              channel="Channel 4"
            />
            <StatCard
              label="Solar Panel Y− Current"
              value={data.solarYMinusCurrent.toFixed(2)}
              unit="mA"
              icon="☀️"
              color="#f97316"
              channel="Channel 5"
            />
          </div>
        </div>

        {/* SYSTEM CURRENTS SECTION */}
        <div
          className={`transition-all duration-1000 delay-600 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-green-400">⚡</span>
              System Currents
            </h2>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-48"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <StatCard
              label="System Load Current"
              value={data.systemLoadCurrent.toFixed(2)}
              unit="mA"
              icon="🔌"
              color="#22c55e"
              channel="Channel 13"
              sublabel="OBC + Payload + Aux"
            />
            <StatCard
              label="Battery Charging Current"
              value={data.batteryChargingCurrent.toFixed(2)}
              unit="mA"
              icon="🔋"
              color="#10b981"
              channel="Channel 14"
            />
            <StatCard
              label="Comm Subsystem Current"
              value={data.commSubsystemCurrent.toFixed(2)}
              unit="mA"
              icon="📡"
              color="#14b8a6"
              channel="Channel 15"
            />
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
              Data updates every second
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
