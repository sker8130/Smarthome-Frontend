"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");

  // Load user from JWT
  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (userStr) {
      const user = JSON.parse(userStr);

      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();

      setDisplayName(fullName || user.username || "User");
    }
  }, []);


  // Logout handler
  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("lastname");
      sessionStorage.removeItem("lastname");
    }

    router.push("/login");
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/devices", label: "Devices" },
    { href: "/log", label: "Device Logs" },
  ];

  return (
    <header className="bg-[var(--color-purple)] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* LOGO */}
        <a href="#">
          <Image
            src="/HEHUB_logo.svg"
            alt="HEHub logo"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </a>

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
                  className={`rounded-full px-5 py-2 text-xl font-semibold transition ${isActive
                    ? "bg-[var(--color-darkpurple)] text-white"
                    : "text-white hover:bg-[var(--color-darkpurple)]/70"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* USER + LOGOUT */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-purple)] text-xl">
                <Image
                  src="/avt-temp.svg"
                  alt="Avatar"
                  width={150}
                  height={150}
                  className="object-contain bg-[var(--color-purple)] w-auto h-auto"
                  priority
                />
              </div>
              <span className="text-xl font-semibold">{displayName}</span>
            </div>

            <button
              onClick={logout}
              className="rounded-full bg-white/20 px-4 py-2 text-xl font-semibold hover:bg-white/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
