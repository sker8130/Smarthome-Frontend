"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
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

interface Device {
  id: number;
  name: string;
  mqttTopic: string;
}

interface SensorData {
  time: number;
  value: number;
}

export default function RealtimeChart() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [dataMap, setDataMap] = useState<Record<string, SensorData[]>>({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Lấy danh sách device
  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch("http://localhost:3000/devices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        setDevices(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Failed to fetch devices:", err);
      }
    }

    if (token) {
      fetchDevices();
    }
  }, [token]);

  // Kết nối realtime qua socket.io
  useEffect(() => {
    if (!token) return;

    const socket: Socket = io("http://localhost:3000", {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Connected to NestJS WebSocket with token");
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connect error:", err.message);
    });

    socket.on(
      "sensorData",
      (msg: { topic: string; value: number; time: string }) => {
        const timestamp = new Date(msg.time).getTime();
        setDataMap((prev) => {
          const topicData = prev[msg.topic] || [];
          return {
            ...prev,
            [msg.topic]: [
              ...topicData.slice(-99),
              { time: timestamp, value: msg.value },
            ],
          };
        });
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Realtime Device Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Live sensor data streaming from your smart devices.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live updating
        </span>
      </div>

      {devices.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
          Loading devices or no device found. Make sure you are logged in and
          the backend is running.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {devices.map((device) => {
            const series = dataMap[device.mqttTopic] || [];
            const latest = series[series.length - 1];

            // id gradient riêng cho mỗi topic
            const gradientId = `lineGradient-${device.mqttTopic.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}`;

            return (
              <div
                key={device.id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Header card */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {device.name}
                    </h2>
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      Topic: <span className="font-mono">{device.mqttTopic}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      Latest value
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {latest ? latest.value.toFixed(2) : "--"}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        unit
                      </span>
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                      <defs>
                        <linearGradient
                          id={gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4f46e5"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor="#4f46e5"
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
                          new Date(t).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        }
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                        width={40}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        labelFormatter={(t) =>
                          new Date(t).toLocaleTimeString()
                        }
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.75rem",
                          border: "1px solid #e5e7eb",
                          boxShadow:
                            "0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.08)",
                          fontSize: 12,
                        }}
                        itemStyle={{ color: "#111827" }}
                      />

                      {/* Area fill dưới line cho “soft” look */}
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
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 0,
                          fill: "#4f46e5",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Footer nhỏ */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Points:{" "}
                    <span className="font-medium text-slate-500">
                      {series.length}
                    </span>
                  </span>
                  <span className="italic">
                    Auto trim to last 100 points
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
