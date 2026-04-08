"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import MomentsComposer from "@/components/moments/MomentsComposer";
import MomentsPostActions from "@/components/moments/MomentsPostActions";

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

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function avatarFor(name, explicit = "") {
  if (explicit) return explicit;
  const safe = encodeURIComponent(String(name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safe}&background=fee2e2&color=991b1b&size=96&bold=true`;
}

function mediaKind(url, postType = "") {
  const lower = String(url || "").toLowerCase();
  if (String(postType).toLowerCase() === "video") return "video";
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("video")) return "video";
  return "image";
}

function MediaGallery({ mediaUrls, postType }) {
  if (!mediaUrls.length) return null;

  if (mediaUrls.length === 1) {
    const url = mediaUrls[0];
    return (
      <div className="mt-3 overflow-hidden rounded-xl bg-slate-100">
        {mediaKind(url, postType) === "video" ? (
          <video src={url} preload="metadata" muted playsInline className="h-auto max-h-[620px] w-full bg-black object-cover" />
        ) : (
          <img src={url} alt="وسائط المنشور" className="h-auto max-h-[620px] w-full object-cover" loading="lazy" />
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-1 sm:grid-cols-2">
      {mediaUrls.slice(0, 4).map((url, index) => (
        <div key={`${url}-${index}`} className="overflow-hidden rounded-lg bg-slate-100">
          {mediaKind(url, postType) === "video" ? (
            <video src={url} preload="metadata" muted playsInline className="h-56 w-full object-cover bg-black" />
          ) : (
            <img src={url} alt="وسائط المنشور" className="h-56 w-full object-cover" loading="lazy" />
          )}
        </div>
      ))}
    </div>
  );
}

function normalizePost(row) {
  const isAnonymous = row.is_anonymous === true;
  const profileRaw = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const profile = profileRaw && typeof profileRaw === "object" ? profileRaw : {};

  const urls = parseMediaUrls(row.media_urls);
  const mediaUrl = String(row.media_url || "").trim();
  if (mediaUrl && !urls.includes(mediaUrl)) urls.unshift(mediaUrl);

  const content = String(row.custom_text || row.content || "").trim();

  return {
    id: String(row.id || ""),
    userId: String(row.user_id || ""),
    authorName: isAnonymous ? "مستخدم مجهول" : String(profile.name || row.name || "").trim() || "مستخدم",
    authorAvatar: isAnonymous ? "" : String(profile.avatar_url || row.avatar_url || "").trim(),
    content,
    createdAt: String(row.created_at || ""),
    postType: String(row.type || "text"),
    mediaUrls: urls,
    bgColor: String(row.custom_background_color || row.bg_color || "").trim(),
    textColor: String(row.custom_text_color || "").trim(),
    postContextText: String(row.post_context_text || "").trim(),
    hasVisualMoment: Boolean(urls.length || content || row.bg_color || row.custom_background_color || row.shared_post_id),
  };
}

function PostHeader({ post, isMine, isFollowing, onToggleFollow, followLoading }) {
  return (
    <header dir="rtl" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={avatarFor(post.authorName, post.authorAvatar)} alt={post.authorName} className="h-12 w-12 rounded-full border border-slate-200" loading="lazy" />
          <div className="text-right">
            <div className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">{post.authorName}</div>
            <div className="text-xs text-slate-500">{formatDate(post.createdAt)}</div>
          </div>

          {!isMine ? (
            <button
              type="button"
              onClick={onToggleFollow}
              disabled={followLoading}
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-sm font-bold transition",
                isFollowing ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200" : "border-blue-500 text-blue-600 hover:bg-blue-50",
              ].join(" ")}
            >
              <img src="/dribdo-assets/published/follow-user.svg" alt="متابعة" className="h-4 w-4" loading="lazy" />
              {followLoading ? "..." : isFollowing ? "متابع" : "متابعة"}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" aria-label="خيارات">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
          </button>
        </div>
      </div>

      {post.postContextText ? <div className="text-xs font-semibold text-slate-500">{post.postContextText}</div> : null}
    </header>
  );
}

export default function MomentsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authUserId, setAuthUserId] = useState("");
  const [followMap, setFollowMap] = useState({});
  const [followBusy, setFollowBusy] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});

  const syncFollowMap = useCallback(async (rows) => {
    const supabase = await getSupabaseClient();
    if (!supabase) return;

    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = String(authData?.user?.id || "");
    setAuthUserId(currentUserId);

    if (!currentUserId || !rows.length) {
      setFollowMap({});
      return;
    }

    const authorIds = [...new Set(rows.map((item) => item.userId).filter((id) => id && id !== currentUserId))];
    if (!authorIds.length) {
      setFollowMap({});
      return;
    }

    const map = {};

    try {
      const { data: followedRows } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", currentUserId)
        .in("following_id", authorIds);

      for (const row of followedRows || []) {
        const targetId = String(row.following_id || "");
        if (targetId) map[targetId] = true;
      }
    } catch {}

    try {
      const { data: followsRows } = await supabase
        .from("follows")
        .select("following_id,status")
        .eq("follower_id", currentUserId)
        .in("following_id", authorIds)
        .eq("status", "accepted");

      for (const row of followsRows || []) {
        const targetId = String(row.following_id || "");
        if (targetId) map[targetId] = true;
      }
    } catch {}

    setFollowMap(map);
  }, []);

  const loadMoments = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setError("تعذر الاتصال بقاعدة البيانات.");
      setLoading(false);
      return;
    }

    let rows = [];

    const primary = await supabase
      .from("posts")
      .select(`*,profiles:posts_user_id_fkey(name,avatar_url,is_verified,is_gold_verified)`)
      .order("created_at", { ascending: false })
      .limit(120);

    if (primary.error) {
      const fallback = await supabase.from("posts_feed").select("*").order("created_at", { ascending: false }).limit(120);
      if (fallback.error) {
        setError(primary.error.message || fallback.error.message || "تعذر تحميل المنشورات.");
        setLoading(false);
        return;
      }
      rows = fallback.data || [];
    } else {
      rows = primary.data || [];
    }

    const normalized = rows.map(normalizePost).filter((post) => post.id && post.hasVisualMoment);
    setPosts(normalized);
    await syncFollowMap(normalized);
    setLoading(false);
  }, [syncFollowMap]);

  async function toggleFollow(authorId) {
    if (!authorId || !authUserId || authorId === authUserId) return;

    setFollowBusy((prev) => ({ ...prev, [authorId]: true }));

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setFollowBusy((prev) => ({ ...prev, [authorId]: false }));
      return;
    }

    const isFollowing = Boolean(followMap[authorId]);

    if (!isFollowing) {
      try {
        const { error: rpcError } = await supabase.rpc("send_follow_request", { p_following_id: authorId });
        if (rpcError) throw rpcError;
      } catch {
        await supabase.from("followers").insert({ follower_id: authUserId, following_id: authorId });
      }
      setFollowMap((prev) => ({ ...prev, [authorId]: true }));
    } else {
      try {
        const { error: rpcError } = await supabase.rpc("cancel_follow", { p_following_id: authorId });
        if (rpcError) throw rpcError;
      } catch {
        await supabase.from("followers").delete().eq("follower_id", authUserId).eq("following_id", authorId);
      }
      setFollowMap((prev) => ({ ...prev, [authorId]: false }));
    }

    setFollowBusy((prev) => ({ ...prev, [authorId]: false }));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMoments();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadMoments]);

  const hasPosts = useMemo(() => posts.length > 0, [posts]);

  return (
    <div dir="rtl" className="space-y-4">
      <MomentsComposer onCreated={loadMoments} />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل المنشورات...</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div>
      ) : !hasPosts ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد منشورات لحظات بعد.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-4 sm:px-5">
                <PostHeader
                  post={post}
                  isMine={authUserId && authUserId === post.userId}
                  isFollowing={Boolean(followMap[post.userId])}
                  onToggleFollow={() => toggleFollow(post.userId)}
                  followLoading={Boolean(followBusy[post.userId])}
                />

                <Link href={`/post/${post.id}`} className="group block">
                  {post.content ? (
                    (() => {
                      const normalizedText = String(post.content || "").trim();
                      const limit = 170;
                      const expanded = Boolean(expandedPosts[post.id]);
                      const isLong = normalizedText.length > limit;
                      const visibleText = !isLong || expanded ? normalizedText : `${normalizedText.slice(0, limit)}...`;

                      return (
                        <div
                          className="mt-4 whitespace-pre-wrap rounded-xl px-3 py-2 text-base font-normal leading-7 text-slate-800 transition group-hover:ring-1 group-hover:ring-slate-200"
                          style={{ background: post.bgColor || "transparent", color: post.textColor || "#111827" }}
                        >
                          {visibleText}
                          {isLong ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setExpandedPosts((prev) => ({ ...prev, [post.id]: !expanded }));
                              }}
                              className="mr-2 inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
                            >
                              {expanded ? "إخفاء" : "عرض المزيد"}
                            </button>
                          ) : null}
                        </div>
                      );
                    })()
                  ) : null}

                  <MediaGallery mediaUrls={post.mediaUrls} postType={post.postType} />
                  <div className="mb-1 mt-3 text-sm font-semibold text-blue-700">فتح صفحة المنشور</div>
                </Link>
              </div>

              <MomentsPostActions postId={post.id} postAuthorId={post.userId} onMutated={loadMoments} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}


