import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}

export function parseMediaUrls(raw) {
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

export function mediaKind(url, postType = "") {
  const lower = String(url || "").toLowerCase();
  if (String(postType).toLowerCase() === "video") return "video";
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("video")) return "video";
  return "image";
}

export function excerptText(content, limit = 180) {
  const text = String(content || "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
}

export function normalizeHashtagTag(value = "") {
  let text = String(value || "").trim();
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(text);
      if (!decoded || decoded === text) break;
      text = decoded;
    } catch {
      break;
    }
  }
  return text.replace(/^#+/, "").trim().toLowerCase();
}

function escapeRegex(value = "") {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function postContainsHashtag(text = "", hashtag = "") {
  const normalizedTag = normalizeHashtagTag(hashtag);
  if (!normalizedTag) return false;
  const source = String(text || "");
  if (!source) return false;
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])#${escapeRegex(normalizedTag)}(?=$|[^\\p{L}\\p{N}_])`, "iu");
  return pattern.test(source);
}

function normalizePost(row, files = []) {
  const isAnonymous = row?.is_anonymous === true || row?.isAnonymous === true;
  const anonymousName = String(row?.anonymous_name || row?.anonymousName || "مستخدم مجهول").trim() || "مستخدم مجهول";
  const profileRaw = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles;
  const profile = profileRaw && typeof profileRaw === "object" ? profileRaw : {};

  const urls = parseMediaUrls(row?.media_urls);
  const mediaUrl = String(row?.media_url || "").trim();
  if (mediaUrl && !urls.includes(mediaUrl)) urls.unshift(mediaUrl);

  const attachments = (files || [])
    .map((item) => ({
      id: String(item.id || ""),
      fileName: String(item.file_name || "").trim(),
      fileType: String(item.file_type || "").trim(),
      fileUrl: String(item.file_url || "").trim(),
      fileSize: Number(item.file_size || 0),
      createdAt: String(item.created_at || ""),
    }))
    .filter((item) => item.fileUrl);

  return {
    id: String(row?.id || ""),
    userId: String(row?.user_id || ""),
    authorName: isAnonymous ? anonymousName : String(profile.name || row?.name || "").trim() || "مستخدم",
    authorAvatar: isAnonymous ? "" : String(profile.avatar_url || row?.avatar_url || "").trim(),
    authorUsername: isAnonymous ? "" : String(profile.username || row?.username || "").trim(),
    content: String(row?.custom_text || row?.content || "").trim(),
    isAnonymous,
    anonymousName,
    createdAt: String(row?.created_at || ""),
    postType: String(row?.type || "text"),
    mediaUrls: urls,
    bgColor: String(row?.custom_background_color || row?.bg_color || "").trim(),
    textColor: String(row?.custom_text_color || "").trim(),
    likesCount: Number(row?.likes_count || 0),
    commentsCount: Number(row?.comments_count || 0),
    sharesCount: Number(row?.shares_count || 0),
    viewsCount: Number(row?.views_count || 0),
    attachments,
  };
}

export async function listMomentPostsForFeed({ limit = 120 } = {}) {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  let rows = [];

  const primary = await supabase
    .from("posts")
    .select(`
      *,
      profiles:posts_user_id_fkey(name,username,avatar_url,is_verified,is_gold_verified)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (primary.error) {
    const fallback = await supabase.from("posts_feed").select("*").order("created_at", { ascending: false }).limit(limit);
    if (fallback.error) return [];
    rows = fallback.data || [];
  } else {
    rows = primary.data || [];
  }

  return rows.map((row) => normalizePost(row));
}

export async function listMomentPostsByHashtag(tag, { limit = 180 } = {}) {
  const normalizedTag = normalizeHashtagTag(tag);
  if (!normalizedTag) return [];

  const supabase = getServerSupabase();
  if (!supabase) return [];

  const queryToken = `#${normalizedTag}`;
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:posts_user_id_fkey(name,username,avatar_url,is_verified,is_gold_verified)
    `)
    .or(`content.ilike.%${queryToken}%,custom_text.ilike.%${queryToken}%,post_context_text.ilike.%${queryToken}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data || [])
    .filter((row) => {
      const content = String(row?.custom_text || row?.content || "");
      const context = String(row?.post_context_text || "");
      return postContainsHashtag(content, normalizedTag) || postContainsHashtag(context, normalizedTag);
    })
    .map((row) => normalizePost(row));
}

export async function getMomentPostById(id) {
  const postId = String(id || "").trim();
  if (!postId) return null;

  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data: row, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:posts_user_id_fkey(name,username,avatar_url,is_verified,is_gold_verified)
    `)
    .eq("id", postId)
    .maybeSingle();

  if (error || !row) return null;

  let files = [];
  try {
    const { data: fileRows } = await supabase
      .from("post_files")
      .select("id,file_name,file_type,file_size,file_url,created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    files = fileRows || [];
  } catch {}

  return normalizePost(row, files);
}

export async function listIndexableMomentPosts({ limit = 5000 } = {}) {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data } = await supabase.from("posts").select("id,created_at,updated_at").order("created_at", { ascending: false }).limit(limit);

  return (data || [])
    .map((row) => ({
      id: String(row.id || ""),
      lastModified: String(row.updated_at || row.created_at || new Date().toISOString()),
    }))
    .filter((row) => row.id);
}

function hasVideoMedia(row) {
  const postType = String(row?.type || "").toLowerCase();
  if (postType === "video") return true;
  const urls = parseMediaUrls(row?.media_urls);
  const mediaUrl = String(row?.media_url || "").trim();
  if (mediaUrl) urls.unshift(mediaUrl);
  return urls.some((url) => mediaKind(url, postType) === "video");
}

export async function listMomentVideoIds({ limit = 500 } = {}) {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("posts")
    .select("id,type,media_url,media_urls,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).filter((row) => row?.id && hasVideoMedia(row)).map((row) => String(row.id));
}

export async function getMomentVideoNeighbors(postId, { limit = 500 } = {}) {
  const targetId = String(postId || "").trim();
  if (!targetId) return { prevId: "", nextId: "", index: -1, total: 0 };

  const ids = await listMomentVideoIds({ limit });
  const index = ids.indexOf(targetId);
  if (index < 0) return { prevId: "", nextId: "", index: -1, total: ids.length };

  return {
    prevId: ids[index - 1] || "",
    nextId: ids[index + 1] || "",
    index,
    total: ids.length,
  };
}
