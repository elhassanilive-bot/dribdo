import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function parseStringList(raw) {
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

function normalizeCharityItem(row, profileMap = new Map()) {
  const profile = profileMap.get(String(row?.user_id || "")) || {};
  const anonymous = row?.is_anonymous === true;

  return {
    id: String(row?.id || ""),
    userId: String(row?.user_id || ""),
    title: String(row?.title || "").trim(),
    description: String(row?.description || "").trim(),
    type: String(row?.type || "donation").trim() || "donation",
    category: String(row?.category || "other").trim() || "other",
    condition: String(row?.condition || "good").trim() || "good",
    deliveryMethod: String(row?.delivery_method || "hand").trim() || "hand",
    city: String(row?.city || "").trim(),
    country: String(row?.country || "").trim(),
    phoneNumber: String(row?.phone_number || "").trim(),
    images: parseStringList(row?.images),
    isUrgent: row?.is_urgent === true,
    isAnonymous: anonymous,
    isCompleted: row?.is_completed === true,
    isActive: row?.is_active === true,
    interestCount: Number(row?.interest_count || 0),
    createdAt: String(row?.created_at || ""),
    updatedAt: String(row?.updated_at || ""),
    userName: anonymous ? "مستخدم مجهول" : String(profile?.full_name || profile?.name || profile?.username || "مستخدم").trim() || "مستخدم",
    userAvatar: anonymous ? "" : String(profile?.avatar_url || "").trim(),
    isVerified: anonymous ? false : profile?.is_verified === true,
  };
}

async function fetchProfilesMap(admin, userIds = []) {
  const ids = [...new Set(userIds.map((v) => String(v || "").trim()).filter(Boolean))];
  if (!ids.length) return new Map();

  const { data } = await admin.from("profiles").select("id,full_name,name,username,avatar_url,is_verified").in("id", ids);
  const map = new Map();
  for (const row of data || []) map.set(String(row?.id || ""), row || {});
  return map;
}

export async function listCharityItems({ limit = 12, cursor = "" } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(40, Math.max(1, Number(limit || 12)));
  const safeCursor = String(cursor || "").trim();

  let query = admin
    .from("charity_items")
    .select("id,user_id,title,description,type,category,condition,delivery_method,city,country,phone_number,images,is_urgent,is_anonymous,is_completed,is_active,interest_count,created_at,updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (safeCursor) query = query.lt("created_at", safeCursor);

  const { data, error } = await query;
  if (error) return [];

  const rows = data || [];
  const profilesMap = await fetchProfilesMap(admin, rows.map((row) => row?.user_id));

  return rows.map((row) => normalizeCharityItem(row, profilesMap));
}

export async function getCharityItemById(itemId) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return null;

  const id = String(itemId || "").trim();
  if (!id) return null;

  const { data: row, error } = await admin
    .from("charity_items")
    .select("id,user_id,title,description,type,category,condition,delivery_method,city,country,phone_number,images,is_urgent,is_anonymous,is_completed,is_active,interest_count,created_at,updated_at")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !row) return null;

  const profilesMap = await fetchProfilesMap(admin, [row.user_id]);
  return normalizeCharityItem(row, profilesMap);
}

export async function listIndexableCharityItems({ limit = 5000 } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(10000, Math.max(1, Number(limit || 5000)));

  const { data } = await admin
    .from("charity_items")
    .select("id,created_at,updated_at,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  return (data || [])
    .map((row) => ({
      id: String(row?.id || ""),
      lastModified: String(row?.updated_at || row?.created_at || new Date().toISOString()),
    }))
    .filter((row) => row.id);
}
