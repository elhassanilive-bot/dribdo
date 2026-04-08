"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

function cleanUsername(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function profileHref(username, userId = "") {
  const cleaned = cleanUsername(username);
  if (cleaned) return `/${encodeURIComponent(cleaned)}`;
  return userId ? `/profile?uid=${encodeURIComponent(String(userId))}` : "/profile";
}

function isVideoUrl(url = "") {
  const lower = String(url || "").toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("video");
}

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

function pickVideoUrl(post) {
  const postType = String(post?.type || "").toLowerCase();
  const urls = parseMediaUrls(post?.media_urls);
  const mediaUrl = String(post?.media_url || "").trim();
  if (mediaUrl && !urls.includes(mediaUrl)) urls.unshift(mediaUrl);

  if (postType === "video") {
    return urls.find((url) => isVideoUrl(url)) || urls[0] || "";
  }

  return urls.find((url) => isVideoUrl(url)) || "";
}

function excerpt(content, limit = 130) {
  const text = String(content || "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
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
  return `https://ui-avatars.com/api/?name=${safe}&background=f1f5f9&color=0f172a&size=96&bold=true`;
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10 14a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 14" />
      <path d="M14 10a5 5 0 0 1 0 7L12.5 18.5a5 5 0 0 1-7-7L7 10" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <BookmarkIcon />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد فيديوهات محفوظة</h2>
      <p className="mt-2 text-sm text-slate-600">عند حفظ أي فيديو من قسم الواجهة سيظهر هنا مباشرة.</p>
      <Link href="/moments?tab=videos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
        اذهب إلى فيديوهات الواجهة
      </Link>
    </div>
  );
}

export default function SavedVideosClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerId, setViewerId] = useState("");
  const [items, setItems] = useState([]);
  const [copiedId, setCopiedId] = useState("");
  const [unsavingId, setUnsavingId] = useState("");

  const ready = useMemo(() => isSupabaseConfigured(), []);

  const loadSavedVideos = useCallback(async () => {
    if (!ready) {
      setError("Supabase غير مُعد بعد.");
      setLoading(false);
      return;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setError("تعذر الاتصال بقاعدة البيانات.");
      setLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const uid = String(authData?.user?.id || "");
    setViewerId(uid);

    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let savedRows = [];

      const byUser = await supabase
        .from("saved_posts")
        .select("post_id,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(400);

      if (!byUser.error) {
        savedRows = byUser.data || [];
      } else {
        const byViewer = await supabase
          .from("saved_posts")
          .select("post_id,created_at")
          .eq("viewer_id", uid)
          .order("created_at", { ascending: false })
          .limit(400);

        if (byViewer.error) throw new Error(byViewer.error.message || byUser.error.message || "تعذر تحميل المحفوظات");
        savedRows = byViewer.data || [];
      }

      const postIds = [...new Set((savedRows || []).map((row) => String(row?.post_id || "")).filter(Boolean))];
      if (!postIds.length) {
        setItems([]);
        return;
      }

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id,user_id,custom_text,content,media_url,media_urls,type,created_at,profiles:posts_user_id_fkey(name,username,avatar_url)")
        .in("id", postIds);

      if (postsError) throw new Error(postsError.message || "تعذر تحميل بيانات المنشورات المحفوظة");

      const savedAtMap = new Map((savedRows || []).map((row) => [String(row?.post_id || ""), String(row?.created_at || "")]));
      const orderMap = new Map(postIds.map((id, index) => [id, index]));

      const normalized = (posts || [])
        .map((post) => {
          const profileRaw = Array.isArray(post?.profiles) ? post.profiles[0] : post?.profiles;
          const profile = profileRaw && typeof profileRaw === "object" ? profileRaw : {};
          const videoUrl = pickVideoUrl(post);
          if (!videoUrl) return null;

          return {
            id: String(post.id || ""),
            userId: String(post.user_id || ""),
            authorName: String(profile?.name || "مستخدم").trim() || "مستخدم",
            authorUsername: cleanUsername(profile?.username || ""),
            authorAvatar: String(profile?.avatar_url || "").trim(),
            content: String(post?.custom_text || post?.content || "").trim(),
            createdAt: String(post?.created_at || ""),
            savedAt: String(savedAtMap.get(String(post.id || "")) || ""),
            videoUrl,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (orderMap.get(a.id) ?? 9999) - (orderMap.get(b.id) ?? 9999));

      setItems(normalized);
    } catch (err) {
      setError(String(err?.message || "تعذر تحميل الفيديوهات المحفوظة."));
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    loadSavedVideos();
  }, [loadSavedVideos]);

  async function copyLink(postId) {
    const url = `${window.location.origin}/video/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(""), 1200);
    } catch {}
  }

  async function unsaveVideo(postId) {
    if (!postId || !viewerId || unsavingId === postId) return;

    setUnsavingId(postId);
    setError("");
    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== postId));

    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const byUser = await supabase.from("saved_posts").delete().eq("user_id", viewerId).eq("post_id", postId);
      if (byUser.error) {
        const byViewer = await supabase.from("saved_posts").delete().eq("viewer_id", viewerId).eq("post_id", postId);
        if (byViewer.error) throw new Error(byViewer.error.message || byUser.error.message || "تعذر إلغاء الحفظ.");
      }
    } catch (err) {
      setItems(previousItems);
      setError(String(err?.message || "تعذر إلغاء الحفظ."));
    } finally {
      setUnsavingId("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8" dir="rtl">
      <section className="rounded-[2.5rem] border border-slate-200 bg-[linear-gradient(130deg,#eef6ff_0%,#ffffff_55%,#f8fafc_100%)] p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Dribdo Saved</p>
        <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">المحفوظات</h1>
        <p className="mt-2 text-sm text-slate-600">كل الفيديوهات التي قمت بحفظها ستظهر هنا مع وصول سريع لصفحة الفيديو والرابط.</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href="/account" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
            العودة إلى الحساب
          </Link>
          <button type="button" onClick={loadSavedVideos} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
            تحديث القائمة
          </button>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">إجمالي الفيديوهات: {items.length}</span>
        </div>
      </section>

      {!viewerId && !loading ? (
        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
          يجب تسجيل الدخول لعرض المحفوظات.
          <Link href="/login?next=/account/saved-videos" className="mr-2 font-bold text-amber-950 underline">تسجيل الدخول</Link>
        </section>
      ) : null}

      {loading ? <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600">جارٍ تحميل الفيديوهات المحفوظة...</div> : null}
      {!loading && error ? <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-6 text-sm text-rose-700">{error}</div> : null}
      {!loading && !error && viewerId && items.length === 0 ? <div className="mt-6"><EmptyState /></div> : null}

      {!loading && !error && items.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const authorUrl = profileHref(item.authorUsername, item.userId);
            return (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative bg-black">
                  <video src={item.videoUrl} controls preload="metadata" className="h-56 w-full object-cover" />
                  <Link href={`/video/${item.id}`} className="absolute bottom-2 left-2 rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white hover:bg-black/75">
                    فتح صفحة الفيديو
                  </Link>
                </div>

                <div className="space-y-3 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={authorUrl} className="flex min-w-0 items-center gap-2">
                      <img src={avatarFor(item.authorName, item.authorAvatar)} alt={item.authorName} className="h-9 w-9 rounded-full border border-slate-200 object-cover" loading="lazy" />
                      <div className="min-w-0 text-right">
                        <p className="truncate text-xs font-bold text-slate-900">{item.authorName}</p>
                        <p className="truncate text-[11px] text-slate-500">{formatDate(item.createdAt)}</p>
                      </div>
                    </Link>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">محفوظ</span>
                  </div>

                  {item.content ? <p className="line-clamp-2 text-xs leading-6 text-slate-700">{excerpt(item.content)}</p> : null}

                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => copyLink(item.id)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <LinkIcon />
                      {copiedId === item.id ? "تم النسخ" : "نسخ الرابط"}
                    </button>
                    <Link href={`/post/${item.id}`} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      تفاصيل المنشور
                    </Link>
                    <button
                      type="button"
                      onClick={() => unsaveVideo(item.id)}
                      disabled={unsavingId === item.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {unsavingId === item.id ? "جارٍ الإلغاء..." : "إلغاء الحفظ"}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">تاريخ الحفظ: {formatDate(item.savedAt)}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

