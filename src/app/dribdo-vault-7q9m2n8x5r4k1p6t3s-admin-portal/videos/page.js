import Link from "next/link";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SECRET_ADMIN_BASE_PATH, SECRET_ADMIN_VIDEOS_PATH } from "@/lib/admin/paths";

export const metadata = {
  title: "تحليلات الفيديو",
  description: "لوحة تحليلات الفيديو في دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: SECRET_ADMIN_VIDEOS_PATH },
};

function excerpt(text, limit = 70) {
  const raw = String(text || "").trim().replace(/\s+/g, " ");
  if (!raw) return "(بدون نص)";
  if (raw.length <= limit) return raw;
  return `${raw.slice(0, limit)}...`;
}

function pct(numerator, denominator) {
  const d = Number(denominator || 0);
  if (!d) return 0;
  return Math.round((Number(numerator || 0) * 1000) / d) / 10;
}

function parseDateValue(value, endOfDay = false) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const hasTime = raw.includes("T");
  let date = new Date(raw);
  if (!hasTime) {
    date = new Date(`${raw}${endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z"}`);
  }
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function dayStartOffset(daysBack) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  start.setUTCDate(start.getUTCDate() - daysBack);
  return start.toISOString();
}

function getRangeFromSearchParams(searchParams = {}) {
  const incoming = String(searchParams?.range || "7d").toLowerCase();
  const range = ["today", "7d", "30d", "90d", "all", "custom"].includes(incoming) ? incoming : "7d";

  if (range === "today") {
    return {
      range,
      fromIso: dayStartOffset(0),
      toIso: "",
      label: "اليوم",
      fromRaw: "",
      toRaw: "",
    };
  }

  if (range === "7d") {
    return {
      range,
      fromIso: dayStartOffset(7),
      toIso: "",
      label: "آخر 7 أيام",
      fromRaw: "",
      toRaw: "",
    };
  }

  if (range === "30d") {
    return {
      range,
      fromIso: dayStartOffset(30),
      toIso: "",
      label: "آخر 30 يومًا",
      fromRaw: "",
      toRaw: "",
    };
  }

  if (range === "90d") {
    return {
      range,
      fromIso: dayStartOffset(90),
      toIso: "",
      label: "آخر 90 يومًا",
      fromRaw: "",
      toRaw: "",
    };
  }

  if (range === "custom") {
    const fromRaw = String(searchParams?.from || "").trim();
    const toRaw = String(searchParams?.to || "").trim();
    const fromIso = parseDateValue(fromRaw, false);
    const toIso = parseDateValue(toRaw, true);
    return {
      range,
      fromIso,
      toIso,
      label: fromIso || toIso ? "نطاق مخصص" : "نطاق مخصص (غير مكتمل)",
      fromRaw,
      toRaw,
    };
  }

  return {
    range: "all",
    fromIso: "",
    toIso: "",
    label: "كل الوقت",
    fromRaw: "",
    toRaw: "",
  };
}

async function fetchVideoEvents(client, { fromIso = "", toIso = "" } = {}) {
  let primaryQuery = client
    .from("video_analytics_events")
    .select("post_id,event_type,watch_seconds,session_id,created_at")
    .order("created_at", { ascending: false })
    .limit(8000);

  if (fromIso) primaryQuery = primaryQuery.gte("created_at", fromIso);
  if (toIso) primaryQuery = primaryQuery.lte("created_at", toIso);

  const primary = await primaryQuery;

  if (!primary.error) return { rows: primary.data || [], source: "video_analytics_events", error: null };

  let fallbackQuery = client
    .from("post_analytics_events")
    .select("post_id,event_type,watch_seconds,session_id,created_at")
    .order("created_at", { ascending: false })
    .limit(8000);

  if (fromIso) fallbackQuery = fallbackQuery.gte("created_at", fromIso);
  if (toIso) fallbackQuery = fallbackQuery.lte("created_at", toIso);

  const fallback = await fallbackQuery;

  if (!fallback.error) return { rows: fallback.data || [], source: "post_analytics_events", error: null };

  return { rows: [], source: "none", error: primary.error?.message || fallback.error?.message || "تعذر تحميل أحداث التحليلات" };
}

