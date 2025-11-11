"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, getAuthToken } from "@/lib/api";
import { LineChart } from '@mui/x-charts/LineChart';

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
};

type Device = { id: string; name: string; icon: string; on: boolean };

const iconMap: Record<string, string> = {
  fan: "/icons/fan.png",
  light: "/icons/light.png",
  lightauto: "/icons/light-auto.gif",
  speaker: "/icons/speaker.png",
};

const temperatureData = [27.5, 28.1, 29.0, 0, 30.2, 31.0, 30.7];
const temperatureX = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
const lightData = [320, 560, 880, 1200, 200, 1450, 980];
const lightX = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [totalPower, setTotalPower] = useState<number | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data: ApiDevice[] = await apiFetch("/devices");
        const mapped: Device[] =
          (data || []).map((d) => {
            const id = String(d.id);
            const on =
              typeof d.isOn === "boolean"
                ? d.isOn
                : typeof d.on === "boolean"
                  ? d.on
                  : typeof d.status === "boolean"
                    ? d.status
                    : false;

            const keyGuess =
              id ||
              (d.type ?? "").toLowerCase() ||
              (d.name ?? "").toLowerCase().split(" ")[0];

            const icon =
              iconMap[keyGuess] ||
              (d.name?.toLowerCase().includes("quạt")
                ? iconMap.fan
                : d.name?.toLowerCase().includes("loa")
                  ? iconMap.speaker
                  : d.name?.toLowerCase().includes("đèn")
                    ? iconMap.light
                    : "/icons/light.png");

            return { id, name: d.name ?? `Device ${id}`, icon, on };
          }) || [];

        setDevices(mapped);
      } catch {
        setDevices([
          { id: "fan", name: "Quạt", icon: "/icons/fan.png", on: true },
          { id: "light", name: "Đèn", icon: "/icons/light.png", on: false },
          {
            id: "lightauto",
            name: "Đèn tự động",
            icon: "/icons/light-auto.gif",
            on: false,
          },
          { id: "speaker", name: "Loa", icon: "/icons/speaker.png", on: true },
        ]);
      } finally {
        setLoading(false);
      }

      try {
        const total = await apiFetch("/energy-consumptions/total");
        const val =
          typeof total === "number"
            ? total
            : total?.total?.power ?? total?.total_power ?? total?.value ?? null;
        if (typeof val === "number") setTotalPower(val);
      } catch {
      }
    })();
  }, []);

  const totalOn = useMemo(() => devices.filter((d) => d.on).length, [devices]);

  const dailyKwh = useMemo(() => {
    if (typeof totalPower === "number") return totalPower;
    return 9.2;
  }, [totalPower]);
  const limitKwh = 10;
  const ratio = dailyKwh / limitKwh;
  const badge =
    ratio >= 1
      ? {
        text: "Energy Limit",
        color: "bg-red-100 text-red-700 border-red-200",
      }
      : ratio >= 0.7
        ? {
          text: "High Usage",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        }
        : { text: "Normal", color: "bg-gray-100 text-gray-700 border-gray-200" };

  async function toggle(id: string, next?: boolean) {
    setBusyId(id);
    setDevices((ds) =>
      ds.map((d) => (d.id === id ? { ...d, on: next ?? !d.on } : d))
    );

    try {
      await apiFetch(`/devices/${id}/toggle`, { method: "POST" });
    } catch {
      setDevices((ds) =>
        ds.map((d) => (d.id === id ? { ...d, on: !(next ?? !d.on) } : d))
      );
      alert("Không thể bật/tắt thiết bị. Kiểm tra server hoặc token.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAll(next: boolean) {
    const prev = devices;
    setDevices((ds) => ds.map((d) => ({ ...d, on: next })));
    try {
      const toToggle = prev.filter((d) => d.on !== next).map((d) => d.id);
      await Promise.all(
        toToggle.map((id) =>
          apiFetch(`/devices/${id}/toggle`, { method: "POST" })
        )
      );
    } catch {
      // rollback
      setDevices(prev);
      alert("Không thể áp dụng cho tất cả thiết bị.");
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <p className="animate-pulse text-gray-500">Đang tải thiết bị…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Smarthome — Dashboard</h1>
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${badge.color}`}
        >
          <span>⚡</span>
          <span>{badge.text}</span>
          <span className="ml-1 font-mono">
            {dailyKwh.toFixed(1)} / {limitKwh} kWh
          </span>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => toggleAll(false)}
          className="rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          Tắt tất cả
        </button>
        <button
          onClick={() => toggleAll(true)}
          className="rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          Bật tất cả
        </button>
        <span className="text-sm text-gray-500">
          Đang bật:{" "}
          <b>
            {totalOn}/{devices.length}
          </b>
        </span>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {devices.map((d) => (
          <article
            key={d.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10">
                {d.icon.startsWith("http") || d.icon.startsWith("/") ? (
                  <img
                    src={d.icon}
                    alt={d.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl">{d.icon}</span>
                )}
              </div>

              <button
                onClick={() => (busyId ? null : toggle(d.id))}
                disabled={busyId === d.id}
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm border transition
                  ${d.on
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                  ${busyId === d.id
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:opacity-90"
                  }
                `}
              >
                {busyId === d.id ? "..." : d.on ? "ON" : "OFF"}
              </button>
            </div>
            <h3 className="mt-3 text-base font-medium">{d.name}</h3>
            <p className="mt-1 text-xs text-gray-500">ID: {d.id}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Tiêu thụ hôm nay"
          value={`${dailyKwh.toFixed(1)} kWh`}
          sub="+0.8 so với hôm qua"
        />
        <StatCard
          label="Thiết bị đang bật"
          value={String(totalOn)}
          sub={`${Math.round((totalOn / devices.length) * 100)}% tổng số`}
        />
        <StatCard
          label="Chi phí ước tính"
          value={(dailyKwh * 3000).toLocaleString("vi-VN") + " đ"}
          sub="giả định 3.000đ/kWh"
        />
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <LineChart
          xAxis={[{ data: temperatureX, scaleType: 'point' }]}
          series={[
            {
              data: temperatureData,
            },
          ]}
          height={300}
        />
        <p className="text-sm text-center">Nhiệt độ (°C)</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <LineChart
          xAxis={[{ data: lightX, scaleType: 'point' }]}
          series={[
            {
              data: lightData,
            },
          ]}
          height={300}
        />
        <p className="text-sm text-center">Ánh sáng (Lux)</p>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
