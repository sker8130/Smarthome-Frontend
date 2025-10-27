import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center bg-gray-50 p-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold">Smarthome Frontend Homepage</h1>
        <div className="flex justify-center gap-3">
          <Link className="rounded-xl border px-4 py-2" href="/login">Sign In</Link>
          <Link className="rounded-xl border px-4 py-2" href="/dashboard">Dashboard</Link>
          <Link className="rounded-xl bg-[--primary] border px-4 py-2" href="/test">TEST PAGE</Link>
        </div>
      </div>
    </main>
  );
}


