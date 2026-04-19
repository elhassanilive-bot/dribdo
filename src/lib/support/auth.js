import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dribdo_support_owner_session";
const MAX_AGE = 60 * 60 * 24 * 14;
const ROLE_OWNER = "owner";
const ROLE_ADMIN = "admin";

function hash(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function getOwnerKey() {
  return String(process.env.SUPPORT_DASHBOARD_OWNER_KEY || process.env.SUPPORT_DASHBOARD_KEY || "").trim();
}

function getAdminKeys() {
  return String(process.env.SUPPORT_DASHBOARD_ADMIN_KEYS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCookieSignature(role) {
  const ownerKey = getOwnerKey();
  if (!ownerKey) return "";
  return hash(`${role}|${ownerKey}`);
}

export function isSupportAccessConfigured() {
  return Boolean(getOwnerKey());
}

export async function getSupportSession() {
  const ownerKey = getOwnerKey();
  if (!ownerKey) return { allowed: false, role: null };

  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value || "";
  if (!cookie) return { allowed: false, role: null };

  const [role, signature] = String(cookie || "").split("|");
  const safeRole = role === ROLE_OWNER || role === ROLE_ADMIN ? role : "";
  if (!safeRole || !signature) return { allowed: false, role: null };

  const valid = signature === getCookieSignature(safeRole);
  if (!valid) return { allowed: false, role: null };

  return { allowed: true, role: safeRole };
}

export async function hasSupportSession() {
  const session = await getSupportSession();
  return session.allowed;
}

export async function createSupportSession(role = ROLE_OWNER) {
  const ownerKey = getOwnerKey();
  if (!ownerKey) return { ok: false, error: "missing_support_key" };

  const safeRole = role === ROLE_ADMIN ? ROLE_ADMIN : ROLE_OWNER;
  const signature = getCookieSignature(safeRole);
  if (!signature) return { ok: false, error: "invalid_cookie_signature" };

  const store = await cookies();
  store.set(COOKIE_NAME, `${safeRole}|${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: MAX_AGE,
    path: "/",
  });

  return { ok: true };
}

export async function clearSupportSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 0,
    path: "/",
  });
}

export function resolveSupportRoleByKey(input) {
  const value = String(input || "").trim();
  if (!value) return null;

  const ownerKey = getOwnerKey();
  if (ownerKey && value === ownerKey) return ROLE_OWNER;

  const adminMatch = getAdminKeys().includes(value);
  if (adminMatch) return ROLE_ADMIN;

  return null;
}

export function isValidSupportKey(input) {
  return Boolean(resolveSupportRoleByKey(input));
}

export function isOwnerRole(role) {
  return String(role || "") === ROLE_OWNER;
}

export function isAdminRole(role) {
  return String(role || "") === ROLE_ADMIN;
}
