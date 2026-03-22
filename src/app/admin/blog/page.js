import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import AdminBlogDashboard from "@/components/blog/AdminBlogDashboard";
<<<<<<< HEAD
import { createPost, deletePost, isBlogPublishingEnabled, listPostsForAdmin, updatePost } from "@/lib/blog/posts";
=======
import { createPost, deletePost, deletePosts, isBlogPublishingEnabled, listPostsForAdmin, updatePost } from "@/lib/blog/posts";
>>>>>>> 300f687 (dribdo initial)
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const metadata = {
  title: "لوحة المدونة",
  description: "نشر وإدارة مقالات دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/blog" },
};

const ADMIN_SESSION_COOKIE = "dribdo_admin_blog_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function createAdminSessionValue(token) {
  const seed = process.env.NEXT_PUBLIC_SUPABASE_URL || "dribdo-admin";
  return createHash("sha256").update(`${seed}:${token}`).digest("hex");
}

function secureEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function hasValidAdminSession(cookieStore) {
  const expectedToken = process.env.BLOG_ADMIN_TOKEN || "";
  if (!expectedToken) return true;

  const cookieValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!cookieValue) return false;

  return secureEqual(cookieValue, createAdminSessionValue(expectedToken));
}

async function setAdminSessionCookie(token) {
  const cookieStore = await cookies();
  const value = createAdminSessionValue(token);
  cookieStore.set(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/admin",
  });
}

async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

function SetupBox() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)] sm:p-8">
      <h2 className="text-2xl font-black text-slate-950">إعداد Supabase للنشر</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
        بنية الجداول الحالية كافية لهذا التطوير لأن
        {" "}
        <code>content</code>
        {" "}
        يبقى حقلًا نصيًا، لكننا نخزّن فيه الآن
        {" "}
        <strong>HTML غني</strong>
        {" "}
        بدل Markdown. شغّل
        {" "}
        <code>supabase/blog_schema.sql</code>
        {" "}
        ثم
        {" "}
        <code>supabase/blog_storage.sql</code>
        {" "}
        لتفعيل رفع الوسائط، ثم
        {" "}
        <code>supabase/blog_temp_publishing.sql</code>
        {" "}
        مؤقتًا إذا أردت تجربة النشر بدون تسجيل.
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
        إذا كنت تستعمل اسم bucket مختلفًا، أضف
        {" "}
        <code>NEXT_PUBLIC_SUPABASE_BLOG_BUCKET</code>
        {" "}
        داخل
        {" "}
        <code>.env.local</code>.
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
            ويفضّل أيضًا
            {" "}
            <code>NEXT_PUBLIC_SUPABASE_BLOG_BUCKET</code>
            {" "}
            داخل
            {" "}
            <code>.env.local</code>.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <div className="text-sm font-semibold text-slate-900">RLS</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            القراءة العامة تبقى محصورة على
            {" "}
            <code>{"status = 'published'"}</code>
            {" "}
            بينما عمليات التعديل والحذف تحتاج Service Role أو سياسات RLS إضافية.
          </p>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
function validateAdminToken(adminToken) {
  const expectedToken = process.env.BLOG_ADMIN_TOKEN || "";
  const providedToken = String(adminToken || "");

  if (expectedToken && providedToken !== expectedToken) {
    return "رمز الإدارة غير صحيح. راجع قيمة BLOG_ADMIN_TOKEN ثم أعد المحاولة.";
  }

  return null;
}

