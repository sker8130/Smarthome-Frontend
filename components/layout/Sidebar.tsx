"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/rooms", label: "Rooms", icon: "🗂️" },
  { href: "/devices", label: "Devices", icon: "📦" },
  { href: "/setting", label: "Setting", icon: "⚙️" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 h-dvh w-16 shrink-0 rounded-2xl bg-[color-mix(in_oklab,var(--primary),#000_12%)] p-2 text-white">
      <div className="flex h-full flex-col items-center gap-2">
        <div className="mt-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl">💡</div>
        <nav className="mt-2 flex flex-1 flex-col items-center gap-2">
          {nav.map((i) => {
            const active = path.startsWith(i.href);
            return (
              <Link key={i.href} href={i.href} title={i.label}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg ${active ? "bg-white/20" : "hover:bg-white/10"}`}>
                <span aria-hidden>{i.icon}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mb-2 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">🔔</div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">👤</div>
        </div>
      </div>
    </aside>
  );
}
