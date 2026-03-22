import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSlugCandidate } from "@/lib/blog/slug";

<<<<<<< HEAD
const POST_LIST_COLUMNS_BASE =
  "id,slug,title,excerpt,content,cover_image_url,category,tags,published_at,created_at,updated_at,status,permalink_style,permalink_template";
const POST_LIST_COLUMNS_WITH_VIEWS = `${POST_LIST_COLUMNS_BASE},view_count`;
=======
const POST_LIST_COLUMNS =
  "id,slug,title,excerpt,content,cover_image_url,category,tags,published_at,created_at,updated_at,status";
const PUBLIC_STATUS = "published";
>>>>>>> 300f687 (dribdo initial)

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
<<<<<<< HEAD
    viewCount: row.view_count ?? 0,
    permalinkStyle: row.permalink_style || "",
    permalinkTemplate: row.permalink_template || "",
=======
    workflowStatus:
      row.status === "published" && row.published_at && new Date(row.published_at).getTime() > Date.now()
        ? "scheduled"
        : row.status,
>>>>>>> 300f687 (dribdo initial)
  };
}

function getNowIso() {
  return new Date().toISOString();
}

function isPubliclyVisiblePost(post) {
  if (!post) return false;
  if (post.status !== PUBLIC_STATUS) return false;
  if (!post.publishedAt) return true;
  return new Date(post.publishedAt).getTime() <= Date.now();
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "draft" || value === "published" || value === "archived") return value;
  if (value === "scheduled") return "published";
  return "published";
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [...new Set(tags.map((tag) => String(tag || "").trim()).filter(Boolean))];
}

<<<<<<< HEAD
function buildSlugVariants(slug) {
  const base = String(slug || "").trim();
  if (!base) return [];
  const spaced = base.replace(/-/g, " ");
  const compact = base.replace(/\s+/g, "-");
  return Array.from(new Set([base, spaced, compact].filter(Boolean)));
}

async function getWriteClient() {
  return isSupabaseAdminConfigured() ? getSupabaseAdminClient() : getSupabaseClient();
}

=======
async function getWriteClient() {
  return isSupabaseAdminConfigured() ? getSupabaseAdminClient() : getSupabaseClient();
}

>>>>>>> 300f687 (dribdo initial)
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

<<<<<<< HEAD
  return (data || []).map(normalizePost);
=======
  if (error) return [];
  return (data || []).map(normalizePost).filter(isPubliclyVisiblePost);
>>>>>>> 300f687 (dribdo initial)
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

<<<<<<< HEAD
=======
  if (error) return { posts: [], error: error.message };
  return { posts: (data || []).map(normalizePost).filter(isPubliclyVisiblePost), error: null };
}

export async function listPostsDetailedPaginated({
  page = 1,
  limit = 9,
  query = "",
  category = "",
  tag = "",
} = {}) {
  if (!isSupabaseConfigured()) return { posts: [], total: 0, page: 1, limit, error: "Supabase غير مُعد" };

  const supabase = await getSupabaseClient();
  if (!supabase) return { posts: [], total: 0, page: 1, limit, error: "Supabase client غير متاح" };

  const safeLimit = Math.max(1, Math.min(Number(limit) || 9, 36));
  const safePage = Math.max(1, Number(page) || 1);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let countQuery = supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .eq("status", PUBLIC_STATUS)
    .lte("published_at", getNowIso());

  let listQuery = supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS)
    .eq("status", PUBLIC_STATUS)
    .lte("published_at", getNowIso())
    .order("published_at", { ascending: false })
    .range(from, to);

  const trimmedQuery = String(query || "").trim();
  if (trimmedQuery) {
    const escaped = trimmedQuery.replace(/,/g, " ");
    listQuery = listQuery.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%,content.ilike.%${escaped}%`);
    countQuery = countQuery.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%,content.ilike.%${escaped}%`);
  }

  if (category) {
    listQuery = listQuery.eq("category", category);
    countQuery = countQuery.eq("category", category);
  }

  if (tag) {
    listQuery = listQuery.contains("tags", [tag]);
    countQuery = countQuery.contains("tags", [tag]);
  }

  const [countRes, listRes] = await Promise.all([countQuery, listQuery]);

  if (countRes.error) {
    return { posts: [], total: 0, page: safePage, limit: safeLimit, error: countRes.error.message };
  }

  if (listRes.error) {
    return { posts: [], total: 0, page: safePage, limit: safeLimit, error: listRes.error.message };
  }

  return {
    posts: (listRes.data || []).map(normalizePost).filter(isPubliclyVisiblePost),
    total: countRes.count || 0,
    page: safePage,
    limit: safeLimit,
    error: null,
  };
}

