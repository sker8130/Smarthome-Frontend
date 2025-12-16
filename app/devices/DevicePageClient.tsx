"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Loader from "@/components/ui/Loader";

type ApiDevice = {
  id: number;
  name: string;
  type?: string;
  mqttTopic?: string;
  description?: string;
  powerValue?: number;
  isOn?: boolean;
};

export default function DevicePageClient() {
  const [devices, setDevices] = useState<ApiDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ApiDevice | null>(null);
  const [addMode, setAddMode] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof ApiDevice;
    direction: "asc" | "desc";
  }>({
    key: "id",
    direction: "asc",
  });


  const [form, setForm] = useState({
    name: "",
    type: "",
    mqttTopic: "",
    description: "",
  });

  const sortedDevices = [...devices];
  if (sortConfig) {
    sortedDevices.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  function handleSort(key: keyof ApiDevice) {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  }

  // Load devices
  async function loadDevices() {
    try {
      const res: any = await apiFetch("/devices");
      const list = Array.isArray(res.data) ? res.data : [];
      setDevices(list);
    } catch (err) {
      console.error("Failed to load devices", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
  }, []);

  // Open edit modal
  function openEditModal(item: ApiDevice) {
    setAddMode(false);
    setEditItem(item);
    setForm({
      name: item.name,
      type: item.type ?? "",
      mqttTopic: item.mqttTopic ?? "",
      description: item.description ?? "",
    });
    setModalOpen(true);
  }

  // Open add modal
  function openAddModal() {
    setAddMode(true);
    setEditItem(null);
    setForm({
      name: "",
      type: "sensor",
      mqttTopic: "27C45UV/feeds/V1",
      description: "",
    });
    setModalOpen(true);
  }

  // Submit Edit
  async function saveEdit() {
    if (!editItem) return;

    try {
      await apiFetch(`/devices/${editItem.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });

      setModalOpen(false);
      setEditItem(null);
      await loadDevices();
    } catch (err) {
      alert("Error when updating device.");
      console.error(err);
    }
  }

  // Submit Add
  async function saveAdd() {
    try {
      await apiFetch("/devices", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setModalOpen(false);
      await loadDevices();
    } catch (err) {
      alert("Error when adding device.");
      console.error(err);
    }
  }

  // Delete
  async function deleteDevice(id: number) {
    if (!confirm("Are you sure you want to delete this device?")) return;

    try {
      await apiFetch(`/devices/${id}`, { method: "DELETE" });
      await loadDevices();
    } catch (err) {
      alert("Error when deleting device.");
      console.error(err);
    }
  }

  const [uiLoading, setUiLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setUiLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

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
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Devices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your smart devices, topics and descriptions in one place.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--color-purple)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-darkpurple)] transition"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Device
          </button>
        </div>

        {/* TABLE CARD */}
        <section className="rounded-2xl border border-purple-50 bg-white/90 p-4 shadow-sm md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Device List
            </h2>
            <p className="text-xs text-gray-400">
              {devices.length} device{devices.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--color-purple)] text-white">
                <tr>
                  <SortableHeader
                    label="ID"
                    active={sortConfig?.key === "id"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("id")}
                    className="w-20"
                  />
                  <SortableHeader
                    label="Name"
                    active={sortConfig?.key === "name"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("name")}
                  />
                  <SortableHeader
                    label="Type"
                    active={sortConfig?.key === "type"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("type")}
                    className="w-32"
                  />
                  <SortableHeader
                    label="MQTT Topic"
                    active={sortConfig?.key === "mqttTopic"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("mqttTopic")}
                    className="w-56"
                  />
                  <SortableHeader
                    label="Description"
                    active={sortConfig?.key === "description"}
                    direction={sortConfig?.direction}
                    onClick={() => handleSort("description")}
                  />
                  <th className="whitespace-nowrap border-l border-gray-200 px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {sortedDevices.map((d, index) => (
                  <tr
                    key={d.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#faf9ff]"}
                  >
                    <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-gray-500">
                      #{d.id}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-2 text-sm text-gray-800">
                      {d.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-[var(--color-purple)]">
                      {d.type || "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-2 text-xs text-gray-600">
                      {d.mqttTopic || "—"}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-2 text-xs text-gray-600">
                      {d.description || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEditModal(d)}
                          className="inline-flex items-center rounded-lg bg-[#edf2ff] px-2 py-1 text-xs font-semibold text-[var(--color-purple)] hover:bg-[#e0e6ff]"
                          title="Edit"
                        >
                          ✏️
                          <span className="ml-1 hidden sm:inline">Edit</span>
                        </button>

                        <button
                          onClick={() => deleteDevice(d.id)}
                          className="inline-flex items-center rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                          title="Delete"
                        >
                          🗑
                          <span className="ml-1 hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {sortedDevices.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No devices found. Click <strong>Add Device</strong> to
                      create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* EDIT / ADD MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-gray-900">
                {addMode ? "Add New Device" : `Edit Device`}
              </h2>
              {!addMode && editItem && (
                <p className="mt-1 text-xs text-gray-500">
                  ID: #{editItem.id} • {editItem.name}
                </p>
              )}

              <div className="mt-5 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-[#f7f8ff] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[var(--color-purple)] focus:ring-1 focus:ring-[var(--color-purple)]"
                    placeholder="Device name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Type
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-200 bg-[#f7f8ff] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[var(--color-purple)] focus:ring-1 focus:ring-[var(--color-purple)]"
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    >
                      <option value="sensor">Sensor</option>
                      <option value="light">Light</option>
                      <option value="fan">Fan</option>
                      <option value="speaker">Speaker</option>
                      <option value="relay">Relay</option>
                      <option value="brightness">Brightness</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      MQTT Topic
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-200 bg-[#f7f8ff] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[var(--color-purple)] focus:ring-1 focus:ring-[var(--color-purple)]"
                      value={form.mqttTopic}
                      onChange={(e) =>
                        setForm({ ...form, mqttTopic: e.target.value })
                      }
                    >
                      {Array.from(
                        { length: 20 },
                        (_, i) => `27C45UV/feeds/V${i + 1}`
                      ).map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 bg-[#f7f8ff] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[var(--color-purple)] focus:ring-1 focus:ring-[var(--color-purple)]"
                    rows={3}
                    placeholder="Short description for this device..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addMode ? saveAdd : saveEdit}
                  className="rounded-xl bg-[var(--color-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-darkpurple)]"
                >
                  {addMode ? "Add Device" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Small component for sortable table header */
function SortableHeader({
  label,
  active,
  direction,
  onClick,
  className = "",
}: {
  label: string;
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
