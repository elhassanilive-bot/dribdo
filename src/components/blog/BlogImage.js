"use client";

import { useState } from "react";
import Image from "next/image";

function isLocalImage(src) {
  return String(src || "").startsWith("/");
}

function isLegacyPlaceholder(src) {
  const normalized = String(src || "").trim().toLowerCase();
  return normalized === "/screenshots/feed.svg";
}

export default function BlogImage({
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  priority = false,
}) {
  const [failed, setFailed] = useState(false);
  const rawSource = !failed && String(src || "").trim() ? String(src).trim() : "";
  const source = isLegacyPlaceholder(rawSource) ? "" : rawSource;
  const altText = String(alt || "").trim() || "صورة توضيحية للمحتوى";

  if (!source) {
    return (
      <div
        role="img"
        aria-label={altText}
        className={[
          "flex items-center justify-center bg-[linear-gradient(140deg,#f8fafc_0%,#f1f5f9_55%,#e2e8f0_100%)]",
          className,
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-12 w-12 text-slate-400 sm:h-14 sm:w-14">
            <path
              d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-11Z"
              fill="currentColor"
              opacity="0.22"
            />
            <circle cx="9" cy="9" r="1.35" fill="currentColor" />
            <path
              d="M7 16.5h10c.3 0 .48-.34.3-.58l-2.8-3.62a.38.38 0 0 0-.6.01l-1.74 2.17a.38.38 0 0 1-.58.01l-1.42-1.7a.38.38 0 0 0-.58.02l-2.2 3.1c-.18.24 0 .59.3.59Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-2xl font-semibold text-slate-500 sm:text-3xl">لا صورة مدرجة</span>
        </div>
      </div>
    );
  }

  if (isLocalImage(source)) {
    return (
      <Image
        src={source}
        alt={altText}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt={altText}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
