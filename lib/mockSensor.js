// src/lib/mockSensor.ts
export const generateSensorData = () => ({
  acc: {
    x: +(Math.random() * 2).toFixed(2),
    y: +(Math.random() * 2).toFixed(2),
    z: +(Math.random() * 2).toFixed(2),
  },
  mag: {
    x: +(Math.random() * 50).toFixed(1),
    y: +(Math.random() * 50).toFixed(1),
    z: +(Math.random() * 50).toFixed(1),
  },
  gyro: {
    x: +(Math.random() * 5).toFixed(2),
    y: +(Math.random() * 5).toFixed(2),
    z: +(Math.random() * 5).toFixed(2),
  },
  bmpTemp: 25 + Math.random() * 5,
  bmpPressure: 1000 + Math.random() * 10,
  temperature: 26 + Math.random() * 4,
  humidity: 50 + Math.random() * 30,
  pressure: 1012 + Math.random() * 8,
  gas: 12 + Math.random() * 5,
  uv: Math.floor(Math.random() * 100),
  red: Math.floor(Math.random() * 400),
  nox: Math.floor(Math.random() * 300),
  gps: {
    lat: 23.8103,
    lng: 90.4125,
    sats: Math.floor(Math.random() * 12),
  },
});
