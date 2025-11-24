"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const pathname = usePathname();
  const [lastName, setLastName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored =
      localStorage.getItem("lastname") || sessionStorage.getItem("lastname");

    setLastName(stored);
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/devices", label: "Devices" },
    { href: "/log", label: "Device Logs" },
  ];

  return (
    <header className="bg-[var(--color-purple)] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-40 px-6 py-3">
        {/* LOGO */}
        <div className="flex items-center gap-2">
            <a href="/dashboard">
                <Image
                    src="/HEHUB_logo.svg"
                    alt="HEHub logo"
                    width={200}
                    height={200}
                    className="object-contain"
                    priority
                />
            </a>
        </div>

        {/* NAV + USER */}
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-5 py-2 text-xl font-semibold transition ${
                    isActive
                      ? "bg-[var(--color-darkpurple)] text-white"
                      : "text-white hover:bg-[var(--color-darkpurple)]/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* USER */}
          <div className="flex items-center gap-2">
            <img
                src="/avt-temp.svg"
                alt=""
            />
            
            <span className="text-xl font-semibold">{lastName || "User"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
