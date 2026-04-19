"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RealEstateComposer from "@/components/moments/RealEstateComposer";
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

function formatPrice(item) {
  const amount = Number(item?.price || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "السعر عند الاتفاق";
  const currency = String(item?.currency || "MAD").trim() || "MAD";
  return `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)} ${currency}`;
}

function excerpt(text, max = 110) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

export default function MomentsRealEstateFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [viewerId, setViewerId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [editingPropertyId, setEditingPropertyId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "MAD",
    city: "",
    country: "Morocco",
    purpose: "sale",
    propertyType: "apartment",
    category: "residential",
    contactPhone: "",
    contactWhatsapp: "",
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
      const response = await fetch(`/api/moments/real-estate-feed?${query.toString()}`, { cache: "no-store" });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(String(json?.error || "تعذر تحميل العقارات."));
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
      setError("تعذر تحميل العقارات.");
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
    const url = `${window.location.origin}${path || `/property/${id}`}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1400);
    } catch {}
  }

  function beginEdit(item) {
    setStatus("");
    setEditingPropertyId(item.id);
    setEditForm({
      title: String(item?.title || ""),
      description: String(item?.description || ""),
      price: String(item?.price ?? ""),
      currency: String(item?.currency || "MAD"),
      city: String(item?.city || ""),
      country: String(item?.country || "Morocco"),
      purpose: String(item?.purpose || "sale"),
      propertyType: String(item?.propertyType || "apartment"),
      category: String(item?.category || "residential"),
      contactPhone: String(item?.contactPhone || ""),
      contactWhatsapp: String(item?.contactWhatsapp || ""),
    });
  }

  function cancelEdit() {
    setEditingPropertyId("");
    setSavingEdit(false);
  }

  async function saveEdit(propertyId) {
    setStatus("");

    const title = String(editForm.title || "").trim();
    const description = String(editForm.description || "").trim();
    const city = String(editForm.city || "").trim();
    const country = String(editForm.country || "").trim();
    const price = Number(editForm.price || 0);

    if (title.length < 3 || title.length > 120) {
      setStatus("عنوان العقار يجب أن يكون بين 3 و120 حرف.");
      return;
    }
    if (description.length < 10 || description.length > 3000) {
      setStatus("وصف العقار يجب أن يكون بين 10 و3000 حرف.");
      return;
    }
    if (!city || !country) {
      setStatus("المدينة والدولة مطلوبتان.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setStatus("السعر غير صالح.");
      return;
    }

    setSavingEdit(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const payload = {
        title,
        description,
        price,
        currency: String(editForm.currency || "MAD").trim() || "MAD",
        city,
        country,
        purpose: String(editForm.purpose || "sale").trim() || "sale",
        property_type: String(editForm.propertyType || "apartment").trim() || "apartment",
        category: String(editForm.category || "residential").trim() || "residential",
        contact_phone: String(editForm.contactPhone || "").trim() || null,
        contact_whatsapp: String(editForm.contactWhatsapp || "").trim() || null,
      };

      const { error: updateError } = await supabase.from("real_estate_properties").update(payload).eq("id", propertyId);
      if (updateError) throw new Error(updateError.message || "تعذر حفظ التعديلات.");

      setItems((prev) =>
        prev.map((item) =>
          item.id === propertyId
            ? {
                ...item,
                title: payload.title,
                description: payload.description,
                price: payload.price,
                currency: payload.currency,
                city: payload.city,
                country: payload.country,
                purpose: payload.purpose,
                propertyType: payload.property_type,
                category: payload.category,
                contactPhone: payload.contact_phone || "",
                contactWhatsapp: payload.contact_whatsapp || "",
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

  async function hideProperty(item) {
    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const { error: updateError } = await supabase.from("real_estate_properties").update({ is_active: false }).eq("id", item.id);
      if (updateError) throw new Error(updateError.message || "تعذر إيقاف العقار.");
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setStatus("تم إيقاف العقار.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر إيقاف العقار."));
    }
  }

  async function deleteProperty(item) {
    const ok = window.confirm(`هل تريد حذف العقار "${item.title || "هذا العقار"}" نهائياً؟`);
    if (!ok) return;

    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const { error: deleteError } = await supabase.from("real_estate_properties").delete().eq("id", item.id);
      if (deleteError) throw new Error(deleteError.message || "تعذر حذف العقار.");
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setStatus("تم حذف العقار.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر حذف العقار."));
    }
  }

  const visible = useMemo(() => items.filter((item) => item && item.id), [items]);

  return (
    <div dir="rtl" className="space-y-3">
      <RealEstateComposer onCreated={() => fetchBatch("", false)} />
      {status ? <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700">{status}</div> : null}

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل العقارات...</div> : null}
      {!loading && error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div> : null}
      {!loading && !error && visible.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد عقارات متاحة الآن.</div> : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((item) => {
            const pagePath = String(item?.propertyPath || `/property/${item.id}`);
            const image = Array.isArray(item?.images) ? String(item.images[0] || "") : "";
            const isOwner = Boolean(viewerId) && String(item?.userId || "") === viewerId;
            const isEditing = editingPropertyId === item.id;
            const location = [String(item?.city || "").trim(), String(item?.country || "").trim()].filter(Boolean).join("، ");

            return (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <Link href={pagePath} className="block">
                  {image ? <img src={image} alt={item.title || "عقار"} className="h-48 w-full object-cover" loading="lazy" /> : <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-500">بدون صورة</div>}
                </Link>

                <div className="space-y-2 p-3 text-right">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={pagePath} className="line-clamp-2 text-sm font-bold text-slate-900 hover:underline">{item.title || "عقار"}</Link>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{formatPrice(item)}</span>
                  </div>
                  {item.description ? <p className="line-clamp-2 text-xs text-slate-600">{excerpt(item.description)}</p> : null}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {location ? <span className="rounded-full bg-slate-100 px-2 py-1">{location}</span> : null}
                    <span className="rounded-full bg-slate-100 px-2 py-1">{item.purpose === "rent" ? "إيجار" : item.purpose === "exchange" ? "تبادل" : "بيع"}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{item.ownerName || "مستخدم"}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <div className="text-[11px] text-slate-500">{formatDate(item.createdAt)}</div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => copyLink(pagePath, item.id)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">{copiedId === item.id ? "تم النسخ" : "نسخ الرابط"}</button>
                      <Link href={pagePath} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100">عرض العقار</Link>
                    </div>
                  </div>
                  {isOwner ? (
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                      <button type="button" onClick={() => beginEdit(item)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">تعديل</button>
                      <button type="button" onClick={() => hideProperty(item)} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100">إيقاف</button>
                      <button type="button" onClick={() => deleteProperty(item)} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100">حذف</button>
                    </div>
                  ) : null}

                  {isEditing ? (
                    <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50/40 p-2.5">
                      <div className="text-xs font-bold text-slate-800">تعديل العقار</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="العنوان" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input type="number" min="0" step="0.01" value={editForm.price} onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="السعر" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.currency} onChange={(e) => setEditForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))} placeholder="العملة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.city} onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="المدينة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.country} onChange={(e) => setEditForm((prev) => ({ ...prev, country: e.target.value }))} placeholder="الدولة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <select value={editForm.purpose} onChange={(e) => setEditForm((prev) => ({ ...prev, purpose: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                          <option value="sale">للبيع</option>
                          <option value="rent">للإيجار</option>
                          <option value="exchange">للتبادل</option>
                        </select>
                        <select value={editForm.propertyType} onChange={(e) => setEditForm((prev) => ({ ...prev, propertyType: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                          <option value="apartment">شقة</option>
                          <option value="house">منزل</option>
                          <option value="villa">فيلا</option>
                          <option value="land">أرض</option>
                          <option value="shop">محل</option>
                          <option value="office">مكتب</option>
                        </select>
                        <select value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                          <option value="residential">سكني</option>
                          <option value="commercial">تجاري</option>
                          <option value="land">أراضي</option>
                          <option value="industrial">صناعي</option>
                        </select>
                        <input value={editForm.contactPhone} onChange={(e) => setEditForm((prev) => ({ ...prev, contactPhone: e.target.value }))} placeholder="الهاتف" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                        <input value={editForm.contactWhatsapp} onChange={(e) => setEditForm((prev) => ({ ...prev, contactWhatsapp: e.target.value }))} placeholder="واتساب" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      </div>
                      <textarea value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} placeholder="الوصف" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
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

      {!loading && !error && visible.length > 0 ? <div ref={loaderRef} className="flex items-center justify-center py-2 text-xs text-slate-500">{loadingMore ? "جارٍ تحميل المزيد..." : hasMore ? "اسحب للأسفل للمزيد" : "تم عرض كل العقارات"}</div> : null}
    </div>
  );
}