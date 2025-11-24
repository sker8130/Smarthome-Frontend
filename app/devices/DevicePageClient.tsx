"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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

  const [sortConfig, setSortConfig] = useState<{ key: keyof ApiDevice; direction: "asc" | "desc" } | null>(null);

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
      setSortConfig({ key, direction: sortConfig.direction === "asc" ? "desc" : "asc" });
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

  if (loading) {
    return <div className="p-6 text-lg">Loading...</div>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Devices</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          + Add Device
        </button>
      </div>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("id")}>
              ID {sortConfig?.key === "id" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("name")}>
              Name {sortConfig?.key === "name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("type")}>
              Type {sortConfig?.key === "type" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("mqttTopic")}>
              MQTT Topic {sortConfig?.key === "mqttTopic" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("description")}>
              Description {sortConfig?.key === "description" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border p-2 w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedDevices.map((d) => (
            <tr key={d.id}>
              <td className="border p-2">{d.id}</td>
              <td className="border p-2">{d.name}</td>
              <td className="border p-2">{d.type}</td>
              <td className="border p-2">{d.mqttTopic}</td>
              <td className="border p-2">{d.description}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => openEditModal(d)}
                  className="p-1 rounded hover:bg-blue-100"
                  title="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 4h10M4 21v-7a4 4 0 014-4h12M16 3l5 5M5 21l4-4"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => deleteDevice(d.id)}
                  className="p-1 rounded hover:bg-red-100"
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {addMode ? "Add New Device" : `Edit Device ${editItem?.name}`}
            </h2>

            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <select
                className="w-full border p-2 rounded"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="sensor">Sensor</option>
                <option value="light">Light</option>
                <option value="fan">Fan</option>
                <option value="speaker">Speaker</option>
                <option value="relay">Relay</option>
              </select>

              <select
                className="w-full border p-2 rounded"
                value={form.mqttTopic}
                onChange={(e) => setForm({ ...form, mqttTopic: e.target.value })}
              >
                {Array.from({ length: 20 }, (_, i) => `27C45UV/feeds/V${i + 1}`).map(
                  (topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  )
                )}
              </select>

              <textarea
                className="w-full border p-2 rounded"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addMode ? saveAdd : saveEdit}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                {addMode ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}