export async function listCategorySummaries({ limit = 20 } = {}) {
  const { posts } = await listPostsDetailed({ limit: Math.max(limit, 300) });
  const map = new Map();
  for (const post of posts) {
    const key = String(post.category || "").trim();
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count, slug: createSlugCandidate(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ar"));
}

export async function listTagSummaries({ limit = 40 } = {}) {
  const { posts } = await listPostsDetailed({ limit: Math.max(limit, 300) });
  const map = new Map();
  for (const post of posts) {
    for (const rawTag of post.tags || []) {
      const tag = String(rawTag || "").trim();
      if (!tag) continue;
      map.set(tag, (map.get(tag) || 0) + 1);
    }
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count, slug: createSlugCandidate(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ar"))
    .slice(0, limit);
}

export async function listPostsForAdmin({ limit = 100 } = {}) {
  if (!isSupabaseConfigured()) return { posts: [], error: "Supabase غير مُعد" };

  const client = await getAdminReadClient();
  if (!client) return { posts: [], error: "Supabase client غير متاح" };

  const { data, error } = await client
    .from("blog_posts")
    .select(POST_LIST_COLUMNS)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { posts: [], error: error.message };
>>>>>>> 300f687 (dribdo initial)
  return { posts: (data || []).map(normalizePost), error: null };
}

export async function getPostBySlug(slug) {
  if (!isSupabaseConfigured()) return null;

  const normalizedSlug = String(slug || "").trim();
  if (!normalizedSlug) return null;

  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const baseQuery = (column, value) =>
    supabase
      .from("blog_posts")
      .select(POST_LIST_COLUMNS_WITH_VIEWS)
      [column]("slug", value)
      .eq("status", "published")
      .maybeSingle();

  const { data, error } = await baseQuery("eq", normalizedSlug);

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await supabase
        .from("blog_posts")
        .select(POST_LIST_COLUMNS_BASE)
        .eq("slug", normalizedSlug)
        .eq("status", "published")
        .maybeSingle();
      if (fallback.error || !fallback.data) return null;
      return normalizePost(fallback.data);
    }
    return null;
  }
  if (!data && normalizedSlug) {
    const variants = buildSlugVariants(normalizedSlug);
    for (const variant of variants) {
      const caseInsensitive = await baseQuery("ilike", variant);
      if (caseInsensitive.data) return normalizePost(caseInsensitive.data);
      const prefixMatch = await baseQuery("ilike", `${variant}%`);
      if (prefixMatch.data) return normalizePost(prefixMatch.data);
      const containsMatch = await baseQuery("ilike", `%${variant}%`);
      if (containsMatch.data) return normalizePost(containsMatch.data);
    }
  }
  if (!data) return null;
  return normalizePost(data);
}

export async function getPostById(id) {
  if (!isSupabaseConfigured()) return null;

  const normalizedId = String(id || "").trim();
  if (!normalizedId) return null;

  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS_WITH_VIEWS)
    .eq("id", normalizedId)
    .eq("status", "published")
    .maybeSingle();

<<<<<<< HEAD
  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await supabase
        .from("blog_posts")
        .select(POST_LIST_COLUMNS_BASE)
        .eq("id", normalizedId)
        .eq("status", "published")
        .maybeSingle();
      if (fallback.error || !fallback.data) return null;
      return normalizePost(fallback.data);
    }
    return null;
  }
  if (!data) return null;
  return normalizePost(data);
