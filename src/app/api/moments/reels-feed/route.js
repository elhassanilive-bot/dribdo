import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function parseMediaUrls(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v || "").trim()).filter(Boolean);
  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return [];
    try {
      const decoded = JSON.parse(value);
      if (Array.isArray(decoded)) return decoded.map((v) => String(v || "").trim()).filter(Boolean);
    } catch {}
    return [value];
  }
  return [];
}

function isVideoUrl(url = "") {
  const lower = String(url || "").toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("video");
}

function cleanUsername(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function normalizeVideoPost(row) {
  const isAnonymous = row?.is_anonymous === true || row?.isAnonymous === true;
  const anonymousName = String(row?.anonymous_name || row?.anonymousName || "مستخدم مجهول").trim() || "مستخدم مجهول";
  const profileRaw = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles;
  const profile = profileRaw && typeof profileRaw === "object" ? profileRaw : {};

  const urls = parseMediaUrls(row?.media_urls);
  const mediaUrl = String(row?.media_url || "").trim();
  if (mediaUrl && !urls.includes(mediaUrl)) urls.unshift(mediaUrl);

  const byType = String(row?.type || "").toLowerCase() === "video";
  const firstVideoUrl = urls.find((url) => isVideoUrl(url));
  const videoUrl = byType ? firstVideoUrl || mediaUrl || urls[0] : firstVideoUrl;
  if (!videoUrl) return null;

  return {
    id: String(row?.id || ""),
    userId: String(row?.user_id || ""),
    authorName: isAnonymous ? anonymousName : String(profile?.name || row?.name || "").trim() || "مستخدم",
    authorAvatar: isAnonymous ? "" : String(profile?.avatar_url || row?.avatar_url || "").trim(),
    authorUsername: isAnonymous ? "" : cleanUsername(profile?.username || row?.username || ""),
    content: String(row?.custom_text || row?.content || "").trim(),
    createdAt: String(row?.created_at || ""),
    likesCount: Number(row?.likes_count || 0),
    commentsCount: Number(row?.comments_count || 0),
    sharesCount: Number(row?.shares_count || 0),
    viewsCount: Number(row?.views_count || 0),
    videoUrl,
    isAnonymous,
    anonymousName,
  };
}

function computeScore(post, { isFollowing }) {
  const createdAt = new Date(post.createdAt || 0).getTime();
  const ageHours = Math.max(1, (Date.now() - createdAt) / 3600000);
  const recency = 100 / Math.sqrt(ageHours);
  const engagement =
    Number(post.likesCount || 0) * 1.4 +
    Number(post.commentsCount || 0) * 2.4 +
    Number(post.sharesCount || 0) * 3.2 +
    Number(post.viewsCount || 0) * 0.15;
  const followBoost = isFollowing ? 45 : 0;
  return recency + engagement + followBoost;
}

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "admin_not_configured" }, { status: 500 });
    }

    const cursor = String(request.nextUrl.searchParams.get("cursor") || "").trim();
    const viewerId = String(request.nextUrl.searchParams.get("viewerId") || "").trim();
    const limit = Math.min(40, Math.max(8, Number(request.nextUrl.searchParams.get("limit") || 14)));

    let query = admin
      .from("posts")
      .select("*,profiles:posts_user_id_fkey(name,username,avatar_url,is_verified,is_gold_verified)")
      .order("created_at", { ascending: false })
      .limit(220);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message || "failed_to_load_posts" }, { status: 500 });
    }

    const all = (rows || []).map(normalizeVideoPost).filter(Boolean);

    const authorIds = [...new Set(all.map((post) => post.userId).filter(Boolean))];
    const followingSet = new Set();

    if (viewerId && authorIds.length) {
      try {
        const { data: accepted } = await admin
          .from("follows")
          .select("following_id")
          .eq("follower_id", viewerId)
          .eq("status", "accepted")
          .in("following_id", authorIds);

        for (const row of accepted || []) {
          const id = String(row?.following_id || "");
          if (id) followingSet.add(id);
        }
      } catch {}
    }

    const ranked = all
      .map((post) => ({
        ...post,
        score: computeScore(post, { isFollowing: followingSet.has(post.userId) }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const nextCursor = ranked.length ? ranked[ranked.length - 1].createdAt : "";

    return NextResponse.json(
      {
        items: ranked.map((item) => ({
          ...item,
          sharePath: `/v/${item.id}`,
          pagePath: `/video/${item.id}`,
        })),
        nextCursor,
        hasMore: ranked.length >= limit,
      },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "failed_to_build_reels_feed" }, { status: 500 });
  }
}


