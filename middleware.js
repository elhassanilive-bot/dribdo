import { NextResponse } from "next/server";
import {
  SECRET_ADMIN_BASE_PATH,
  SECRET_ADMIN_BLOG_PATH,
  SECRET_ADMIN_REPORTS_PATH,
} from "@/lib/admin/paths";

export function middleware(request) {
  const { pathname } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
