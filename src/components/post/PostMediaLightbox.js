"use client";

import { useMemo, useState } from "react";

function mediaKind(url) {
  const lower = String(url || "").toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("video")) return "video";
  return "image";
}

export default function PostMediaLightbox({ mediaUrls = [], postType = "" }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);

  const items = useMemo(
    () => mediaUrls.map((url) => ({ url, kind: postType === "video" ? "video" : mediaKind(url) })),
    [mediaUrls, postType]
  );

  if (!items.length) return null;

  return (
    <>
      <div className={items.length === 1 ? "mt-4" : "mt-4 grid gap-2 sm:grid-cols-2"}>
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => {
              setActiveIndex(index);
              setZoom(1);
            }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-right"
          >
            {item.kind === "video" ? (
              <video src={item.url} preload="metadata" controls className="h-auto max-h-[620px] w-full bg-black object-cover" />
            ) : (
              <img src={item.url} alt="وسائط المنشور" loading="lazy" className="h-auto max-h-[620px] w-full object-cover" />
            )}
          </button>
        ))}
      </div>

      {activeIndex >= 0 ? (
        <div
          className="fixed inset-0 z-[90] bg-black/80 p-4"
          onClick={() => setActiveIndex(-1)}
          onWheel={(event) => {
            event.preventDefault();
            setZoom((value) => Math.max(1, Math.min(3, value + (event.deltaY < 0 ? 0.15 : -0.15))));
          }}
        >
          <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
            <button
              type="button"
              className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-slate-900"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex(-1);
              }}
            >
              إغلاق
            </button>

            {items[activeIndex]?.kind === "video" ? (
              <video
                src={items[activeIndex].url}
                controls
                autoPlay
                preload="metadata"
                className="max-h-full w-full rounded-2xl bg-black"
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <img
                src={items[activeIndex]?.url}
                alt="عرض كامل"
                className="max-h-full max-w-full rounded-2xl object-contain transition duration-150"
                style={{ transform: `scale(${zoom})` }}
                onClick={(event) => event.stopPropagation()}
                draggable
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
