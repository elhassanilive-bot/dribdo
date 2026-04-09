"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/moments", label: "الواجهة", icon: "moment" },
  { href: "/forum", label: "المنتدى", icon: "forum" },
  { href: "/", label: "النبذة", icon: "home" },
  { href: "/features", label: "المميزات", icon: "spark" },
  { href: "/blog", label: "المدونة", icon: "blog" },
  { href: "/download", label: "التحميل", icon: "download" },
  { href: "/account", label: "الحساب", icon: "account" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav dir="rtl" className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-right">
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-black/45">Dribdo</span>
          <span className="text-2xl font-black text-black">دريبدو</span>
        </Link>

        <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-2 py-1.5 md:flex">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} active={isLinkActive(pathname, link.href)} icon={link.icon}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/download"
            className="hidden rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 md:inline-flex"
          >
            حمل التطبيق
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-slate-100 md:hidden"
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
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
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
              className="mt-2 inline-flex items-center justify-center rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800"
            >
              حمل التطبيق
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
  if (filled) {
    const commonFilled = { viewBox: "0 0 24 24", className: "h-3.5 w-3.5", fill: "currentColor" };
    switch (type) {
      case "moment":
        return <svg {...commonFilled}><path d="M4 6h16v12H4z" /><path d="M11 3h2v18h-2z" /><path d="M3 11h18v2H3z" /></svg>;
      case "home":
        return <svg {...commonFilled}><path d="m12 3 9 8h-3v9H6v-9H3z" /></svg>;
      case "spark":
        return <svg {...commonFilled}><path d="m12 2.5 2.2 5.1 5.5 1.8-4.2 3.4 1.3 5.5L12 15.2 7.2 18.3l1.3-5.5-4.2-3.4 5.5-1.8Z" /></svg>;
      case "blog":
        return <svg {...commonFilled}><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 4v2h8V8Zm0 4v2h8v-2Zm0 4v2h5v-2Z" /></svg>;
      case "forum":
        return <svg {...commonFilled}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.2 3.3a.8.8 0 0 1-1.3-.63V16h-1A2.5 2.5 0 0 1 1 13.5v-7A2.5 2.5 0 0 1 3.5 4H4Zm3.2 2.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm4.8 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm4.8 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" /></svg>;
      case "download":
        return <svg {...commonFilled}><path d="M11 3h2v9.2l2.8-2.8 1.4 1.4-5.2 5.2-5.2-5.2 1.4-1.4 2.8 2.8zM4 19h16v2H4z" /></svg>;
      case "account":
        return <svg {...commonFilled}><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" /></svg>;
      default:
        return <svg {...commonFilled}><circle cx="12" cy="12" r="4.5" /></svg>;
    }
  }

  const common = {
    viewBox: "0 0 24 24",
    className: "h-3.5 w-3.5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
  };

  switch (type) {
    case "moment":
      return (
        <svg {...common}>
          <path d="M12 3v18M3 12h18" strokeLinecap="round" />
          <path d="M5 6h14v12H5z" opacity=".35" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m3 11 9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 10v10h12V10" strokeLinecap="round" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.9 4.7L19 9.5l-4 3.2 1.2 5-4.2-2.7L7.8 17.7l1.2-5-4-3.2 5.1-1.8Z" strokeLinejoin="round" />
        </svg>
      );
    case "blog":
      return (
        <svg {...common}>
          <path d="M5 5h14v14H5z" />
          <path d="M8 9h8M8 12h8M8 15h5" strokeLinecap="round" />
        </svg>
      );
    case "forum":
      return (
        <svg {...common}>
          <path d="M4.5 6.5h15a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H10l-4.3 3.3a.5.5 0 0 1-.8-.4V16.5h-.4A1.5 1.5 0 0 1 3 15V8a1.5 1.5 0 0 1 1.5-1.5Z" strokeLinejoin="round" />
          <path d="M8 11h.01M12 11h.01M16 11h.01" strokeLinecap="round" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v11" strokeLinecap="round" />
          <path d="m8 11 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20h16" strokeLinecap="round" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4.5" />
        </svg>
      );
  }
}

function NavLink({ href, children, active, icon }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] leading-none transition",
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
