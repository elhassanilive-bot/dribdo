"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MarketProductComposer from "@/components/moments/MarketProductComposer";
import { getSupabaseClient } from "@/lib/supabase/client";

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function formatPrice(product) {
  if (product?.isFree) return "مجاني";
  const amount = Number(product?.price || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "السعر عند الاتفاق";
  const currency = String(product?.currency || "MAD").trim() || "MAD";
  const value = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
  return `${value} ${currency}`;
}

function pickImage(product) {
  const list = Array.isArray(product?.images) ? product.images : [];
  const first = list.find((url) => String(url || "").trim());
  return first ? String(first).trim() : "";
}

function excerpt(text, max = 120) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

const MEDIA_BUCKET = "media";
const MAX_EDIT_IMAGES = 8;
const MAX_EDIT_IMAGE_SIZE = 8 * 1024 * 1024;

export default function MomentsMarketFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [copiedId, setCopiedId] = useState("");
  const [viewerId, setViewerId] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editNewImages, setEditNewImages] = useState([]);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "MAD",
    city: "",
    country: "Morocco",
    condition: "used",
    status: "active",
    isNegotiable: false,
    isFree: false,
    isExchange: false,
  });

  const loaderRef = useRef(null);
  const editFileInputRef = useRef(null);

  const editNewPreviewUrls = useMemo(
    () => editNewImages.map((file) => ({ key: `${file.name}-${file.size}-${file.lastModified}`, file, url: URL.createObjectURL(file) })),
    [editNewImages]
  );

  useEffect(() => {
    return () => {
      editNewPreviewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [editNewPreviewUrls]);

  const fetchBatch = useCallback(async (nextCursor = "", append = false) => {
    if (!append && !nextCursor) {
      setLoading(true);
      setError("");
      setItems([]);
      setCursor("");
      setHasMore(true);
    }

    try {
      const query = new URLSearchParams({ limit: "12" });
      if (nextCursor) query.set("cursor", nextCursor);
      const response = await fetch(`/api/moments/market-feed?${query.toString()}`, { cache: "no-store" });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(String(json?.error || "تعذر تحميل منتجات السوق."));
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
      setError("تعذر تحميل منتجات السوق.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBatch("", false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBatch]);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase || !active) return;
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setViewerId(String(data?.user?.id || ""));
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
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [loadMore]);

  async function copyProductLink(path, productId) {
    const url = `${window.location.origin}${path || `/product/${productId}`}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(productId);
      setTimeout(() => setCopiedId(""), 1400);
    } catch {}
  }

  function beginEdit(product) {
    setStatus("");
    setEditingProductId(product.id);
    setEditExistingImages(Array.isArray(product?.images) ? product.images.filter((url) => String(url || "").trim()) : []);
    setEditNewImages([]);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
    setEditForm({
      title: String(product?.title || ""),
      description: String(product?.description || ""),
      price: String(product?.price ?? ""),
      currency: String(product?.currency || "MAD"),
      city: String(product?.city || ""),
      country: String(product?.country || "Morocco"),
      condition: String(product?.condition || "used"),
      status: String(product?.status || "active"),
      isNegotiable: product?.isNegotiable === true,
      isFree: product?.isFree === true,
      isExchange: product?.isExchange === true,
    });
  }

  function cancelEdit() {
    setEditingProductId("");
    setSavingEdit(false);
    setEditExistingImages([]);
    setEditNewImages([]);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  }

  function handlePickEditImages(event) {
    const picked = Array.from(event.target?.files || []);
    event.target.value = "";
    if (!picked.length) return;

    const room = Math.max(0, MAX_EDIT_IMAGES - (editExistingImages.length + editNewImages.length));
    if (room <= 0) {
      setStatus(`الحد الأقصى للصور هو ${MAX_EDIT_IMAGES}.`);
      return;
    }

    const accepted = [];
    for (const file of picked) {
      if (accepted.length >= room) break;
      if (!String(file?.type || "").startsWith("image/")) {
        setStatus("بعض الملفات ليست صوراً وتم تجاهلها.");
        continue;
      }
      if (Number(file?.size || 0) > MAX_EDIT_IMAGE_SIZE) {
        setStatus("بعض الصور أكبر من 8MB وتم تجاهلها.");
        continue;
      }
      accepted.push(file);
    }

    if (!accepted.length) return;
    setStatus("");
    setEditNewImages((prev) => [...prev, ...accepted]);
  }

  function removeExistingEditImage(index) {
    setEditExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewEditImage(index) {
    setEditNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadEditNewImages(supabase, userId) {
    if (!editNewImages.length) return [];

    const uploads = [];
    for (let i = 0; i < editNewImages.length; i += 1) {
      const file = editNewImages[i];
      const ext = String(file?.name || "").includes(".") ? String(file.name).split(".").pop().toLowerCase() : "jpg";
      const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext : "jpg";
      const path = `${userId}/marketplace/${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file?.type || undefined,
      });

      if (uploadError) {
        throw new Error(uploadError.message || "تعذر رفع صور المنتج.");
      }

      const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      const publicUrl = String(publicData?.publicUrl || "").trim();
      if (publicUrl) uploads.push(publicUrl);
    }

    return uploads;
  }

  async function saveEdit(productId) {
    setStatus("");
    const title = String(editForm.title || "").trim();
    const description = String(editForm.description || "").trim();

    if (title.length < 3 || title.length > 100) {
      setStatus("عنوان المنتج يجب أن يكون بين 3 و 100 حرف.");
      return;
    }
    if (description.length < 10 || description.length > 2000) {
      setStatus("وصف المنتج يجب أن يكون بين 10 و 2000 حرف.");
      return;
    }
    if (!String(editForm.city || "").trim()) {
      setStatus("المدينة مطلوبة.");
      return;
    }

    const totalImages = editExistingImages.length + editNewImages.length;
    if (totalImages > MAX_EDIT_IMAGES) {
      setStatus(`الحد الأقصى للصور هو ${MAX_EDIT_IMAGES}.`);
      return;
    }

    const price = editForm.isFree ? 0 : Number(editForm.price || 0);
    if (!Number.isFinite(price) || price < 0) {
      setStatus("السعر غير صالح.");
      return;
    }

    setSavingEdit(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) throw new Error("يجب تسجيل الدخول لإكمال التعديل.");
      const userId = String(authData.user.id);

      const uploadedNewImages = await uploadEditNewImages(supabase, userId);
      const mergedImages = [...editExistingImages, ...uploadedNewImages].filter((url) => String(url || "").trim()).slice(0, MAX_EDIT_IMAGES);

      const payload = {
        title,
        description,
        price,
        currency: String(editForm.currency || "MAD").trim() || "MAD",
        city: String(editForm.city || "").trim(),
        country: String(editForm.country || "Morocco").trim() || "Morocco",
        condition: String(editForm.condition || "used").trim() || "used",
        status: String(editForm.status || "active").trim() || "active",
        is_negotiable: editForm.isNegotiable === true,
        is_free: editForm.isFree === true,
        is_exchange: editForm.isExchange === true,
        images: mergedImages,
      };

      const { error: updateError } = await supabase.from("marketplace_products").update(payload).eq("id", productId);
      if (updateError) throw new Error(updateError.message || "تعذر حفظ التعديلات.");

      setItems((prev) =>
        prev.map((item) =>
          item.id === productId
            ? {
                ...item,
                title: payload.title,
                description: payload.description,
                price: payload.price,
                currency: payload.currency,
                city: payload.city,
                country: payload.country,
                condition: payload.condition,
                status: payload.status,
                isNegotiable: payload.is_negotiable,
                isFree: payload.is_free,
                isExchange: payload.is_exchange,
                images: payload.images,
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

  async function updateProductStatus(product, nextStatus) {
    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const { error: updateError } = await supabase.from("marketplace_products").update({ status: nextStatus }).eq("id", product.id);
      if (updateError) throw new Error(updateError.message || "تعذر تحديث حالة المنتج.");

      if (nextStatus !== "active") {
        setItems((prev) => prev.filter((item) => item.id !== product.id));
      } else {
        setItems((prev) => prev.map((item) => (item.id === product.id ? { ...item, status: nextStatus } : item)));
      }

      setStatus(nextStatus === "sold" ? "تم تعليم المنتج كمباع." : "تم إيقاف المنتج.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر تحديث حالة المنتج."));
    }
  }

  async function deleteProduct(product) {
    const ok = window.confirm(`هل تريد حذف المنتج "${product.title || "هذا المنتج"}" نهائياً؟`);
    if (!ok) return;

    setStatus("");
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const { error: deleteError } = await supabase.from("marketplace_products").delete().eq("id", product.id);
      if (deleteError) throw new Error(deleteError.message || "تعذر حذف المنتج.");

      setItems((prev) => prev.filter((item) => item.id !== product.id));
      setStatus("تم حذف المنتج.");
    } catch (err) {
      setStatus(String(err?.message || "تعذر حذف المنتج."));
    }
  }

  const visible = useMemo(() => items.filter((item) => item && item.id), [items]);

  return (
    <div dir="rtl" className="space-y-3">
      <MarketProductComposer
        onCreated={() => {
          fetchBatch("", false);
        }}
      />

      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700">{status}</div>
      ) : null}

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">جارٍ تحميل منتجات السوق...</div> : null}
      {!loading && error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">{error}</div> : null}
      {!loading && !error && visible.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-600">لا توجد منتجات متاحة الآن.</div> : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((product) => {
            const pagePath = String(product?.productPath || `/product/${product.id}`);
            const image = pickImage(product);
            const title = String(product?.title || "منتج").trim() || "منتج";
            const location = [String(product?.city || "").trim(), String(product?.country || "").trim()].filter(Boolean).join("، ");
            const isOwner = Boolean(viewerId) && String(product?.userId || "") === viewerId;
            const isEditing = editingProductId === product.id;

            return (
              <article key={product.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <Link href={pagePath} className="block">
                  {image ? (
                    <img src={image} alt={title} className="h-48 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500">بدون صورة</div>
                  )}
                </Link>

                <div className="space-y-2 p-3 text-right">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={pagePath} className="line-clamp-2 text-sm font-bold text-slate-900 hover:underline">
                      {title}
                    </Link>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{formatPrice(product)}</span>
                  </div>

                  {product?.description ? <p className="line-clamp-2 text-xs text-slate-600">{excerpt(product.description, 110)}</p> : null}

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    {product?.categoryName ? <span className="rounded-full bg-slate-100 px-2 py-1">{product.categoryName}</span> : null}
                    {location ? <span className="rounded-full bg-slate-100 px-2 py-1">{location}</span> : null}
                    {product?.sellerName ? <span className="rounded-full bg-slate-100 px-2 py-1">البائع: {product.sellerName}</span> : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                    <div className="text-[11px] text-slate-500">{formatDate(product?.createdAt)}</div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyProductLink(pagePath, product.id)}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {copiedId === product.id ? "تم النسخ" : "نسخ الرابط"}
                      </button>
                      <Link href={pagePath} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100">
                        عرض المنتج
                      </Link>
                    </div>
                  </div>

                  {isOwner ? (
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => beginEdit(product)}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProductStatus(product, "sold")}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        تم البيع
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProductStatus(product, "inactive")}
                        className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                      >
                        إيقاف
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        حذف
                      </button>
                    </div>
                  ) : null}

                  {isEditing ? (
                    <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50/40 p-2.5">
                      <div className="text-xs font-bold text-slate-800">تعديل المنتج</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="العنوان"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                          disabled={editForm.isFree}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                          placeholder="السعر"
                        />
                        <input
                          value={editForm.currency}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="العملة"
                        />
                        <input
                          value={editForm.city}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="المدينة"
                        />
                        <input
                          value={editForm.country}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, country: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="الدولة"
                        />
                        <select
                          value={editForm.condition}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, condition: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        >
                          <option value="new">جديد</option>
                          <option value="used">مستعمل</option>
                          <option value="refurbished">مجدّد</option>
                        </select>
                      </div>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="الوصف"
                      />

                      <div className="space-y-2 rounded-xl border border-slate-200 bg-white/70 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-semibold text-slate-700">صور المنتج ({editExistingImages.length + editNewImages.length}/{MAX_EDIT_IMAGES})</div>
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            إضافة صور
                          </button>
                          <input ref={editFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePickEditImages} />
                        </div>

                        {editExistingImages.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold text-slate-600">الصور الحالية</div>
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                              {editExistingImages.map((url, index) => (
                                <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                  <img src={url} alt="صورة المنتج" className="h-16 w-full object-cover" loading="lazy" />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingEditImage(index)}
                                    className="absolute left-1 top-1 rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white"
                                  >
                                    حذف
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {editNewPreviewUrls.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold text-slate-600">صور جديدة (لم تُحفظ بعد)</div>
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                              {editNewPreviewUrls.map((item, index) => (
                                <div key={item.key} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                  <img src={item.url} alt="معاينة صورة" className="h-16 w-full object-cover" loading="lazy" />
                                  <button
                                    type="button"
                                    onClick={() => removeNewEditImage(index)}
                                    className="absolute left-1 top-1 rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white"
                                  >
                                    حذف
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <p className="text-[11px] text-slate-500">يمكنك رفع حتى {MAX_EDIT_IMAGES} صور. الحجم الأقصى للصورة الواحدة 8MB.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                        <label className="inline-flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={editForm.isNegotiable}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, isNegotiable: e.target.checked }))}
                          />
                          قابل للتفاوض
                        </label>
                        <label className="inline-flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={editForm.isFree}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, isFree: e.target.checked }))}
                          />
                          مجاني
                        </label>
                        <label className="inline-flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={editForm.isExchange}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, isExchange: e.target.checked }))}
                          />
                          مقايضة
                        </label>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(product.id)}
                          disabled={savingEdit}
                          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {savingEdit ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <div ref={loaderRef} className="flex items-center justify-center py-2 text-xs text-slate-500">
          {loadingMore ? "جارٍ تحميل المزيد..." : hasMore ? "اسحب للأسفل للمزيد" : "تم عرض كل المنتجات"}
        </div>
      ) : null}
    </div>
  );
}
