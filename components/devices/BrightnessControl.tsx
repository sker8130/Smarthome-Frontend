"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Props {
  deviceId: string;
  initialBrightness?: number; // 0–100
}

export default function BrightnessControl({
  deviceId,
  initialBrightness = 30,
}: Props) {
  const [value, setValue] = useState(initialBrightness);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function updateBrightness(v: number) {
    setLoading(true);
    try {
      await apiFetch(`/devices/${deviceId}/brightness`, {
        method: "POST",
        body: JSON.stringify({ brightness: v }),
      });
    } catch (err) {
      console.error("Update brightness failed", err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateBrightness(v);
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[var(--color-lightpurple)] text-white p-6 space-y-3">
      {/* Title */}
      <h2 className="text-center text-xl font-semibold">Brightness</h2>

      {/* Slider Container */}
      <div className="rounded-full bg-white py-4 px-6 flex items-center gap-4 shadow-card">
        <span className="text-gray-700 text-sm w-10">{value}%</span>

        {/* SLIDER */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={handleChange}
          className="flex-1 appearance-none h-2 rounded-full slider-track"
          style={{ "--value": value } as any}
          disabled={loading}
        />
      </div>
    </div>
  );
}
