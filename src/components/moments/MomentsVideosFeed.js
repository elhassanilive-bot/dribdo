"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import MomentsPostActions from "@/components/moments/MomentsPostActions";
import RichMomentText from "@/components/moments/RichMomentText";

function cleanUsername(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function profileHref(username, userId = "") {
  const cleaned = cleanUsername(username);
  if (cleaned) return `/${encodeURIComponent(cleaned)}`;
  return userId ? `/profile?uid=${encodeURIComponent(String(userId))}` : "/profile";
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

function resolveVideoTextSize(length) {
  if (length <= 100) return "text-[14px] leading-7";
  if (length <= 180) return "text-[13px] leading-7";
  if (length <= 260) return "text-[12px] leading-6";
  if (length <= 360) return "text-[11.5px] leading-6";
  return "text-[11px] leading-6";
}

function VideoCreatorTools() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("short");
  const [copied, setCopied] = useState(false);

  const hashtags = useMemo(() => {
    const words = String(topic || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((w) => `#${w.replace(/[^\p{L}\p{N}_]+/gu, "")}`)
      .filter((w) => w.length > 1);

    const base = ["#Dribdo", "#واجهة_الفيديو"];
    if (duration === "short") base.push("#قصير");
    if (duration === "long") base.push("#ممتد");
    return [...new Set([...words, ...base])].join(" ");
  }, [duration, topic]);

  const captionTemplate = useMemo(() => {
    const title = topic ? `عنوان: ${topic}` : "عنوان: فيديو جديد";
    return `${title}\n\nوصف مختصر:\n- الفكرة الأساسية\n- الفائدة للمشاهد\n\n${hashtags}`;
  }, [hashtags, topic]);

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(captionTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch {}
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3" dir="rtl">
      <div className="mb-2 text-sm font-semibold text-slate-900">أدوات منشئ الفيديو</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="اكتب فكرة الفيديو"
          className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-400"
        />
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-400"
        >
          <option value="short">قصير</option>
          <option value="long">ممتد</option>
        </select>
        <button type="button" onClick={copyTemplate} className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
          {copied ? "تم النسخ" : "نسخ قالب النشر"}
        </button>
      </div>
      <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{hashtags}</div>
    </section>
  );
}

export default function MomentsVideosFeed() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [expanded, setExpanded] = useState({});
  const [savedMap, setSavedMap] = useState({});
  const [hiddenMap, setHiddenMap] = useState({});
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [viewerId, setViewerId] = useState("");

  const videoRefs = useRef(new Map());
  const loaderRef = useRef(null);

  const fetchBatch = useCallback(async (nextCursor = "", append = false) => {
    if (!append && !nextCursor) {
      setLoading(true);
      setError("");
      setVideos([]);
      setCursor("");
      setHasMore(true);
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setError("تعذر الاتصال بقاعدة البيانات.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = String(authData?.user?.id || "");
      if (uid) setViewerId(uid);

      const query = new URLSearchParams({ limit: "14" });
      if (nextCursor) query.set("cursor", nextCursor);
      if (uid) query.set("viewerId", uid);

      const res = await fetch(`/api/moments/reels-feed?${query.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(String(json?.error || "تعذر تحميل فيديوهات الواجهة."));
        setLoading(false);
        return;
      }

      const items = Array.isArray(json?.items) ? json.items : [];
      const next = String(json?.nextCursor || "");

      setVideos((prev) => {
        if (!append) return items;
        const map = new Map(prev.map((v) => [v.id, v]));
        for (const item of items) map.set(item.id, item);
        return [...map.values()];
      });

      setCursor(next);
      setHasMore(Boolean(json?.hasMore) && Boolean(items.length));
    } catch {
      setError("تعذر تحميل فيديوهات الواجهة.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchBatch("", false);
    }, 0);
    return () => clearTimeout(t);
  }, [fetchBatch]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !cursor) return;
    setLoadingMore(true);
    await fetchBatch(cursor, true);
    setLoadingMore(false);
  }, [cursor, fetchBatch, hasMore, loading, loadingMore]);

  useEffect(() => {
    if (!loaderRef.current) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadMore();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (!videos.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target;
          const id = element.getAttribute("data-video-id");
          const video = videoRefs.current.get(id);
          if (!video) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.72) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: [0.35, 0.72, 0.9] }
    );

    const nodes = document.querySelectorAll("[data-video-item='true']");
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [videos]);

  async function copyVideoLink(sharePath, videoId) {
    const url = `${window.location.origin}${sharePath || `/v/${videoId}`}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(videoId);
      setTimeout(() => setCopiedId(""), 1400);
    } catch {}
  }

  async function toggleSave(postId) {
    const supabase = await getSupabaseClient();
    if (!supabase || !viewerId || !postId) return;

    const isSaved = Boolean(savedMap[postId]);
    setSavedMap((prev) => ({ ...prev, [postId]: !isSaved }));

    try {
      if (!isSaved) {
        const { error: e1 } = await supabase.from("saved_posts").insert({ user_id: viewerId, post_id: postId });
        if (e1) {
          await supabase.from("saved_posts").insert({ viewer_id: viewerId, post_id: postId });
        }
      } else {
        const { error: e1 } = await supabase.from("saved_posts").delete().eq("user_id", viewerId).eq("post_id", postId);
        if (e1) {
          await supabase.from("saved_posts").delete().eq("viewer_id", viewerId).eq("post_id", postId);
        }
      }
    } catch {
      setSavedMap((prev) => ({ ...prev, [postId]: isSaved }));
    }
  }

  async function markNotInterested(postId) {
    const supabase = await getSupabaseClient();
    if (!supabase || !viewerId || !postId) return;

    setHiddenMap((prev) => ({ ...prev, [postId]: true }));
    try {
      const { error } = await supabase.rpc("hide_post", { p_post_id: postId, p_user_id: viewerId, p_reason: "not_interested" });
      if (error) {
        await supabase.from("hidden_posts").insert({ post_id: postId, user_id: viewerId, reason: "not_interested", hidden_at: new Date().toISOString() });
      }
    } catch {}
  }

  const visibleVideos = useMemo(() => videos.filter((v) => !hiddenMap[v.id]), [videos, hiddenMap]);

  return (
    <div dir="rtl" className="space-y-3">
      <VideoCreatorTools />

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل فيديوهات الواجهة...</div> : null}
      {!loading && error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div> : null}
      {!loading && !error && visibleVideos.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد فيديوهات بعد.</div> : null}

      {!loading && !error && visibleVideos.length > 0 ? (
        <div className="h-[calc(100vh-270px)] snap-y snap-mandatory space-y-3 overflow-y-auto pb-10">
          {visibleVideos.map((post) => {
            const canOpenAuthorProfile = !post.isAnonymous && Boolean(post.authorUsername || post.userId);
            const authorUrl = canOpenAuthorProfile ? profileHref(post.authorUsername, post.userId) : "";
            const normalizedContent = String(post.content || "").trim();
            const previewLimit = 100;
            const isLong = normalizedContent.length > previewLimit;
            const isExpanded = Boolean(expanded[post.id]);
            const shownText = !isLong || isExpanded ? normalizedContent : `${normalizedContent.slice(0, previewLimit).trim()}...`;
            const sharePath = String(post.sharePath || `/v/${post.id}`);
            const pagePath = String(post.pagePath || `/video/${post.id}`);
            const saved = Boolean(savedMap[post.id]);

            return (
              <article key={post.id} data-video-item="true" data-video-id={post.id} className="snap-start overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    {canOpenAuthorProfile ? (
                      <Link href={authorUrl} className="inline-flex">
                        <img src={avatarFor(post.authorName, post.authorAvatar)} alt={post.authorName} className="h-9 w-9 rounded-full border border-slate-200" loading="lazy" />
                      </Link>
                    ) : (
                      <img src={avatarFor(post.authorName, post.authorAvatar)} alt={post.authorName} className="h-9 w-9 rounded-full border border-slate-200" loading="lazy" />
                    )}
                    <div className="text-right">
                      {canOpenAuthorProfile ? (
                        <Link href={authorUrl} className="text-sm font-bold text-slate-900 hover:underline">{post.authorName}</Link>
                      ) : (
                        <div className="text-sm font-bold text-slate-900">{post.authorName}</div>
                      )}
                      <div className="text-[11px] text-slate-500">{formatDate(post.createdAt)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => copyVideoLink(sharePath, post.id)} className="rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                      {copiedId === post.id ? "تم النسخ" : "نسخ الرابط"}
                    </button>
                    <Link href={pagePath} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100">
                      صفحة الفيديو
                    </Link>
                  </div>
                </div>

                <div className="relative cursor-pointer bg-black" onClick={() => router.push(pagePath)}>
                  <video
                    ref={(el) => {
                      if (!el) videoRefs.current.delete(post.id);
                      else videoRefs.current.set(post.id, el);
                    }}
                    src={post.videoUrl}
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="h-[calc(100vh-390px)] min-h-[360px] w-full object-contain"
                  />
                  <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[11px] font-semibold text-white">
                    افتح الفيديو
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-b border-slate-100 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleSave(post.id)}
                    className={[
                      "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      saved ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {saved ? "محفوظ" : "حفظ"}
                  </button>
                  <button type="button" onClick={() => markNotInterested(post.id)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    غير مهتم
                  </button>
                </div>

                {normalizedContent ? (
                  <div className={["px-3 py-2 text-right text-slate-800", resolveVideoTextSize(normalizedContent.length)].join(" ")}>
                    <RichMomentText text={shownText} className="whitespace-pre-wrap" />
                    {isLong ? (
                      <button type="button" onClick={() => setExpanded((prev) => ({ ...prev, [post.id]: !isExpanded }))} className="mr-2 text-xs font-semibold text-blue-700 hover:underline">
                        {isExpanded ? "إخفاء" : "عرض المزيد"}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <MomentsPostActions postId={post.id} postContent={post.content || ""} sharePath={sharePath} />
              </article>
            );
          })}

          <div ref={loaderRef} className="flex items-center justify-center py-3 text-xs text-slate-500">
            {loadingMore ? "جارٍ تحميل المزيد..." : hasMore ? "اسحب للأسفل للمزيد" : "تم عرض كل الفيديوهات"}
          </div>
        </div>
      ) : null}
    </div>
  );
}







