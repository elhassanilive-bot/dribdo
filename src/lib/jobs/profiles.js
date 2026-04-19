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

function normalizeJobProfile(row, profileMap = new Map(), categoryMap = new Map()) {
  const profile = profileMap.get(String(row?.user_id || "")) || {};
  const category = categoryMap.get(String(row?.category_id || "")) || {};

  return {
    id: String(row?.id || ""),
    userId: String(row?.user_id || ""),
    fullName: String(row?.full_name || "").trim(),
    jobTitle: String(row?.job_title || "").trim(),
    bio: String(row?.bio || "").trim(),
    phone: String(row?.phone || "").trim(),
    email: String(row?.email || "").trim(),
    locationCity: String(row?.location_city || "").trim(),
    locationCountry: String(row?.location_country || "").trim(),
    experienceYears: Number(row?.experience_years || 0),
    educationLevel: String(row?.education_level || "").trim(),
    categoryId: String(row?.category_id || ""),
    categoryName: String(category?.name_ar || category?.name_en || "").trim(),
    expectedSalaryMin: Number(row?.expected_salary_min || 0),
    expectedSalaryMax: Number(row?.expected_salary_max || 0),
    salaryCurrency: String(row?.salary_currency || "MAD").trim() || "MAD",
    salaryNegotiable: row?.salary_negotiable === true,
    jobType: parseStringList(row?.job_type),
    workArrangement: parseStringList(row?.work_arrangement),
    isAvailable: row?.is_available === true,
    isPublic: row?.is_public === true,
    profileViews: Number(row?.profile_views || 0),
    allowPhoneContact: row?.allow_phone_contact === true,
    allowEmailContact: row?.allow_email_contact === true,
    allowChatContact: row?.allow_chat_contact === true,
    createdAt: String(row?.created_at || ""),
    updatedAt: String(row?.updated_at || ""),
    avatar: String(profile?.avatar_url || "").trim(),
    username: String(profile?.username || "").trim(),
  };
}

async function fetchProfilesMap(admin, userIds = []) {
  const ids = [...new Set(userIds.map((v) => String(v || "").trim()).filter(Boolean))];
  if (!ids.length) return new Map();

  const { data } = await admin.from("profiles").select("id,username,avatar_url").in("id", ids);
  const map = new Map();
  for (const row of data || []) map.set(String(row?.id || ""), row || {});
  return map;
}

async function fetchCategoriesMap(admin, categoryIds = []) {
  const ids = [...new Set(categoryIds.map((v) => String(v || "").trim()).filter(Boolean))];
  if (!ids.length) return new Map();

  const { data } = await admin.from("job_categories").select("id,name_ar,name_en").in("id", ids);
  const map = new Map();
  for (const row of data || []) map.set(String(row?.id || ""), row || {});
  return map;
}

export async function listJobProfiles({ limit = 12, cursor = "" } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(40, Math.max(1, Number(limit || 12)));
  const safeCursor = String(cursor || "").trim();

  let query = admin
    .from("professional_profiles")
    .select(
      "id,user_id,full_name,job_title,bio,phone,email,location_city,location_country,experience_years,education_level,category_id,expected_salary_min,expected_salary_max,salary_currency,salary_negotiable,job_type,work_arrangement,is_available,is_public,profile_views,allow_phone_contact,allow_email_contact,allow_chat_contact,created_at,updated_at"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (safeCursor) query = query.lt("created_at", safeCursor);

  const { data, error } = await query;
  if (error) return [];

  const rows = data || [];
  const [profilesMap, categoriesMap] = await Promise.all([
    fetchProfilesMap(admin, rows.map((row) => row?.user_id)),
    fetchCategoriesMap(admin, rows.map((row) => row?.category_id)),
  ]);

  return rows.map((row) => normalizeJobProfile(row, profilesMap, categoriesMap));
}

export async function getJobProfileById(profileId) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return null;

  const id = String(profileId || "").trim();
  if (!id) return null;

  const { data: row, error } = await admin
    .from("professional_profiles")
    .select(
      "id,user_id,full_name,job_title,bio,phone,email,location_city,location_country,experience_years,education_level,category_id,expected_salary_min,expected_salary_max,salary_currency,salary_negotiable,job_type,work_arrangement,is_available,is_public,profile_views,allow_phone_contact,allow_email_contact,allow_chat_contact,created_at,updated_at"
    )
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !row) return null;

  const [profilesMap, categoriesMap] = await Promise.all([
    fetchProfilesMap(admin, [row.user_id]),
    fetchCategoriesMap(admin, [row.category_id]),
  ]);

  return normalizeJobProfile(row, profilesMap, categoriesMap);
}

export async function listIndexableJobProfiles({ limit = 5000 } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return [];

  const safeLimit = Math.min(10000, Math.max(1, Number(limit || 5000)));

  const { data } = await admin
    .from("professional_profiles")
    .select("id,created_at,updated_at,is_public")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  return (data || [])
    .map((row) => ({
      id: String(row?.id || ""),
      lastModified: String(row?.updated_at || row?.created_at || new Date().toISOString()),
    }))
    .filter((row) => row.id);
}
