"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import MomentsPostActions from "@/components/moments/MomentsPostActions";

const TABS = [
  { key: "posts", label: "المنشورات" },
  { key: "photos", label: "الصور" },
  { key: "videos", label: "الفيديوهات" },
  { key: "links", label: "الروابط" },
  { key: "stickers", label: "الملصقات" },
  { key: "files", label: "الملفات" },
  { key: "about", label: "حول" },
];

function cleanUsername(value = "") {
  let text = String(value || "").trim();
  // Handle encoded route segments like %D9%85%D8...
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(text);
      if (!decoded || decoded === text) break;
      text = decoded;
    } catch {
      break;
    }
  }
  return text.trim().replace(/^@+/, "").toLowerCase();
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

function mediaKind(url, postType = "") {
  const lower = String(url || "").toLowerCase();
  if (String(postType).toLowerCase() === "video") return "video";
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("video")) return "video";
  return "image";
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

function formatDay(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", { year: "numeric", month: "long", day: "numeric" }).format(date);
  } catch {
    return String(iso);
  }
}

function avatarFor(name, explicit = "") {
  if (explicit) return explicit;
  const safe = encodeURIComponent(String(name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safe}&background=fee2e2&color=991b1b&size=160&bold=true`;
}

function normalizePost(row, filesMap) {
  const profileRaw = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles;
  const profile = profileRaw && typeof profileRaw === "object" ? profileRaw : {};
  const media = parseMediaUrls(row?.media_urls);
  const mediaUrl = String(row?.media_url || "").trim();
  if (mediaUrl && !media.includes(mediaUrl)) media.unshift(mediaUrl);
  return {
    id: String(row?.id || ""),
    userId: String(row?.user_id || ""),
    authorName: String(profile?.name || row?.name || "").trim() || "مستخدم",
    authorAvatar: String(profile?.avatar_url || row?.avatar_url || "").trim(),
    content: String(row?.custom_text || row?.content || "").trim(),
    createdAt: String(row?.created_at || ""),
    postType: String(row?.type || "text"),
    mediaUrls: media,
    bgColor: String(row?.custom_background_color || row?.bg_color || "").trim(),
    textColor: String(row?.custom_text_color || "").trim(),
    linkUrl: String(row?.link_url || "").trim(),
    stickerUrl: String(row?.sticker_url || "").trim(),
    attachments: filesMap.get(String(row?.id || "")) || [],
  };
}

function MediaGallery({ mediaUrls, postType }) {
  if (!mediaUrls.length) return null;
  if (mediaUrls.length === 1) {
    const url = mediaUrls[0];
    return (
      <div className="mt-3 overflow-hidden rounded-xl bg-slate-100">
        {mediaKind(url, postType) === "video" ? (
          <video src={url} controls preload="metadata" className="h-auto max-h-[620px] w-full bg-black object-cover" />
        ) : (
          <img src={url} alt="وسائط" className="h-auto max-h-[620px] w-full object-cover" loading="lazy" />
        )}
      </div>
    );
  }
  return (
    <div className="mt-3 grid gap-1 sm:grid-cols-2">
      {mediaUrls.slice(0, 4).map((url, idx) => (
        <div key={`${url}-${idx}`} className="overflow-hidden rounded-lg bg-slate-100">
          {mediaKind(url, postType) === "video" ? (
            <video src={url} controls preload="metadata" className="h-56 w-full bg-black object-cover" />
          ) : (
            <img src={url} alt="وسائط" className="h-56 w-full object-cover" loading="lazy" />
          )}
        </div>
      ))}
    </div>
  );
}

function PostCard({ post, expanded, onToggleExpanded }) {
  const text = String(post.content || "").trim();
  const long = text.length > 170;
  const shown = !long || expanded ? text : `${text.slice(0, 170)}...`;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="px-4 pt-4 sm:px-5" dir="rtl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={avatarFor(post.authorName, post.authorAvatar)} alt={post.authorName} className="h-10 w-10 rounded-full border border-slate-200" loading="lazy" />
            <div className="text-right">
              <div className="text-base font-bold text-slate-900">{post.authorName}</div>
              <div className="text-xs text-slate-500">{formatDate(post.createdAt)}</div>
            </div>
          </div>
          <Link href={`/post/${post.id}`} className="text-xs font-bold text-blue-600 hover:underline">فتح المنشور</Link>
        </div>

        {text ? (
          <div className="mt-3 whitespace-pre-wrap rounded-xl px-3 py-2 text-base font-normal leading-7 text-slate-800" style={{ background: post.bgColor || "transparent", color: post.textColor || "#111827" }}>
            {shown}
            {long ? <button type="button" onClick={onToggleExpanded} className="mr-2 inline-flex items-center text-sm font-bold text-blue-600 hover:underline">{expanded ? "إخفاء" : "عرض المزيد"}</button> : null}
          </div>
        ) : null}

        <MediaGallery mediaUrls={post.mediaUrls} postType={post.postType} />

        {post.attachments?.length ? (
          <div className="mt-3 space-y-2">
            {post.attachments.map((file) => (
              <a key={file.id || file.fileUrl} href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                <span className="truncate">{file.fileName || "ملف"}</span>
                <span className="text-xs text-slate-500">فتح</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <MomentsPostActions postId={post.id} postContent={post.content || ""} />
    </article>
  );
}

function AboutTab({ profile }) {
  const rows = [
    ["الموقع", profile.website],
    ["العمل", profile.work],
    ["الدراسة", profile.education],
    ["البلد", profile.country],
    ["المدينة", profile.city],
    ["الجنس", profile.gender],
    ["تاريخ الميلاد", profile.birthDate ? formatDay(profile.birthDate) : ""],
    ["تاريخ الانضمام", profile.createdAt ? formatDay(profile.createdAt) : ""],
  ].filter((item) => String(item[1] || "").trim());

  return (
    <div className="space-y-3">
      {profile.bio ? <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">السيرة الذاتية</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{profile.bio}</p></section> : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-bold text-slate-900">التفاصيل</h3>
        {rows.length ? (
          <div className="mt-2 divide-y divide-slate-100">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2 text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">لا توجد تفاصيل إضافية.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center"><div className="text-[13px] font-black text-slate-900">{value}</div><div className="text-[10px] text-slate-500">{label}</div></div>;
}

export default function UserProfileShell({ username = "", userId = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerId, setViewerId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("posts");
  const [expandedPosts, setExpandedPosts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setProfile(null);
    setPosts([]);
    setTargetId("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setError("تعذر الاتصال بقاعدة البيانات.");
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user || null;
      const authUserId = String(authUser?.id || "");
      setViewerId(authUserId);

      const byUsername = cleanUsername(username);
      const byUserId = String(userId || "").trim();
      const hasExplicitTarget = Boolean(byUsername || byUserId);

      let profileRow = null;

      if (byUsername) {
        const columns = "id,name,username,avatar_url,cover_url,bio,followers_count,following_count,website,work,education,country,city,gender,birth_date,created_at";
        let found = null;
        const candidates = Array.from(new Set([byUsername, `@${byUsername}`]));

        const { data: exactRows, error: exactError } = await supabase
          .from("profiles")
          .select(columns)
          .in("username", candidates)
          .limit(20);

        if (exactError) throw exactError;

        if (Array.isArray(exactRows) && exactRows.length) {
          found = exactRows.find((row) => cleanUsername(row?.username || "") === byUsername) || exactRows[0];
        }

        // Secondary lookup for legacy mixed-case usernames.
        if (!found && !/%|_/.test(byUsername)) {
          const { data: ilikeRows, error: ilikeError } = await supabase
            .from("profiles")
            .select(columns)
            .ilike("username", byUsername)
            .limit(20);

          if (ilikeError) throw ilikeError;
          if (Array.isArray(ilikeRows) && ilikeRows.length) {
            found = ilikeRows.find((row) => cleanUsername(row?.username || "") === byUsername) || null;
          }
        }

        profileRow = found;
      } else if (byUserId) {
        const { data, error: byIdError } = await supabase
          .from("profiles")
          .select("id,name,username,avatar_url,cover_url,bio,followers_count,following_count,website,work,education,country,city,gender,birth_date,created_at")
          .eq("id", byUserId)
          .maybeSingle();
        if (byIdError) throw byIdError;
        profileRow = data || null;
      } else if (authUserId) {
        const { data, error: selfError } = await supabase
          .from("profiles")
          .select("id,name,username,avatar_url,cover_url,bio,followers_count,following_count,website,work,education,country,city,gender,birth_date,created_at")
          .eq("id", authUserId)
          .maybeSingle();
        if (selfError) throw selfError;
        profileRow = data || null;
      }

      const finalTargetId =
        String(profileRow?.id || "").trim() ||
        (byUserId ? byUserId : "") ||
        (!hasExplicitTarget ? authUserId : "");
      setTargetId(finalTargetId);

      if (!finalTargetId) {
        if (hasExplicitTarget) {
          setError("هذا المستخدم غير موجود.");
        }
        return;
      }

      const { data: postRows, error: postError } = await supabase
        .from("posts")
        .select("*,profiles:posts_user_id_fkey(name,username,avatar_url,is_verified,is_gold_verified)")
        .eq("user_id", finalTargetId)
        .order("created_at", { ascending: false })
        .limit(240);

      if (postError) {
        setError(postError.message || "تعذر تحميل منشورات المستخدم.");
        return;
      }

      const rows = postRows || [];
      const ids = rows.map((r) => String(r.id || "")).filter(Boolean);
      const filesMap = new Map();

    if (ids.length) {
      try {
        const { data: fRows } = await supabase
          .from("post_files")
          .select("id,post_id,file_name,file_type,file_size,file_url,created_at")
          .in("post_id", ids)
          .order("created_at", { ascending: true });

        for (const row of fRows || []) {
          const pid = String(row.post_id || "");
          if (!pid) continue;
          if (!filesMap.has(pid)) filesMap.set(pid, []);
          filesMap.get(pid).push({
            id: String(row.id || ""),
            fileName: String(row.file_name || "").trim(),
            fileType: String(row.file_type || "").trim(),
            fileSize: Number(row.file_size || 0),
            fileUrl: String(row.file_url || "").trim(),
            createdAt: String(row.created_at || ""),
          });
        }
      } catch {}
    }

      const normalized = rows.map((row) => normalizePost(row, filesMap)).filter((post) => post.id);

      let followersCount = Number(profileRow?.followers_count || 0);
      let followingCount = Number(profileRow?.following_count || 0);

      // RLS can hide follows/followers rows from anon users in the browser,
      // so we ask a server endpoint (service role) for public counts.
      try {
        const statsRes = await fetch(`/api/profile/stats?userId=${encodeURIComponent(finalTargetId)}`, { cache: "no-store" });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          followersCount = Math.max(followersCount, Number(stats?.followers || 0));
          followingCount = Math.max(followingCount, Number(stats?.following || 0));
        }
      } catch {}

      if (!followersCount) {
        try {
          const { count } = await supabase.from("followers").select("follower_id", { count: "exact", head: true }).eq("following_id", finalTargetId);
          followersCount = Number(count || 0);
        } catch {}
      }

      if (!followingCount) {
        try {
          const { count } = await supabase.from("followers").select("following_id", { count: "exact", head: true }).eq("follower_id", finalTargetId);
          followingCount = Number(count || 0);
        } catch {}
      }

      setPosts(normalized);
      const fallbackNameFromPosts = String(normalized[0]?.authorName || "").trim();
      const fallbackAvatarFromPosts = String(normalized[0]?.authorAvatar || "").trim();
      const fallbackUsername = hasExplicitTarget ? byUsername : "";

      setProfile({
        id: finalTargetId,
        name: String(profileRow?.name || fallbackNameFromPosts || (!hasExplicitTarget ? (authUser?.user_metadata?.full_name || authUser?.email || "") : "") || "مستخدم").trim(),
        username: String(profileRow?.username || fallbackUsername || "").trim(),
        avatarUrl: String(profileRow?.avatar_url || fallbackAvatarFromPosts || "").trim(),
        coverUrl: String(profileRow?.cover_url || "").trim(),
        bio: String(profileRow?.bio || "").trim(),
        followersCount,
        followingCount,
        postsCount: normalized.length,
        website: String(profileRow?.website || "").trim(),
        work: String(profileRow?.work || "").trim(),
        education: String(profileRow?.education || "").trim(),
        country: String(profileRow?.country || "").trim(),
        city: String(profileRow?.city || "").trim(),
        gender: String(profileRow?.gender || "").trim(),
        birthDate: String(profileRow?.birth_date || "").trim(),
        createdAt: String(profileRow?.created_at || (!hasExplicitTarget ? authUser?.created_at : "") || "").trim(),
      });
    } catch (err) {
      setError(String(err?.message || "تعذر تحميل الملف الشخصي."));
    } finally {
      setLoading(false);
    }
  }, [username, userId]);

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const counts = useMemo(() => ({
    posts: posts.length,
    photos: posts.filter((p) => p.mediaUrls.some((u) => mediaKind(u, p.postType) === "image")).length,
    videos: posts.filter((p) => p.postType === "video" || p.mediaUrls.some((u) => mediaKind(u, p.postType) === "video")).length,
    links: posts.filter((p) => p.linkUrl || /(https?:\/\/|www\.)/i.test(p.content)).length,
    stickers: posts.filter((p) => p.postType === "sticker" || p.stickerUrl).length,
    files: posts.filter((p) => p.postType === "file" || (p.attachments || []).length > 0).length,
  }), [posts]);

  const filtered = useMemo(() => {
    if (tab === "posts") return posts;
    if (tab === "photos") return posts.filter((p) => p.mediaUrls.some((u) => mediaKind(u, p.postType) === "image"));
    if (tab === "videos") return posts.filter((p) => p.postType === "video" || p.mediaUrls.some((u) => mediaKind(u, p.postType) === "video"));
    if (tab === "links") return posts.filter((p) => p.linkUrl || /(https?:\/\/|www\.)/i.test(p.content));
    if (tab === "stickers") return posts.filter((p) => p.postType === "sticker" || p.stickerUrl);
    if (tab === "files") return posts.filter((p) => p.postType === "file" || (p.attachments || []).length > 0);
    return posts;
  }, [posts, tab]);

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل الملف الشخصي...</div>;

  if (!targetId && !username && !userId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center">
        <p className="text-sm text-slate-600">سجل الدخول أولًا لعرض ملفك الشخصي.</p>
        <Link href="/login?next=/profile" className="mt-3 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">تسجيل الدخول</Link>
      </div>
    );
  }

  if (!profile) return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error || "تعذر تحميل بيانات الملف الشخصي."}</div>;

  return (
    <div dir="rtl" className="space-y-4">
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-40 w-full bg-slate-100 sm:h-52">
          {profile.coverUrl ? <img src={profile.coverUrl} alt="الغلاف" className="h-full w-full object-cover" loading="lazy" /> : null}
          <div className="absolute -bottom-10 right-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-28 sm:w-28">
            <img src={avatarFor(profile.name, profile.avatarUrl)} alt={profile.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>

        <div className="px-4 pb-4 pt-12 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="text-right">
              <h1 className="text-xl font-black text-slate-900">{profile.name}</h1>
              {profile.username ? <div className="text-sm font-semibold text-slate-500">@{profile.username}</div> : null}
            </div>
            {viewerId && viewerId === profile.id ? (
              <Link href="/account" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100">تعديل الحساب</Link>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md">
            <Stat label="المنشورات" value={profile.postsCount} />
            <Stat label="المتابعون" value={profile.followersCount} />
            <Stat label="يتابع" value={profile.followingCount} />
          </div>

          {profile.bio ? <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{profile.bio}</p> : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-3 py-2">
          {TABS.map((item) => {
            const active = tab === item.key;
            const c = item.key === "about" ? "" : counts[item.key];
            return (
              <button key={item.key} type="button" onClick={() => setTab(item.key)} className={["shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition", active ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"].join(" ")}>
                {item.label}
                {c !== "" ? <span className="mr-1 opacity-80">({c})</span> : null}
              </button>
            );
          })}
        </div>

        <div className="bg-slate-50 p-3 sm:p-4">
          {tab === "about" ? (
            <AboutTab profile={profile} />
          ) : filtered.length ? (
            <div className="space-y-4">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} expanded={Boolean(expandedPosts[post.id])} onToggleExpanded={() => setExpandedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }))} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">لا يوجد محتوى في هذا التبويب.</div>
          )}
        </div>
      </section>
    </div>
  );
}



