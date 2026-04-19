import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function parseStringList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v || "").trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return [];
    try {
      const decoded = JSON.parse(value);
      if (Array.isArray(decoded)) {
        return decoded.map((v) => String(v || "").trim()).filter(Boolean);
      }
    } catch {}
    return [value];
  }
  return [];
}

function normalizeProduct(row, profileMap = new Map(), categoryMap = new Map()) {
  const profile = profileMap.get(String(row?.user_id || "")) || {};
  const category = categoryMap.get(String(row?.category_id || "")) || {};

  return {
    id: String(row?.id || ""),
    userId: String(row?.user_id || ""),
    categoryId: String(row?.category_id || ""),
    title: String(row?.title || "").trim(),
    description: String(row?.description || "").trim(),
    price: Number(row?.price || 0),
    currency: String(row?.currency || "MAD").trim() || "MAD",
    isNegotiable: row?.is_negotiable === true,
    isFree: row?.is_free === true,
    isExchange: row?.is_exchange === true,
    city: String(row?.city || "").trim(),
    country: String(row?.country || "").trim(),
    condition: String(row?.condition || "").trim(),
    status: String(row?.status || "").trim(),
    images: parseStringList(row?.images),
    videoUrl: String(row?.video_url || "").trim(),
    viewsCount: Number(row?.views_count || 0),
    favoritesCount: Number(row?.favorites_count || 0),
    createdAt: String(row?.created_at || ""),
    updatedAt: String(row?.updated_at || ""),
    categoryName: String(category?.name_ar || category?.name_en || "").trim(),
    categoryIcon: String(category?.icon || "").trim(),
    sellerName: String(profile?.full_name || profile?.name || profile?.username || "مستخدم").trim() || "مستخدم",
    sellerUsername: String(profile?.username || "").trim(),
    sellerAvatar: String(profile?.avatar_url || "").trim(),
  };
}

async function fetchProfilesMap(admin, userIds = []) {
  const ids = [...new Set(userIds.map((v) => String(v || "").trim()).filter(Boolean))];
  if (!ids.length) return new Map();

  const { data } = await admin
    .from("profiles")
    .select("id,full_name,name,username,avatar_url")
    .in("id", ids);

  const map = new Map();
  for (const row of data || []) {
    map.set(String(row?.id || ""), row || {});
  }
  return map;
}

async function fetchCategoriesMap(admin, categoryIds = []) {
  const ids = [...new Set(categoryIds.map((v) => String(v || "").trim()).filter(Boolean))];
  if (!ids.length) return new Map();

  const { data } = await admin
    .from("product_categories")
    .select("id,name_ar,name_en,icon")
    .in("id", ids);

  const map = new Map();
  for (const row of data || []) {
    map.set(String(row?.id || ""), row || {});
  }
  return map;
}

export async function listMarketProducts({ limit = 12, cursor = "" } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(40, Math.max(1, Number(limit || 12)));
  const safeCursor = String(cursor || "").trim();

  let query = admin
    .from("marketplace_products")
    .select(
      "id,user_id,category_id,title,description,price,currency,is_negotiable,is_free,is_exchange,city,country,condition,status,images,video_url,views_count,favorites_count,created_at,updated_at"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (safeCursor) query = query.lt("created_at", safeCursor);

  const { data, error } = await query;
  if (error) return [];

  const rows = data || [];
  const profilesMap = await fetchProfilesMap(admin, rows.map((row) => row?.user_id));
  const categoriesMap = await fetchCategoriesMap(admin, rows.map((row) => row?.category_id));

  return rows.map((row) => normalizeProduct(row, profilesMap, categoriesMap));
}

export async function getMarketProductById(productId) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return null;

  const id = String(productId || "").trim();
  if (!id) return null;

  const { data: row, error } = await admin
    .from("marketplace_products")
    .select(
      "id,user_id,category_id,title,description,price,currency,is_negotiable,is_free,is_exchange,city,country,condition,status,images,video_url,views_count,favorites_count,created_at,updated_at"
    )
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !row) return null;

  const profilesMap = await fetchProfilesMap(admin, [row.user_id]);
  const categoriesMap = await fetchCategoriesMap(admin, [row.category_id]);

  return normalizeProduct(row, profilesMap, categoriesMap);
}

export async function listIndexableMarketProducts({ limit = 5000 } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(10000, Math.max(1, Number(limit || 5000)));

  const { data } = await admin
    .from("marketplace_products")
    .select("id,created_at,updated_at,status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  return (data || [])
    .map((row) => ({
      id: String(row?.id || ""),
      lastModified: String(row?.updated_at || row?.created_at || new Date().toISOString()),
    }))
    .filter((row) => row.id);
}
