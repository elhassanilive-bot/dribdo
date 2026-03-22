import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "dribdo_admin_owner_session";
const ADMIN_OWNER_EMAIL =
  process.env.BLOG_ADMIN_OWNER_EMAIL || "elhassanilive@gmail.com";

async function createAdminSessionValue(email) {
  const seed = process.env.NEXT_PUBLIC_SUPABASE_URL || "dribdo-admin";
  const input = new TextEncoder().encode(`${seed}:${String(email || "").toLowerCase()}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin") {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const expectedValue = await createAdminSessionValue(ADMIN_OWNER_EMAIL);

  if (cookieValue && cookieValue === expectedValue) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
