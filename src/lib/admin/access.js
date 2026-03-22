import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const ADMIN_OWNER_USER_ID =
  process.env.BLOG_ADMIN_OWNER_USER_ID || "15b8d491-6d29-41b9-a0eb-21184f5936a4";
export const ADMIN_SESSION_COOKIE = "dribdo_admin_owner_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14;

function createAdminSessionValue(userId) {
  const seed = process.env.NEXT_PUBLIC_SUPABASE_URL || "dribdo-admin";
  return createHash("sha256").update(`${seed}:${userId}`).digest("hex");
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
  return secureEqual(cookieValue, createAdminSessionValue(ADMIN_OWNER_USER_ID));
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(ADMIN_OWNER_USER_ID), {
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

  if (data.user.id !== ADMIN_OWNER_USER_ID) {
    return {
      ok: false,
      code: "user_mismatch",
      error: "هذا الحساب غير مخول للوصول إلى لوحة الإدارة.",
      actualUserId: data.user.id,
      actualEmail: data.user.email || "",
      expectedUserId: ADMIN_OWNER_USER_ID,
    };
  }

  return { ok: true, user: data.user };
}

export async function requireAdminSession() {
  const valid = await hasValidAdminSession();
  if (!valid) {
    return { ok: false, error: "يجب تسجيل الدخول بالحساب المالك للوصول إلى الإدارة." };
  }
  return { ok: true };
}
