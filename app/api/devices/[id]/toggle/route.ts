import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await fetch(`${BACKEND_BASE}/devices/${params.id}/toggle`, {
    method: "POST",
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
