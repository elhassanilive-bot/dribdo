"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CharityComposer from "@/components/moments/CharityComposer";
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

export default function MomentsCharityFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [viewerId, setViewerId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [editingItemId, setEditingItemId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "donation",
    category: "other",
    condition: "good",
    city: "",
    country: "Morocco",
    phoneNumber: "",
    isUrgent: false,
    isAnonymous: false,
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
      const response = await fetch(`/api/moments/charity-feed?${query.toString()}`, { cache: "no-store" });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(String(json?.error || "تعذر تحميل الصدقات."));
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
      setError("تعذر تحميل الصدقات.");
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
    const url = `${window.location.origin}${path || `/charity/${id}`}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1400);
    } catch {}
  }

  function beginEdit(item) {
    setStatus("");
    setEditingItemId(item.id);
    setEditForm({
      title: String(item?.title || ""),
      description: String(item?.description || ""),
      type: String(item?.type || "donation"),
      category: String(item?.category || "other"),
      condition: String(item?.condition || "good"),
      city: String(item?.city || ""),
      country: String(item?.country || "Morocco"),
      phoneNumber: String(item?.phoneNumber || ""),
      isUrgent: item?.isUrgent === true,
      isAnonymous: item?.isAnonymous === true,
    });
  }

  function cancelEdit() {
    setEditingItemId("");
    setSavingEdit(false);
  }

  async function saveEdit(itemId) {
    setStatus("");
    const title = String(editForm.title || "").trim();
    const description = String(editForm.description || "").trim();

    if (title.length < 3 || title.length > 120) {
      setStatus("العنوان يجب أن يكون بين 3 و120 حرف.");
      return;
    }
    if (description.length < 10 || description.length > 2000) {
      setStatus("الوصف يجب أن يكون بين 10 و2000 حرف.");
      return;
    }

    setSavingEdit(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const payload = {
        title,
        description,
        type: String(editForm.type || "donation").trim() || "donation",
        category: String(editForm.category || "other").trim() || "other",
        condition: String(editForm.condition || "good").trim() || "good",
        city: String(editForm.city || "").trim(),
        country: String(editForm.country || "Morocco").trim() || "Morocco",
        phone_number: String(editForm.phoneNumber || "").trim() || null,
        is_urgent: editForm.isUrgent === true,
        is_anonymous: editForm.isAnonymous === true,
      };

      const { error: updateError } = await supabase.from("charity_items").update(payload).eq("id", itemId);
      if (updateError) throw new Error(updateError.message || "تعذر حفظ التعديلات.");

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                title: payload.title,
                description: payload.description,
                type: payload.type,
                category: payload.category,
                condition: payload.condition,
                city: payload.city,
                country: payload.country,
                phoneNumber: payload.phone_number || "",
                isUrgent: payload.is_urgent,
                isAnonymous: payload.is_anonymous,
              }
            : item
        )
      );

      setStatus("تم حفظ التعديلات بنجاح.");
      cancelEdit();
    } catch (err) {
      setStatus(String(err?.message || "تعذر حفظ التعديلات."));
    } finally {
      setSavingEdit(false);
    }
  }

  async function completeItem(item) {
    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const { error: updateError } = await supabase
        .from("charity_items")
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq("id", item.id);
      if (updateError) throw new Error(updateError.message || "تعذر تحديث حالة الصدقة.");
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setStatus("تم تعليم الحالة كمكتملة.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر تحديث حالة الصدقة."));
    }
  }

  async function deleteItem(item) {
    const ok = window.confirm(`هل تريد حذف "${item.title || "هذه الحالة"}"؟`);
    if (!ok) return;
    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const { error: deleteError } = await supabase.from("charity_items").delete().eq("id", item.id);
      if (deleteError) throw new Error(deleteError.message || "تعذر حذف الحالة.");
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setStatus("تم حذف الحالة.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر حذف الحالة."));
    }
  }

  const visible = useMemo(() => items.filter((item) => item && item.id && item.isCompleted !== true), [items]);

  return (
    <div dir="rtl" className="space-y-3">
      <CharityComposer onCreated={() => fetchBatch("", false)} />
      {status ? <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700">{status}</div> : null}

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل الصدقات...</div> : null}
      {!loading && error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div> : null}
      {!loading && !error && visible.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد حالات صدقات الآن.</div> : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((item) => {
            const pagePath = String(item?.charityPath || `/charity/${item.id}`);
            const image = Array.isArray(item?.images) ? String(item.images[0] || "") : "";
            const isOwner = Boolean(viewerId) && String(item?.userId || "") === viewerId;
            const isEditing = editingItemId === item.id;
            const location = [String(item?.city || "").trim(), String(item?.country || "").trim()].filter(Boolean).join("، ");

            return (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <Link href={pagePath} className="block">
                  {image ? <img src={image} alt={item.title || "حالة صدقة"} className="h-48 w-full object-cover" loading="lazy" /> : <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-500">بدون صورة</div>}
                </Link>

                <div className="space-y-2 p-3 text-right">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={pagePath} className="line-clamp-2 text-sm font-bold text-slate-900 hover:underline">{item.title || "صدقة"}</Link>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{item.type === "request" ? "طلب" : item.type === "urgent" ? "طارئ" : "تبرع"}</span>
                  </div>
                  {item.description ? <p className="line-clamp-2 text-xs text-slate-600">{excerpt(item.description)}</p> : null}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {item.category ? <span className="rounded-full bg-slate-100 px-2 py-1">{item.category}</span> : null}
                    {location ? <span className="rounded-full bg-slate-100 px-2 py-1">{location}</span> : null}
                    <span className="rounded-full bg-slate-100 px-2 py-1">{item.userName || "مستخدم"}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <div className="text-[11px] text-slate-500">{formatDate(item.createdAt)}</div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => copyLink(pagePath, item.id)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">{copiedId === item.id ? "تم النسخ" : "نسخ الرابط"}</button>
                      <Link href={pagePath} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100">عرض الحالة</Link>
                    </div>
                  </div>
                  {isOwner ? (
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                      <button type="button" onClick={() => beginEdit(item)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">تعديل</button>
                      <button type="button" onClick={() => completeItem(item)} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100">اكتملت</button>
                      <button type="button" onClick={() => deleteItem(item)} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100">حذف</button>
                    </div>
                  ) : null}

                  {isEditing ? (
                    <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50/40 p-2.5">
                      <div className="text-xs font-bold text-slate-800">تعديل الحالة</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="العنوان" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.city} onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="المدينة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.country} onChange={(e) => setEditForm((prev) => ({ ...prev, country: e.target.value }))} placeholder="الدولة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.phoneNumber} onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} placeholder="الهاتف" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <select value={editForm.type} onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                          <option value="donation">تبرع</option>
                          <option value="request">طلب مساعدة</option>
                          <option value="urgent">حالة طارئة</option>
                        </select>
                        <select value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                          <option value="food">طعام</option>
                          <option value="clothes">ملابس</option>
                          <option value="furniture">أثاث</option>
                          <option value="medicine">أدوية</option>
                          <option value="books">كتب</option>
                          <option value="electronics">إلكترونيات</option>
                          <option value="other">أخرى</option>
                        </select>
                        <select value={editForm.condition} onChange={(e) => setEditForm((prev) => ({ ...prev, condition: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                          <option value="new_item">جديد</option>
                          <option value="used">مستعمل</option>
                          <option value="good">جيد</option>
                          <option value="urgent">طارئ</option>
                        </select>
                      </div>
                      <textarea value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} placeholder="الوصف" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                        <label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={editForm.isUrgent} onChange={(e) => setEditForm((prev) => ({ ...prev, isUrgent: e.target.checked }))} /> مستعجل</label>
                        <label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={editForm.isAnonymous} onChange={(e) => setEditForm((prev) => ({ ...prev, isAnonymous: e.target.checked }))} /> نشر مجهول</label>
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

      {!loading && !error && visible.length > 0 ? <div ref={loaderRef} className="flex items-center justify-center py-2 text-xs text-slate-500">{loadingMore ? "جارٍ تحميل المزيد..." : hasMore ? "اسحب للأسفل للمزيد" : "تم عرض كل الحالات"}</div> : null}
    </div>
  );
}