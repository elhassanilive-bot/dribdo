"use client";

import { useMemo, useState, useTransition } from "react";
import RichTextEditorField from "@/components/blog/RichTextEditorField";
import { getSupabaseClient } from "@/lib/supabase/client";

const EMPTY_CONTENT = "<p></p>";

function stripHtml(text) {
  return String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function generateForumSlug() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  return `post-${stamp}`;
}

async function ensureUniqueSlug(client, baseSlug) {
  let candidate = baseSlug;
  let attempt = 0;
  while (attempt < 20) {
    const { data } = await client.from("blog_posts").select("id, slug").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

export default function ForumComposer() {
  const [form, setForm] = useState({
    displayName: "",
    title: "",
    type: "اقتراح",
    tagsInput: "",
    content: EMPTY_CONTENT,
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [lastSlug, setLastSlug] = useState("");
  const [isPending, startTransition] = useTransition();

  const tagList = useMemo(
    () =>
      form.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [form.tagsInput]
  );

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm({
      displayName: "",
      title: "",
      type: "اقتراح",
      tagsInput: "",
      content: EMPTY_CONTENT,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const name = form.displayName.trim();
    const title = form.title.trim();
    const content = form.content || EMPTY_CONTENT;
    const summary = stripHtml(content).slice(0, 160);

    if (!title || !summary) {
      setStatus({ type: "error", message: "يرجى كتابة عنوان ومحتوى واضح قبل النشر." });
      return;
    }

    startTransition(async () => {
      try {
        const supabase = await getSupabaseClient();
        if (!supabase) {
          setStatus({ type: "error", message: "Supabase غير مُعد في المشروع." });
          return;
        }

        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user || null;
        if (!authUser) {
          setStatus({ type: "error", message: "يجب تسجيل الدخول لنشر مشاركة في المنتدى." });
          return;
        }

        const slug = await ensureUniqueSlug(supabase, generateForumSlug());
        const authorName =
          name ||
          String(authUser.user_metadata?.full_name || "").trim() ||
          authUser.email ||
          "مستخدم";
        const excerpt = authorName ? `الكاتب: ${authorName} | ${summary}` : summary;
        const tags = [form.type, ...tagList];

        const { error } = await supabase.from("blog_posts").insert({
          slug,
          title,
          excerpt,
          content,
          cover_image_url: "",
          category: "forum",
          author_user_id: authUser.id,
          author_name: authorName,
          tags,
          status: "published",
          published_at: new Date().toISOString(),
        });

        if (error) {
          setStatus({ type: "error", message: error.message || "تعذر نشر المشاركة." });
          return;
        }

        setLastSlug(slug);
        setStatus({ type: "success", message: "تم نشر مشاركتك بنجاح وستظهر للجميع." });
        resetForm();
      } catch (err) {
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "حدث خطأ غير متوقع.",
        });
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)]">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <h2 className="text-2xl font-black text-slate-950">شارك رأيك أو مشكلتك</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          اكتب تجربتك أو المشكلة التي واجهتها وسيراها الجميع، كما ستظهر مشاركتك أيضًا داخل المدونة.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">اسمك (اختياري)</span>
            <input
              type="text"
              value={form.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
              placeholder="مثال: أحمد"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">نوع المشاركة</span>
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
            >
              <option value="اقتراح">اقتراح</option>
              <option value="مشكلة">مشكلة</option>
              <option value="رأي">رأي</option>
              <option value="سؤال">سؤال</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-900">عنوان المشاركة</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="مثال: مشكلة في تسجيل الدخول"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-900">وسوم (اختياري)</span>
          <input
            type="text"
            value={form.tagsInput}
            onChange={(event) => updateField("tagsInput", event.target.value)}
            placeholder="مثال: تسجيل, بطء, iOS"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-900">المحتوى</span>
          <RichTextEditorField name="forum-content" value={form.content} onChange={(value) => updateField("content", value)} />
        </div>

        {status.message ? (
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm",
              status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900",
            ].join(" ")}
          >
            {status.message}
            {status.type === "success" && lastSlug ? (
              <div className="mt-2 text-xs text-emerald-700">
                رابط المشاركة: <span className="font-semibold">/blog/{lastSlug}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            الوسوم الحالية: {tagList.length ? tagList.join(" • ") : "لا يوجد"}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "جارٍ النشر..." : "نشر المشاركة"}
          </button>
        </div>
      </form>
    </section>
  );
}
