import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function cleanEvent(value = "") {
  const allowed = new Set(["play", "pause", "progress", "ended", "auto_next", "share", "open"]);
  const v = String(value || "").trim().toLowerCase();
  return allowed.has(v) ? v : "open";
}

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const admin = await getSupabaseAdminClient();
    if (!admin) return NextResponse.json({ ok: false, reason: "admin_not_configured" }, { status: 500 });

    const body = await request.json().catch(() => ({}));
    const postId = String(body?.postId || "").trim();
    if (!postId) return NextResponse.json({ ok: false, reason: "missing_post_id" }, { status: 400 });

    const payload = {
      post_id: postId,
      user_id: String(body?.userId || "").trim() || null,
      event_type: cleanEvent(body?.eventType),
      watch_seconds: Number(body?.watchSeconds || 0),
      session_id: String(body?.sessionId || "").trim() || null,
      user_agent: String(request.headers.get("user-agent") || "").slice(0, 300),
      page_path: String(body?.path || "").trim() || null,
      created_at: new Date().toISOString(),
    };

    // Primary analytics table
    let inserted = false;
    try {
      const { error } = await admin.from("video_analytics_events").insert(payload);
      inserted = !error;
    } catch {}

    // Fallback generic table name if your DB uses another schema naming.
    if (!inserted) {
      try {
        const { error } = await admin.from("post_analytics_events").insert(payload);
        inserted = !error;
      } catch {}
    }

    return NextResponse.json({ ok: inserted }, { status: inserted ? 200 : 202 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
