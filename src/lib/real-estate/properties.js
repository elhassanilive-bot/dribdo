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

function parsePropertyImages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      url: String(item?.image_url || "").trim(),
      order: Number(item?.image_order || 0),
      isMain: item?.is_main === true,
    }))
    .filter((item) => item.url)
    .sort((a, b) => {
      if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
      return a.order - b.order;
    })
    .map((item) => item.url);
}

function normalizeProperty(row, profileMap = new Map()) {
  const profile = profileMap.get(String(row?.user_id || "")) || {};
  const images = parsePropertyImages(row?.property_images);

  return {
    id: String(row?.id || ""),
    userId: String(row?.user_id || ""),
    title: String(row?.title || "").trim(),
    description: String(row?.description || "").trim(),
    propertyType: String(row?.property_type || "apartment").trim() || "apartment",
    purpose: String(row?.purpose || "sale").trim() || "sale",
    category: String(row?.category || "residential").trim() || "residential",
    country: String(row?.country || "").trim(),
    city: String(row?.city || "").trim(),
    district: String(row?.district || "").trim(),
    address: String(row?.address || "").trim(),
    price: Number(row?.price || 0),
    currency: String(row?.currency || "MAD").trim() || "MAD",
    area: Number(row?.area || 0),
    bedrooms: Number(row?.bedrooms || 0),
    bathrooms: Number(row?.bathrooms || 0),
    floors: Number(row?.floors || 0),
    parkingSpaces: Number(row?.parking_spaces || 0),
    features: parseStringList(row?.features),
    amenities: parseStringList(row?.amenities),
    contactPhone: String(row?.contact_phone || "").trim(),
    contactWhatsapp: String(row?.contact_whatsapp || "").trim(),
    allowAppMessages: row?.allow_app_messages === true,
    isActive: row?.is_active === true,
    isFeatured: row?.is_featured === true,
    viewsCount: Number(row?.views_count || 0),
    createdAt: String(row?.created_at || ""),
    updatedAt: String(row?.updated_at || ""),
    images,
    ownerName: String(profile?.full_name || profile?.name || profile?.username || "مستخدم").trim() || "مستخدم",
    ownerAvatar: String(profile?.avatar_url || "").trim(),
  };
}

async function fetchProfilesMap(admin, userIds = []) {
  const ids = [...new Set(userIds.map((v) => String(v || "").trim()).filter(Boolean))];
  if (!ids.length) return new Map();

  const { data } = await admin.from("profiles").select("id,full_name,name,username,avatar_url").in("id", ids);
  const map = new Map();
  for (const row of data || []) map.set(String(row?.id || ""), row || {});
  return map;
}

export async function listRealEstateProperties({ limit = 12, cursor = "" } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(40, Math.max(1, Number(limit || 12)));
  const safeCursor = String(cursor || "").trim();

  let query = admin
    .from("real_estate_properties")
    .select(
      "id,user_id,title,description,property_type,purpose,category,country,city,district,address,price,currency,area,bedrooms,bathrooms,floors,parking_spaces,features,amenities,contact_phone,contact_whatsapp,allow_app_messages,is_active,is_featured,views_count,created_at,updated_at,property_images(image_url,image_order,is_main)"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (safeCursor) query = query.lt("created_at", safeCursor);

  const { data, error } = await query;
  if (error) return [];

  const rows = data || [];
  const profilesMap = await fetchProfilesMap(admin, rows.map((row) => row?.user_id));

  return rows.map((row) => normalizeProperty(row, profilesMap));
}

export async function getRealEstatePropertyById(propertyId) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return null;

  const id = String(propertyId || "").trim();
  if (!id) return null;

  const { data: row, error } = await admin
    .from("real_estate_properties")
    .select(
      "id,user_id,title,description,property_type,purpose,category,country,city,district,address,price,currency,area,bedrooms,bathrooms,floors,parking_spaces,features,amenities,contact_phone,contact_whatsapp,allow_app_messages,is_active,is_featured,views_count,created_at,updated_at,property_images(image_url,image_order,is_main)"
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !row) return null;

  const profilesMap = await fetchProfilesMap(admin, [row.user_id]);
  return normalizeProperty(row, profilesMap);
}

export async function listIndexableRealEstateProperties({ limit = 5000 } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(10000, Math.max(1, Number(limit || 5000)));

  const { data } = await admin
    .from("real_estate_properties")
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
