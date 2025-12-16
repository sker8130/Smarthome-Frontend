"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Loader from "@/components/ui/Loader";

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
  const [uiLoading, setUiLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setUiLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Compute durations
  const durationsMap = useMemo(() => {
    const map = new Map<number, number>();

    // Sort by timestamp ascending
    const byTime = [...logs].sort((a, b) => {
      const ta = new Date(a.timestamp).getTime() || 0;
      const tb = new Date(b.timestamp).getTime() || 0;
      return ta - tb;
    });

    const lastOn = new Map<number, number>();

    for (const log of byTime) {
      const devId = log.device?.id;
      if (devId == null) continue;
      const ts = new Date(log.timestamp).getTime();
      if (isNaN(ts)) continue;

      if (log.action === "ON") {
        lastOn.set(devId, ts);
      } else if (log.action === "OFF") {
        const onTs = lastOn.get(devId);
        if (onTs != null && onTs <= ts) {
          map.set(log.id, ts - onTs);
          // Clear the paired ON
          lastOn.delete(devId);
        }
      }
    }

    return map;
  }, [logs]);

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
      case "duration":
        return durationsMap.get(log.id) ?? -1;
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
  // Filter by date range first
  const filteredLogs = useMemo(() => {
    let base = logs;
    if (startDate || endDate) {
      const startTs = startDate ? new Date(startDate).getTime() : -Infinity;
      const endTs = endDate
        ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1).getTime()
        : Infinity;
      base = base.filter((log) => {
        const ts = new Date(log.timestamp).getTime();
        if (isNaN(ts)) return false;
        return ts >= startTs && ts <= endTs;
      });
    }

    if (selectedUser) {
      const key = selectedUser.toLowerCase();
      base = base.filter((log) => {
        const uname = (log.user?.username || "").toLowerCase();
        const fullname = `${log.user?.first_name || ""} ${log.user?.last_name || ""}`
          .trim()
          .toLowerCase();
        return uname.includes(key) || fullname.includes(key);
      });
    }

    return base;
  }, [logs, startDate, endDate, selectedUser]);

  const sortedLogs = [...filteredLogs];
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

  // Chart data for durations (use filtered logs to reflect current filter)
  const durationChartData = useMemo(() => {
    // Use only OFF actions with a valid paired duration
    const offLogs = filteredLogs.filter((l) => l.action === "OFF");
    return offLogs.map((l) => {
      const dur = durationsMap.get(l.id) ?? 0;
      return {
        time: new Date(l.timestamp).toLocaleString(undefined, {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        durationHours: Math.max(0, +(dur / 3600000).toFixed(2)),
        device: l.device?.name ?? "Unknown",
      };
    });
  }, [filteredLogs, durationsMap]);

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // Format duration
  function formatDuration(ms: number) {
    if (ms == null || isNaN(ms) || ms < 0) return "-";
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const days = Math.floor(totalSeconds / 86400);

    // < 60s => show seconds
    if (totalSeconds < 60) {
      return `${seconds}s`;
    }

    // >= 60s and < 60min => show minutes (and seconds)
    if (totalSeconds < 3600) {
      const mins = Math.floor(totalSeconds / 60);
      return `${mins}m ${String(seconds).padStart(2, "0")}s`;
    }

    // >= 60min and < 24h => show hours (and minutes)
    if (totalSeconds < 86400) {
      const hrs = Math.floor(totalSeconds / 3600);
      return `${hrs}h ${String(minutes).padStart(2, "0")}m`;
    }

    // >= 24h => show days (and hours)
    const ds = days;
    return `${ds}d ${String(hours).padStart(2, "0")}h`;
  }

  if (uiLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f4f5ff]">
        <DashboardHeader />
        <main className="flex h-screen items-center justify-center bg-[var(--color-purple)]">
          <Loader />
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
          <h1 className="text-3xl font-semibold text-gray-900">Device Logs</h1>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-4 text-sm text-gray-700 shadow-sm">
            <label className="font-semibold">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-200 px-2 py-1 text-sm"
            />
            <label className="ml-2 font-semibold">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-200 px-2 py-1 text-sm"
            />
            <label className="ml-4 font-semibold">User</label>
            <input
              type="text"
              placeholder="Search user..."
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-200 px-2 py-1 text-sm w-40"
            />
            <button
              className="ml-2 rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedUser("");
                setCurrentPage(1);
              }}
            >
              Clear
            </button>
          </div>

          <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-gray-500 shadow-sm">
            Total records: {" "}
            <span className="font-semibold text-[var(--color-purple)]">
              {sortedLogs.length}
            </span>
          </div>
        </div>

        {/* DURATION CHART */}
        <section className="rounded-2xl border border-purple-50 bg-white/90 p-4 shadow-sm md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Usage Duration (hours)
            </h2>
          </div>
          <div className="w-full" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7f3" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={{ stroke: "#e5e7f3" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={{ stroke: "#e5e7f3" }} />
                <Tooltip cursor={{ fill: "#f9fafb" }} formatter={(value: any) => [`${value} h`, "Duration"]} labelFormatter={(label: any, payload: any) => {
                  const item = payload && payload[0] && payload[0].payload;
                  return item ? `${label} • ${item.device}` : label;
                }} />
                <Bar dataKey="durationHours" fill="#7B79DA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

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
                  <SortableHeader
                    label="Duration"
                    sortKey="duration"
                    active={sortConfig?.key === "duration"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("duration")}
                    className="w-40"
                  />
                  <th className="whitespace-nowrap px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">
                    Mode
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedLogs.map((log, index) => {
                  const isOn = log.action === "ON";
                  // Determine if automatic device
                  const isAuto =
                    Boolean(log.isAutomatic) || /auto/i.test(log.device?.name ?? "");

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
                        {log.user
                          ? `${log.user.first_name || ""} ${log.user.last_name || ""}`.trim() || log.user.username
                          : "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${isOn
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                        >
                          <span
                            className={`mr-1 h-2 w-2 rounded-full ${isOn ? "bg-green-500" : "bg-red-500"
                              }`}
                          />
                          {log.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-gray-700">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-gray-700">
                        {log.action === "OFF" ? (
                          durationsMap.has(log.id) ? (
                            formatDuration(durationsMap.get(log.id) as number)
                          ) : (
                            "-"
                          )
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right text-xs">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${isAuto
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
                      colSpan={7}
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
                  className={`min-w-[32px] rounded-full px-3 py-1 text-xs font-medium ${currentPage === i + 1
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