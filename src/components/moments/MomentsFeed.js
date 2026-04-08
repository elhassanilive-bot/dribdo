"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import MomentsComposer from "@/components/moments/MomentsComposer";
import MomentsPostActions from "@/components/moments/MomentsPostActions";
import RichMomentText from "@/components/moments/RichMomentText";

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
    return new Intl.DateTimeFormat("ar-MA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  } catch {
    return date.toISOString();
  }
}

function avatarFor(name, explicit = "") {
  if (explicit) return explicit;
  const safe = encodeURIComponent(String(name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safe}&background=fee2e2&color=991b1b&size=96&bold=true`;
}

function cleanUsername(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function profileHref(username, userId = "") {
  const cleaned = cleanUsername(username);
  if (cleaned) return `/${encodeURIComponent(cleaned)}`;
  return userId ? `/profile?uid=${encodeURIComponent(String(userId))}` : "/profile";
}

function mediaKind(url, postType = "") {
  const lower = String(url || "").toLowerCase();
  if (String(postType).toLowerCase() === "video") return "video";
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("video")) return "video";
  return "image";
}

function normalizeAttachment(row) {
  return {
    id: String(row?.id || ""),
    name: String(row?.file_name || row?.name || "ملف"),
    type: String(row?.file_type || row?.type || ""),
    size: Number(row?.file_size || row?.size || 0),
    url: String(row?.file_url || row?.url || "").trim(),
  };
}

function hexToRgb(hex) {
  const clean = String(hex || "").replace("#", "").trim();
  if (!clean) return null;
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function isDarkColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance < 0.5;
}

function resolveTextSizeClass(length, hasColorBackground) {
  if (hasColorBackground) {
    if (length <= 100) return "text-4xl sm:text-5xl";
    if (length <= 160) return "text-3xl sm:text-4xl";
    if (length <= 240) return "text-2xl sm:text-3xl";
    if (length <= 320) return "text-xl sm:text-2xl";
    if (length <= 420) return "text-lg sm:text-xl";
    return "text-base sm:text-lg";
  }

  if (length <= 100) return "text-[16px] leading-8 font-medium";
  if (length <= 180) return "text-[15px] leading-7 font-normal";
  if (length <= 260) return "text-[14px] leading-7 font-normal";
  if (length <= 360) return "text-[13px] leading-6 font-normal";
  return "text-[12px] leading-6 font-normal";
}

function TextCard({ post, expanded, onToggleExpand }) {
  if (!post.content) return null;

  const normalizedText = String(post.content || "").trim();
  const hasColorBackground = Boolean(post.bgColor);
  const previewLimit = 100;
  const isLong = normalizedText.length > previewLimit;
  const visibleText = !isLong || expanded ? normalizedText : `${normalizedText.slice(0, previewLimit).trim()}...`;

  const darkBackground = hasColorBackground ? isDarkColor(post.bgColor) : false;
  const fallbackTextColor = hasColorBackground
    ? (darkBackground ? "#ffffff" : "#0f172a")
    : "#1f2937";

  const richBackground = hasColorBackground
    ? {
        background: `linear-gradient(160deg, ${post.bgColor}, ${post.bgColor})`,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        color: darkBackground ? "#ffffff" : (post.textColor || fallbackTextColor),
      }
    : { color: post.textColor || fallbackTextColor };

  return (
    <div
      className={[
        "mt-4 whitespace-pre-wrap rounded-2xl transition group-hover:ring-1 group-hover:ring-slate-200",
        hasColorBackground
          ? "flex min-h-[230px] items-center justify-center px-6 py-7 text-center font-black leading-[1.45] tracking-tight sm:min-h-[280px]"
          : "px-4 py-3",
        resolveTextSizeClass(normalizedText.length, hasColorBackground),
      ].join(" ")}
      style={richBackground}
    >
      <div>
        <RichMomentText text={visibleText} />
        {isLong ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleExpand();
            }}
            className={[
              "mr-2 inline-flex items-center hover:underline",
              hasColorBackground ? "text-sm font-black text-white/95" : "text-sm font-bold text-blue-600",
            ].join(" ")}
          >
            {expanded ? "إخفاء" : "عرض المزيد"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
function AttachmentList({ attachments = [] }) {
  if (!attachments.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {attachments.map((item) => (
        <a key={item.id || item.url} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs hover:bg-slate-100">
          <div className="max-w-[70%] truncate font-semibold text-slate-700">{item.name}</div>
          <span className="text-slate-500">فتح الملف</span>
        </a>
      ))}
    </div>
  );
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

function normalizePost(row, attachments = []) {
  const isAnonymous = row.is_anonymous === true || row.isAnonymous === true;
  const anonymousName = String(row.anonymous_name || row.anonymousName || "مستخدم مجهول").trim() || "مستخدم مجهول";
  const profileRaw = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const profile = profileRaw && typeof profileRaw === "object" ? profileRaw : {};
  const urls = parseMediaUrls(row.media_urls);
  const mediaUrl = String(row.media_url || "").trim();
  if (mediaUrl && !urls.includes(mediaUrl)) urls.unshift(mediaUrl);
  const content = String(row.custom_text || row.content || "").trim();
  return {
    id: String(row.id || ""),
    userId: String(row.user_id || ""),
    authorName: isAnonymous ? anonymousName : String(profile.name || row.name || "").trim() || "مستخدم",
    authorAvatar: isAnonymous ? "" : String(profile.avatar_url || row.avatar_url || "").trim(),
    authorUsername: isAnonymous ? "" : cleanUsername(profile.username || row.username || ""),
    isAnonymous,
    anonymousName,
    content,
    createdAt: String(row.created_at || ""),
    postType: String(row.type || "text"),
    mediaUrls: urls,
    bgColor: String(row.custom_background_color || row.bg_color || "").trim(),
    textColor: String(row.custom_text_color || "").trim(),
    postContextText: String(row.post_context_text || "").trim(),
    attachments,
  };
}

function PostOptionsModal({ open, quickOnly, post, isFollowing, onClose, onToggleFollow, onHidePost, onReportPost, onBlockUser, onCopyText }) {
  if (!open || !post) return null;

  return (
    <div className="fixed inset-0 z-[115] bg-black/40 p-3" dir="rtl" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-2xl bg-slate-100 p-2" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-1.5 h-1 w-12 rounded-full bg-slate-300" />

        <div className="space-y-1.5">
          {!quickOnly && !post.isAnonymous ? (
            <button type="button" onClick={onToggleFollow} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
              <div>
                <div className="text-[11px] font-bold text-slate-900">{isFollowing ? `إلغاء متابعة ${post.authorName}` : `متابعة ${post.authorName}`}</div>
                <div className="text-[10px] text-slate-500">{isFollowing ? `سيتم إلغاء متابعة ${post.authorName}` : `ستتم متابعة ${post.authorName}`}</div>
              </div>
              <img src="/dribdo-assets/published/follow-user.svg" alt="متابعة" className="h-4 w-4" loading="lazy" />
            </button>
          ) : null}

          <button type="button" onClick={onReportPost} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
            <div>
              <div className="text-[11px] font-bold text-slate-900">الإبلاغ عن المنشور</div>
              <div className="text-[10px] text-slate-500">سيتم مراجعته من الإدارة</div>
            </div>
            <img src="/dribdo-assets/published/report.svg" alt="إبلاغ" className="h-4 w-4" loading="lazy" />
          </button>

          <button type="button" onClick={onBlockUser} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
            <div>
              <div className="text-[11px] font-bold text-rose-600">حظر المستخدم</div>
              <div className="text-[10px] text-slate-500">لن ترى محتوى هذا المستخدم بعد الآن</div>
            </div>
            <img src="/dribdo-assets/published/user-block.svg" alt="حظر" className="h-4 w-4" loading="lazy" />
          </button>

          <button type="button" onClick={onHidePost} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
            <div>
              <div className="text-[11px] font-bold text-slate-900">إخفاء المنشور</div>
              <div className="text-[10px] text-slate-500">لن يظهر هذا المنشور في الخلاصة</div>
            </div>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="currentColor"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
          </button>

          {!quickOnly && post.content ? (
            <button type="button" onClick={onCopyText} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
              <div>
                <div className="text-[11px] font-bold text-slate-900">نسخ نص المنشور</div>
                <div className="text-[10px] text-slate-500">نسخ النص إلى الحافظة</div>
              </div>
              <img src="/dribdo-assets/published/copy-text.svg" alt="نسخ" className="h-4 w-4" loading="lazy" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PostHeader({ post, isMine, isFollowing, onToggleFollow, followLoading, onOpenOptions, onOpenQuickOptions }) {
  const authorProfileLink = profileHref(post.authorUsername, post.userId);
  const canOpenAuthorProfile = !post.isAnonymous && Boolean(post.authorUsername || post.userId);

  return (
    <header dir="rtl" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canOpenAuthorProfile ? (
            <Link href={authorProfileLink} className="inline-flex">
              <img src={avatarFor(post.authorName, post.authorAvatar)} alt={post.authorName} className="h-10 w-10 rounded-full border border-slate-200" loading="lazy" />
            </Link>
          ) : (
            <img src={avatarFor(post.authorName, post.authorAvatar)} alt={post.authorName} className="h-10 w-10 rounded-full border border-slate-200" loading="lazy" />
          )}
          <div className="text-right">
            {canOpenAuthorProfile ? (
              <Link href={authorProfileLink} className="inline-flex items-center gap-1.5 text-base font-bold text-slate-900 hover:underline">{post.authorName}</Link>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-base font-bold text-slate-900">{post.authorName}</div>
            )}
            <div className="text-xs text-slate-500">{formatDate(post.createdAt)}</div>
          </div>

          {!isMine && !post.isAnonymous ? (
            <button type="button" onClick={onToggleFollow} disabled={followLoading} className={["inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-bold transition", isFollowing ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200" : "border-blue-500 text-blue-600 hover:bg-blue-50"].join(" ")}>
              <img src="/dribdo-assets/published/follow-user.svg" alt="متابعة" className="h-4 w-4" loading="lazy" />
              {followLoading ? "..." : isFollowing ? "متابع" : "متابعة"}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          {!isMine && !post.isAnonymous ? (
            <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" aria-label="إخفاء" onClick={onOpenQuickOptions}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          ) : null}
          <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" aria-label="خيارات" onClick={onOpenOptions}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
          </button>
        </div>
      </div>

      {post.postContextText ? <div className="text-xs font-semibold text-slate-500"><RichMomentText text={post.postContextText} /></div> : null}
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
  const [hiddenPosts, setHiddenPosts] = useState({});
  const [optionsPostId, setOptionsPostId] = useState("");
  const [quickOptionsPostId, setQuickOptionsPostId] = useState("");

  const syncFollowMap = useCallback(async (rows) => {
    const supabase = await getSupabaseClient();
    if (!supabase) return;

    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = String(authData?.user?.id || "");
    setAuthUserId(currentUserId);

    if (!currentUserId || !rows.length) return setFollowMap({});

    const authorIds = [...new Set(rows.map((item) => item.userId).filter((id) => id && id !== currentUserId))];
    if (!authorIds.length) return setFollowMap({});

    const map = {};
    try {
      const { data: followedRows } = await supabase.from("followers").select("following_id").eq("follower_id", currentUserId).in("following_id", authorIds);
      for (const row of followedRows || []) {
        const targetId = String(row.following_id || "");
        if (targetId) map[targetId] = true;
      }
    } catch {}

    try {
      const { data: followsRows } = await supabase.from("follows").select("following_id,status").eq("follower_id", currentUserId).in("following_id", authorIds).eq("status", "accepted");
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
    const primary = await supabase.from("posts").select("*,profiles:posts_user_id_fkey(name,username,avatar_url,is_verified,is_gold_verified)").order("created_at", { ascending: false }).limit(120);
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

    const postIds = [...new Set((rows || []).map((row) => String(row?.id || "")).filter(Boolean))];
    const attachmentsMap = new Map();

    if (postIds.length) {
      try {
        const { data: attachmentRows } = await supabase
          .from("post_files")
          .select("id,post_id,file_name,file_type,file_size,file_url,name,type,size,url")
          .in("post_id", postIds)
          .limit(1000);

        for (const row of attachmentRows || []) {
          const pid = String(row?.post_id || "");
          if (!pid) continue;
          const list = attachmentsMap.get(pid) || [];
          const normalized = normalizeAttachment(row);
          if (normalized.url) list.push(normalized);
          attachmentsMap.set(pid, list);
        }
      } catch {}
    }

    const normalized = rows
      .map((row) => normalizePost(row, attachmentsMap.get(String(row?.id || "")) || []))
      .filter((post) => post.id);

    await syncFollowMap(normalized);
    setPosts(normalized);
    setLoading(false);
  }, [syncFollowMap]);

  async function toggleFollow(authorId) {
    if (!authorId || !authUserId || authorId === authUserId) return;
    const supabase = await getSupabaseClient();
    if (!supabase) return;

    const isFollowing = Boolean(followMap[authorId]);
    setFollowBusy((prev) => ({ ...prev, [authorId]: true }));

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

  async function hidePost(post) {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    const { data: authData } = await supabase.auth.getUser();
    const uid = String(authData?.user?.id || "");
    if (!uid) return;

    let ok = false;
    try {
      const { error } = await supabase.rpc("hide_post", { p_post_id: post.id, p_user_id: uid, p_reason: "user_hidden" });
      ok = !error;
    } catch {}

    if (!ok) {
      for (const action of [
        () => supabase.from("hidden_posts").insert({ post_id: post.id, user_id: uid, reason: "user_hidden", hidden_at: new Date().toISOString() }),
        () => supabase.from("hidden_posts").insert({ post_id: post.id, viewer_id: uid, reason: "user_hidden", hidden_at: new Date().toISOString() }),
      ]) {
        try {
          const { error } = await action();
          if (!error) {
            ok = true;
            break;
          }
        } catch {}
      }
    }

    if (ok) setHiddenPosts((prev) => ({ ...prev, [post.id]: true }));
    setOptionsPostId("");
    setQuickOptionsPostId("");
  }

  async function reportPost(post) {
    const reason = window.prompt("سبب الإبلاغ", "محتوى غير لائق");
    if (!reason) return;
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    const { data: authData } = await supabase.auth.getUser();
    const uid = String(authData?.user?.id || "");
    if (!uid) return;

    let ok = false;
    for (const action of [
      () => supabase.from("post_reports").insert({ post_id: post.id, reporter_id: uid, reason }),
      () => supabase.from("reports").insert({ post_id: post.id, reporter_id: uid, reason, type: "post" }),
      () => supabase.from("blog_post_comment_reports").insert({ comment_id: post.id, reporter_user_id: uid, reason }),
    ]) {
      try {
        const { error } = await action();
        if (!error) {
          ok = true;
          break;
        }
      } catch {}
    }

    if (ok) alert("تم إرسال البلاغ.");
    setOptionsPostId("");
    setQuickOptionsPostId("");
  }

  async function blockAuthor(post) {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    const { data: authData } = await supabase.auth.getUser();
    const uid = String(authData?.user?.id || "");
    if (!uid || !post.userId) return;

    let ok = false;
    for (const action of [
      () => supabase.rpc("block_user", { p_blocked_id: post.userId }),
      () => supabase.rpc("block_user", { blocked_id: post.userId }),
      () => supabase.from("blocked_users").insert({ user_id: uid, blocked_user_id: post.userId }),
      () => supabase.from("blocked_users").insert({ blocker_id: uid, blocked_id: post.userId }),
    ]) {
      try {
        const { error } = await action();
        if (!error) {
          ok = true;
          break;
        }
      } catch {}
    }

    if (ok) {
      setHiddenPosts((prev) => ({ ...prev, [post.id]: true }));
      alert("تم حظر المستخدم.");
    }

    setOptionsPostId("");
    setQuickOptionsPostId("");
  }

  function copyPostText(post) {
    if (!post.content) return;
    navigator.clipboard.writeText(post.content).then(() => alert("تم نسخ النص.")).catch(() => {});
    setOptionsPostId("");
  }

  useEffect(() => {
    const timer = setTimeout(() => loadMoments(), 0);
    return () => clearTimeout(timer);
  }, [loadMoments]);

  const visiblePosts = useMemo(() => posts.filter((post) => !hiddenPosts[post.id]), [posts, hiddenPosts]);

  return (
    <div dir="rtl" className="space-y-4">
      <MomentsComposer onCreated={loadMoments} />

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل المنشورات...</div> : null}
      {!loading && error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div> : null}
      {!loading && !error && visiblePosts.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد منشورات لحظات بعد.</div> : null}

      {!loading && !error && visiblePosts.length > 0 ? (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-4 sm:px-5">
                <PostHeader
                  post={post}
                  isMine={authUserId && authUserId === post.userId}
                  isFollowing={Boolean(followMap[post.userId])}
                  onToggleFollow={() => toggleFollow(post.userId)}
                  followLoading={Boolean(followBusy[post.userId])}
                  onOpenOptions={() => setOptionsPostId(post.id)}
                  onOpenQuickOptions={() => setQuickOptionsPostId(post.id)}
                />

                <Link href={`/post/${post.id}`} className="group block">
                  <TextCard
                    post={post}
                    expanded={Boolean(expandedPosts[post.id])}
                    onToggleExpand={() => setExpandedPosts((prev) => ({ ...prev, [post.id]: !Boolean(prev[post.id]) }))}
                  />

                  <MediaGallery mediaUrls={post.mediaUrls} postType={post.postType} />
                  <AttachmentList attachments={post.attachments} />
                  <div className="mb-1 mt-3 text-sm font-semibold text-blue-700">فتح صفحة المنشور</div>
                </Link>
              </div>

              <MomentsPostActions postId={post.id} postContent={post.content || ""} />

              <PostOptionsModal
                open={optionsPostId === post.id}
                quickOnly={false}
                post={post}
                isFollowing={Boolean(followMap[post.userId])}
                onClose={() => setOptionsPostId("")}
                onToggleFollow={() => toggleFollow(post.userId)}
                onHidePost={() => hidePost(post)}
                onReportPost={() => reportPost(post)}
                onBlockUser={() => blockAuthor(post)}
                onCopyText={() => copyPostText(post)}
              />

              <PostOptionsModal
                open={quickOptionsPostId === post.id}
                quickOnly={true}
                post={post}
                isFollowing={Boolean(followMap[post.userId])}
                onClose={() => setQuickOptionsPostId("")}
                onToggleFollow={() => toggleFollow(post.userId)}
                onHidePost={() => hidePost(post)}
                onReportPost={() => reportPost(post)}
                onBlockUser={() => blockAuthor(post)}
                onCopyText={() => copyPostText(post)}
              />
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}








