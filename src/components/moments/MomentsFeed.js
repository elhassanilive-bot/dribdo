"use client";

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
      if (Array.isArray(decoded)) {
        return decoded.map((v) => String(v || "").trim()).filter(Boolean);
      }
    } catch (_) {}
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
          <video src={url} controls preload="metadata" className="h-auto max-h-[620px] w-full bg-black" />
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
            <video src={url} controls preload="metadata" className="h-56 w-full object-cover bg-black" />
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

  const spaceRaw = Array.isArray(row.space) ? row.space[0] : row.space;
  const communityRaw = Array.isArray(row.community) ? row.community[0] : row.community;

  const isSpacePost = Boolean(row.space_id);
  const isCommunityPost = !isSpacePost && Boolean(row.community_id);

  const authorName = isAnonymous
    ? String(row.anonymous_name || "").trim() || "مستخدم مجهول"
    : isSpacePost
      ? String(row.space_name || spaceRaw?.name || "").trim() || "مساحة"
      : isCommunityPost
        ? String(row.community_name || communityRaw?.name || "").trim() || "مجتمع"
        : String(profile.name || row.name || "").trim() || "مستخدم";

  const authorAvatar = isAnonymous
    ? ""
    : isSpacePost
      ? String(row.space_avatar || spaceRaw?.avatar_url || "").trim()
      : isCommunityPost
        ? String(row.community_avatar || communityRaw?.avatar_url || "").trim()
        : String(profile.avatar_url || row.avatar_url || "").trim();

  const urls = parseMediaUrls(row.media_urls);
  const mediaUrl = String(row.media_url || "").trim();
  if (mediaUrl && !urls.includes(mediaUrl)) urls.unshift(mediaUrl);

  const content = String(row.custom_text || row.content || "").trim();
  const hasVisualMoment = Boolean(urls.length || row.bg_color || row.custom_background_color || row.shared_post_id || row.space_id || row.community_id);

  return {
    id: String(row.id || ""),
    userId: String(row.user_id || ""),
    authorName,
    authorAvatar,
    content,
    createdAt: String(row.created_at || ""),
    postType: String(row.type || "text"),
    mediaUrls: urls,
    likesCount: Number(row.likes_count || 0),
    commentsCount: Number(row.comments_count || 0),
    sharesCount: Number(row.shares_count || 0),
    viewsCount: Number(row.views_count || 0),
    bgColor: String(row.custom_background_color || row.bg_color || "").trim(),
    textColor: String(row.custom_text_color || "").trim(),
    postContextText: String(row.post_context_text || "").trim(),
    isAnonymous,
    hasVisualMoment,
  };
}

export default function MomentsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      .select(`
        *,
        profiles:posts_user_id_fkey(name,avatar_url,is_verified,is_gold_verified),
        space:space_id(id,name,avatar_url),
        community:community_id(id,name,avatar_url)
      `)
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
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMoments();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadMoments]);

  const hasPosts = useMemo(() => posts.length > 0, [posts]);

  return (
    <div className="space-y-6">
      <MomentsComposer onCreated={loadMoments} />

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">منشورات المستخدمين</h2>
          <button
            type="button"
            onClick={loadMoments}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل المنشورات...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div>
        ) : !hasPosts ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد منشورات لحظات بعد.</div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-4 sm:px-5">
                  {post.postContextText ? <div className="mb-2 text-[11px] font-semibold text-slate-500">{post.postContextText}</div> : null}

                  <header className="flex items-center gap-3">
                    <img src={avatarFor(post.authorName, post.authorAvatar)} alt={post.authorName} className="h-11 w-11 rounded-full border border-slate-200" loading="lazy" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">{post.authorName}</div>
                      <div className="text-xs text-slate-500">{formatDate(post.createdAt)}</div>
                    </div>
                  </header>

                  {post.content ? (
                    <div
                      className="mt-3 whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-7"
                      style={{
                        background: post.bgColor || "transparent",
                        color: post.textColor || "#0f172a",
                      }}
                    >
                      {post.content}
                    </div>
                  ) : null}

                  <MediaGallery mediaUrls={post.mediaUrls} postType={post.postType} />
                </div>

                <MomentsPostActions postId={post.id} postAuthorId={post.userId} onMutated={loadMoments} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
