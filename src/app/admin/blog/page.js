import { revalidatePath } from "next/cache";
import AdminBlogDashboard from "@/components/blog/AdminBlogDashboard";
import { createPost, isBlogPublishingEnabled } from "@/lib/blog/posts";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const metadata = {
  title: "لوحة المدونة",
  description: "نشر وإدارة مقالات دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/blog" },
};

function SetupBox() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)] sm:p-8">
      <h2 className="text-2xl font-black text-slate-950">إعداد Supabase للنشر</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
        لتفعيل نظام المقالات بالكامل، شغّل
        {" "}
        <code>supabase/blog_schema.sql</code>
        {" "}
        في SQL Editor. وإذا أردت النشر من هذه اللوحة مؤقتًا بدون تسجيل دخول، شغّل أيضًا
        {" "}
        <code>supabase/blog_temp_publishing.sql</code>.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <div className="text-sm font-semibold text-slate-900">البيئة</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            تأكد من وجود
            {" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code>
            {" "}
            و
            {" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            {" "}
            داخل
            {" "}
            <code>.env.local</code>.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <div className="text-sm font-semibold text-slate-900">RLS</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            القراءة العامة يجب أن تبقى محصورة على
            {" "}
            <code>{"status = 'published'"}</code>
            {" "}
            بينما سياسات الكتابة المؤقتة مخصصة للتجربة فقط.
          </p>
        </div>
      </div>
    </div>
  );
}

const initialState = {
  ok: false,
  error: "",
  slug: "",
  title: "",
};

export default async function AdminBlogPage() {
  async function publishPostAction(_prevState, formData) {
    "use server";

    const expectedToken = process.env.BLOG_ADMIN_TOKEN || "";
    const providedToken = String(formData.get("adminToken") || "");

    if (expectedToken && providedToken !== expectedToken) {
      return {
        ...initialState,
        error: "رمز الإدارة غير صحيح. راجع قيمة BLOG_ADMIN_TOKEN ثم أعد المحاولة.",
      };
    }

    const result = await createPost({
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt"),
      coverImageUrl: formData.get("coverImageUrl"),
      category: formData.get("category"),
      tags: String(formData.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      content: formData.get("content"),
    });

    if (!result.ok) {
      return {
        ...initialState,
        error: result.error || "تعذر نشر المقال. حاول مرة أخرى.",
      };
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${result.slug}`);

    return {
      ok: true,
      error: "",
      slug: result.slug || "",
      title: String(formData.get("title") || "").trim(),
    };
  }

  const publishingEnabled = isBlogPublishingEnabled();
  const requiresToken = Boolean(process.env.BLOG_ADMIN_TOKEN);
  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 28%,#f8fafc_100%)]">
      <section className="py-8 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          {!supabaseReady ? <SetupBox /> : null}
          <AdminBlogDashboard
            action={publishPostAction}
            publishingEnabled={publishingEnabled}
            requiresToken={requiresToken}
          />
        </div>
      </section>
    </div>
  );
}
