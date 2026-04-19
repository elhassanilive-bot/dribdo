"use client";

import { useState } from "react";
import MomentsFeed from "@/components/moments/MomentsFeed";
import MomentsVideosFeed from "@/components/moments/MomentsVideosFeed";
import MomentsMarketFeed from "@/components/moments/MomentsMarketFeed";
import MomentsRealEstateFeed from "@/components/moments/MomentsRealEstateFeed";
import MomentsJobsFeed from "@/components/moments/MomentsJobsFeed";
import MomentsCharityFeed from "@/components/moments/MomentsCharityFeed";

export default function MomentsHub() {
  const [tab, setTab] = useState("posts");

  return (
    <div className="space-y-3" dir="rtl">
      <section className="sticky top-[84px] z-20 rounded-2xl border border-slate-200 bg-white/95 p-2 backdrop-blur">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
          <button
            type="button"
            onClick={() => setTab("market")}
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold transition",
              tab === "market" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            السوق
          </button>
          <button
            type="button"
            onClick={() => setTab("real_estate")}
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold transition",
              tab === "real_estate" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            العقارات
          </button>
          <button
            type="button"
            onClick={() => setTab("jobs")}
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold transition",
              tab === "jobs" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            الوظائف
          </button>
          <button
            type="button"
            onClick={() => setTab("charity")}
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold transition",
              tab === "charity" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            الصدقات
          </button>
        </div>
      </section>

      {tab === "posts" ? <MomentsFeed /> : null}
      {tab === "videos" ? <MomentsVideosFeed /> : null}
      {tab === "market" ? <MomentsMarketFeed /> : null}
      {tab === "real_estate" ? <MomentsRealEstateFeed /> : null}
      {tab === "jobs" ? <MomentsJobsFeed /> : null}
      {tab === "charity" ? <MomentsCharityFeed /> : null}
    </div>
  );
}
