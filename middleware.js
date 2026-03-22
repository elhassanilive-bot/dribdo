import { NextResponse } from "next/server";
import {
  SECRET_ADMIN_BASE_PATH,
  SECRET_ADMIN_BLOG_PATH,
  SECRET_ADMIN_REPORTS_PATH,
} from "@/lib/admin/paths";

const ADMIN_SESSION_COOKIE = "dribdo_admin_owner_session";

async function createAdminSessionValue() {
  const seed = process.env.NEXT_PUBLIC_SUPABASE_URL || "dribdo-admin";
  const input = new TextEncoder().encode(`${seed}:blog-admin-session`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function isProtectedAdminPath(pathname) {
  return pathname.startsWith("/admin/") || pathname.startsWith(`${SECRET_ADMIN_BASE_PATH}/`);
}

function isAdminEntryPath(pathname) {
  return pathname === "/admin" || pathname === SECRET_ADMIN_BASE_PATH;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!isAdminEntryPath(pathname) && !isProtectedAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = SECRET_ADMIN_BASE_PATH;
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin/blog") {
    const url = request.nextUrl.clone();
    url.pathname = SECRET_ADMIN_BLOG_PATH;
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin/reports") {
    const url = request.nextUrl.clone();
    url.pathname = SECRET_ADMIN_REPORTS_PATH;
    return NextResponse.redirect(url);
  }

  if (pathname === SECRET_ADMIN_BASE_PATH) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const expectedValue = await createAdminSessionValue();

  if (cookieValue && cookieValue === expectedValue) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = SECRET_ADMIN_BASE_PATH;
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/dribdo-vault-7q9m2n8x5r4k1p6t3s-admin-portal/:path*", "/admin"],
};
