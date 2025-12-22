"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
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
import Loader from "@/components/ui/Loader";
import BrightnessControl from "@/components/devices/BrightnessControl";

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
  brightness?: number;
};

type Device = {
  id: string;
  name: string;
  type: string;
  icon: string;
  on: boolean;
  mqttTopic?: string;
  brightness?: number;
};

interface SensorPoint {
  time: number;
  value: number;
}

type WatchRule = {
  id: number;
  topic: string;
  threshold: number;
  createdAt: string;
};

const iconMap: Record<string, string> = {
  fan: "/icons/fan.png",
  light: "/icons/light.png",
  lightauto: "/icons/light-auto.gif",
  speaker: "/icons/speaker.png",
};

type SensorTooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
};

function SensorTooltip({ active, payload, label }: SensorTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;

  return (
    <div className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-gray-800">Value: {value}</div>
      <div className="mt-1 text-[10px] text-gray-500">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Fetch data realtime from back-end
  const [dataMap, setDataMap] = useState<Record<string, SensorPoint[]>>({});
  const [rules, setRules] = useState<WatchRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);

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
            brightness: typeof d.brightness === "number" ? d.brightness : undefined,
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

  // ==========================================
  // Fetch watch rules after get token
  // ==========================================

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res: any = await apiFetch("/mqtt-watch-rules");
        if (Array.isArray(res)) setRules(res);
      } catch (err) {
        console.error("Fetch watch rules error", err);
      } finally {
        setRulesLoading(false);
      }
    })();
  }, [token]);

  // ======================================
  // Connect to WebSocket and realtime data
  // ======================================

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
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
  const [uiLoading, setUiLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setUiLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (uiLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-purple)] text-white">
        <DashboardHeader />
        <main className="flex h-screen items-center justify-center bg-[var(--color-purple)]">
          <Loader />
        </main>
      </div>
    );
  }

  // ==========================================
  // Render page
  // ==========================================
  // Sort devices by name (A → Z) once, then derive each section
  const devicesByName = [...devices].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
  );

  const brightnessDevices = devicesByName.filter((d) => d.type === "brightness");

  // Get sensor devices with mqttTopic (only sensors have data)
  const sensorDevices = devicesByName.filter((d) => d.type === "sensor" && !!d.mqttTopic);
  return (
    <div className="bg-[var(--color-purple)] text-white min-h-screen">
      <DashboardHeader />
      <main className="mx-auto max-w-5xl p-6 space-y-8">

        {/* DEVICES */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {devicesByName
            .filter((d) => d.type !== "sensor" && d.type !== "brightness")
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
                        className={`rounded-full px-3 py-1 text-sm border cursor-not-allowed ${d.on
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
                        className={`rounded-full px-3 py-1 text-sm border cursor-pointer ${d.on
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                      >
                        {busyId === d.id ? "..." : d.on ? "ON" : "OFF"}
                      </button>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-medium text-gray-900">
                    {d.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Type: {d.type || "—"}
                  </p>
                </article>
              );
            })}
          {brightnessDevices.map((bd) => (
            <div className="lg:col-span-2" key={bd.id}>
              <BrightnessControl
                deviceId={bd.id}
                initialBrightness={typeof bd.brightness === "number" ? bd.brightness : 100}
              />
            </div>
          ))}
        </section>

        {/* SENSOR CHARTS */}
        <section className="grid grid-cols-1 gap-8">
          {[...sensorDevices]
            .sort((a, b) =>
              (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
            )
            .map((d) => {
              const arr = d.mqttTopic ? dataMap[d.mqttTopic] || [] : [];

              const chartData = arr.map((p) => ({
                time: new Date(p.time).toLocaleTimeString(),
                value: p.value,
              }));

              const latest = arr.length ? arr[arr.length - 1].value : null;

              // Get thresholds by topic (min threshold if multiple rules)
              const topic = d.mqttTopic || "";
              const thresholds = rules.filter((r) => r.topic === topic).map((r) => r.threshold);
              const minThreshold = thresholds.length ? Math.min(...thresholds) : undefined;
              const isDanger = minThreshold !== undefined && latest !== null && latest >= minThreshold;

              // Dynamic Y domain
              const values = arr.map((p) => p.value);
              const minY = values.length > 0 ? Math.min(...values) : 0;
              const maxY = values.length > 0 ? Math.max(...values) : 10;

              // Chart color (normal or danger)
              const lineColor = isDanger ? "#D60000" : "#7B79DA";
              const gradientId = `sensorGradient-${String(d.id).replace(/[^a-zA-Z0-9_-]/g, "_")}`;

              return (
                <div
                  key={d.id}
                  className="rounded-2xl border p-4 md:p-5 shadow-sm border-purple-50 bg-white shadow-purple-100/80"
                >
                  {/* Header card */}
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        Sensor
                      </p>
                      <h3 className="text-base font-semibold text-gray-900">
                        {d.name}
                      </h3>
                    </div>

                    <div
                      className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold ${isDanger
                          ? "bg-red-100 text-red-700"
                          : "bg-[var(--color-purple)]/10 text-[var(--color-purple)]"
                        }`}
                    >
                      <span
                        className={`mr-2 h-2 w-2 rounded-full ${isDanger ? "bg-red-500" : "bg-[var(--color-purple)]"
                          }`}
                      />
                      {latest !== null ? `Now: ${latest}` : "No data"}
                      {minThreshold !== undefined && (
                        <span className="ml-2 opacity-80">Threshold: {minThreshold}</span>
                      )}
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="w-full overflow-x-auto">
                    <LineChart width={900} height={260} data={chartData}>
                      <defs>
                        <linearGradient
                          id={gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#7B79DA" stopOpacity={0.4} />
                          <stop offset="90%" stopColor="#7B79DA" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7f3" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7f3" }}
                      />
                      <YAxis
                        domain={[minY - 1, maxY + 1]}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7f3" }}
                      />

                      <Tooltip content={<SensorTooltip />} />

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
                        stroke={lineColor}
                        strokeWidth={2.4}
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </div>

                  <p className="mt-2 text-center text-sm text-gray-600">
                    {d.name}
                  </p>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
}
