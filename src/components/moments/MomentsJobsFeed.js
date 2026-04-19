"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JobsComposer from "@/components/moments/JobsComposer";
import { getSupabaseClient } from "@/lib/supabase/client";

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  } catch {
    return date.toISOString();
  }
}

function excerpt(text, max = 110) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

function formatSalary(item) {
  const min = Number(item?.expectedSalaryMin || 0);
  const max = Number(item?.expectedSalaryMax || 0);
  const currency = String(item?.salaryCurrency || "MAD").trim() || "MAD";
  if (min > 0 && max > 0) return `${min.toFixed(0)} - ${max.toFixed(0)} ${currency}`;
  if (min > 0) return `من ${min.toFixed(0)} ${currency}`;
  if (max > 0) return `حتى ${max.toFixed(0)} ${currency}`;
  return item?.salaryNegotiable ? "قابل للتفاوض" : "غير محدد";
}

export default function MomentsJobsFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [viewerId, setViewerId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [editingProfileId, setEditingProfileId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    jobTitle: "",
    bio: "",
    locationCity: "",
    locationCountry: "Morocco",
    experienceYears: "0",
    expectedSalaryMin: "",
    expectedSalaryMax: "",
    salaryCurrency: "MAD",
    salaryNegotiable: true,
    phone: "",
    email: "",
    isAvailable: true,
    isPublic: true,
  });
  const loaderRef = useRef(null);

  const fetchBatch = useCallback(async (nextCursor = "", append = false) => {
    if (!append && !nextCursor) {
      setLoading(true);
      setError("");
      setItems([]);
    }

    try {
      const query = new URLSearchParams({ limit: "12" });
      if (nextCursor) query.set("cursor", nextCursor);
      const response = await fetch(`/api/moments/jobs-feed?${query.toString()}`, { cache: "no-store" });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(String(json?.error || "تعذر تحميل الوظائف."));
        setLoading(false);
        return;
      }

      const nextItems = Array.isArray(json?.items) ? json.items : [];
      const next = String(json?.nextCursor || "");

      setItems((prev) => {
        if (!append) return nextItems;
        const map = new Map(prev.map((item) => [item.id, item]));
        for (const item of nextItems) map.set(item.id, item);
        return [...map.values()];
      });

      setCursor(next);
      setHasMore(Boolean(json?.hasMore) && Boolean(nextItems.length));
    } catch {
      setError("تعذر تحميل الوظائف.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatch("", false);
  }, [fetchBatch]);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase || !active) return;
      const { data } = await supabase.auth.getUser();
      if (active) setViewerId(String(data?.user?.id || ""));
    })();
    return () => {
      active = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !cursor) return;
    setLoadingMore(true);
    await fetchBatch(cursor, true);
    setLoadingMore(false);
  }, [cursor, fetchBatch, hasMore, loading, loadingMore]);

  useEffect(() => {
    if (!loaderRef.current) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    }, { threshold: 0.2 });
    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [loadMore]);

  async function copyLink(path, id) {
    const url = `${window.location.origin}${path || `/job/${id}`}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1400);
    } catch {}
  }

  function beginEdit(item) {
    setStatus("");
    setEditingProfileId(item.id);
    setEditForm({
      fullName: String(item?.fullName || ""),
      jobTitle: String(item?.jobTitle || ""),
      bio: String(item?.bio || ""),
      locationCity: String(item?.locationCity || ""),
      locationCountry: String(item?.locationCountry || "Morocco"),
      experienceYears: String(item?.experienceYears ?? "0"),
      expectedSalaryMin: String(item?.expectedSalaryMin ?? ""),
      expectedSalaryMax: String(item?.expectedSalaryMax ?? ""),
      salaryCurrency: String(item?.salaryCurrency || "MAD"),
      salaryNegotiable: item?.salaryNegotiable === true,
      phone: String(item?.phone || ""),
      email: String(item?.email || ""),
      isAvailable: item?.isAvailable === true,
      isPublic: item?.isPublic === true,
    });
  }

  function cancelEdit() {
    setEditingProfileId("");
    setSavingEdit(false);
  }

  async function saveEdit(profileId) {
    setStatus("");
    const fullName = String(editForm.fullName || "").trim();
    const jobTitle = String(editForm.jobTitle || "").trim();
    const bio = String(editForm.bio || "").trim();

    if (fullName.length < 2) {
      setStatus("الاسم الكامل مطلوب.");
      return;
    }
    if (jobTitle.length < 2) {
      setStatus("المسمى الوظيفي مطلوب.");
      return;
    }
    if (bio && bio.length > 3000) {
      setStatus("النبذة طويلة جداً.");
      return;
    }

    setSavingEdit(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const payload = {
        full_name: fullName,
        job_title: jobTitle,
        bio: bio || null,
        location_city: String(editForm.locationCity || "").trim() || null,
        location_country: String(editForm.locationCountry || "Morocco").trim() || "Morocco",
        experience_years: Number(editForm.experienceYears || 0),
        expected_salary_min: String(editForm.expectedSalaryMin || "").trim() ? Number(editForm.expectedSalaryMin) : null,
        expected_salary_max: String(editForm.expectedSalaryMax || "").trim() ? Number(editForm.expectedSalaryMax) : null,
        salary_currency: String(editForm.salaryCurrency || "MAD").trim() || "MAD",
        salary_negotiable: editForm.salaryNegotiable === true,
        phone: String(editForm.phone || "").trim() || null,
        email: String(editForm.email || "").trim() || null,
        is_available: editForm.isAvailable === true,
        is_public: editForm.isPublic === true,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase.from("professional_profiles").update(payload).eq("id", profileId);
      if (updateError) throw new Error(updateError.message || "تعذر حفظ التعديلات.");

      if (payload.is_public !== true) {
        setItems((prev) => prev.filter((item) => item.id !== profileId));
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === profileId
              ? {
                  ...item,
                  fullName: payload.full_name,
                  jobTitle: payload.job_title,
                  bio: payload.bio || "",
                  locationCity: payload.location_city || "",
                  locationCountry: payload.location_country,
                  experienceYears: payload.experience_years,
                  expectedSalaryMin: payload.expected_salary_min ?? 0,
                  expectedSalaryMax: payload.expected_salary_max ?? 0,
                  salaryCurrency: payload.salary_currency,
                  salaryNegotiable: payload.salary_negotiable,
                  phone: payload.phone || "",
                  email: payload.email || "",
                  isAvailable: payload.is_available,
                  isPublic: payload.is_public,
                }
              : item
          )
        );
      }

      setStatus("تم حفظ التعديلات بنجاح.");
      cancelEdit();
    } catch (err) {
      setStatus(String(err?.message || "تعذر حفظ التعديلات."));
    } finally {
      setSavingEdit(false);
    }
  }

  async function togglePublic(item) {
    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const next = item?.isPublic !== true;
      const { error: updateError } = await supabase.from("professional_profiles").update({ is_public: next }).eq("id", item.id);
      if (updateError) throw new Error(updateError.message || "تعذر تحديث حالة الملف.");
      if (!next) setItems((prev) => prev.filter((x) => x.id !== item.id));
      else setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isPublic: true } : x)));
      setStatus(next ? "تم إظهار الملف المهني." : "تم إخفاء الملف المهني.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر تحديث حالة الملف."));
    }
  }

  async function deleteProfile(item) {
    const ok = window.confirm(`هل تريد حذف ملف "${item.fullName || "هذا المستخدم"}" المهني؟`);
    if (!ok) return;
    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const { error: deleteError } = await supabase.from("professional_profiles").delete().eq("id", item.id);
      if (deleteError) throw new Error(deleteError.message || "تعذر حذف الملف المهني.");
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setStatus("تم حذف الملف المهني.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر حذف الملف المهني."));
    }
  }

  const visible = useMemo(() => items.filter((item) => item && item.id), [items]);

  return (
    <div dir="rtl" className="space-y-3">
      <JobsComposer onCreated={() => fetchBatch("", false)} />
      {status ? <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700">{status}</div> : null}

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل الوظائف...</div> : null}
      {!loading && error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div> : null}
      {!loading && !error && visible.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد ملفات وظيفية الآن.</div> : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((item) => {
            const pagePath = String(item?.jobPath || `/job/${item.id}`);
            const isOwner = Boolean(viewerId) && String(item?.userId || "") === viewerId;
            const isEditing = editingProfileId === item.id;
            const location = [String(item?.locationCity || "").trim(), String(item?.locationCountry || "").trim()].filter(Boolean).join("، ");

            return (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="space-y-2 p-3 text-right">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={pagePath} className="line-clamp-2 text-sm font-bold text-slate-900 hover:underline">{item.fullName || "مستخدم"}</Link>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{formatSalary(item)}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{item.jobTitle || "بدون مسمى وظيفي"}</div>
                  {item.bio ? <p className="line-clamp-2 text-xs text-slate-600">{excerpt(item.bio)}</p> : null}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {item.categoryName ? <span className="rounded-full bg-slate-100 px-2 py-1">{item.categoryName}</span> : null}
                    {location ? <span className="rounded-full bg-slate-100 px-2 py-1">{location}</span> : null}
                    <span className="rounded-full bg-slate-100 px-2 py-1">{item.isAvailable ? "متاح للعمل" : "غير متاح"}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <div className="text-[11px] text-slate-500">{formatDate(item.createdAt)}</div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => copyLink(pagePath, item.id)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">{copiedId === item.id ? "تم النسخ" : "نسخ الرابط"}</button>
                      <Link href={pagePath} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100">عرض الملف</Link>
                    </div>
                  </div>
                  {isOwner ? (
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                      <button type="button" onClick={() => beginEdit(item)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">تعديل</button>
                      <button type="button" onClick={() => togglePublic(item)} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100">{item.isPublic ? "إخفاء" : "إظهار"}</button>
                      <button type="button" onClick={() => deleteProfile(item)} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100">حذف</button>
                    </div>
                  ) : null}

                  {isEditing ? (
                    <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50/40 p-2.5">
                      <div className="text-xs font-bold text-slate-800">تعديل الملف الوظيفي</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input value={editForm.fullName} onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="الاسم الكامل" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.jobTitle} onChange={(e) => setEditForm((prev) => ({ ...prev, jobTitle: e.target.value }))} placeholder="المسمى الوظيفي" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.locationCity} onChange={(e) => setEditForm((prev) => ({ ...prev, locationCity: e.target.value }))} placeholder="المدينة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.locationCountry} onChange={(e) => setEditForm((prev) => ({ ...prev, locationCountry: e.target.value }))} placeholder="الدولة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input type="number" min="0" value={editForm.experienceYears} onChange={(e) => setEditForm((prev) => ({ ...prev, experienceYears: e.target.value }))} placeholder="سنوات الخبرة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input type="number" min="0" value={editForm.expectedSalaryMin} onChange={(e) => setEditForm((prev) => ({ ...prev, expectedSalaryMin: e.target.value }))} placeholder="أدنى راتب" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input type="number" min="0" value={editForm.expectedSalaryMax} onChange={(e) => setEditForm((prev) => ({ ...prev, expectedSalaryMax: e.target.value }))} placeholder="أعلى راتب" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.salaryCurrency} onChange={(e) => setEditForm((prev) => ({ ...prev, salaryCurrency: e.target.value.toUpperCase() }))} placeholder="العملة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="الهاتف" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="البريد" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      </div>
                      <textarea value={editForm.bio} onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))} rows={3} placeholder="نبذة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                        <label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={editForm.salaryNegotiable} onChange={(e) => setEditForm((prev) => ({ ...prev, salaryNegotiable: e.target.checked }))} /> قابل للتفاوض</label>
                        <label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={editForm.isAvailable} onChange={(e) => setEditForm((prev) => ({ ...prev, isAvailable: e.target.checked }))} /> متاح للعمل</label>
                        <label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={editForm.isPublic} onChange={(e) => setEditForm((prev) => ({ ...prev, isPublic: e.target.checked }))} /> عام</label>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">إلغاء</button>
                        <button type="button" onClick={() => saveEdit(item.id)} disabled={savingEdit} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{savingEdit ? "جارٍ الحفظ..." : "حفظ التعديلات"}</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && visible.length > 0 ? <div ref={loaderRef} className="flex items-center justify-center py-2 text-xs text-slate-500">{loadingMore ? "جارٍ تحميل المزيد..." : hasMore ? "اسحب للأسفل للمزيد" : "تم عرض كل الملفات"}</div> : null}
    </div>
  );
}