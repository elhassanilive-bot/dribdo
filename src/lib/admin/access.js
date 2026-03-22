export const ADMIN_SESSION_COOKIE = "dribdo_admin_owner_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14;

export async function hasValidAdminSession() {
  return true;
}

export async function setAdminSessionCookie() {
  return;
}

export async function clearAdminSessionCookie() {
  return;
}

export async function validateAdminAccessToken() {
  return { ok: true };
}

export async function requireAdminSession() {
  return { ok: true };
}
