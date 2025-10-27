"use client";
export default function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-[--primary]" : "bg-gray-300"}`}
      aria-label="toggle"
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white transition ${checked ? "left-7" : "left-1"}`}
      />
    </button>
  );
}
