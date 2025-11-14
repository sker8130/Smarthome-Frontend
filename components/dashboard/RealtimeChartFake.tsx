"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

interface FakeSensor {
  id: number;
  name: string;
  mqttTopic: string;
  type: "temperature" | "light";
}

const fakeSensors: FakeSensor[] = [
  {
    id: 1,
    name: "Living Room Temperature",
    mqttTopic: "home/sensor/temperature",
    type: "temperature",
  },
  {
    id: 2,
    name: "Light Sensor",
    mqttTopic: "home/sensor/light",
    type: "light",
  },
];

interface SensorData {
  time: number;
  value: number;
}

export default function RealtimeChartFake() {
  const [dataMap, setDataMap] = useState<Record<string, SensorData[]>>({});

  // Fake sensor data generator
  useEffect(() => {
    const interval = setInterval(() => {
      setDataMap((prev) => {
        const updated: Record<string, SensorData[]> = { ...prev };
        const now = Date.now();

        fakeSensors.forEach((s) => {
          const oldData = updated[s.mqttTopic] || [];

          let base: number;
          let variation: number;

          if (s.type === "temperature") {
            // khoảng 26–30°C, dao động nhẹ
            base = 27.5;
            variation = Math.random() * 2 - 1; // [-1, +1]
          } else {
            // light: khoảng 150–450, dao động mạnh hơn
            base = 300;
            variation = Math.random() * 120 - 60; // [-60, +60]
          }

          updated[s.mqttTopic] = [
            ...oldData.slice(-99), // giữ lại 100 điểm gần nhất
            { time: now, value: base + variation },
          ];
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Realtime Environment Chart (Fake Data)
          </h1>
          <p className="text-sm text-slate-500">
            Temperature & Light simulated for preview. Devices: lamp, fan, speaker.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Fake mode active
        </span>
      </div>

      {/* 2 chart: Temperature + Light */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {fakeSensors.map((sensor) => {
          const series = dataMap[sensor.mqttTopic] || [];
          const latest = series[series.length - 1];

          const gradientId = `fakeGradient-${sensor.mqttTopic.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}`;

          // label & unit
          const unit = sensor.type === "temperature" ? "°C" : "lx";
          const color =
            sensor.type === "temperature" ? "#f97316" /* orange */ : "#4f46e5"; /* indigo */

          return (
            <div
              key={sensor.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Card header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {sensor.name}
                  </h2>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        sensor.type === "temperature"
                          ? "bg-orange-400"
                          : "bg-indigo-400"
                      }`}
                    />
                    Topic: <span className="font-mono">{sensor.mqttTopic}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Latest
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {latest ? `${latest.value.toFixed(1)} ${unit}` : "--"}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={color}
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor={color}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="time"
                      type="number"
                      domain={["auto", "auto"]}
                      tickFormatter={(t) =>
                        new Date(t).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      }
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      domain={["auto", "auto"]}
                    />

                    <Tooltip
                      labelFormatter={(t) => new Date(t).toLocaleTimeString()}
                      formatter={(value: any) => [
                        `${(value as number).toFixed(2)} ${unit}`,
                        "Value",
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.75rem",
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="none"
                      fill={`url(#${gradientId})`}
                      isAnimationActive={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      activeDot={{ r: 4, fill: color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
                <span>Points: {series.length}</span>
                <span>Auto-trim last 100 points</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
