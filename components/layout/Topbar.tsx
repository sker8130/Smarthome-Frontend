export default function Topbar() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[--primary] px-6 py-4 text-white">
      <div className="flex items-center gap-6 text-lg font-medium">
        <span className="font-semibold">HEHub</span>
        <span className="hidden sm:inline">Dashboard</span>
        <span className="hidden sm:inline">Rooms</span>
        <span className="hidden sm:inline">Devices</span>
        <span className="hidden sm:inline">Setting</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm">Welcome back, <b>Sker</b></span>
      </div>
    </div>
  );
}
