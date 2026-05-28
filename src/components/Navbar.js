"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "الرئيسية", icon: "home" },
  { href: "/moments", label: "الواجهة", icon: "moment" },
  { href: "/about", label: "عن Dribdo", icon: "info" },
  { href: "/privacy", label: "الخصوصية", icon: "lock" },
  { href: "/terms", label: "الشروط", icon: "doc" },
  { href: "/community-guidelines", label: "المجتمع", icon: "group" },
  { href: "/help-center", label: "المساعدة", icon: "help" },
  { href: "/contact", label: "اتصل بنا", icon: "mail" },
  { href: "/security", label: "الأمان", icon: "shield" },
  { href: "/deletion", label: "حذف الحساب", icon: "delete" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav dir="rtl" className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-right">
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-black/45">Dribdo</span>
          <span className="text-2xl font-black text-black">دريبدو</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-slate-50/80 px-2 py-1.5">
            {links.map((link) => (
              <NavLink key={link.href} href={link.href} active={isLinkActive(pathname, link.href)} icon={link.icon}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/download"
            className="hidden rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 md:inline-flex"
          >
            تحميل التطبيق
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-slate-100 lg:hidden"
            aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={isOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
            {links.map((link) => (
              <NavLinkMobile
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={isLinkActive(pathname, link.href)}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLinkMobile>
            ))}
            <Link
              href="/download"
              onClick={() => setIsOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800 sm:col-span-2"
            >
              تحميل التطبيق
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function isLinkActive(pathname, href) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function iconFor(type, filled = false) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-3.5 w-3.5",
    fill: filled ? "currentColor" : "none",
    stroke: filled ? "none" : "currentColor",
    strokeWidth: "1.8",
  };

  switch (type) {
    case "home":
      return filled ? <svg {...common}><path d="m12 3 9 8h-3v9H6v-9H3z" /></svg> : <svg {...common}><path d="m3 11 9-8 9 8" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 10v10h12V10" strokeLinecap="round" /></svg>;
    case "moment":
      return filled ? <svg {...common}><path d="M4 6h16v12H4z" /><path d="M11 3h2v18h-2z" /><path d="M3 11h18v2H3z" /></svg> : <svg {...common}><path d="M12 3v18M3 12h18" strokeLinecap="round" /><path d="M5 6h14v12H5z" opacity=".35" /></svg>;`r`n    case "info":
      return filled ? <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M11 10h2v7h-2zM11 7h2v2h-2z" fill="white" /></svg> : <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" strokeLinecap="round" /></svg>;
    case "lock":
      return filled ? <svg {...common}><path d="M6 10h12v10H6z" /><path d="M8 10V8a4 4 0 0 1 8 0v2" /></svg> : <svg {...common}><rect x="6" y="10" width="12" height="10" rx="2" /><path d="M8 10V8a4 4 0 0 1 8 0v2" strokeLinecap="round" /></svg>;
    case "doc":
      return filled ? <svg {...common}><path d="M6 3h9l3 3v15H6z" /><path d="M9 10h6M9 14h6M9 18h4" stroke="white" strokeWidth="1.5" /></svg> : <svg {...common}><path d="M6 3h9l3 3v15H6z" /><path d="M9 10h6M9 14h6M9 18h4" strokeLinecap="round" /></svg>;
    case "group":
      return filled ? <svg {...common}><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 20a4.5 4.5 0 0 1 9 0ZM13 20a3.5 3.5 0 0 1 7 0Z" /></svg> : <svg {...common}><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path d="M3.5 20a4.5 4.5 0 0 1 9 0M13 20a3.5 3.5 0 0 1 7 0" strokeLinecap="round" /></svg>;
    case "help":
      return filled ? <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M10 9a2 2 0 1 1 3.2 1.6c-.9.6-1.2 1-1.2 2M12 17h.01" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg> : <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M10 9a2 2 0 1 1 3.2 1.6c-.9.6-1.2 1-1.2 2M12 17h.01" strokeLinecap="round" /></svg>;
    case "mail":
      return filled ? <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="m4 8 8 6 8-6" stroke="white" strokeWidth="1.6" /></svg> : <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="m4 8 8 6 8-6" strokeLinecap="round" /></svg>;
    case "shield":
      return filled ? <svg {...common}><path d="M12 3 4 6v5c0 5.2 3.5 9.6 8 10 4.5-.4 8-4.8 8-10V6z" /></svg> : <svg {...common}><path d="M12 3 4 6v5c0 5.2 3.5 9.6 8 10 4.5-.4 8-4.8 8-10V6z" /></svg>;
    case "delete":
      return filled ? <svg {...common}><path d="M7 8h10l-.7 12H7.7zM9 5h6l1 2H8z" /></svg> : <svg {...common}><path d="M5 8h14M9 8V5h6v3M8 8l.7 12h6.6L16 8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="4.5" /></svg>;
  }
}

function NavLink({ href, children, active, icon }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] leading-none transition",
        active
          ? "bg-white text-slate-900 ring-1 ring-slate-200 font-semibold"
          : "text-slate-600 hover:bg-white hover:text-slate-900 font-normal",
      ].join(" ")}
    >
      <span className={active ? "text-slate-900" : "text-slate-500"}>{iconFor(icon, active)}</span>
      {children}
    </Link>
  );
}

function NavLinkMobile({ href, children, onClick, icon, active }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "inline-flex w-full items-center justify-start gap-2.5 rounded-2xl border px-4 py-3 text-right text-[13px] transition",
        active
          ? "border-slate-300 bg-slate-100 text-slate-900 font-semibold"
          : "border-slate-200 text-slate-700 hover:bg-slate-50 font-normal",
      ].join(" ")}
    >
      <span className={active ? "text-slate-900" : "text-slate-500"}>{iconFor(icon, active)}</span>
      {children}
    </Link>
  );
}

