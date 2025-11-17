"use client";

import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { getFriendlyColumnName } from "@/lib/columnMapping";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDisplayProps {
  data: {
    type: "bar" | "line" | "pie";
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }>;
    title?: string;
  };
}

export function ChartDisplay({ data }: ChartDisplayProps) {
  // Professional blue color palette
  const blueColors = [
    "rgba(59, 130, 246, 0.8)",   // Blue-500
    "rgba(96, 165, 250, 0.8)",   // Blue-400
    "rgba(37, 99, 235, 0.8)",    // Blue-600
    "rgba(147, 197, 253, 0.8)",  // Blue-300
    "rgba(29, 78, 216, 0.8)",    // Blue-700
  ];

  const blueBorders = [
    "rgba(59, 130, 246, 1)",     // Blue-500
    "rgba(96, 165, 250, 1)",     // Blue-400
    "rgba(37, 99, 235, 1)",      // Blue-600
    "rgba(147, 197, 253, 1)",    // Blue-300
    "rgba(29, 78, 216, 1)",      // Blue-700
  ];

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 11,
          },
          boxWidth: 12,
          padding: 8,
        },
      },
      title: {
        display: !!data.title,
        text: data.title || "",
        font: {
          size: 14,
          weight: 600,
        },
        padding: {
          top: 0,
          bottom: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            const value = context.parsed?.y ?? context.parsed;
            if (value !== null && value !== undefined) {
              label += typeof value === 'number' ? value.toLocaleString() : value;
            }
            return label;
          },
        },
      },
    },
    scales:
      data.type !== "pie"
        ? {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value: any) {
                  return value.toLocaleString();
                },
              },
            },
          }
        : undefined,
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      label: getFriendlyColumnName(dataset.label),
      backgroundColor:
        dataset.backgroundColor ||
        (data.type === "pie"
          ? blueColors
          : blueColors[index % blueColors.length]),
      borderColor: dataset.borderColor || blueBorders[index % blueBorders.length],
      borderWidth: data.type === "bar" ? 0 : 2,
    })),
  };

  return (
    <div className="w-full rounded-lg border border-border bg-card overflow-hidden" data-testid="chart-visualization">
      <div className="p-3 sm:p-4">
        <div className="w-full aspect-[4/3] sm:aspect-[2/1]">
          {data.type === "bar" && <Bar data={chartData} options={options} />}
          {data.type === "line" && <Line data={chartData} options={options} />}
          {data.type === "pie" && <Pie data={chartData} options={options} />}
        </div>
      </div>
    </div>
  );
}
