"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import BlogEditorField from "@/components/blog/BlogEditorField";
import { createSlugCandidate } from "@/lib/blog/slug";

const initialState = {
  ok: false,
  error: "",
  slug: "",
  title: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-w-40 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "جارٍ نشر المقال..." : "نشر المقال"}
    </button>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-5 backdrop-blur">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

export default function AdminBlogDashboard({
  action,
  publishingEnabled,
  requiresToken,
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [title, setTitle] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [manualSlug, setManualSlug] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const slug = manualSlug ? slugInput : createSlugCandidate(title);

  const tagsPreview = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),
    [tagsInput]
  );

  const titleWords = useMemo(
    () => title.trim().split(/\s+/).filter(Boolean).length,
    [title]
  );

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#f8fafc_100%)] shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.9fr] lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-white/75 px-4 py-2 text-xs font-semibold text-orange-700 backdrop-blur">
              Dribdo Editorial Desk
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              لوحة نشر مقالات احترافية قابلة للتوسّع إلى منصة أخبار كاملة
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              اكتب، راجع، وانشر مباشرة إلى Supabase مع رابط مختصر ذكي، دعم Markdown، وتجربة إدارة مصممة
              لتكون سريعة وواضحة على الموبايل والديسكتوب.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                معاينة المدونة العامة
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-2xl border border-transparent px-5 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                الرجوع إلى لوحة الأدمن
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <StatCard label="وضع النشر" value={publishingEnabled ? "جاهز" : "يحتاج RLS"} hint="المنشورات تُرسل مباشرة إلى Supabase" />
            <StatCard label="الرابط المختصر" value={slug || "سيُولد تلقائيًا"} hint="يُمنع التكرار بإضافة لاحقة رقمية عند الحاجة" />
            <StatCard label="الوسوم" value={tagsPreview.length || 0} hint="أدخلها مفصولة بفواصل لبناء تصنيفات مستقبلية" />
          </div>
        </div>
      </section>

      {!publishingEnabled ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-950">
          النشر المباشر يحتاج سياسات `insert` في Supabase. يمكنك استخدام
          {" "}
          <code>supabase/blog_temp_publishing.sql</code>
          {" "}
          مؤقتًا أثناء التجربة.
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-900">
          {state.error}
        </div>
      ) : null}

      {state.ok ? (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 px-6 py-5 text-emerald-900">
          تم نشر المقال بنجاح.
          {" "}
          <Link href={`/blog/${state.slug}`} className="font-semibold underline decoration-emerald-400 underline-offset-4">
            افتح المقال المنشور
          </Link>
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_340px]">
        <form action={formAction} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">عنوان المقال</span>
              <input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="مثال: كيف تبني غرفة أخبار رقمية قابلة للتوسع؟"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Slug</span>
              <input
                name="slug"
                value={slug}
                onChange={(event) => {
                  setManualSlug(true);
                  setSlugInput(createSlugCandidate(event.target.value));
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                dir="ltr"
                placeholder="auto-generated-post-slug"
              />
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">الملخص</span>
            <textarea
              name="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              required
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="ملخص قصير واحترافي يظهر في بطاقات المقال ونتائج المشاركة."
            />
          </label>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">صورة الغلاف</span>
              <input
                name="coverImageUrl"
                type="url"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                dir="ltr"
                placeholder="https://example.com/cover.jpg"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">التصنيف</span>
              <input
                name="category"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="تقارير، أخبار، أدلة، منتج"
              />
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">الوسوم</span>
            <input
              name="tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="تحليلات، Dribdo، مجتمع، تحديثات"
            />
          </label>

          {requiresToken ? (
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">رمز الإدارة</span>
              <input
                name="adminToken"
                type="password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="BLOG_ADMIN_TOKEN"
              />
            </label>
          ) : (
            <input type="hidden" name="adminToken" value="" />
          )}

          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">المحتوى</div>
                <div className="mt-1 text-sm text-slate-500">يدعم Markdown مع معاينة مباشرة وصور وروابط وعناوين فرعية.</div>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                Draft auto-save
              </div>
            </div>
            <BlogEditorField name="content" storageKey="dribdo-blog-admin-draft" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <SubmitButton />
            <p className="text-sm text-slate-500">
              سيتم حفظ المقال مباشرة بحالة
              {" "}
              <span className="font-semibold text-slate-900">published</span>
              {" "}
              مع
              {" "}
              <code>published_at</code>.
            </p>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)]">
            <div className="text-sm font-semibold text-slate-500">معاينة سريعة</div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">
              {title || "عنوان المقال سيظهر هنا"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {excerpt || "أضف ملخصًا مقنعًا يشرح قيمة المقال خلال سطرين إلى ثلاثة أسطر."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(tagsPreview.length ? tagsPreview : ["featured", "analysis"]).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-4 text-sm text-slate-300" dir="ltr">
              /blog/{slug || "your-story-slug"}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)]">
            <div className="text-sm font-semibold text-slate-500">جودة التحرير</div>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold text-slate-500">عدد كلمات العنوان</div>
                <div className="mt-1 text-xl font-bold text-slate-950">{titleWords}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold text-slate-500">طول الملخص</div>
                <div className="mt-1 text-xl font-bold text-slate-950">{excerpt.trim().length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                اترك `slug` كما هو إن كنت تريد رابطًا تلقائيًا. عند وجود نفس الرابط، سيُضاف رقم تلقائيًا بدل فشل النشر.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
