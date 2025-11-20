"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

export default function LogPageClient() {
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Load logs
  async function loadLogs() {
    try {
      const res: any = await apiFetch("/relay-controls");
      if (Array.isArray(res.data)) setLogs(res.data);
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  // Safe value accessor
  function getValue(log: DeviceLog, key: string) {
    switch (key) {
      case "device.name":
        return log.device?.name ?? "";
      case "user.username":
        return log.user?.username ?? "";
      case "timestamp":
        return log.timestamp ?? "";
      default:
        return (log as any)[key] ?? "";
    }
  }

  // Handle sort
  function handleSort(key: string) {
    if (sortConfig?.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === "asc" ? "desc" : "asc" });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  }

  // Sorted logs
  const sortedLogs = [...logs];
  if (sortConfig) {
    sortedLogs.sort((a, b) => {
      const aVal = getValue(a, sortConfig.key);
      const bVal = getValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedLogs.length / rowsPerPage);
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const formatTimestamp = (ts: string) => new Date(ts).toLocaleString();

  if (loading) return <div className="p-6 text-lg">Loading logs...</div>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-semibold mb-6">Device Logs</h1>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("id")}>
              ID {sortConfig?.key === "id" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("device.name")}>
              Device {sortConfig?.key === "device.name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("user.username")}>
              User {sortConfig?.key === "user.username" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("action")}>
              Action {sortConfig?.key === "action" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("timestamp")}>
              Timestamp {sortConfig?.key === "timestamp" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
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
            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-green-600 text-white" : ""}`}
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