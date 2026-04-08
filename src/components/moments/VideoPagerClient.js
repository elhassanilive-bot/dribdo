"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function VideoPagerClient({ prevId = "", nextId = "" }) {
  const router = useRouter();
  const wheelLock = useRef(0);

  useEffect(() => {
    function onKey(event) {
      if ((event.key === "ArrowDown" || event.key === "PageDown") && nextId) {
        event.preventDefault();
        router.push(`/video/${nextId}`);
      }
      if ((event.key === "ArrowUp" || event.key === "PageUp") && prevId) {
        event.preventDefault();
        router.push(`/video/${prevId}`);
      }
    }

    function onWheel(event) {
      const now = Date.now();
      if (now - wheelLock.current < 550) return;
      if (event.deltaY > 60 && nextId) {
        wheelLock.current = now;
        router.push(`/video/${nextId}`);
      } else if (event.deltaY < -60 && prevId) {
        wheelLock.current = now;
        router.push(`/video/${prevId}`);
      }
    }

    window.addEventListener("keydown", onKey, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [nextId, prevId, router]);

  return (
    <div className="mt-3 flex items-center justify-between gap-2" dir="rtl">
      {prevId ? (
        <Link href={`/video/${prevId}`} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <span>السابق</span>
          <span>↑</span>
        </Link>
      ) : <span />}

      {nextId ? (
        <Link href={`/video/${nextId}`} className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
          <span>التالي</span>
          <span>↓</span>
        </Link>
      ) : <span />}
    </div>
  );
}
