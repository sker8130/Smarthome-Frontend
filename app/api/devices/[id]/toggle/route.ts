import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await fetch(`${BACKEND_BASE}/devices/${params.id}/toggle`, {
    method: "POST",
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
