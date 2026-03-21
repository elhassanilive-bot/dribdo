"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditorField from "@/components/blog/RichTextEditorField";
import BlogImage from "@/components/blog/BlogImage";
import { createSlugCandidate } from "@/lib/blog/slug";
import { prepareBlogContentForEditor } from "@/lib/blog/content";
import { getSupabaseClient } from "@/lib/supabase/client";
import { buildPermalink, PERMALINK_OPTIONS, getPermalinkStyle } from "@/lib/blog/permalinks";

const EMPTY_CONTENT = "<p></p>";
const BLOG_MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BLOG_BUCKET || "blog-media";

function createEmptyForm() {
  return {
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    coverImageUrl: "",
    category: "",
    tagsInput: "",
    adminToken: "",
    permalinkStyle: "",
    permalinkTemplate: "",
    content: EMPTY_CONTENT,
  };
}

function SubmitButton({ pending, editing }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "جارٍ حفظ المقال..." : editing ? "حفظ التعديلات" : "نشر المقال"}
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

function PermalinkBox({ samplePost }) {
  const currentStyle = getPermalinkStyle();
  const currentTemplate = process.env.NEXT_PUBLIC_BLOG_PERMALINK_TEMPLATE || "/blog/%post_id%-%postname%";
  const previewPost = samplePost || {
    id: "post-id",
    slug: "عنوان-المقال",
    publishedAt: new Date().toISOString(),
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">تركيبة الروابط</div>
      <p className="mt-2 text-xs leading-6 text-slate-600">
        اختر الصيغة من البيئة عبر المتغير <code>NEXT_PUBLIC_BLOG_PERMALINK_STYLE</code>. القيم المتاحة:
      </p>
      <div className="mt-3 grid gap-2">
        {PERMALINK_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-start gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-xs">
            <span
              className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                option.value === currentStyle ? "border-orange-400 bg-orange-100 text-orange-600" : "border-slate-300"
              }`}
            >
              {option.value === currentStyle ? "✓" : ""}
            </span>
            <div>
              <div className="font-semibold text-slate-900">{option.label}</div>
              <div className="text-[11px] text-slate-500">{option.example}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
        معاينة الرابط الحالي: {buildPermalink(previewPost, currentStyle)}
      </div>
      {currentStyle === "custom" ? (
        <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
          القالب الحالي: {currentTemplate}
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }) {
  const current = status || "published";
  const tone =
    current === "published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{current}</span>;
}

function DeletePostModal({ post, pending, onCancel, onConfirm }) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">تأكيد حذف المقال</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              سيتم حذف المقال <span className="font-semibold text-slate-900">{post.title}</span> من لوحة النشر. هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            إغلاق
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          الرابط المختصر الحالي: <span className="font-semibold">/{post.slug}</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "جارٍ الحذف..." : "تأكيد الحذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

function mapPostToForm(post, adminToken) {
  return {
    id: post.id || "",
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    coverImageUrl: post.coverImageUrl || "",
    category: post.category || "",
    tagsInput: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    adminToken: adminToken || "",
    permalinkStyle: post.permalinkStyle || "",
    permalinkTemplate: post.permalinkTemplate || "",
    content: prepareBlogContentForEditor(post.content),
  };
}

export default function AdminBlogDashboard({
  posts = [],
  saveAction,
  deleteAction,
  publishingEnabled,
  requiresToken,
  adminListError,
}) {
  const router = useRouter();
  const coverInputRef = useRef(null);
  const [form, setForm] = useState(createEmptyForm);
  const [manualSlug, setManualSlug] = useState(false);
  const [flash, setFlash] = useState({ type: "", message: "", slug: "", id: "" });
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [coverUpload, setCoverUpload] = useState({ message: "", error: false });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const editing = Boolean(form.id);
  const visibleSlug = manualSlug ? form.slug : createSlugCandidate(form.title);
  const resolvedPermalinkStyle = form.permalinkStyle || getPermalinkStyle();

  const categories = useMemo(() => {
    return [...new Set(posts.map((post) => post.category).filter(Boolean))];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory = categoryFilter === "all" ? true : post.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!term) return true;

      const haystack = [post.title, post.excerpt, post.slug, post.category, ...(post.tags || [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [categoryFilter, posts, query]);

  const tagsPreview = useMemo(
    () =>
      form.tagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),
    [form.tagsInput]
  );

  const titleWords = useMemo(() => form.title.trim().split(/\s+/).filter(Boolean).length, [form.title]);
  const permalinkPreview = useMemo(
    () =>
      buildPermalink(
        {
          id: form.id || "post-id",
          slug: visibleSlug || "عنوان-المقال",
          publishedAt: new Date().toISOString(),
          permalinkStyle: resolvedPermalinkStyle,
          permalinkTemplate: form.permalinkTemplate,
        },
        resolvedPermalinkStyle
      ),
    [form.id, visibleSlug, resolvedPermalinkStyle, form.permalinkTemplate]
  );

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadCoverFile(file) {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase غير مُعد. أضف المفاتيح أولًا.");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `covers/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BLOG_MEDIA_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      throw new Error(
        `تعذر رفع صورة الغلاف إلى bucket "${BLOG_MEDIA_BUCKET}". شغّل supabase/blog_storage.sql أو تأكد من اسم الـ bucket في .env.local.`
      );
    }

    const { data } = supabase.storage.from(BLOG_MEDIA_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      throw new Error("تم الرفع لكن تعذر إنشاء الرابط العام لصورة الغلاف.");
    }

    return data.publicUrl;
  }

  async function handleCoverSelection(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setCoverUpload({ message: "جارٍ رفع صورة الغلاف...", error: false });
      const publicUrl = await uploadCoverFile(file);
      updateField("coverImageUrl", publicUrl);
      setCoverUpload({ message: "تم رفع صورة الغلاف بنجاح.", error: false });
    } catch (error) {
      setCoverUpload({
        message: error instanceof Error ? error.message : "تعذر رفع صورة الغلاف.",
        error: true,
      });
    }
  }

  function resetForm(keepToken = true) {
    setForm((current) => ({
      ...createEmptyForm(),
      adminToken: keepToken ? current.adminToken : "",
    }));
    setManualSlug(false);
  }

  function handleEdit(post) {
    setForm((current) => mapPostToForm(post, current.adminToken));
    setManualSlug(true);
    setFlash({ type: "", message: "", slug: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("id", form.id);
    formData.set("title", form.title);
    formData.set("slug", visibleSlug);
    formData.set("excerpt", form.excerpt);
    formData.set("coverImageUrl", form.coverImageUrl);
    formData.set("category", form.category);
    formData.set("tags", form.tagsInput);
    formData.set("content", form.content);
    formData.set("permalinkStyle", form.permalinkStyle);
    formData.set("permalinkTemplate", form.permalinkTemplate);
    formData.set("adminToken", form.adminToken);

    startSaveTransition(() => {
      saveAction(formData).then((result) => {
        if (!result?.ok) {
          setFlash({
            type: "error",
            message: result?.error || "تعذر حفظ المقال.",
            slug: "",
            id: "",
          });
          return;
        }

        setFlash({
          type: "success",
          message: editing ? "تم تحديث المقال بنجاح." : "تم نشر المقال بنجاح.",
          slug: result.slug || "",
          id: result.id || "",
        });
        resetForm();
        router.refresh();
      });
    });
  }

  function handleDelete(post) {
    setDeleteTarget(post);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startDeleteTransition(() => {
      deleteAction({ id: deleteTarget.id, adminToken: form.adminToken }).then((result) => {
        if (!result?.ok) {
          setFlash({
            type: "error",
            message: result?.error || "تعذر حذف المقال.",
            slug: "",
            id: "",
          });
          return;
        }

        if (form.id === deleteTarget.id) {
          resetForm();
        }

        setFlash({
          type: "success",
          message: "تم حذف المقال بنجاح.",
            slug: "",
            id: "",
        });
        setDeleteTarget(null);
        router.refresh();
      });
    });
  }

  return (
    <div className="space-y-8">
      <DeletePostModal
        post={deleteTarget}
        pending={isDeleting}
        onCancel={() => (isDeleting ? null : setDeleteTarget(null))}
        onConfirm={confirmDelete}
      />
      <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#f8fafc_100%)] shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.9fr] lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-white/75 px-4 py-2 text-xs font-semibold text-orange-700 backdrop-blur">
              Dribdo Editorial Desk
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              لوحة نشر وإدارة مقالات غنية ومتقدمة
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              اكتب بمحرر Rich Text حديث، أدرج وسائط متعددة وروابط وأزرار وجداول، ثم عدّل أو احذف المقالات من نفس
              اللوحة مع بقاء النشر مباشرًا إلى Supabase.
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
            <StatCard label="وضع النشر" value={publishingEnabled ? "جاهز" : "يحتاج RLS"} hint="الحفظ المباشر يحترم إعدادات Supabase الحالية" />
            <StatCard label="المقالات" value={posts.length} hint="قائمة الإدارة تعرض آخر المقالات القابلة للوصول" />
            <StatCard label="الرابط المختصر" value={visibleSlug || "سيُولد تلقائيًا"} hint="يُمنع التكرار بإضافة لاحقة رقمية عند الحاجة" />
          </div>
        </div>
      </section>

      {!publishingEnabled ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-950">
          النشر المباشر يحتاج سياسات `insert` ويفضّل أيضًا سياسات `update/delete` أو Service Role إذا كنت تريد إدارة كاملة من هذه اللوحة.
        </div>
      ) : null}

      {adminListError ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-950">
          تعذر تحميل قائمة المقالات كاملة: {adminListError}
        </div>
      ) : null}

      {flash.message ? (
        <div
          className={[
            "rounded-[2rem] px-6 py-5",
            flash.type === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-900"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900",
          ].join(" ")}
        >
          {flash.message}
          {flash.slug && flash.id ? (
            <>
              {" "}
              <Link href={buildPermalink({ id: flash.id, slug: flash.slug })} className="font-semibold underline underline-offset-4">
                افتح المقال
              </Link>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_360px]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] sm:p-8">
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelection} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-500">محرر المقال</div>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{editing ? "تعديل المقال" : "إضافة مقال جديد"}</h2>
            </div>
            {editing ? (
              <button
                type="button"
                onClick={() => resetForm()}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                مقال جديد
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">عنوان المقال</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="مثال: كيف تبني غرفة أخبار رقمية قابلة للتوسع؟"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Slug</span>
              <input
                value={visibleSlug}
                onChange={(event) => {
                  setManualSlug(true);
                  updateField("slug", createSlugCandidate(event.target.value));
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                dir="ltr"
                placeholder="auto-generated-post-slug"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">تركيبة الرابط</span>
              <select
                value={form.permalinkStyle || "inherit"}
                onChange={(event) => updateField("permalinkStyle", event.target.value === "inherit" ? "" : event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
              >
                <option value="inherit">افتراضي الموقع (ENV)</option>
                {PERMALINK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">قالب مخصص (اختياري)</span>
              <input
                value={form.permalinkTemplate}
                onChange={(event) => updateField("permalinkTemplate", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                dir="ltr"
                placeholder="/blog/%year%/%monthnum%/%postname%"
              />
              <span className="mt-2 block text-xs text-slate-500" dir="ltr">
                %postname% · %post_id% · %year% · %monthnum% · %day%
              </span>
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">الملخص</span>
            <textarea
              value={form.excerpt}
              onChange={(event) => updateField("excerpt", event.target.value)}
              required
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="ملخص قصير واحترافي يظهر في بطاقات المقال ونتائج المشاركة."
            />
          </label>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">صورة الغلاف</span>
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    رفع صورة الغلاف
                  </button>
                  {form.coverImageUrl ? (
                    <button
                      type="button"
                      onClick={() => updateField("coverImageUrl", "")}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                    >
                      إزالة الصورة
                    </button>
                  ) : null}
                  <span className="text-sm text-slate-500">من جهازك مباشرة بدل إدخال رابط يدوي.</span>
                </div>

                {coverUpload.message ? (
                  <div className={coverUpload.error ? "px-4 py-3 text-sm text-rose-700" : "px-4 py-3 text-sm text-emerald-700"}>
                    {coverUpload.message}
                  </div>
                ) : null}

                <div className="px-4 pb-4">
                  {form.coverImageUrl ? (
                    <div className="relative mt-4 h-52 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                      <BlogImage
                        src={form.coverImageUrl}
                        alt={form.title || "Cover preview"}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                      لم يتم اختيار صورة غلاف بعد.
                    </div>
                  )}
                </div>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">التصنيف</span>
              <input
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="تقارير، أخبار، أدلة، منتج"
              />
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">الوسوم</span>
            <input
              value={form.tagsInput}
              onChange={(event) => updateField("tagsInput", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="تحليلات، Dribdo، مجتمع، تحديثات"
            />
          </label>

          {requiresToken ? (
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">رمز الإدارة</span>
              <input
                type="password"
                value={form.adminToken}
                onChange={(event) => updateField("adminToken", event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="BLOG_ADMIN_TOKEN"
              />
            </label>
          ) : null}

          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">المحتوى الغني</div>
                <div className="mt-1 text-sm text-slate-500">عناوين، ألوان، جداول، وسائط، أزرار، embeds ومحاذاة كاملة.</div>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                Rich Text / HTML
              </div>
            </div>
            <RichTextEditorField value={form.content} onChange={(html) => updateField("content", html)} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <SubmitButton pending={isSaving} editing={editing} />
            <p className="text-sm text-slate-500">
              سيتم حفظ المقال بحالة
              {" "}
              <span className="font-semibold text-slate-900">published</span>
              {" "}
              مع
              {" "}
              <code>published_at</code>
              {" "}
              وتحديث
              {" "}
              <code>updated_at</code>
              {" "}
              تلقائيًا من trigger الحالي.
            </p>
          </div>
        </form>

        <aside className="space-y-6">
          <PermalinkBox
            samplePost={{
              id: form.id || "post-id",
              slug: visibleSlug || "عنوان-المقال",
              publishedAt: new Date().toISOString(),
              permalinkStyle: resolvedPermalinkStyle,
              permalinkTemplate: form.permalinkTemplate,
            }}
          />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)]">
            <div className="text-sm font-semibold text-slate-500">معاينة سريعة</div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">
              {form.title || "عنوان المقال سيظهر هنا"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {form.excerpt || "أضف ملخصًا مقنعًا يشرح قيمة المقال خلال سطرين إلى ثلاثة أسطر."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(tagsPreview.length ? tagsPreview : ["featured", "analysis"]).map((tag) => (
                <span key={tag} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-4 text-sm text-slate-300" dir="ltr">
              {permalinkPreview}
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
                <div className="mt-1 text-xl font-bold text-slate-950">{form.excerpt.trim().length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                يمكن تحرير المقالات القديمة أيضًا. إذا كان المحتوى مخزّنًا بـ Markdown فسيتم تحويله تلقائيًا إلى HTML داخل المحرر قبل التعديل.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-500">إدارة المقالات</div>
            <h2 className="mt-1 text-2xl font-black text-slate-950">قائمة المقالات الحالية</h2>
          </div>
          <div className="flex w-full flex-wrap gap-3 lg:w-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-64 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="ابحث بالعنوان أو slug أو الوسوم"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
            >
              <option value="all">كل التصنيفات</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
            لا توجد مقالات مطابقة للفلاتر الحالية.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {filteredPosts.map((post) => (
              <article key={post.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={post.status} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{post.category || "General"}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-slate-950">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(post.tags || []).map((tag) => (
                        <span key={`${post.id}-${tag}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-slate-400" dir="ltr">
                      {buildPermalink(post)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={buildPermalink(post)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                    >
                      عرض
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(post)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      disabled={isDeleting}
                      className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
