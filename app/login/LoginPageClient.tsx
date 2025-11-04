"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!res.ok) throw new Error("Đăng nhập thất bại");
      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Đăng nhập thất bại, kiểm tra lại tài khoản hoặc server.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--color-purple)] p-6">
      {/* decorative background */}
      <div className="pointer-events-none absolute bottom-0 right-0">
        <Image
          src="/decorbanner.svg"
          alt=""
          width={912}
          height={557}
          priority
        />
      </div>
      <div className="pointer-events-none absolute inset-x-3 top-3 -z-10 h-[72%] rounded-3xl bg-[--primary]/90 md:inset-x-6 md:top-6" />
      <div className="pointer-events-none absolute -bottom-24 right-[-15%] -z-10 h-[42rem] w-[42rem] rounded-[55%] bg-[--primary] opacity-70 blur-2xl" />
      
      <div className="mx-auto min-h-screen grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        {/* Banner */}
        <div className="hidden justify-center md:flex">
          <Image
            src="/dashboard_monitor.svg"
            alt="Dashboard monitor illustration"
            width={500}
            height={439}
            priority
          />
        </div>

        {/* Login card */}
        <div className="mx-auto w-full max-w-md z-10">
          <div className="rounded-2xl bg-white p-10 shadow-xl shadow-black/5 ring-1 ring-black/5">
            <h1 className="text-3xl font-semibold text-gray-800">Login</h1>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {/* Username */}
              <div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 grid w-6 place-content-center text-gray-600">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-[#eaf0ff] pl-10 pr-3 py-3 text-[15px] text-gray-800 placeholder:text-gray-500 outline-none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 grid w-6 place-content-center text-gray-700">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 11h14v10H5z" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 grid w-9 place-content-center hover:opacity-90"
                  >
                    <Image
                      src={showPassword ? "/img-eye1.svg" : "/img-eye2.svg"}
                      alt={showPassword ? "Open eye" : "Closed eye"}
                      width={22}
                      height={22}
                      priority
                    />
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full appearance-none rounded-xl bg-[#eaf0ff] pl-10 pr-10 py-3 text-[15px] text-gray-800 placeholder:text-gray-500 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 text-[--primary]"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-[--primary] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                disabled={loading}
                className="w-full py-2.5 bg-[var(--color-purple)]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[--primary] hover:underline"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
