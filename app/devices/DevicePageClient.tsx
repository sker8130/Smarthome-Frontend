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

  // Preset map
  const devicePresets = [
    {
      label: "LED Light",
      type: "light",
      topic: "27C45UV/feeds/V11",
      description:
        "A standard lighting fixture that uses LED technology for illumination. Its state (on/off) and sometimes brightness are controlled remotely.",
    },
    {
      label: "LED Light Auto",
      type: "light",
      topic: "27C45UV/feeds/V14",
      description:
        "An LED lighting unit with automated control capabilities, allowing it to be scheduled or activated based on conditions (e.g., motion or light levels).",
    },
    {
      label: "LED Brightness",
      type: "brightness",
      topic: "27C45UV/feeds/V12",
      description:
        "Controls the luminous output of the LEDs, allowing the user to increase or decrease the light intensity.",
    },
    {
      label: "Fan",
      type: "fan",
      topic: "27C45UV/feeds/V10",
      description:
        "A motor-driven appliance used to circulate air and provide cooling. It is controlled manually or remotely via the app.",
    },
    {
      label: "Fan Auto",
      type: "fan",
      topic: "27C45UV/feeds/V15",
      description:
        "A fan that can be programmed or triggered by sensor data (e.g., temperature) to adjust its speed or turn on/off without manual input.",
    },
    {
      label: "Speaker",
      type: "speaker",
      topic: "27C45UV/feeds/V13",
      description:
        "An audio output device used for playing sounds, music, or voice notifications. It can be integrated for alerts or home entertainment systems.",
    },
    {
      label: "Relay Switch",
      type: "relay",
      topic: "27C45UV/feeds/V16",
      description:
        "An electrically operated switch used to turn devices (like lights, fans, or appliances) on or off remotely by controlling the power supply.",
    },
    {
      label: "Humidity Sensor",
      type: "sensor",
      topic: "27C45UV/feeds/V2",
      description:
        "A device that measures the amount of water vapor (humidity) in the air. Used for monitoring environmental conditions and optimizing indoor climate.",
    },
    {
      label: "Temperature Sensor",
      type: "sensor",
      topic: "27C45UV/feeds/V1",
      description:
        "A device that measures the heat level (temperature) of its surroundings. Essential for climate control and thermal monitoring.",
    },
    {
      label: "Light Sensor",
      type: "sensor",
      topic: "27C45UV/feeds/V4",
      description:
        "A component that detects and measures the intensity of ambient light. Often used to automatically control lights or blinds.",
    },
  ] as const;
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  function findPresetByTypeTopic(type?: string, topic?: string) {
    return devicePresets.find(p => p.type === (type || "") && p.topic === (topic || ""));
  }

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
    const matched = findPresetByTypeTopic(item.type, item.mqttTopic);
    setSelectedPreset(matched?.label || "");
    setModalOpen(true);
  }

  // Open add modal
  function openAddModal() {
    setAddMode(true);
    setEditItem(null);
    const def = devicePresets.find(p => p.label === "Temperature Sensor") || devicePresets[0];
    setForm({
      name: def.label,
      type: def.type,
      mqttTopic: def.topic,
      description: def.description,
    });
    setSelectedPreset(def.label);
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

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Device Preset
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-[#f7f8ff] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[var(--color-purple)] focus:ring-1 focus:ring-[var(--color-purple)]"
                    value={selectedPreset}
                    onChange={(e) => {
                      const label = e.target.value;
                      setSelectedPreset(label);
                      const preset = devicePresets.find(p => p.label === label);
                      if (preset) {
                        // Apply type & topic from preset; set name if empty or matches previous preset
                        setForm(prev => ({
                          ...prev,
                          name: preset.label,
                          type: preset.type,
                          mqttTopic: preset.topic,
                          description: preset.description,
                        }));
                      }
                    }}
                  >
                    <option value="" disabled>Select a device...</option>
                    {devicePresets.map(p => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Selecting a preset will auto-fill device name, type, MQTT topic, and a suggested description. You can still adjust these fields.
                  </p>
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
