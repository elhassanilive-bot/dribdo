"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

function asText(v) {
  return String(v || "").trim();
}

export default function JobsComposer({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    jobTitle: "",
    bio: "",
    categoryId: "",
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

  useEffect(() => {
    if (!open || categories.length) return;
    let active = true;

    (async () => {
      try {
        const supabase = await getSupabaseClient();
        if (!supabase || !active) return;
        const { data, error } = await supabase.from("job_categories").select("id,name_ar,name_en,sort_order").eq("is_active", true).order("sort_order", { ascending: true });
        if (error) return;
        const list = (data || []).map((row) => ({ id: asText(row?.id), name: asText(row?.name_ar || row?.name_en || "غير مصنف") }));
        if (!active) return;
        setCategories(list);
        if (!form.categoryId && list.length) setForm((prev) => ({ ...prev, categoryId: list[0].id }));
      } catch {}
    })();

    return () => {
      active = false;
    };
  }, [open, categories.length, form.categoryId]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const fullName = asText(form.fullName);
    const jobTitle = asText(form.jobTitle);
    if (fullName.length < 2) return setStatus({ type: "error", message: "الاسم الكامل مطلوب." });
    if (jobTitle.length < 2) return setStatus({ type: "error", message: "المسمى الوظيفي مطلوب." });

    setSubmitting(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");
      const { data: authData } = await supabase.auth.getUser();
      const userId = asText(authData?.user?.id);
      if (!userId) throw new Error("يجب تسجيل الدخول أولاً.");

      const payload = {
        user_id: userId,
        full_name: fullName,
        job_title: jobTitle,
        bio: asText(form.bio) || null,
        category_id: asText(form.categoryId) || null,
        location_city: asText(form.locationCity) || null,
        location_country: asText(form.locationCountry) || "Morocco",
        experience_years: Number(form.experienceYears || 0),
        expected_salary_min: asText(form.expectedSalaryMin) ? Number(form.expectedSalaryMin) : null,
        expected_salary_max: asText(form.expectedSalaryMax) ? Number(form.expectedSalaryMax) : null,
        salary_currency: asText(form.salaryCurrency) || "MAD",
        salary_negotiable: form.salaryNegotiable === true,
        phone: asText(form.phone) || null,
        email: asText(form.email) || null,
        is_available: form.isAvailable === true,
        is_public: form.isPublic === true,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase.from("professional_profiles").select("id").eq("user_id", userId).maybeSingle();

      if (existing?.id) {
        const { error } = await supabase.from("professional_profiles").update(payload).eq("user_id", userId);
        if (error) throw new Error(error.message || "تعذر تحديث الملف المهني.");
      } else {
        const { error } = await supabase.from("professional_profiles").insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw new Error(error.message || "تعذر نشر الملف المهني.");
      }

      setStatus({ type: "success", message: "تم حفظ ملف الوظيفة بنجاح." });
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setStatus({ type: "error", message: String(err?.message || "تعذر حفظ الملف المهني.") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">إضافة ملف وظيفي</h3>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">{open ? "إغلاق" : "إضافة وظيفة"}</button>
      </div>

      {status.message ? <div className={["mt-2 rounded-xl px-3 py-2 text-xs", status.type === "error" ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"].join(" ")}>{status.message}</div> : null}

      {open ? (
        <form className="mt-3 space-y-2" onSubmit={submit}>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="الاسم الكامل" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} placeholder="المسمى الوظيفي" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <select value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">بدون فئة</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <input value={form.locationCity} onChange={(e) => updateField("locationCity", e.target.value)} placeholder="المدينة" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)} rows={3} placeholder="نبذة مختصرة" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={form.expectedSalaryMin} onChange={(e) => updateField("expectedSalaryMin", e.target.value)} type="number" min="0" placeholder="الحد الأدنى للراتب" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.expectedSalaryMax} onChange={(e) => updateField("expectedSalaryMax", e.target.value)} type="number" min="0" placeholder="الحد الأعلى للراتب" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.salaryCurrency} onChange={(e) => updateField("salaryCurrency", e.target.value.toUpperCase())} placeholder="العملة" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="الهاتف" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="البريد الإلكتروني" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <label><input type="checkbox" checked={form.salaryNegotiable} onChange={(e) => updateField("salaryNegotiable", e.target.checked)} /> الراتب قابل للتفاوض</label>
            <label><input type="checkbox" checked={form.isAvailable} onChange={(e) => updateField("isAvailable", e.target.checked)} /> متاح للعمل</label>
            <label><input type="checkbox" checked={form.isPublic} onChange={(e) => updateField("isPublic", e.target.checked)} /> عام</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">إلغاء</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{submitting ? "جارٍ الحفظ..." : "حفظ"}</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
