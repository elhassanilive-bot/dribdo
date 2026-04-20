import { NextResponse } from "next/server";
import { getSupportSession } from "@/lib/support/auth";
import { testSmtpConnection } from "@/lib/support/mailer";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSupportSession();
  if (!session.allowed) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await testSmtpConnection({ sendProbe: true });
  const status = result.ok ? 200 : 500;
  return NextResponse.json({ ok: result.ok, code: result.code, message: result.message }, { status });
}
