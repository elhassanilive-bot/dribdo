import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSlugCandidate } from "@/lib/blog/slug";

const POST_LIST_COLUMNS =
  "id,slug,title,excerpt,content,cover_image_url,category,tags,published_at,created_at,updated_at,status";

export function isBlogEnabled() {
  return isSupabaseConfigured();
}

export function isBlogPublishingEnabled() {
  return isSupabaseConfigured();
}

function normalizePost(row) {
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    category: row.category,
    tags: row.tags || [],
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
  };
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [...new Set(tags.map((tag) => String(tag || "").trim()).filter(Boolean))];
}

async function getWriteClient() {
  return isSupabaseAdminConfigured()
    ? getSupabaseAdminClient()
    : getSupabaseClient();
}

async function ensureUniqueSlug(client, baseSlug) {
  const fallbackBase = createSlugCandidate(baseSlug);
  let attempt = 0;

  while (attempt < 100) {
    const candidate = attempt === 0 ? fallbackBase : `${fallbackBase}-${attempt + 1}`;
    const { data, error } = await client
      .from("blog_posts")
      .select("slug")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      return { slug: candidate, error: error.message };
    }

    if (!data) {
      return { slug: candidate, error: null };
    }

    attempt += 1;
  }

  return { slug: `${fallbackBase}-${Date.now()}`, error: null };
}

export async function listPosts({ limit = 20 } = {}) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map(normalizePost);
}

export async function listPostsDetailed({ limit = 20 } = {}) {
  if (!isSupabaseConfigured()) return { posts: [], error: "Supabase غير مُعد" };

  const supabase = await getSupabaseClient();
  if (!supabase) return { posts: [], error: "Supabase client غير متاح" };

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return { posts: [], error: error.message };
  return { posts: (data || []).map(normalizePost), error: null };
}

export async function getPostBySlug(slug) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return normalizePost(data);
}

export async function getPostBySlugDetailed(slug) {
  if (!isSupabaseConfigured()) return { post: null, error: "Supabase غير مُعد" };

  const supabase = await getSupabaseClient();
  if (!supabase) return { post: null, error: "Supabase client غير متاح" };

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) return { post: null, error: error.message };
  if (!data) return { post: null, error: null };
  return { post: normalizePost(data), error: null };
}

export async function createPost(input) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const title = String(input?.title || "").trim();
  const excerpt = String(input?.excerpt || "").trim();
  const content = String(input?.content || "").trim();
  const coverImageUrl = String(input?.coverImageUrl || "").trim() || null;
  const category = String(input?.category || "").trim() || null;
  const tags = normalizeTags(input?.tags);
  const desiredSlug = String(input?.slug || "").trim();

  if (!title || !excerpt || !content) {
    return { ok: false, error: "يرجى تعبئة العنوان والملخص والمحتوى." };
  }

  const writer = await getWriteClient();
  if (!writer) {
    return { ok: false, error: "Supabase client is not available" };
  }

  const { slug, error: slugError } = await ensureUniqueSlug(
    writer,
    desiredSlug ? createSlugCandidate(desiredSlug) : createSlugCandidate(title)
  );

  if (slugError) {
    return { ok: false, error: slugError };
  }

  const { data, error } = await writer
    .from("blog_posts")
    .insert({
      slug,
      title,
      excerpt,
      content,
      cover_image_url: coverImageUrl,
      category,
      tags,
      status: "published",
      published_at: new Date().toISOString(),
    })
    .select("id, slug")
    .maybeSingle();

  if (error) {
    const message =
      error.code === "23505"
        ? "يوجد مقال آخر بنفس الرابط المختصر. غيّر العنوان أو slug ثم أعد المحاولة."
        : error.message;

    return { ok: false, error: message };
  }

  return { ok: true, slug: data?.slug || slug, id: data?.id || null };
}
