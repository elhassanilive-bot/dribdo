import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSlugCandidate } from "@/lib/blog/slug";

const POST_LIST_COLUMNS_BASE =
  "id,slug,title,excerpt,content,cover_image_url,category,tags,published_at,created_at,updated_at,status";
const POST_LIST_COLUMNS_WITH_VIEWS = `${POST_LIST_COLUMNS_BASE},view_count`;

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
    viewCount: row.view_count ?? 0,
  };
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [...new Set(tags.map((tag) => String(tag || "").trim()).filter(Boolean))];
}

async function getWriteClient() {
  return isSupabaseAdminConfigured() ? getSupabaseAdminClient() : getSupabaseClient();
}

async function getAdminReadClient() {
  return isSupabaseAdminConfigured() ? getSupabaseAdminClient() : getSupabaseClient();
}

async function ensureUniqueSlug(client, baseSlug, excludeId = null) {
  const fallbackBase = createSlugCandidate(baseSlug);
  let attempt = 0;

  while (attempt < 100) {
    const candidate = attempt === 0 ? fallbackBase : `${fallbackBase}-${attempt + 1}`;
    let query = client.from("blog_posts").select("id, slug").eq("slug", candidate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();

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

  const makeQuery = (columns) =>
    supabase
      .from("blog_posts")
      .select(columns)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

  const { data, error } = await makeQuery(POST_LIST_COLUMNS_WITH_VIEWS);

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await makeQuery(POST_LIST_COLUMNS_BASE);
      if (fallback.error) return [];
      return (fallback.data || []).map(normalizePost);
    }
    return [];
  }

  return (data || []).map(normalizePost);
}

export async function listPostsDetailed({ limit = 20 } = {}) {
  if (!isSupabaseConfigured()) return { posts: [], error: "Supabase غير مُعد" };

  const supabase = await getSupabaseClient();
  if (!supabase) return { posts: [], error: "Supabase client غير متاح" };

  const makeQuery = (columns) =>
    supabase
      .from("blog_posts")
      .select(columns)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

  const { data, error } = await makeQuery(POST_LIST_COLUMNS_WITH_VIEWS);

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await makeQuery(POST_LIST_COLUMNS_BASE);
      if (fallback.error) return { posts: [], error: fallback.error.message };
      return { posts: (fallback.data || []).map(normalizePost), error: null };
    }
    return { posts: [], error: error.message };
  }

  return { posts: (data || []).map(normalizePost), error: null };
}

export async function listCommentCountsForPosts(postIds = []) {
  if (!isSupabaseConfigured()) return {};
  if (!Array.isArray(postIds) || postIds.length === 0) return {};

  const supabase = await getSupabaseClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("blog_post_comment_counts")
    .select("post_id, comment_count")
    .in("post_id", postIds);

  if (error) return {};
  return Object.fromEntries((data || []).map((row) => [row.post_id, row.comment_count]));
}

export async function listPostsForAdmin({ limit = 100 } = {}) {
  if (!isSupabaseConfigured()) return { posts: [], error: "Supabase غير مُعد" };

  const client = await getAdminReadClient();
  if (!client) return { posts: [], error: "Supabase client غير متاح" };

  const makeQuery = (columns) =>
    client
      .from("blog_posts")
      .select(columns)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

  const { data, error } = await makeQuery(POST_LIST_COLUMNS_WITH_VIEWS);

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await makeQuery(POST_LIST_COLUMNS_BASE);
      if (fallback.error) return { posts: [], error: fallback.error.message };
      return { posts: (fallback.data || []).map(normalizePost), error: null };
    }
    return { posts: [], error: error.message };
  }

  return { posts: (data || []).map(normalizePost), error: null };
}

export async function getPostBySlug(slug) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS_WITH_VIEWS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await supabase
        .from("blog_posts")
        .select(POST_LIST_COLUMNS_BASE)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (fallback.error || !fallback.data) return null;
      return normalizePost(fallback.data);
    }
    return null;
  }
  if (!data) return null;
  return normalizePost(data);
}

