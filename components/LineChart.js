// components/LineChart.js
"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler);

export default function LineChart({
  data,
  color = "#3b82f6",
  gradientColor = "#1d4ed8",
}) {
  return (
    <div className="h-24 mt-3">
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderColor: color,
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.ctx;
                const gradient = canvas.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, color + "40");
                gradient.addColorStop(1, color + "00");
                return gradient;
              },
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: color,
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: color,
              pointHoverBorderColor: "#ffffff",
              pointHoverBorderWidth: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: "index",
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "#ffffff",
              bodyColor: "#ffffff",
              borderColor: color,
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              display: false,
              grid: { display: false },
            },
            y: {
              display: false,
              grid: { display: false },
            },
          },
          elements: {
            point: {
              hoverRadius: 8,
            },
          },
        }}
      />
    </div>
  );
}
