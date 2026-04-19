"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = "media";

function asText(value) {
  return String(value || "").trim();
}

function splitList(value) {
  return asText(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const PAYMENT_OPTIONS = ["نقداً", "تحويل بنكي", "الدفع عند الاستلام", "محفظة رقمية"];

export default function MarketProductComposer({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "",
    currency: "MAD",
    isNegotiable: false,
    isFree: false,
    isExchange: false,
    city: "",
    country: "Morocco",
    condition: "used",
    videoUrl: "",
    brand: "",
    address: "",
    quantity: "1",
    sellerType: "individual",
    deliveryMethod: "",
    deliveryCost: "",
    contactMethod: "chat",
    phoneEnabled: true,
    whatsappEnabled: true,
    chatEnabled: true,
    phoneNumber: "",
    whatsappNumber: "",
    paymentMethodsText: "",
    customFieldsText: "",
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    let active = true;

    (async () => {
      setLoadingCategories(true);
      try {
        const supabase = await getSupabaseClient();
        if (!supabase) {
          if (active) setStatus({ type: "error", message: "تعذر الاتصال بقاعدة البيانات." });
          return;
        }

        const { data, error } = await supabase
          .from("product_categories")
          .select("id,name_ar,name_en,parent_id,sort_order")
          .order("sort_order", { ascending: true })
          .limit(300);

        if (error) {
          if (active) setStatus({ type: "error", message: error.message || "تعذر تحميل فئات السوق." });
          return;
        }

        if (active) {
          const list = (data || []).map((row) => ({
            id: String(row?.id || ""),
            name: asText(row?.name_ar || row?.name_en || "غير مصنف"),
            parentId: asText(row?.parent_id),
            sortOrder: Number(row?.sort_order || 0),
          }));
          setCategories(list);
          if (!form.categoryId && list.length) {
            const topLevel = list.find((item) => !item.parentId) || list[0];
            setForm((prev) => ({ ...prev, categoryId: topLevel.id }));
          }
        }
      } catch {
        if (active) setStatus({ type: "error", message: "تعذر تحميل فئات السوق." });
      } finally {
        if (active) setLoadingCategories(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, categories.length, form.categoryId]);

  const previewUrls = useMemo(
    () => images.map((file) => ({ key: `${file.name}-${file.size}-${file.lastModified}`, url: URL.createObjectURL(file), name: file.name })),
    [images]
  );

  useEffect(() => {
    return () => {
      for (const item of previewUrls) URL.revokeObjectURL(item.url);
    };
  }, [previewUrls]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePickImages(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const accepted = [];
    for (const file of files) {
      if (!String(file.type || "").startsWith("image/")) continue;
      if (file.size > 15 * 1024 * 1024) continue;
      accepted.push(file);
    }

    setImages((prev) => {
      const merged = [...prev, ...accepted];
      return merged.slice(0, 8);
    });
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(supabase, userId) {
    const uploaded = [];

    for (let index = 0; index < images.length; index += 1) {
      const file = images[index];
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${userId}/marketplace/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext || "bin"}`;

      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (uploadError) {
        throw new Error(uploadError.message || `تعذر رفع ${file.name}`);
      }

      const { data: urlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      const publicUrl = asText(urlData?.publicUrl);
      if (!publicUrl) {
        throw new Error("تعذر إنشاء رابط صورة المنتج.");
      }

      uploaded.push(publicUrl);
    }

    return uploaded;
  }

  function validate() {
    const title = asText(form.title);
    const description = asText(form.description);
    const categoryId = asText(form.categoryId);
    const city = asText(form.city);

    if (title.length < 3 || title.length > 100) {
      return "عنوان المنتج يجب أن يكون بين 3 و 100 حرف.";
    }
    if (description.length < 10 || description.length > 2000) {
      return "وصف المنتج يجب أن يكون بين 10 و 2000 حرف.";
    }
    if (!categoryId) return "اختر فئة المنتج.";
    if (!city) return "المدينة مطلوبة.";

    if (!form.isFree) {
      const priceValue = Number(form.price || 0);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        return "السعر غير صالح.";
      }
    }

    const qty = Number(form.quantity || 1);
    if (!Number.isInteger(qty) || qty <= 0) {
      return "الكمية يجب أن تكون رقماً صحيحاً أكبر من 0.";
    }

    const deliveryCost = asText(form.deliveryCost);
    if (deliveryCost) {
      const n = Number(deliveryCost);
      if (!Number.isFinite(n) || n < 0) {
        return "تكلفة التوصيل يجب أن تكون قيمة موجبة أو صفر.";
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const validationError = validate();
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setSubmitting(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) throw new Error("يجب تسجيل الدخول أولاً لإضافة منتج.");

      const uploadedImages = await uploadImages(supabase, user.id);

      let customFields = {};
      const customRaw = asText(form.customFieldsText);
      if (customRaw) {
        try {
          const parsed = JSON.parse(customRaw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            customFields = parsed;
          }
        } catch {
          throw new Error("حقل JSON للخصائص الإضافية غير صالح.");
        }
      }

      const paymentMethods = splitList(form.paymentMethodsText);
      const priceValue = form.isFree ? 0 : Number(form.price || 0);
      const quantityValue = Number(form.quantity || 1);
      const deliveryCostValue = asText(form.deliveryCost) ? Number(form.deliveryCost) : null;

      const payload = {
        user_id: user.id,
        category_id: asText(form.categoryId),
        title: asText(form.title),
        description: asText(form.description),
        price: priceValue,
        currency: asText(form.currency) || "MAD",
        is_negotiable: form.isNegotiable === true,
        is_free: form.isFree === true,
        is_exchange: form.isExchange === true,
        city: asText(form.city),
        country: asText(form.country) || "Morocco",
        condition: asText(form.condition) || "used",
        status: "active",
        images: uploadedImages,
        video_url: asText(form.videoUrl) || null,
        phone_enabled: form.phoneEnabled === true,
        whatsapp_enabled: form.whatsappEnabled === true,
        chat_enabled: form.chatEnabled === true,
        phone_number: asText(form.phoneNumber) || null,
        whatsapp_number: asText(form.whatsappNumber) || null,
        custom_fields: customFields,
        brand: asText(form.brand) || null,
        address: asText(form.address) || null,
        quantity: quantityValue,
        seller_type: asText(form.sellerType) || null,
        delivery_method: asText(form.deliveryMethod) || null,
        delivery_cost: deliveryCostValue,
        payment_methods: paymentMethods.length ? paymentMethods : null,
        contact_method: asText(form.contactMethod) || null,
      };

      const { data: inserted, error } = await supabase.from("marketplace_products").insert(payload).select("id").single();
      if (error || !inserted?.id) {
        throw new Error(error?.message || "تعذر نشر المنتج.");
      }

      setImages([]);
      setForm({
        title: "",
        description: "",
        categoryId: categories[0]?.id || "",
        price: "",
        currency: "MAD",
        isNegotiable: false,
        isFree: false,
        isExchange: false,
        city: "",
        country: "Morocco",
        condition: "used",
        videoUrl: "",
        brand: "",
        address: "",
        quantity: "1",
        sellerType: "individual",
        deliveryMethod: "",
        deliveryCost: "",
        contactMethod: "chat",
        phoneEnabled: true,
        whatsappEnabled: true,
        chatEnabled: true,
        phoneNumber: "",
        whatsappNumber: "",
        paymentMethodsText: "",
        customFieldsText: "",
      });
      setStatus({ type: "success", message: "تم نشر المنتج بنجاح في السوق." });
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setStatus({ type: "error", message: String(err?.message || "تعذر نشر المنتج.") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">نشر منتج جديد</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          {open ? "إغلاق" : "إضافة منتج"}
        </button>
      </div>

      {status.message ? (
        <div className={[
          "mt-3 rounded-xl px-3 py-2 text-xs",
          status.type === "error" ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700",
        ].join(" ")}>
          {status.message}
        </div>
      ) : null}

      {open ? (
        <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">عنوان المنتج</span>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} required minLength={3} maxLength={100} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>

            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">الفئة</span>
              <select value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1 text-xs block">
            <span className="font-semibold text-slate-700">الوصف</span>
            <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} required minLength={10} maxLength={2000} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">السعر</span>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => updateField("price", e.target.value)} disabled={form.isFree} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">العملة</span>
              <input value={form.currency} onChange={(e) => updateField("currency", e.target.value.toUpperCase())} maxLength={8} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">الحالة</span>
              <select value={form.condition} onChange={(e) => updateField("condition", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="new">جديد</option>
                <option value="used">مستعمل</option>
                <option value="refurbished">مجدّد</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">المدينة</span>
              <input value={form.city} onChange={(e) => updateField("city", e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">الدولة</span>
              <input value={form.country} onChange={(e) => updateField("country", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">العلامة التجارية</span>
              <input value={form.brand} onChange={(e) => updateField("brand", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">الكمية</span>
              <input type="number" min="1" step="1" value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">نوع البائع</span>
              <select value={form.sellerType} onChange={(e) => updateField("sellerType", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="individual">فرد</option>
                <option value="store">متجر</option>
                <option value="company">شركة</option>
              </select>
            </label>
          </div>

          <label className="space-y-1 text-xs block">
            <span className="font-semibold text-slate-700">العنوان التفصيلي</span>
            <input value={form.address} onChange={(e) => updateField("address", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">طريقة التوصيل</span>
              <input value={form.deliveryMethod} onChange={(e) => updateField("deliveryMethod", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">تكلفة التوصيل</span>
              <input type="number" min="0" step="0.01" value={form.deliveryCost} onChange={(e) => updateField("deliveryCost", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700">طريقة التواصل</span>
              <select value={form.contactMethod} onChange={(e) => updateField("contactMethod", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="chat">دردشة</option>
                <option value="phone">اتصال</option>
                <option value="whatsapp">واتساب</option>
                <option value="all">الكل</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-2 text-xs font-semibold text-slate-700">خيارات البيع</div>
            <div className="grid gap-2 sm:grid-cols-3 text-xs">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isNegotiable} onChange={(e) => updateField("isNegotiable", e.target.checked)} /> قابل للتفاوض</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isFree} onChange={(e) => updateField("isFree", e.target.checked)} /> مجاني</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isExchange} onChange={(e) => updateField("isExchange", e.target.checked)} /> متاح للمقايضة</label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-2 text-xs font-semibold text-slate-700">قنوات التواصل</div>
            <div className="grid gap-2 sm:grid-cols-3 text-xs">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.chatEnabled} onChange={(e) => updateField("chatEnabled", e.target.checked)} /> دردشة</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.phoneEnabled} onChange={(e) => updateField("phoneEnabled", e.target.checked)} /> اتصال</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.whatsappEnabled} onChange={(e) => updateField("whatsappEnabled", e.target.checked)} /> واتساب</label>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input placeholder="رقم الهاتف" value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input placeholder="رقم واتساب" value={form.whatsappNumber} onChange={(e) => updateField("whatsappNumber", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs block">
              <span className="font-semibold text-slate-700">وسائل الدفع (مفصولة بفاصلة)</span>
              <input
                value={form.paymentMethodsText}
                onChange={(e) => updateField("paymentMethodsText", e.target.value)}
                placeholder={PAYMENT_OPTIONS.join(", ")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs block">
              <span className="font-semibold text-slate-700">رابط فيديو المنتج (اختياري)</span>
              <input value={form.videoUrl} onChange={(e) => updateField("videoUrl", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="space-y-1 text-xs block">
            <span className="font-semibold text-slate-700">خصائص إضافية JSON (اختياري)</span>
            <textarea value={form.customFieldsText} onChange={(e) => updateField("customFieldsText", e.target.value)} rows={2} placeholder='{"color":"red","size":"L"}' className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">صور المنتج</div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                إضافة صور
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePickImages} />

            {images.length ? (
              <div className="grid gap-2 sm:grid-cols-4">
                {previewUrls.map((item, index) => (
                  <div key={item.key} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <img src={item.url} alt={item.name} className="h-24 w-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="w-full border-t border-slate-200 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500">يمكنك رفع حتى 8 صور (الحد الأقصى 15MB للصورة).</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">إلغاء</button>
            <button type="submit" disabled={submitting || loadingCategories} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? "جارٍ النشر..." : "نشر المنتج"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
