"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// ---- Types -----

type Device = {
  id: number;
  name: string;
  type: string;
  mqttTopic: string;
  isOn?: boolean;
  description?: string;
  priority?: number;
  powerValue?: number | null;
  createdAt: string;
  updatedAt: string;
};

type User = {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
};

type DeviceLog = {
  id: number;
  device: Device;
  user: User | null;
  action: "ON" | "OFF";
  isAutomatic: boolean;
  timestamp: string;
};

type DeviceLogWithDuration = DeviceLog & {
  duration: number | null;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

// -------------------------------------

export default function LogPageClient() {
  const [logs, setLogs] = useState<DeviceLogWithDuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "id",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // ---- Fetch logs ----
  async function loadLogs() {
    try {
      const res: any = await apiFetch("/relay-controls");

      if (Array.isArray(res.data)) {
        const processed = calculateDurations(res.data);
        setLogs(processed);
      }
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  // ---- Helper to get value by key ----
  function getValue(log: DeviceLogWithDuration, key: string) {
    switch (key) {
      case "device.name":
        return log.device?.name ?? "";
      case "user.username":
        return log.user?.username ?? "";
      case "timestamp":
        return log.timestamp ?? "";
      case "duration":
        return log.duration ?? 0;
      default:
        return (log as any)[key] ?? "";
    }
  }

  // ---- Calculate durations between ON and OFF ----
  function calculateDurations(rawLogs: DeviceLog[]): DeviceLogWithDuration[] {
    // Sort logs by timestamp ascending
    const sorted = [...rawLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const onMap = new Map<number, DeviceLog>();
    const result = sorted.map((log) => ({ ...log, duration: null as number | null }));

    for (const log of result) {
      if (log.action === "ON") {
        onMap.set(log.device.id, log);
      } else if (log.action === "OFF") {
        const onLog = onMap.get(log.device.id);
        if (onLog) {
          log.duration =
            new Date(log.timestamp).getTime() - new Date(onLog.timestamp).getTime();
        }
      }
    }

    return result;
  }

  // ---- Sort handler ----
  function handleSort(key: string) {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  }

  // ---- Apply sorting ----
  const sortedLogs = [...logs].sort((a, b) => {
    const aVal = getValue(a, sortConfig.key);
    const bVal = getValue(b, sortConfig.key);

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // ---- Format duration helper ----
  function formatDuration(seconds: number) {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const mins = seconds / 60;
    if (mins < 60) {
      return `${Math.floor(mins)} mins`;
    }

    const hours = mins / 60;
    if (hours < 24) {
      return `${Math.floor(hours)} hours`;
    }

    const days = hours / 24;
    return `${Math.floor(days)} days`;
  }

  // ---- Pagination ----
  const totalPages = Math.ceil(sortedLogs.length / rowsPerPage);
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString(undefined, {
      hour12: false,
    });

  if (loading) return <div className="p-6 text-lg">Loading logs...</div>;

  // ---- Render UI ----
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-semibold mb-6">Device Logs</h1>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-green-600 text-white">
          <tr>
            <Th label="ID" sortKey="id" sortConfig={sortConfig} onSort={handleSort} />
            <Th label="Device" sortKey="device.name" sortConfig={sortConfig} onSort={handleSort} />
            <Th label="User" sortKey="user.username" sortConfig={sortConfig} onSort={handleSort} />
            <Th label="Action" sortKey="action" sortConfig={sortConfig} onSort={handleSort} />
            <Th label="Timestamp" sortKey="timestamp" sortConfig={sortConfig} onSort={handleSort} />
            <Th label="Duration" sortKey="duration" sortConfig={sortConfig} onSort={handleSort} />
          </tr>
        </thead>

        <tbody>
          {paginatedLogs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.device?.name || "N/A"}</td>
              <td className="border p-2">{log.user?.username || "N/A"}</td>
              <td className="border p-2">{log.action}</td>
              <td className="border p-2">{formatTimestamp(log.timestamp)}</td>
              <td className="border p-2">
                {log.duration ? formatDuration(Math.floor(log.duration / 1000)) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-green-600 text-white" : ""
              }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}

// ---- Header cell component for sorting ----
function Th({
  label,
  sortKey,
  sortConfig,
  onSort,
}: {
  label: string;
  sortKey: string;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
}) {
  const arrow =
    sortConfig?.key === sortKey ? (sortConfig.direction === "asc" ? "▲" : "▼") : "";

  return (
    <th className="border p-2 cursor-pointer select-none" onClick={() => onSort(sortKey)}>
      {label} {arrow}
    </th>
  );
}