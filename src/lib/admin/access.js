import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const ADMIN_SESSION_COOKIE = "dribdo_admin_owner_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14;

function createAdminSessionValue() {
  const seed = process.env.NEXT_PUBLIC_SUPABASE_URL || "dribdo-admin";
  return createHash("sha256").update(`${seed}:blog-admin-session`).digest("hex");
}

function secureEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function hasValidAdminSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!cookieValue) return false;
  return secureEqual(cookieValue, createAdminSessionValue());
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/admin",
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function validateAdminAccessToken(accessToken) {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      code: "missing_service_role",
      error: "SUPABASE_SERVICE_ROLE_KEY غير موجود. لا يمكن تفعيل حماية الأدمن.",
    };
  }

  const token = String(accessToken || "").trim();
  if (!token) {
    return { ok: false, code: "missing_token", error: "جلسة الدخول غير متوفرة." };
  }

  const supabaseAdmin = await getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return { ok: false, code: "admin_client_error", error: "تعذر تهيئة عميل Supabase الإداري." };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, code: "session_verify_failed", error: "تعذر التحقق من جلسة المستخدم." };
  }

  const actualEmail = String(data.user.email || "").toLowerCase();
  const { data: adminUser, error: adminLookupError } = await supabaseAdmin
    .from("blog_admin_users")
    .select("id, email, role, is_active, auth_user_id")
    .eq("email", actualEmail)
    .eq("is_active", true)
    .maybeSingle();

  if (adminLookupError) {
    return {
      ok: false,
      code: "admin_lookup_failed",
      error: "تعذر التحقق من صلاحيات الإدارة من قاعدة البيانات.",
    };
  }

  if (!adminUser) {
    return {
      ok: false,
      code: "not_in_admin_table",
      error: "هذا الحساب غير مخول للوصول إلى لوحة الإدارة.",
      actualUserId: data.user.id,
      actualEmail,
    };
  }

  if (!adminUser.auth_user_id) {
    await supabaseAdmin
      .from("blog_admin_users")
      .update({ auth_user_id: data.user.id })
      .eq("id", adminUser.id);
  }

  return { ok: true, user: data.user, adminUser };
}

export async function requireAdminSession() {
  const valid = await hasValidAdminSession();
  if (!valid) {
    return { ok: false, error: "يجب تسجيل الدخول بحساب موجود في قائمة إدارة المدونة." };
  }
  return { ok: true };
}
