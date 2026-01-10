"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import LineChart from "@/components/LineChart";
import StatCard from "@/components/StatCard";

export default function EpsDashboard() {
  const [data, setData] = useState(null);
  const [cell1TempHist, setCell1TempHist] = useState([]);
  const [cell2TempHist, setCell2TempHist] = useState([]);
  const [cell3TempHist, setCell3TempHist] = useState([]);
  const [cell4TempHist, setCell4TempHist] = useState([]);
  const [epsTempHist, setEpsTempHist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const lastDataId = useRef(null);

  const [solarPowerPath, setSolarPowerPath] = useState(false);
  const [solarCmdSending, setSolarCmdSending] = useState(false);
  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch(
        "/api/eps-readings?limit=1&sort=-timestamp",
        {
          cache: "no-store",
        }
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return result;
    } catch (err) {
      console.error("Error fetching EPS data:", err);
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    setIsLoaded(true);

    // Initial fetch from API
    const initData = async () => {
      const apiData = await fetchData();
      if (apiData) {
        setData(apiData);
        setIsLive(true);
        setError(null);
        lastDataId.current = apiData._id;
        setLastUpdated(new Date());
      } else {
        setIsLive(false);
        setError("Unable to connect to database");
      }
    };

    initData();

    // Poll for updates every second
    const id = setInterval(async () => {
      const apiData = await fetchData();

      if (apiData) {
        // Only update if we have new data (different _id or timestamp)
        const isNewData = lastDataId.current !== apiData._id;

        if (isNewData) {
          lastDataId.current = apiData._id;
          setLastUpdated(new Date());
        }

        setData(apiData);
        setIsLive(true);
        setError(null);

        // Update history charts
        if (apiData.adc) {
          setCell1TempHist((p) => [...p.slice(-25), apiData.adc.ch_0]);
          setCell2TempHist((p) => [...p.slice(-25), apiData.adc.ch_1]);
          setCell3TempHist((p) => [...p.slice(-25), apiData.adc.ch_7]);
          setCell4TempHist((p) => [...p.slice(-25), apiData.adc.ch_8]);
          setEpsTempHist((p) => [...p.slice(-25), apiData.adc.ch_6]);
        }
      } else {
        setIsLive(false);
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // Keep local toggle state in sync with incoming data
  useEffect(() => {
    if (data && data.solar_charger) {
      setSolarPowerPath(!!data.solar_charger.solar_power_path);
    }
  }, [data]);

  // Send command to local solar API
  const sendSolarCommand = async (command) => {
    try {
      setSolarCmdSending(true);
      await fetch("http://localhost:5000/solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      setSolarPowerPath(command === "1");
    } catch (err) {
      console.error("Error sending solar command:", err);
    } finally {
      setSolarCmdSending(false);
    }
  };

  const handleToggleSolar = () => {
    const cmd = solarPowerPath ? "0" : "1";
    sendSolarCommand(cmd);
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-400 text-lg font-medium mb-2">
                Connection Error
              </p>
              <p className="text-zinc-500">{error}</p>
              <p className="text-zinc-600 text-sm mt-4">
                Retrying every second...
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">Connecting to Database...</p>
            </>
          )}
        </div>
      </main>
    );
  }

  // Safe data access with defaults
  const battery = data.battery || {};
  const adc = data.adc || {};
  const solar_charger = data.solar_charger || {};

  // Debug: Log data structure to console
  console.log("Data from API:", JSON.stringify(data, null, 2));

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* DEBUG: Show raw data structure */}
        {/* <div className="bg-zinc-800 p-4 rounded-lg text-xs text-zinc-400 overflow-auto max-h-40">
          <p className="font-bold text-yellow-400 mb-2">
            Debug - Raw Data Keys:
          </p>
          <pre>{JSON.stringify(Object.keys(data), null, 2)}</pre>
          <p className="font-bold text-yellow-400 mt-2 mb-2">Full Data:</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div> */}

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
            <div
              className={`w-2 h-2 rounded-full ${
                isLive ? "bg-green-500" : "bg-yellow-500"
              } animate-pulse`}
            ></div>
            <span
              className={`text-sm font-medium ${
                isLive ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {isLive
                ? "Live Data Stream (API)"
                : "Mock Data (API Unavailable)"}
            </span>
          </div>
        </div>

        {/* BATTERY STATUS SECTION */}
        <div
          className={`transition-all duration-1000 delay-100 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-green-400">🔋</span>
              Battery Status
            </h2>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-48"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Voltage
                  </p>
                  <p className="text-4xl font-bold text-green-400">
                    {battery.voltage_V?.toFixed(3) ?? "N/A"} V
                  </p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 font-medium">
                    State of Charge (SOC)
                  </p>
                  <p className="text-4xl font-bold text-emerald-400">
                    {battery.soc_percent?.toFixed(2) ?? "N/A"} %
                  </p>
                </div>
                <div className="text-4xl">🔋</div>
              </div>
              <div className="mt-4 bg-zinc-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(battery.soc_percent || 0, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS INDICATORS SECTION */}
        <div
          className={`transition-all duration-1000 delay-100 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-purple-400">📊</span>
              Solar Charger Status
            </h2>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full w-56"></div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl">
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Solar Supply Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">Solar Supply:</span>
                <span
                  className={`text-sm font-bold ${
                    solar_charger.solar_supply_ok
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {solar_charger.solar_supply_ok ? "OK" : "NOT OK"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    solar_charger.solar_supply_ok
                      ? "bg-green-500"
                      : "bg-red-500"
                  } animate-pulse`}
                ></div>
              </div>

              {/* Solar Power Path */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">Solar Power Path:</span>
                <span
                  className={`text-sm font-bold ${
                    solar_charger.solar_power_path
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {solar_charger.solar_power_path ? "ON" : "OFF"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    solar_charger.solar_power_path
                      ? "bg-green-500"
                      : "bg-red-500"
                  } animate-pulse`}
                ></div>
                <button
                  onClick={handleToggleSolar}
                  disabled={solarCmdSending}
                  className={`ml-3 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    solarPowerPath
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {solarCmdSending
                    ? "..."
                    : solarPowerPath
                    ? "Turn Off"
                    : "Turn On"}
                </button>
              </div>

              {/* Solar Mode */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">Solar Mode:</span>
                <span className="text-sm font-bold text-yellow-400">
                  {solar_charger.solar_mode ? "ON" : "OFF"}
                </span>
              </div>

              {/* Input Power Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">Input Power:</span>
                <span
                  className={`text-sm font-bold ${
                    solar_charger.input_power_ok
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {solar_charger.input_power_ok ? "OK" : "NOT OK"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    solar_charger.input_power_ok ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                ></div>
              </div>

              {/* Charger Enable */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">Charger Enabled:</span>
                <span
                  className={`text-sm font-bold ${
                    solar_charger.charger_enabled
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {solar_charger.charger_enabled ? "YES" : "NO"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    solar_charger.charger_enabled
                      ? "bg-green-500"
                      : "bg-red-500"
                  } animate-pulse`}
                ></div>
              </div>

              {/* Source Mode */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">Source Mode:</span>
                <span className="text-sm font-bold text-cyan-400">
                  {solar_charger.source_mode || "N/A"}
                </span>
              </div>

              {/* Charging Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">Charging Status:</span>
                <span
                  className={`text-sm font-bold ${
                    solar_charger.charging_status?.includes("charging") &&
                    !solar_charger.charging_status?.includes("Not")
                      ? "text-green-400"
                      : "text-orange-400"
                  }`}
                >
                  {solar_charger.charging_status || "N/A"}
                </span>
              </div>

              {/* STAT1 */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">STAT1:</span>
                <span
                  className={`text-sm font-bold ${
                    solar_charger.stat1 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {solar_charger.stat1 ? "ON" : "OFF"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    solar_charger.stat1 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>

              {/* STAT2 */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-600/30">
                <span className="text-sm text-zinc-400">STAT2:</span>
                <span
                  className={`text-sm font-bold ${
                    solar_charger.stat2 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {solar_charger.stat2 ? "ON" : "OFF"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    solar_charger.stat2 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>
            </div>
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
              Battery Cell Temperatures (ADC)
            </h2>
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-400 rounded-full w-64"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Channel 0: Battery Cell 1 */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    ADC Channel 0
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 1 Temperature
                  </p>
                  <p className="text-3xl font-bold text-orange-400">
                    {adc.ch_0?.toFixed(2) ?? "N/A"} °C
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
                    ADC Channel 1
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 2 Temperature
                  </p>
                  <p className="text-3xl font-bold text-amber-400">
                    {adc.ch_1?.toFixed(2) ?? "N/A"} °C
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
                    ADC Channel 7
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 3 Temperature
                  </p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {adc.ch_7?.toFixed(2) ?? "N/A"} °C
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
                    ADC Channel 8
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Battery Cell 4 Temperature
                  </p>
                  <p className="text-3xl font-bold text-red-400">
                    {adc.ch_8?.toFixed(2) ?? "N/A"} °C
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
                    ADC Channel 6
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    EPS Board Temperature
                  </p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {adc.ch_6?.toFixed(2) ?? "N/A"} °C
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
              Solar Panel Currents (ADC)
            </h2>
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full w-52"></div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <StatCard
              label="Solar Panel X+ Current"
              value={adc.ch_2?.toFixed(2) ?? "N/A"}
              unit="mA"
              icon="☀️"
              color="#facc15"
              channel="ADC Ch 2"
            />
            <StatCard
              label="Solar Panel X− Current"
              value={adc.ch_3?.toFixed(2) ?? "N/A"}
              unit="mA"
              icon="☀️"
              color="#f59e0b"
              channel="ADC Ch 3"
            />
            <StatCard
              label="Solar Panel Y+ Current"
              value={adc.ch_4?.toFixed(2) ?? "N/A"}
              unit="mA"
              icon="☀️"
              color="#fbbf24"
              channel="ADC Ch 4"
            />
            <StatCard
              label="Solar Panel Y− Current"
              value={adc.ch_5?.toFixed(2) ?? "N/A"}
              unit="mA"
              icon="☀️"
              color="#f97316"
              channel="ADC Ch 5"
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
              System Currents (ADC)
            </h2>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-48"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <StatCard
              label="System Load Current"
              value={adc.ch_13?.toFixed(2) ?? "N/A"}
              unit="mA"
              icon="🔌"
              color="#22c55e"
              channel="ADC Ch 13"
              sublabel="OBC + Payload + Aux"
            />
            <StatCard
              label="Battery Charging Current"
              value={adc.ch_14?.toFixed(2) ?? "N/A"}
              unit="mA"
              icon="🔋"
              color="#10b981"
              channel="ADC Ch 14"
            />
            <StatCard
              label="Comm Subsystem Current"
              value={adc.ch_15?.toFixed(2) ?? "N/A"}
              unit="mA"
              icon="📡"
              color="#14b8a6"
              channel="ADC Ch 15"
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
            <div
              className={`w-2 h-2 rounded-full ${
                isLive ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            ></div>
            <span className="text-sm text-zinc-400">
              {isLive
                ? "Connected to MongoDB - Live data stream"
                : "Disconnected - Attempting to reconnect..."}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {data.timestamp && (
              <p className="text-xs text-zinc-500">
                Sensor Timestamp: {new Date(data.timestamp).toLocaleString()}
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-zinc-600">
                Last Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
