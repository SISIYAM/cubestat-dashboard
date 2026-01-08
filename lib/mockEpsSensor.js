// EPS Board Sensor Data Generator - Matches MongoDB Schema
export const generateEpsSensorData = () => ({
  timestamp: new Date().toISOString(),
  battery: {
    voltage_V: 3.5 + Math.random() * 0.5, // 3.5V - 4.0V
    soc_percent: Math.random() * 100, // 0% - 100%
  },
  adc: {
    ch_0: 20 + Math.random() * 5, // Battery Cell 1 Temp (°C)
    ch_1: 20 + Math.random() * 5, // Battery Cell 2 Temp (°C)
    ch_2: Math.random() * 0.5, // Solar X+ Current (mA)
    ch_3: Math.random() * 0.5, // Solar X- Current (mA)
    ch_4: Math.random() * 0.5, // Solar Y+ Current (mA)
    ch_5: Math.random() * 0.5, // Solar Y- Current (mA)
    ch_6: 24 + Math.random() * 2, // EPS Board Temp (°C)
    ch_7: 20 + Math.random() * 5, // Battery Cell 3 Temp (°C)
    ch_8: 18 + Math.random() * 5, // Battery Cell 4 Temp (°C)
    ch_13: 10 + Math.random() * 10, // System Load Current (mA)
    ch_14: 4 + Math.random() * 3, // Battery Charging Current (mA)
    ch_15: 25 + Math.random() * 5, // Comm Subsystem Current (mA)
  },
  solar_charger: {
    solar_supply_ok: Math.random() > 0.2,
    solar_power_path: Math.random() > 0.5,
    solar_mode: Math.random() > 0.5,
    input_power_ok: Math.random() > 0.2,
    charger_enabled: Math.random() > 0.3,
    source_mode: Math.random() > 0.5 ? "ADAPTER" : "BATTERY",
    charging_status:
      Math.random() > 0.5 ? "Adapter-powered fast charging" : "Not charging",
    stat1: Math.random() > 0.5,
    stat2: Math.random() > 0.5,
  },
});