export default async function AdminBlogPage() {
  async function savePostAction(formData) {
    "use server";

    const tokenError = validateAdminToken(formData.get("adminToken"));
    if (tokenError) {
      return { ok: false, error: tokenError };
    }

      const payload = {
        id: formData.get("id"),
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
        permalinkStyle: formData.get("permalinkStyle"),
        permalinkTemplate: formData.get("permalinkTemplate"),
      };
=======
async function validateAdminToken(adminToken) {
  const expectedToken = process.env.BLOG_ADMIN_TOKEN || "";
  if (!expectedToken) return null;
  const cookieStore = await cookies();
  if (hasValidAdminSession(cookieStore)) return null;

  const providedToken = String(adminToken || "");

  if (providedToken !== expectedToken) {
    return "رمز الإدارة غير صحيح. راجع قيمة BLOG_ADMIN_TOKEN ثم أعد المحاولة.";
  }

  return null;
}

function AdminAccessGate({ loginAction, loginError }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)] sm:p-8">
          <h1 className="text-2xl font-black text-slate-950">دخول لوحة المقالات</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            هذه الصفحة خاصة بالإدارة فقط. أدخل رمز
            {" "}
            <code>BLOG_ADMIN_TOKEN</code>
            {" "}
            لمتابعة الدخول.
          </p>
          <form action={loginAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">رمز الإدارة</span>
              <input
                name="adminToken"
                type="password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="BLOG_ADMIN_TOKEN"
              />
            </label>
            {loginError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{loginError}</div>
            ) : null}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)]"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default async function AdminBlogPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const loginError = resolvedSearchParams?.auth === "denied" ? "رمز الإدارة غير صحيح." : null;

  async function loginAction(formData) {
    "use server";

    const expectedToken = process.env.BLOG_ADMIN_TOKEN || "";
    const providedToken = String(formData.get("adminToken") || "");
    if (!expectedToken || providedToken === expectedToken) {
      if (expectedToken) await setAdminSessionCookie(expectedToken);
      revalidatePath("/admin/blog");
      redirect("/admin/blog");
    }

    redirect("/admin/blog?auth=denied");
  }

  async function logoutAction() {
    "use server";
    await clearAdminSessionCookie();
    revalidatePath("/admin/blog");
  }

  async function savePostAction(formData) {
    "use server";

    const tokenError = await validateAdminToken(formData.get("adminToken"));
    if (tokenError) {
      return { ok: false, error: tokenError };
    }

    const payload = {
      id: formData.get("id"),
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt"),
      coverImageUrl: formData.get("coverImageUrl"),
      category: formData.get("category"),
      status: formData.get("status"),
      publishedAt: formData.get("publishedAt"),
      tags: String(formData.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      content: formData.get("content"),
    };
>>>>>>> 300f687 (dribdo initial)

    const result = payload.id ? await updatePost(payload) : await createPost(payload);

    if (result.ok) {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      revalidatePath(`/blog/${result.slug}`);
<<<<<<< HEAD
      if (result.id) {
        revalidatePath(`/blog/${result.id}-${result.slug || ""}`);
      }
=======
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog/category/[slug]", "page");
      revalidatePath("/blog/tag/[slug]", "page");
>>>>>>> 300f687 (dribdo initial)
    }

    return result;
  }

  async function deletePostAction(payload) {
    "use server";

<<<<<<< HEAD
    const tokenError = validateAdminToken(payload?.adminToken);
=======
    const tokenError = await validateAdminToken(payload?.adminToken);
>>>>>>> 300f687 (dribdo initial)
    if (tokenError) {
      return { ok: false, error: tokenError };
    }

    const result = await deletePost(payload?.id);

    if (result.ok) {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
<<<<<<< HEAD
=======
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog/category/[slug]", "page");
      revalidatePath("/blog/tag/[slug]", "page");
    }

    return result;
  }

  async function deletePostsAction(payload) {
    "use server";

    const tokenError = await validateAdminToken(payload?.adminToken);
    if (tokenError) {
      return { ok: false, error: tokenError, deletedIds: [] };
    }

    const result = await deletePosts(payload?.ids);

    if (result.ok || (Array.isArray(result.deletedIds) && result.deletedIds.length > 0)) {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog/category/[slug]", "page");
      revalidatePath("/blog/tag/[slug]", "page");
>>>>>>> 300f687 (dribdo initial)
    }

    return result;
  }

  const publishingEnabled = isBlogPublishingEnabled();
  const cookieStore = await cookies();
  const sessionValid = hasValidAdminSession(cookieStore);
  const requiresToken = Boolean(process.env.BLOG_ADMIN_TOKEN) && !sessionValid;
  const supabaseReady = isSupabaseConfigured();
  const { posts, error: adminListError } = supabaseReady ? await listPostsForAdmin({ limit: 100 }) : { posts: [], error: null };

  if (Boolean(process.env.BLOG_ADMIN_TOKEN) && !sessionValid) {
    return (
      <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 28%,#f8fafc_100%)]">
        <AdminAccessGate loginAction={loginAction} loginError={loginError} />
      </div>
    );
  }

  const { posts, error: adminListError } = supabaseReady ? await listPostsForAdmin({ limit: 100 }) : { posts: [], error: null };

  return (
    <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 28%,#f8fafc_100%)]">
      <section className="py-8 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          <form action={logoutAction} className="self-end">
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              تسجيل خروج الإدارة
            </button>
          </form>
          {!supabaseReady ? <SetupBox /> : null}
          <AdminBlogDashboard
            posts={posts}
            saveAction={savePostAction}
            deleteAction={deletePostAction}
<<<<<<< HEAD
=======
            deleteManyAction={deletePostsAction}
>>>>>>> 300f687 (dribdo initial)
            publishingEnabled={publishingEnabled}
            requiresToken={requiresToken}
            adminListError={adminListError}
          />
        </div>
      </section>
    </div>
  );
}
