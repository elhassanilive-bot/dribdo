import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const userId = String(request.nextUrl.searchParams.get("userId") || "").trim();
    if (!userId) {
      return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
    }

    const admin = await getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "admin_not_configured" }, { status: 500 });
    }

    const counters = {
      followers: 0,
      following: 0,
    };

    // Primary source in production data.
    const [followsFollowers, followsFollowing] = await Promise.all([
      admin.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", userId).eq("status", "accepted"),
      admin.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", userId).eq("status", "accepted"),
    ]);

    counters.followers = Number(followsFollowers?.count || 0);
    counters.following = Number(followsFollowing?.count || 0);

    // Legacy fallback table.
    if (!counters.followers || !counters.following) {
      const [legacyFollowers, legacyFollowing] = await Promise.all([
        admin.from("followers").select("follower_id", { count: "exact", head: true }).eq("following_id", userId),
        admin.from("followers").select("following_id", { count: "exact", head: true }).eq("follower_id", userId),
      ]);

      counters.followers = Math.max(counters.followers, Number(legacyFollowers?.count || 0));
      counters.following = Math.max(counters.following, Number(legacyFollowing?.count || 0));
    }

    return NextResponse.json(counters, {
      status: 200,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "failed_to_load_profile_stats" }, { status: 500 });
  }
}

