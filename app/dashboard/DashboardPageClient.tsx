"use client";

import { useState } from "react";

type Device = { id: string; name: string; icon: string; on: boolean };

const initialDevices: Device[] = [
  { id: "ac", name: "Điều hòa", icon: "❄️", on: true },
  { id: "lamp", name: "Đèn phòng khách", icon: "💡", on: false },
  { id: "tv", name: "TV", icon: "📺", on: false },
  { id: "cam", name: "Camera cửa", icon: "📷", on: true },
];

export default function DashboardClient() {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const totalOn = devices.filter(d => d.on).length;

  function toggle(id: string, state?: boolean) {
    setDevices(ds => ds.map(d => (d.id === id ? { ...d, on: state ?? !d.on } : d)));
  }
  function toggleAll(next: boolean) {
    setDevices(ds => ds.map(d => ({ ...d, on: next })));
  }

  const dailyKwh = 9.2;
  const limitKwh = 10;
  const ratio = dailyKwh / limitKwh;
  const badge =
    ratio >= 1 ? { text: "Energy Limit", color: "bg-red-100 text-red-700 border-red-200" } :
    ratio >= 0.7 ? { text: "High Usage",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" } :
                   { text: "Normal",      color: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Smarthome — Draft</h1>
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${badge.color}`}>
          <span>⚡</span><span>{badge.text}</span>
          <span className="ml-1 font-mono">{dailyKwh.toFixed(1)} / {limitKwh} kWh</span>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <button onClick={() => toggleAll(false)} className="rounded-xl border px-4 py-2 hover:bg-gray-50">Tắt tất cả</button>
        <button onClick={() => toggleAll(true)} className="rounded-xl border px-4 py-2 hover:bg-gray-50">Bật tất cả</button>
        <span className="text-sm text-gray-500">Đang bật: <b>{totalOn}/{devices.length}</b></span>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {devices.map(d => (
          <article key={d.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="text-2xl">{d.icon}</div>
              <button
                onClick={() => toggle(d.id)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm border
                 ${d.on ? "bg-green-600 text-white border-green-600" : "bg-gray-100 text-gray-700 border-gray-200"}`}
              >
                {d.on ? "ON" : "OFF"}
              </button>
            </div>
            <h3 className="mt-3 text-base font-medium">{d.name}</h3>
            <p className="mt-1 text-xs text-gray-500">ID: {d.id}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Tiêu thụ hôm nay" value={`${dailyKwh.toFixed(1)} kWh`} sub="+0.8 so với hôm qua" />
        <StatCard label="Thiết bị đang bật" value={String(totalOn)} sub={`${Math.round((totalOn/devices.length)*100)}% tổng số`} />
        <StatCard label="Chi phí ước tính" value={(dailyKwh * 3000).toLocaleString("vi-VN") + " đ"} sub="giả định 3.000đ/kWh" />
      </section>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
