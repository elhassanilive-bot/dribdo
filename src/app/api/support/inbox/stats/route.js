import { NextResponse } from "next/server";
import { getSupportSession } from "@/lib/support/auth";
import { getSupportInboxStats } from "@/lib/support/tickets";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSupportSession();
  if (!session.allowed) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await getSupportInboxStats();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || "stats_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stats: result.stats, role: session.role }, { status: 200 });
}
