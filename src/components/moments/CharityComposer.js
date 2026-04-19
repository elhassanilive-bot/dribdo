"use client";

import { useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = "media";

function asText(v) {
  return String(v || "").trim();
}

export default function CharityComposer({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "donation",
    category: "other",
    condition: "good",
    deliveryMethod: "hand",
    city: "",
    country: "Morocco",
    phoneNumber: "",
    isUrgent: false,
    isAnonymous: false,
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
    const accepted = files.filter((f) => String(f.type || "").startsWith("image/") && Number(f.size || 0) <= 12 * 1024 * 1024);
    setImages((prev) => [...prev, ...accepted].slice(0, 8));
  }

  async function uploadImages(supabase, userId) {
    const urls = [];
    for (let i = 0; i < images.length; i += 1) {
      const file = images[i];
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${userId}/charity/${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw new Error(uploadError.message || "تعذر رفع صور الصدقة.");

      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      const url = asText(data?.publicUrl);
      if (url) urls.push(url);
    }
    return urls;
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const title = asText(form.title);
    const description = asText(form.description);
    if (title.length < 3 || title.length > 120) return setStatus({ type: "error", message: "العنوان يجب أن يكون بين 3 و120 حرف." });
    if (description.length < 10 || description.length > 2000) return setStatus({ type: "error", message: "الوصف يجب أن يكون بين 10 و2000 حرف." });

    setSubmitting(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const { data: authData } = await supabase.auth.getUser();
      const userId = asText(authData?.user?.id);
      if (!userId) throw new Error("يجب تسجيل الدخول أولاً.");

      const imageUrls = await uploadImages(supabase, userId);
      const payload = {
        user_id: userId,
        title,
        description,
        type: asText(form.type) || "donation",
        category: asText(form.category) || "other",
        condition: asText(form.condition) || "good",
        delivery_method: asText(form.deliveryMethod) || "hand",
        city: asText(form.city),
        country: asText(form.country) || "Morocco",
        phone_number: asText(form.phoneNumber) || null,
        images: imageUrls,
        is_urgent: form.isUrgent === true,
        is_anonymous: form.isAnonymous === true,
      };

      const { error } = await supabase.from("charity_items").insert(payload);
      if (error) throw new Error(error.message || "تعذر نشر الصدقة.");

      setStatus({ type: "success", message: "تم نشر الصدقة بنجاح." });
      setImages([]);
      setForm({
        title: "",
        description: "",
        type: "donation",
        category: "other",
        condition: "good",
        deliveryMethod: "hand",
        city: "",
        country: "Morocco",
        phoneNumber: "",
        isUrgent: false,
        isAnonymous: false,
      });
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setStatus({ type: "error", message: String(err?.message || "تعذر نشر الصدقة.") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">إضافة صدقة</h3>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">{open ? "إغلاق" : "إضافة صدقة"}</button>
      </div>

      {status.message ? <div className={["mt-2 rounded-xl px-3 py-2 text-xs", status.type === "error" ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"].join(" ")}>{status.message}</div> : null}

      {open ? (
        <form className="mt-3 space-y-2" onSubmit={submit}>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="عنوان الصدقة" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="المدينة" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} placeholder="الوصف" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={form.type} onChange={(e) => updateField("type", e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="donation">تبرع</option><option value="request">طلب مساعدة</option><option value="urgent">حالة طارئة</option></select>
            <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="food">طعام</option><option value="clothes">ملابس</option><option value="furniture">أثاث</option><option value="medicine">أدوية</option><option value="books">كتب</option><option value="electronics">إلكترونيات</option><option value="other">أخرى</option></select>
            <select value={form.condition} onChange={(e) => updateField("condition", e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="new_item">جديد</option><option value="used">مستعمل</option><option value="good">جيد</option><option value="urgent">طارئ</option></select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} placeholder="رقم الهاتف" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="الدولة" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <label><input type="checkbox" checked={form.isUrgent} onChange={(e) => updateField("isUrgent", e.target.checked)} /> مستعجل</label>
            <label><input type="checkbox" checked={form.isAnonymous} onChange={(e) => updateField("isAnonymous", e.target.checked)} /> نشر مجهول</label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">صور الصدقة</span><button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs">إضافة صور</button></div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
            {previews.length ? <div className="grid grid-cols-4 gap-2">{previews.map((item, i) => <div key={item.key} className="overflow-hidden rounded-lg border border-slate-200 bg-white"><img src={item.url} alt="صورة" className="h-20 w-full object-cover" /><button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="w-full border-t border-slate-200 px-2 py-1 text-[11px] text-rose-700">حذف</button></div>)}</div> : <p className="text-xs text-slate-500">حتى 8 صور.</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">إلغاء</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{submitting ? "جارٍ النشر..." : "نشر"}</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