=======
  if (error || !data) return null;
  const post = normalizePost(data);
  return isPubliclyVisiblePost(post) ? post : null;
>>>>>>> 300f687 (dribdo initial)
}

export async function getPostBySlugDetailed(slug) {
  const normalizedSlug = String(slug || "").trim();
  if (!normalizedSlug) return { post: null, error: null };
  if (!isSupabaseConfigured()) return { post: null, error: "Supabase غير مُعد" };

  const supabase = await getSupabaseClient();
  if (!supabase) return { post: null, error: "Supabase client غير متاح" };

  const baseQuery = (column, value) =>
    supabase
      .from("blog_posts")
      .select(POST_LIST_COLUMNS_WITH_VIEWS)
      [column]("slug", value)
      .eq("status", "published")
      .maybeSingle();

<<<<<<< HEAD
  const { data, error } = await baseQuery("eq", normalizedSlug);

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await supabase
        .from("blog_posts")
        .select(POST_LIST_COLUMNS_BASE)
        .eq("slug", normalizedSlug)
        .eq("status", "published")
        .maybeSingle();
      if (fallback.error) return { post: null, error: fallback.error.message };
      if (!fallback.data) return { post: null, error: null };
      return { post: normalizePost(fallback.data), error: null };
    }
    return { post: null, error: error.message };
  }
  if (!data && normalizedSlug) {
    const variants = buildSlugVariants(normalizedSlug);
    for (const variant of variants) {
      const caseInsensitive = await baseQuery("ilike", variant);
      if (caseInsensitive.data) return { post: normalizePost(caseInsensitive.data), error: null };
      const prefixMatch = await baseQuery("ilike", `${variant}%`);
      if (prefixMatch.data) return { post: normalizePost(prefixMatch.data), error: null };
      const containsMatch = await baseQuery("ilike", `%${variant}%`);
      if (containsMatch.data) return { post: normalizePost(containsMatch.data), error: null };
    }
  }
  if (!data && isSupabaseAdminConfigured()) {
    const admin = await getSupabaseAdminClient();
    if (admin) {
      const { data: adminRow } = await admin
        .from("blog_posts")
        .select("id, slug, status")
        .ilike("slug", normalizedSlug)
        .maybeSingle();
      if (adminRow?.status && adminRow.status !== "published") {
        return { post: null, error: "المقال موجود لكنه غير منشور بعد." };
      }
    }
  }
  if (!data && isSupabaseAdminConfigured()) {
    const admin = await getSupabaseAdminClient();
    if (admin) {
      const { data: adminRow } = await admin
        .from("blog_posts")
        .select("id, slug, status")
        .eq("id", normalizedId)
        .maybeSingle();
      if (adminRow?.status && adminRow.status !== "published") {
        return { post: null, error: "المقال موجود لكنه غير منشور بعد." };
      }
    }
  }
  if (!data) {
    return { post: null, error: "تعذر العثور على المقال في هذا المشروع. تحقق من مفاتيح Supabase." };
  }
  return { post: normalizePost(data), error: null };
}

export async function getPostByIdDetailed(id) {
  if (!isSupabaseConfigured()) return { post: null, error: "Supabase is not configured" };

  const normalizedId = String(id || "").trim();
  if (!normalizedId) return { post: null, error: null };

  const supabase = await getSupabaseClient();
  if (!supabase) return { post: null, error: "Supabase client is not available" };

  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS_WITH_VIEWS)
    .eq("id", normalizedId)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (String(error.message || "").includes("view_count")) {
      const fallback = await supabase
        .from("blog_posts")
        .select(POST_LIST_COLUMNS_BASE)
        .eq("id", normalizedId)
        .eq("status", "published")
        .maybeSingle();
      if (fallback.error) return { post: null, error: fallback.error.message };
      if (!fallback.data) return { post: null, error: null };
      return { post: normalizePost(fallback.data), error: null };
    }
    return { post: null, error: error.message };
  }
  if (!data) {
    return { post: null, error: "تعذر العثور على المقال في هذا المشروع. تحقق من مفاتيح Supabase." };
  }
  return { post: normalizePost(data), error: null };