async function fetchPostsMap(client, postIds) {
  if (!postIds.length) return new Map();

  const { data } = await client
    .from("posts")
    .select("id,custom_text,content,created_at,user_id,profiles:posts_user_id_fkey(name,username)")
    .in("id", postIds);

  const map = new Map();
  for (const row of data || []) {
    const profileRaw = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles;
    const profile = profileRaw && typeof profileRaw === "object" ? profileRaw : {};
    map.set(String(row.id), {
      id: String(row.id),
      title: excerpt(row?.custom_text || row?.content || "", 90),
      createdAt: String(row?.created_at || ""),
      authorName: String(profile?.name || "مستخدم").trim() || "مستخدم",
      username: String(profile?.username || "").trim(),
    });
  }
  return map;
}

function aggregate(rows) {
  const map = new Map();
  let totalWatchSeconds = 0;
  const allSessions = new Set();

  for (const row of rows) {
    const postId = String(row?.post_id || "").trim();
    if (!postId) continue;

    if (!map.has(postId)) {
      map.set(postId, {
        postId,
        open: 0,
        play: 0,
        pause: 0,
        progress: 0,
        ended: 0,
        autoNext: 0,
        share: 0,
        watchSeconds: 0,
        sessions: new Set(),
      });
    }

    const item = map.get(postId);
    const eventType = String(row?.event_type || "open").trim().toLowerCase();
    const watchSeconds = Number(row?.watch_seconds || 0);
    const sid = String(row?.session_id || "").trim();

    if (sid) {
      item.sessions.add(sid);
      allSessions.add(sid);
    }

    if (eventType === "open") item.open += 1;
    if (eventType === "play") item.play += 1;
    if (eventType === "pause") item.pause += 1;
    if (eventType === "progress") item.progress += 1;
    if (eventType === "ended") item.ended += 1;
    if (eventType === "auto_next") item.autoNext += 1;
    if (eventType === "share") item.share += 1;

    item.watchSeconds += Math.max(0, watchSeconds);
    totalWatchSeconds += Math.max(0, watchSeconds);
  }

  const items = [...map.values()].map((item) => ({
    ...item,
    uniqueSessions: item.sessions.size,
    completionRate: pct(item.ended, Math.max(item.play, item.open, 1)),
    shareRate: pct(item.share, Math.max(item.open, 1)),
    avgWatchSeconds: item.uniqueSessions ? Math.round(item.watchSeconds / item.uniqueSessions) : 0,
  }));

  items.sort((a, b) => b.uniqueSessions - a.uniqueSessions || b.watchSeconds - a.watchSeconds);

  const summary = {
    videosTracked: items.length,
    sessions: allSessions.size,
    totalWatchSeconds,
    totalShares: items.reduce((sum, item) => sum + item.share, 0),
    avgCompletionRate: items.length ? Math.round((items.reduce((sum, item) => sum + item.completionRate, 0) * 10) / items.length) / 10 : 0,
    avgShareRate: items.length ? Math.round((items.reduce((sum, item) => sum + item.shareRate, 0) * 10) / items.length) / 10 : 0,
  };

  return { items, summary };
}

function formatDuration(seconds) {
  const n = Math.max(0, Number(seconds || 0));
  if (n < 60) return `${n}ث`;
  const min = Math.floor(n / 60);
  const sec = n % 60;
  return `${min}د ${sec}ث`;
}

