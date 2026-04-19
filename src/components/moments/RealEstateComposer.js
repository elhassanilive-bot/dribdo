"use client";

import { useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = "media";

function asText(v) {
  return String(v || "").trim();
}

export default function RealEstateComposer({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "apartment",
    purpose: "sale",
    category: "residential",
    country: "Morocco",
    city: "",
    district: "",
    address: "",
    price: "",
    currency: "MAD",
    area: "",
    bedrooms: "0",
    bathrooms: "0",
    floors: "1",
    parkingSpaces: "0",
    contactPhone: "",
    contactWhatsapp: "",
    allowAppMessages: true,
  });

  const previews = useMemo(
    () => images.map((file) => ({ key: `${file.name}-${file.size}-${file.lastModified}`, file, url: URL.createObjectURL(file) })),
    [images]
  );

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function pickImages(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const accepted = files.filter((f) => String(f.type || "").startsWith("image/") && Number(f.size || 0) <= 15 * 1024 * 1024);
    setImages((prev) => [...prev, ...accepted].slice(0, 10));
  }

  async function uploadImages(supabase, userId, propertyId) {
    const uploaded = [];

    for (let i = 0; i < images.length; i += 1) {
      const file = images[i];
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${userId}/real_estate/${propertyId}_${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw new Error(uploadError.message || "تعذر رفع صور العقار.");

      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      const url = asText(data?.publicUrl);
      if (!url) throw new Error("تعذر إنشاء رابط صورة العقار.");
      uploaded.push(url);
    }

    return uploaded;
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const title = asText(form.title);
    const description = asText(form.description);
    const city = asText(form.city);
    const country = asText(form.country);
    const price = Number(form.price || 0);

    if (title.length < 3 || title.length > 120) return setStatus({ type: "error", message: "العنوان يجب أن يكون بين 3 و120 حرف." });
    if (description.length < 10 || description.length > 3000) return setStatus({ type: "error", message: "الوصف يجب أن يكون بين 10 و3000 حرف." });
    if (!city || !country) return setStatus({ type: "error", message: "المدينة والدولة مطلوبتان." });
    if (!Number.isFinite(price) || price < 0) return setStatus({ type: "error", message: "السعر غير صالح." });

    setSubmitting(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const { data: authData } = await supabase.auth.getUser();
      const userId = asText(authData?.user?.id);
      if (!userId) throw new Error("يجب تسجيل الدخول أولاً.");

      const payload = {
        user_id: userId,
        title,
        description,
        property_type: asText(form.propertyType) || "apartment",
        purpose: asText(form.purpose) || "sale",
        category: asText(form.category) || "residential",
        country,
        city,
        district: asText(form.district) || null,
        address: asText(form.address) || null,
        price,
        currency: asText(form.currency) || "MAD",
        area: asText(form.area) ? Number(form.area) : null,
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        floors: Number(form.floors || 1),
        parking_spaces: Number(form.parkingSpaces || 0),
        contact_phone: asText(form.contactPhone) || null,
        contact_whatsapp: asText(form.contactWhatsapp) || null,
        allow_app_messages: form.allowAppMessages === true,
      };

      const { data: inserted, error: insertError } = await supabase.from("real_estate_properties").insert(payload).select("id").single();
      if (insertError || !inserted?.id) throw new Error(insertError?.message || "تعذر نشر العقار.");

      const urls = await uploadImages(supabase, userId, inserted.id);
      if (urls.length) {
        const rows = urls.map((url, index) => ({ property_id: inserted.id, image_url: url, image_order: index, is_main: index === 0 }));
        const { error: imageError } = await supabase.from("property_images").insert(rows);
        if (imageError) throw new Error(imageError.message || "تعذر حفظ صور العقار.");
      }

      setStatus({ type: "success", message: "تم نشر العقار بنجاح." });
      setForm({
        title: "",
        description: "",
        propertyType: "apartment",
        purpose: "sale",
        category: "residential",
        country: "Morocco",
        city: "",
        district: "",
        address: "",
        price: "",
        currency: "MAD",
        area: "",
        bedrooms: "0",
        bathrooms: "0",
        floors: "1",
        parkingSpaces: "0",
        contactPhone: "",
        contactWhatsapp: "",
        allowAppMessages: true,
      });
      setImages([]);
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setStatus({ type: "error", message: String(err?.message || "تعذر نشر العقار.") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">إضافة عقار</h3>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
          {open ? "إغلاق" : "إضافة عقار"}
        </button>
      </div>

      {status.message ? (
        <div className={["mt-2 rounded-xl px-3 py-2 text-xs", status.type === "error" ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"].join(" ")}>
          {status.message}
        </div>
      ) : null}

      {open ? (
        <form className="mt-3 space-y-3" onSubmit={submit}>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="عنوان العقار" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.price} onChange={(e) => updateField("price", e.target.value)} type="number" min="0" step="0.01" placeholder="السعر" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="المدينة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="الدولة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} placeholder="وصف العقار" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={form.propertyType} onChange={(e) => updateField("propertyType", e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="apartment">شقة</option><option value="house">منزل</option><option value="villa">فيلا</option><option value="land">أرض</option><option value="shop">محل</option><option value="office">مكتب</option>
            </select>
            <select value={form.purpose} onChange={(e) => updateField("purpose", e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="sale">للبيع</option><option value="rent">للإيجار</option><option value="exchange">للتبادل</option>
            </select>
            <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="residential">سكني</option><option value="commercial">تجاري</option><option value="land">أراضي</option><option value="industrial">صناعي</option>
            </select>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.contactPhone} onChange={(e) => updateField("contactPhone", e.target.value)} placeholder="رقم الهاتف" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.contactWhatsapp} onChange={(e) => updateField("contactWhatsapp", e.target.value)} placeholder="رقم واتساب" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">صور العقار</span><button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs">إضافة صور</button></div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
            {previews.length ? (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((item, i) => (
                  <div key={item.key} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <img src={item.url} alt="صورة" className="h-20 w-full object-cover" />
                    <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="w-full border-t border-slate-200 px-2 py-1 text-[11px] text-rose-700">حذف</button>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-500">حتى 10 صور.</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">إلغاء</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{submitting ? "جارٍ النشر..." : "نشر العقار"}</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
