import Link from "next/link";

export default function home() {
    return(
        <main className="grid min-h-dvh place-items-center bg-gray-50 p-6">
        <Link href="/dashboard" className="rounded-xl bg-[var(--primary)] px-4 py-2 text-white">
            Mở Dashboard
        </Link>
        </main>
    )
}