function dateInputValue(iso = "") {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function QueryTab({ href, active, label }) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default async function AdminVideoAnalyticsPage({ searchParams }) {
  const resolvedSearchParams = searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams || {};
  const adminReady = isSupabaseAdminConfigured();
  const client = adminReady ? await getSupabaseAdminClient() : await getSupabaseClient();
  const rangeState = getRangeFromSearchParams(resolvedSearchParams);

  if (!client) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">تعذر تهيئة اتصال قاعدة البيانات.</div>
      </div>
    );
  }

  const eventsResult = await fetchVideoEvents(client, {
    fromIso: rangeState.fromIso,
    toIso: rangeState.toIso,
  });
  const { items, summary } = aggregate(eventsResult.rows);
  const topItems = items.slice(0, 30);
  const postsMap = await fetchPostsMap(client, topItems.map((item) => item.postId));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">تحليلات الفيديو</h1>
          <p className="mt-2 text-sm text-slate-600">لوحة متابعة أداء الفيديوهات: المشاهدة، الإكمال، والمشاركة.</p>
          <p className="mt-1 text-xs text-slate-500">مصدر البيانات: {eventsResult.source}</p>
          <p className="mt-1 text-xs font-semibold text-blue-700">الفترة: {rangeState.label}</p>
        </div>
        <Link href={SECRET_ADMIN_BASE_PATH} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          العودة إلى لوحة الأدمن
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <QueryTab href={`${SECRET_ADMIN_VIDEOS_PATH}?range=today`} active={rangeState.range === "today"} label="اليوم" />
          <QueryTab href={`${SECRET_ADMIN_VIDEOS_PATH}?range=7d`} active={rangeState.range === "7d"} label="آخر 7 أيام" />
          <QueryTab href={`${SECRET_ADMIN_VIDEOS_PATH}?range=30d`} active={rangeState.range === "30d"} label="آخر 30 يومًا" />
          <QueryTab href={`${SECRET_ADMIN_VIDEOS_PATH}?range=90d`} active={rangeState.range === "90d"} label="آخر 90 يومًا" />
          <QueryTab href={`${SECRET_ADMIN_VIDEOS_PATH}?range=all`} active={rangeState.range === "all"} label="كل الوقت" />
        </div>
        <form method="get" action={SECRET_ADMIN_VIDEOS_PATH} className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="range" value="custom" />
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            من تاريخ
            <input
              type="date"
              name="from"
              defaultValue={rangeState.range === "custom" ? String(rangeState.fromRaw || dateInputValue(rangeState.fromIso)) : ""}
              className="h-9 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 outline-none focus:border-blue-400"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            إلى تاريخ
            <input
              type="date"
              name="to"
              defaultValue={rangeState.range === "custom" ? String(rangeState.toRaw || dateInputValue(rangeState.toIso)) : ""}
              className="h-9 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 outline-none focus:border-blue-400"
            />
          </label>
          <button type="submit" className="h-9 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
            تطبيق فلترة مخصصة
          </button>
        </form>
      </section>

      {eventsResult.error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">{eventsResult.error}</div>
      ) : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="الفيديوهات المتتبعة" value={summary.videosTracked} />
        <MetricCard label="الجلسات" value={summary.sessions} />
        <MetricCard label="إجمالي وقت المشاهدة" value={formatDuration(summary.totalWatchSeconds)} />
        <MetricCard label="إجمالي المشاركات" value={summary.totalShares} />
        <MetricCard label="متوسط الإكمال" value={`${summary.avgCompletionRate}%`} />
        <MetricCard label="متوسط المشاركة" value={`${summary.avgShareRate}%`} />
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">Top Videos</div>
        {topItems.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">لا توجد بيانات تحليلات بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2">الفيديو</th>
                  <th className="px-3 py-2">جلسات</th>
                  <th className="px-3 py-2">Play</th>
                  <th className="px-3 py-2">Ended</th>
                  <th className="px-3 py-2">Completion</th>
                  <th className="px-3 py-2">Share Rate</th>
                  <th className="px-3 py-2">Avg Watch</th>
                  <th className="px-3 py-2">روابط</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item) => {
                  const post = postsMap.get(item.postId);
                  return (
                    <tr key={item.postId} className="border-t border-slate-100">
                      <td className="px-3 py-2 align-top">
                        <div className="font-semibold text-slate-900">{post?.title || `منشور ${item.postId.slice(0, 8)}`}</div>
                        <div className="mt-1 text-xs text-slate-500">{post?.authorName || "مستخدم"}</div>
                      </td>
                      <td className="px-3 py-2">{item.uniqueSessions}</td>
                      <td className="px-3 py-2">{item.play}</td>
                      <td className="px-3 py-2">{item.ended}</td>
                      <td className="px-3 py-2">{item.completionRate}%</td>
                      <td className="px-3 py-2">{item.shareRate}%</td>
                      <td className="px-3 py-2">{formatDuration(item.avgWatchSeconds)}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/video/${item.postId}`} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">صفحة الفيديو</Link>
                          <Link href={`/post/${item.postId}`} className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">المنشور</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-black text-slate-900">{value}</div>
    </div>
  );
}

