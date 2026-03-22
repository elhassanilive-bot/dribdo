import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AdminOwnerGate from "@/components/admin/AdminOwnerGate";
import AdminBlogDashboard from "@/components/blog/AdminBlogDashboard";
import {
  createPost,
  deletePost,
  deletePosts,
  isBlogPublishingEnabled,
  listPostsForAdmin,
  updatePost,
} from "@/lib/blog/posts";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  clearAdminSessionCookie,
  hasValidAdminSession,
  requireAdminSession,
  setAdminSessionCookie,
  validateAdminAccessToken,
} from "@/lib/admin/access";

export const metadata = {
  title: "لوحة المدونة",
  description: "نشر وإدارة مقالات دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/blog" },
};

function buildLoginHref(nextPath = "/admin/blog", denied = false) {
  const search = new URLSearchParams({ next: nextPath });
  if (denied) search.set("admin", "denied");
  return `/login?${search.toString()}`;
}

function SetupBox() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)] sm:p-8">
      <h2 className="text-2xl font-black text-slate-950">إعداد Supabase للنشر</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
        شغّل ملفات Supabase الخاصة بالمدونة والتخزين ثم أعد المحاولة. إذا كانت اللوحة تعمل لكن النشر يفشل،
        فالمشكلة تكون عادة في سياسات RLS أو متغيرات البيئة.
      </p>
    </div>
  );
}

export default async function AdminBlogPage() {
  async function authorizeAction(formData) {
    "use server";

    const result = await validateAdminAccessToken(formData.get("accessToken"));
    if (!result.ok) {
      redirect(buildLoginHref("/admin/blog", true));
    }

    await setAdminSessionCookie();
    revalidatePath("/admin");
    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  }

  async function logoutAction() {
    "use server";
    await clearAdminSessionCookie();
    revalidatePath("/admin");
    revalidatePath("/admin/blog");
    redirect(buildLoginHref("/admin/blog"));
  }

  async function savePostAction(formData) {
    "use server";

    const access = await requireAdminSession();
    if (!access.ok) return { ok: false, error: access.error };

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

    const result = payload.id ? await updatePost(payload) : await createPost(payload);

    if (result.ok) {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      revalidatePath(`/blog/${result.slug}`);
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog/category/[slug]", "page");
      revalidatePath("/blog/tag/[slug]", "page");
    }

    return result;
  }

  async function deletePostAction(payload) {
    "use server";

    const access = await requireAdminSession();
    if (!access.ok) return { ok: false, error: access.error };

    const result = await deletePost(payload?.id);

    if (result.ok) {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog/category/[slug]", "page");
      revalidatePath("/blog/tag/[slug]", "page");
    }

    return result;
  }

  async function deletePostsAction(payload) {
    "use server";

    const access = await requireAdminSession();
    if (!access.ok) return { ok: false, error: access.error, deletedIds: [] };

    const result = await deletePosts(payload?.ids);

    if (result.ok || (Array.isArray(result.deletedIds) && result.deletedIds.length > 0)) {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog/category/[slug]", "page");
      revalidatePath("/blog/tag/[slug]", "page");
    }

    return result;
  }

  const sessionValid = await hasValidAdminSession();
  const publishingEnabled = isBlogPublishingEnabled();
  const supabaseReady = isSupabaseConfigured();

  if (!sessionValid) {
    return (
      <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff_28%,#f8fafc_100%)]">
        <AdminOwnerGate
          authorizeAction={authorizeAction}
          title="دخول لوحة المقالات"
          description="إذا لم تكن مسجل الدخول أو لم يكن حسابك مضافًا في جدول إدارة المدونة فسيتم تحويلك إلى صفحة تسجيل الدخول."
          loginHref={buildLoginHref("/admin/blog")}
        />
      </div>
    );
  }

  const { posts, error: adminListError } = supabaseReady ? await listPostsForAdmin({ limit: 100 }) : { posts: [], error: null };

  return (
    <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff_28%,#f8fafc_100%)]">
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
            deleteManyAction={deletePostsAction}
            publishingEnabled={publishingEnabled}
            requiresToken={false}
            adminListError={adminListError}
          />
        </div>
      </section>
    </div>
  );
}
