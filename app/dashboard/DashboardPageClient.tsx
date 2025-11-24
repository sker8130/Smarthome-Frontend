"use client";

import { useEffect, useState } from "react";
import { apiFetch, getAuthToken } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";

type ApiDevice = {
  id: number | string;
  name: string;
  type?: string;
  description?: string;
  powerValue?: number;
  priority?: number;
  isOn?: boolean;
  on?: boolean;
  status?: boolean;
  mqttTopic?: string;
};

type Device = {
  id: string;
  name: string;
  type: string;
  icon: string;
  on: boolean;
  mqttTopic?: string;
};

interface SensorPoint {
  time: number;
  value: number;
}

const iconMap: Record<string, string> = {
  fan: "/icons/fan.png",
  light: "/icons/light.png",
  lightauto: "/icons/light-auto.gif",
  speaker: "/icons/speaker.png",
};

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Fetch data realtime from back-end
  const [dataMap, setDataMap] = useState<Record<string, SensorPoint[]>>({});

  // ==========================================
  // Get client token
  // ==========================================
  useEffect(() => {
    const t = getAuthToken();
    if (!t) {
      window.location.href = "/login";
      return;
    }
    setToken(t);
  }, []);

  // ==========================================
  // Fetch devices after get token
  // ==========================================
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res: any = await apiFetch("/devices");
        const list: ApiDevice[] = Array.isArray(res.data) ? res.data : [];

        const mapped: Device[] = list.map((d) => {
          const id = String(d.id);

          // Determine ON/OFF
          const on =
            d.type === "relay"
              ? false
              : typeof d.isOn === "boolean"
              ? d.isOn
              : typeof d.on === "boolean"
              ? d.on
              : typeof d.status === "boolean"
              ? d.status
              : false;

          const icon =
            d.type === "light"
              ? iconMap.light
              : d.type === "fan"
              ? iconMap.fan
              : d.type === "speaker"
              ? iconMap.speaker
              : "/icons/light.png";

          return {
            id,
            name: d.name ?? `Device ${id}`,
            icon,
            on,
            mqttTopic: d.mqttTopic,
            type: d.type ?? "device",
          };
        });

        setDevices(mapped);
      } catch (err) {
        console.error("Fetch devices error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // ======================================
  // Connect to WebSocket and realtime data
  // ======================================
  useEffect(() => {
    if (!token) return;

    const socket: Socket = io("http://localhost:3000", {
      auth: { token },
    });

    socket.on("connect", () => console.log("Connected WebSocket"));

    socket.on(
      "sensorData",
      (msg: { topic: string; time: string; value: number }) => {
        const ts = new Date(msg.time).getTime();

        setDataMap((prev) => {
          const arr = prev[msg.topic] || [];
          const nextArr: SensorPoint[] = [
            ...arr.slice(-99),
            { time: ts, value: msg.value },
          ];
          return { ...prev, [msg.topic]: nextArr };
        });

        setDevices((prev) =>
          prev.map((d) =>
            d.type === "relay" && d.mqttTopic === msg.topic
              ? { ...d, on: msg.value === 1 }
              : d
          )
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // =====================================
  // Toggle devices
  // =====================================
  async function toggle(id: string, next?: boolean) {
    if (!token) return;

    setBusyId(id);

    setDevices((ds) =>
      ds.map((d) => (d.id === id ? { ...d, on: next ?? !d.on } : d))
    );

    try {
      await apiFetch(`/devices/${id}/toggle`, { method: "POST" });
    } catch {
      // Rollback
      setDevices((ds) =>
        ds.map((d) => (d.id === id ? { ...d, on: !(next ?? !d.on) } : d))
      );
      alert("Unable to use device.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <p>Loading...</p>
      </main>
    );
  }

  // ==========================================
  // Render page
  // ==========================================
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      {/* DEVICES */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {devices
          .filter((d) => d.type !== "sensor")
          .map((d) => {
            const isRelay = d.type === "relay";

            return (
              <article
                key={d.id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <img src={d.icon} className="h-10 w-10 object-contain" />

                  {/* Relay button */}
                  {isRelay ? (
                    <span
                      className={`rounded-full px-3 py-1 text-sm border cursor-not-allowed ${
                        d.on
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {d.on ? "ON" : "OFF"}
                    </span>
                  ) : (
                    <button
                      onClick={() => toggle(d.id)}
                      disabled={busyId === d.id}
                      className={`rounded-full px-3 py-1 text-sm border cursor-pointer ${
                        d.on
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {busyId === d.id ? "..." : d.on ? "ON" : "OFF"}
                    </button>
                  )}
                </div>

                <h3 className="mt-3 text-base font-medium">{d.name}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Topic: {d.mqttTopic || "—"}
                </p>
              </article>
            );
          })}
      </section>

      {/* SENSOR CHARTS */}
      <section className="grid grid-cols-1 gap-8">
        {devices
          .filter((d) => d.type === "sensor")
          .map((d) => {
            const arr = d.mqttTopic ? dataMap[d.mqttTopic] || [] : [];

            const chartData = arr.map((p) => ({
              time: new Date(p.time).toLocaleTimeString(),
              value: p.value,
            }));

            const latest = arr.length ? arr[arr.length - 1].value : null;
            const isTemperature = d.name === "Temperature";
            const isDanger = isTemperature && latest !== null && latest >= 28;

            // Dynamic Y domain
            const values = arr.map((p) => p.value);
            const minY = values.length > 0 ? Math.min(...values) : 0;
            const maxY = values.length > 0 ? Math.max(...values) : 10;

            // Chart color (normal or danger)
            const lineColor = isDanger ? "#d60000" : "#245bcbff";
            const textColor = isDanger ? "text-red-600" : "text-blue-600";

            return (
              <div
                key={d.id}
                className="border rounded-xl p-4 bg-white shadow-sm"
              >
                <div
                  className={`text-lg font-semibold mb-2 text-center ${textColor}`}
                >
                  {latest !== null ? `Value: ${latest}` : "No data."}
                </div>

                <div className="w-full overflow-x-auto">
                  <LineChart width={900} height={300} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[minY - 1, maxY + 1]} />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={lineColor}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={lineColor}
                      fill={isDanger ? "#ff00002a" : "#8884d825"}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </div>

                <p className="text-sm text-center mt-2">{d.name}</p>
              </div>
            );
          })}
      </section>
    </main>
  );
}
