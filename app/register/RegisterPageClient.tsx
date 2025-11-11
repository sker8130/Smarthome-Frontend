"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [loading, setLoading] = useState(false);

  const [matchState, setMatchState] = useState<"none" | "match" | "mismatch">(
    "none"
  );

  useEffect(() => {
    if (!confirm) setMatchState("none");
    else if (confirm === password) setMatchState("match");
    else setMatchState("mismatch");
  }, [password, confirm]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          first_name,
          last_name,
          email,
        }),
      });

      if (!res.ok)
        throw new Error(await res.text().catch(() => "Register failed"));

      alert("Account created successfully! Please log in");
      window.location.href = "/login";
    } catch (err) {
      alert(
        "Unable to register. Please verify your details or try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--color-purple)] p-6">
      {/* background */}
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

      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        {/* banner */}
        <div className="hidden justify-center md:flex">
          <Image
            src="/dashboard_monitor.svg"
            alt="Dashboard monitor illustration"
            width={500}
            height={439}
            priority
          />
        </div>

        {/* card register */}
        <div className="z-10 mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-white p-10 shadow-xl shadow-black/5 ring-1 ring-black/5">
            <h1 className="text-3xl font-semibold text-gray-800 ">Register</h1>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field
                icon="user"
                placeholder="Username"
                value={username}
                onChange={setUsername}
              />

              <Field
                icon="id"
                placeholder="First name"
                value={first_name}
                onChange={setFirstName}
              />

              <Field
                icon="id"
                placeholder="Last name"
                value={last_name}
                onChange={setLastName}
              />

              <Field
                icon="mail"
                placeholder="Email"
                type="email"
                value={email}
                onChange={setEmail}
              />

              {/* Password */}
              <Field
                icon="lock"
                placeholder="Password"
                type={show1 ? "text" : "password"}
                value={password}
                onChange={setPassword}
                toggleShow={() => setShow1((v) => !v)}
                show={show1}
              />

              {/* Confirm Password */}
              <Field
                icon="lock"
                placeholder="Confirm Password"
                type={show2 ? "text" : "password"}
                value={confirm}
                onChange={setConfirm}
                toggleShow={() => setShow2((v) => !v)}
                show={show2}
                status={matchState}
              />

              {/* Messages */}
              {matchState === "mismatch" && (
                <p className="text-sm text-red-500 -mt-2" aria-live="polite">
                  ⚠️ Passwords do not match!
                </p>
              )}
              {matchState === "match" && (
                <p className="text-sm text-green-600 -mt-2" aria-live="polite">
                  ✅ Passwords match
                </p>
              )}

              <Button
                disabled={loading}
                className="w-full py-2.5 bg-[var(--color-purple)]"
              >
                {loading ? "Creating..." : "Register"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
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

/* ---------- Small input component ---------- */
function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  toggleShow,
  show,
  status, // "none" | "match" | "mismatch"
}: {
  icon: "user" | "id" | "mail" | "lock";
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  toggleShow?: () => void;
  show?: boolean;
  status?: "none" | "match" | "mismatch";
}) {
  const colorClasses =
    status === "mismatch"
      ? "bg-red-50 border border-red-400 text-red-600 placeholder:text-red-400"
      : status === "match"
        ? "bg-green-50 border border-green-500 text-green-700 placeholder:text-green-600"
        : "bg-[#eaf0ff] text-gray-800 placeholder:text-gray-500";

  const iconColor =
    status === "mismatch"
      ? "text-red-500"
      : status === "match"
        ? "text-green-600"
        : "text-gray-600";

  const IconSvg = {
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
      </>
    ),
    id: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 9h6" />
        <path d="M7 13h10" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <path d="M5 11h14v10H5z" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
  }[icon];

  return (
    <div className="relative">
      <div
        className={`pointer-events-none absolute inset-y-0 left-3 grid w-6 place-content-center ${iconColor}`}
      >
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
          {IconSvg}
        </svg>
      </div>

      <input
        type={type}
        className={`w-full rounded-xl pl-10 pr-10 py-3 text-[15px] outline-none transition-colors ${colorClasses}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        aria-invalid={status === "mismatch" ? true : undefined}
      />

      {/* button show/hide */}
      {toggleShow && (
        <button
          type="button"
          onClick={toggleShow}
          className="absolute inset-y-0 right-2 grid w-9 place-content-center hover:opacity-90"
          aria-label="Toggle password"
        >
          <Image
            src={show ? "/img-eye1.svg" : "/img-eye2.svg"}
            alt="toggle"
            width={22}
            height={22}
            priority
          />
        </button>
      )}
    </div>
  );
}

