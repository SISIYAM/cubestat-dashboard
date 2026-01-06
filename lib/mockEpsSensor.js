// EPS Board Sensor Data Generator
export const generateEpsSensorData = () => ({
  // Temperature Sensors (°C)
  batteryCell1Temp: 20 + Math.random() * 15, // Channel 0
  batteryCell2Temp: 20 + Math.random() * 15, // Channel 1
  batteryCell3Temp: 20 + Math.random() * 15, // Channel 7
  batteryCell4Temp: 20 + Math.random() * 15, // Channel 8
  epsBoardTemp: 25 + Math.random() * 20, // Channel 6

  // Solar Panel Currents (mA)
  solarXPlusCurrent: Math.random() * 500, // Channel 2
  solarXMinusCurrent: Math.random() * 500, // Channel 3
  solarYPlusCurrent: Math.random() * 500, // Channel 4
  solarYMinusCurrent: Math.random() * 500, // Channel 5

  // System Currents (mA)
  systemLoadCurrent: 100 + Math.random() * 400, // Channel 13
  batteryChargingCurrent: Math.random() * 300, // Channel 14
  commSubsystemCurrent: 50 + Math.random() * 200, // Channel 15
});
