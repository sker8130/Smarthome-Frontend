"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

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
      case "action":
        return log.action ?? "";
      default:
        return (log as any)[key] ?? "";
    }
  }

  // Handle sort
  function handleSort(key: string) {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
    // về trang 1 sau khi đổi sort
    setCurrentPage(1);
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
  const totalPages = Math.ceil(sortedLogs.length / rowsPerPage) || 1;
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5ff]">
        <DashboardHeader />
        <main className="mx-auto max-w-6xl p-6">
          <p className="text-gray-700">Loading logs...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5ff]">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl p-6 space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Device Logs
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              History of manual and automatic relay actions.
            </p>
          </div>

          <div className="rounded-full bg-white/70 px-4 py-2 text-xs text-gray-500 shadow-sm">
            Total records:{" "}
            <span className="font-semibold text-[var(--color-purple)]">
              {logs.length}
            </span>
          </div>
        </div>

        {/* TABLE CARD */}
        <section className="rounded-2xl border border-purple-50 bg-white/90 p-4 shadow-sm md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Activity log
            </h2>
            <p className="text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--color-purple)] text-white">
                <tr>
                  <SortableHeader
                    label="ID"
                    sortKey="id"
                    active={sortConfig?.key === "id"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("id")}
                    className="w-16"
                  />
                  <SortableHeader
                    label="Device"
                    sortKey="device.name"
                    active={sortConfig?.key === "device.name"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("device.name")}
                    className="w-40"
                  />
                  <SortableHeader
                    label="User"
                    sortKey="user.username"
                    active={sortConfig?.key === "user.username"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("user.username")}
                    className="w-40"
                  />
                  <SortableHeader
                    label="Action"
                    sortKey="action"
                    active={sortConfig?.key === "action"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("action")}
                    className="w-32"
                  />
                  <SortableHeader
                    label="Timestamp"
                    sortKey="timestamp"
                    active={sortConfig?.key === "timestamp"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("timestamp")}
                    className="w-56"
                  />
                  <th className="whitespace-nowrap px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">
                    Mode
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedLogs.map((log, index) => {
                  const isOn = log.action === "ON";
                  const isAuto = log.isAutomatic;

                  return (
                    <tr
                      key={log.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#faf9ff]"}
                    >
                      <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-gray-500">
                        #{log.id}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-2 text-sm text-gray-800">
                        {log.device?.name || "N/A"}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-2 text-xs text-gray-700">
                        {log.user?.username || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                            isOn
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <span
                            className={`mr-1 h-2 w-2 rounded-full ${
                              isOn ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {log.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-gray-700">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right text-xs">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                            isAuto
                              ? "bg-[var(--color-purple)]/10 text-[var(--color-purple)]"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isAuto ? "Automatic" : "Manual"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {paginatedLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Showing {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, sortedLogs.length)} of{" "}
              {sortedLogs.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`min-w-[32px] rounded-full px-3 py-1 text-xs font-medium ${
                    currentPage === i + 1
                      ? "bg-[var(--color-purple)] text-white"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Small component for sortable header */
function SortableHeader({
  label,
  sortKey,
  active,
  direction,
  onClick,
  className = "",
}: {
  label: string;
  sortKey: string;
  active?: boolean;
  direction?: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1"
      >
        <span>{label}</span>
        {active && (
          <span className="text-[10px]">{direction === "asc" ? "▲" : "▼"}</span>
        )}
      </button>
    </th>
  );
}
