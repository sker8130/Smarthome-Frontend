"use client";

import { useEffect, useState } from "react";
import { apiFetch, getAuthToken } from "@/lib/api";
import { LineChart } from "@mui/x-charts/LineChart";
import { io, Socket } from "socket.io-client";

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
  const token = getAuthToken();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Fetch data realtime from back-end
  const [dataMap, setDataMap] = useState<Record<string, SensorPoint[]>>({});

  // Check JWT and redirect if invalid
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }, []);

  // =================================
  // Fetch all devices
  // =================================
  useEffect(() => {
    (async () => {
      try {
        const res: any = await apiFetch("/devices");
        const list: ApiDevice[] = Array.isArray(res.data) ? res.data : [];
        const mapped: Device[] = list.map((d) => {
          const id = String(d.id);
          const on =
            typeof d.isOn === "boolean"
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
                  : "/icons/light.png"; // default

          return {
            id,
            name: d.name ?? `Device ${id}`,
            icon,
            on,
            mqttTopic: d.mqttTopic,
            type: d.type ?? "device"
          };
        });

        setDevices(mapped);
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ======================================
  // Connect to WebSocket and realtime data
  // ======================================
  useEffect(() => {
    if (!token) return;

    const socket: Socket = io("http://localhost:3000", {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Connected WebSocket");
    });

    socket.on("sensorData", (msg: { topic: string; value: number; time: string }) => {
      const ts = new Date(msg.time).getTime();

      setDataMap((prev) => {
        const arr = prev[msg.topic] || [];
        return {
          ...prev,
          [msg.topic]: [...arr.slice(-99), { time: ts, value: msg.value }],
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // =====================================
  // Toggle devices
  // =====================================
  async function toggle(id: string, next?: boolean) {
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

  // =================================
  // Render data
  // =================================
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      {/* DEVICES */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {devices
          .filter((d) => d.type !== "sensor")
          .map((d) => (
            <article key={d.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <img src={d.icon} className="h-10 w-10 object-contain" />

                <button
                  onClick={() => toggle(d.id)}
                  disabled={busyId === d.id}
                  className={`rounded-full px-3 py-1 text-sm border ${d.on
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                >
                  {busyId === d.id ? "..." : d.on ? "ON" : "OFF"}
                </button>
              </div>

              <h3 className="mt-3 text-base font-medium">{d.name}</h3>
              <p className="mt-1 text-xs text-gray-500">
                Topic: {d.mqttTopic || "—"}
              </p>
            </article>
          ))}
      </section>

      {/* SENSOR CHARTS */}
      <section className="grid grid-cols-1 gap-8">
        {devices
          .filter((d) => d.type === "sensor")
          .map((d) => {
            const arr = d.mqttTopic ? dataMap[d.mqttTopic] || [] : [];

            const xAxis = arr.map((p) => new Date(p.time).toLocaleTimeString());
            const series = arr.map((p) => p.value);

            return (
              <div key={d.id} className="border rounded-xl p-4 bg-white shadow-sm">
                <LineChart
                  xAxis={[{ data: xAxis, scaleType: "point" }]}
                  series={[{ data: series }]}
                  height={300}
                />
                <p className="text-sm text-center mt-2">{d.name}</p>
              </div>
            );
          })}
      </section>
    </main>
  );
}