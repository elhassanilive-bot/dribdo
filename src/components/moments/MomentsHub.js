"use client";

import { useState } from "react";
import MomentsFeed from "@/components/moments/MomentsFeed";
import MomentsVideosFeed from "@/components/moments/MomentsVideosFeed";

export default function MomentsHub() {
  const [tab, setTab] = useState("posts");

  return (
    <div className="space-y-3" dir="rtl">
      <section className="sticky top-[84px] z-20 rounded-2xl border border-slate-200 bg-white/95 p-2 backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold transition",
              tab === "posts" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            المنشورات
          </button>
          <button
            type="button"
            onClick={() => setTab("videos")}
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold transition",
              tab === "videos" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            الفيديو
          </button>
        </div>
      </section>

      {tab === "posts" ? <MomentsFeed /> : <MomentsVideosFeed />}
    </div>
  );
}