export async function getPostBySlugDetailed(slug) {
  if (!isSupabaseConfigured()) return { post: null, error: "Supabase غير مُعد" };

  const supabase = await getSupabaseClient();
  if (!supabase) return { post: null, error: "Supabase client غير متاح" };

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS_WITH_VIEWS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await supabase
        .from("blog_posts")
        .select(POST_LIST_COLUMNS_BASE)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (fallback.error) return { post: null, error: fallback.error.message };
      if (!fallback.data) return { post: null, error: null };
      return { post: normalizePost(fallback.data), error: null };
    }
    return { post: null, error: error.message };
  }
  if (!data) return { post: null, error: null };
  return { post: normalizePost(data), error: null };
}

function normalizePostInput(input) {
  const title = String(input?.title || "").trim();
  const excerpt = String(input?.excerpt || "").trim();
  const content = String(input?.content || "").trim();
  const coverImageUrl = String(input?.coverImageUrl || "").trim() || null;
  const category = String(input?.category || "").trim() || null;
  const tags = normalizeTags(input?.tags);
  const desiredSlug = String(input?.slug || "").trim();

  return {
    title,
    excerpt,
    content,
    coverImageUrl,
    category,
    tags,
    desiredSlug,
  };
}

function validatePostInput(input) {
  const contentText = String(input.content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  const hasMedia = /<(img|video|audio|iframe|table)\b/i.test(String(input.content || ""));

  if (!input.title || !input.excerpt || (!input.content || (!contentText && !hasMedia))) {
    return "يرجى تعبئة العنوان والملخص والمحتوى.";
  }

  return null;
}

export async function createPost(input) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const normalized = normalizePostInput(input);
  const validationError = validatePostInput(normalized);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const writer = await getWriteClient();
  if (!writer) {
    return { ok: false, error: "Supabase client is not available" };
  }

  const { slug, error: slugError } = await ensureUniqueSlug(
    writer,
    normalized.desiredSlug ? createSlugCandidate(normalized.desiredSlug) : createSlugCandidate(normalized.title)
  );

  if (slugError) {
    return { ok: false, error: slugError };
  }

  const { data, error } = await writer
    .from("blog_posts")
    .insert({
      slug,
      title: normalized.title,
      excerpt: normalized.excerpt,
      content: normalized.content,
      cover_image_url: normalized.coverImageUrl,
      category: normalized.category,
      tags: normalized.tags,
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

export async function updatePost(input) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const id = String(input?.id || "").trim();
  if (!id) {
    return { ok: false, error: "معرّف المقال مطلوب للتعديل." };
  }

  const normalized = normalizePostInput(input);
  const validationError = validatePostInput(normalized);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const writer = await getWriteClient();
  if (!writer) {
    return { ok: false, error: "Supabase client is not available" };
  }

  const { slug, error: slugError } = await ensureUniqueSlug(
    writer,
    normalized.desiredSlug ? createSlugCandidate(normalized.desiredSlug) : createSlugCandidate(normalized.title),
    id
  );

  if (slugError) {
    return { ok: false, error: slugError };
  }

  const { data, error } = await writer
    .from("blog_posts")
    .update({
      slug,
      title: normalized.title,
      excerpt: normalized.excerpt,
      content: normalized.content,
      cover_image_url: normalized.coverImageUrl,
      category: normalized.category,
      tags: normalized.tags,
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, slug")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, slug: data?.slug || slug, id: data?.id || id };
}

export async function deletePost(id) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const postId = String(id || "").trim();
  if (!postId) {
    return { ok: false, error: "معرّف المقال مطلوب للحذف." };
  }

  const writer = await getWriteClient();
  if (!writer) {
    return { ok: false, error: "Supabase client is not available" };
  }

  const { error } = await writer.from("blog_posts").delete().eq("id", postId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