=======
  if (error) return { post: null, error: error.message };
  if (!data) return { post: null, error: null };
  const post = normalizePost(data);
  if (!isPubliclyVisiblePost(post)) return { post: null, error: null };
  return { post, error: null };
}

export async function listRelatedPosts(post, { limit = 3 } = {}) {
  const { posts } = await listPostsDetailed({ limit: 120 });
  const sourceTags = new Set((post?.tags || []).map((tag) => String(tag || "").trim()).filter(Boolean));
  const sourceCategory = String(post?.category || "").trim();

  const scored = posts
    .filter((candidate) => candidate.slug !== post?.slug)
    .map((candidate) => {
      let score = 0;
      if (sourceCategory && candidate.category === sourceCategory) score += 3;
      for (const tag of candidate.tags || []) {
        if (sourceTags.has(tag)) score += 2;
      }
      return { candidate, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((row) => row.candidate);
}

export async function trackPostView({ postId, viewerId }) {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase غير مُعد" };
  const supabase = await getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase client غير متاح" };

  const safePostId = String(postId || "").trim();
  const safeViewerId = String(viewerId || "").trim();
  if (!safePostId || !safeViewerId) return { ok: false, error: "بيانات التتبع ناقصة" };

  const { error } = await supabase
    .from("blog_post_views")
    .upsert(
      {
        post_id: safePostId,
        viewer_id: safeViewerId,
        viewed_at: getNowIso(),
      },
      { onConflict: "post_id,viewer_id" }
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getPostViewsCount(postId) {
  if (!isSupabaseConfigured()) return 0;
  const supabase = await getSupabaseClient();
  if (!supabase) return 0;
  const safePostId = String(postId || "").trim();
  if (!safePostId) return 0;

  const { count, error } = await supabase
    .from("blog_post_views")
    .select("id", { count: "exact", head: true })
    .eq("post_id", safePostId);

  if (error) return 0;
  return count || 0;
}

export async function listTopPosts({ limit = 10 } = {}) {
  const { posts } = await listPostsDetailed({ limit: 120 });
  if (!posts.length) return [];

  const supabase = await getSupabaseClient();
  if (!supabase) return posts.slice(0, limit);

  const ids = posts.map((post) => post.id);
  const { data, error } = await supabase.from("blog_post_views").select("post_id").in("post_id", ids);
  if (error) return posts.slice(0, limit);

  const viewsMap = new Map();
  for (const row of data || []) {
    const postId = String(row.post_id || "");
    viewsMap.set(postId, (viewsMap.get(postId) || 0) + 1);
  }

  return posts
    .map((post) => ({ ...post, views: viewsMap.get(post.id) || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
>>>>>>> 300f687 (dribdo initial)
}

function normalizePostInput(input) {
  const title = String(input?.title || "").trim();
  const excerpt = String(input?.excerpt || "").trim();
  const content = String(input?.content || "").trim();
  const coverImageUrl = String(input?.coverImageUrl || "").trim() || null;
  const category = String(input?.category || "").trim() || null;
  const tags = normalizeTags(input?.tags);
  const desiredSlug = String(input?.slug || "").trim();
<<<<<<< HEAD
  const permalinkStyle = String(input?.permalinkStyle || "").trim() || null;
  const permalinkTemplate = String(input?.permalinkTemplate || "").trim() || null;
=======
  const status = normalizeStatus(input?.status);
  const publishedAtInput = String(input?.publishedAt || "").trim();
  const parsedPublishedAt = publishedAtInput ? new Date(publishedAtInput) : null;
  const safePublishedAt = parsedPublishedAt && !Number.isNaN(parsedPublishedAt.getTime()) ? parsedPublishedAt.toISOString() : null;
  const publishedAt =
    status === "draft" || status === "archived"
      ? null
      : safePublishedAt
        ? safePublishedAt
        : getNowIso();
>>>>>>> 300f687 (dribdo initial)

  return {
    title,
    excerpt,
    content,
    coverImageUrl,
    category,
    tags,
    desiredSlug,
<<<<<<< HEAD
    permalinkStyle,
    permalinkTemplate,
=======
    status,
    publishedAt,
>>>>>>> 300f687 (dribdo initial)
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
<<<<<<< HEAD
      permalink_style: normalized.permalinkStyle,
      permalink_template: normalized.permalinkTemplate,
      status: "published",
      published_at: new Date().toISOString(),
=======
      status: normalized.status,
      published_at: normalized.publishedAt,
>>>>>>> 300f687 (dribdo initial)
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
<<<<<<< HEAD
      permalink_style: normalized.permalinkStyle,
      permalink_template: normalized.permalinkTemplate,
      status: "published",
      published_at: new Date().toISOString(),
=======
      status: normalized.status,
      published_at: normalized.publishedAt,
>>>>>>> 300f687 (dribdo initial)
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
<<<<<<< HEAD
    return { ok: false, error: error.message };
  }

  return { ok: true };
=======
    const details = [error.message, error.details, error.hint].filter(Boolean).join(" | ");
    return { ok: false, error: details || "تعذر حذف المقال." };
  }

  // Verify deletion to avoid false-success states when RLS blocks row deletion silently.
  const verifier = await getAdminReadClient();
  if (!verifier) {
    return { ok: false, error: "تعذر التحقق من نتيجة الحذف: Supabase client غير متاح." };
  }

  const { data: existingRow, error: verifyError } = await verifier.from("blog_posts").select("id").eq("id", postId).maybeSingle();
  if (verifyError) {
    const details = [verifyError.message, verifyError.details, verifyError.hint].filter(Boolean).join(" | ");
    return { ok: false, error: `تم تنفيذ طلب الحذف لكن تعذر التحقق من النتيجة: ${details}` };
  }

  if (existingRow?.id) {
    return { ok: false, error: "لم يتم حذف المقال فعليًا. تحقق من سياسات RLS الخاصة بعملية delete أو استخدم Service Role." };
  }

  return { ok: true, id: postId };
}

export async function deletePosts(ids) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured", deletedIds: [] };
  }

  const normalizedIds = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))];
  if (!normalizedIds.length) {
    return { ok: false, error: "لا توجد مقالات محددة للحذف.", deletedIds: [] };
  }

  const writer = await getWriteClient();
  if (!writer) {
    return { ok: false, error: "Supabase client is not available", deletedIds: [] };
  }

  const { error } = await writer.from("blog_posts").delete().in("id", normalizedIds);
  if (error) {
    const details = [error.message, error.details, error.hint].filter(Boolean).join(" | ");
    return { ok: false, error: details || "تعذر حذف المقالات.", deletedIds: [] };
  }

  const verifier = await getAdminReadClient();
  if (!verifier) {
    return { ok: false, error: "تعذر التحقق من نتيجة الحذف: Supabase client غير متاح.", deletedIds: [] };
  }

  const { data: remainingRows, error: verifyError } = await verifier.from("blog_posts").select("id").in("id", normalizedIds);
  if (verifyError) {
    const details = [verifyError.message, verifyError.details, verifyError.hint].filter(Boolean).join(" | ");
    return { ok: false, error: `تم تنفيذ طلب الحذف لكن تعذر التحقق من النتيجة: ${details}`, deletedIds: [] };
  }

  const remainingIds = new Set((remainingRows || []).map((row) => String(row.id || "")));
  const deletedIds = normalizedIds.filter((id) => !remainingIds.has(id));

  if (!deletedIds.length) {
    return { ok: false, error: "لم يتم حذف أي مقال فعليًا. تحقق من سياسات RLS الخاصة بعملية delete.", deletedIds: [] };
  }

  if (remainingIds.size > 0) {
    return {
      ok: false,
      error: `تم حذف ${deletedIds.length} مقال(ات) فقط. تعذر حذف ${remainingIds.size} مقال(ات) بسبب الصلاحيات أو القيود.`,
      deletedIds,
    };
  }

  return { ok: true, deletedIds };
>>>>>>> 300f687 (dribdo initial)
}
