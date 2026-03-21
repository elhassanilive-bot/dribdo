import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getSupabaseClient } from "@/lib/supabase/client";

export const metadata = {
  title: "بلاغات التعليقات",
  description: "مراجعة بلاغات التعليقات في المنتدى والمدونة.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/reports" },
};

async function fetchReports() {
  const adminReady = isSupabaseAdminConfigured();
  const client = adminReady ? await getSupabaseAdminClient() : await getSupabaseClient();
  if (!client) {
    return { reports: [], error: "Supabase client غير متاح" };
  }

  const { data, error } = await client
    .from("blog_post_comment_reports")
    .select(
      "id, reason, details, created_at, session_id, comment:blog_post_comments(id, content, author_name, created_at, is_hidden, post:blog_posts(id, title, slug))"
    )
    .order("created_at", { ascending: false });

  if (error) return { reports: [], error: error.message };
  return { reports: data || [], error: null };
}

export default async function AdminReportsPage() {
  const { reports, error } = await fetchReports();

  const reportCounts = reports.reduce((acc, report) => {
    const commentId = report.comment?.id;
    if (!commentId) return acc;
    acc[commentId] = (acc[commentId] || 0) + 1;
    return acc;
  }, {});

  async function hideCommentAction(formData) {
    "use server";
    const commentId = String(formData.get("commentId") || "");
    if (!commentId) return;

    const client = isSupabaseAdminConfigured() ? await getSupabaseAdminClient() : await getSupabaseClient();
    if (!client) return;
    await client.from("blog_post_comments").update({ is_hidden: true }).eq("id", commentId);
    revalidatePath("/admin/reports");
    revalidatePath("/blog");
  }

  async function unhideCommentAction(formData) {
    "use server";
    const commentId = String(formData.get("commentId") || "");
    if (!commentId) return;

    const client = isSupabaseAdminConfigured() ? await getSupabaseAdminClient() : await getSupabaseClient();
    if (!client) return;
    await client.from("blog_post_comments").update({ is_hidden: false }).eq("id", commentId);
    revalidatePath("/admin/reports");
    revalidatePath("/blog");
  }

  async function deleteCommentAction(formData) {
    "use server";
    const commentId = String(formData.get("commentId") || "");
    if (!commentId) return;

    const client = isSupabaseAdminConfigured() ? await getSupabaseAdminClient() : await getSupabaseClient();
    if (!client) return;
    await client.from("blog_post_comments").delete().eq("id", commentId);
    revalidatePath("/admin/reports");
    revalidatePath("/blog");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">بلاغات التعليقات</h1>
          <p className="mt-2 text-sm text-slate-600">
            راجع البلاغات واتخذ الإجراء المناسب (إخفاء/إظهار/حذف).
          </p>
        </div>
        <Link href="/admin" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          العودة للوحة الأدمن
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          تعذر تحميل البلاغات: {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600">
          لا توجد بلاغات بعد.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reports.map((report) => {
            const comment = report.comment;
            const post = comment?.post;
            const count = comment?.id ? reportCounts[comment.id] || 0 : 0;
            return (
              <div key={report.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-500">
                    {new Date(report.created_at).toLocaleString("ar-MA")} • {report.reason}
                  </div>
                  <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    {count} بلاغات
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-700">
                  <span className="font-semibold">التعليق:</span> {comment?.content || "غير متاح"}
                </div>

                {report.details ? (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {report.details}
                  </div>
                ) : null}

                <div className="mt-4 text-xs text-slate-500">
                  الكاتب: {comment?.author_name || "غير معروف"} • المقال:{" "}
                  {post ? (
                    <Link href={`/blog/${post.slug}`} className="text-orange-600 hover:text-orange-700">
                      {post.title}
                    </Link>
                  ) : (
                    "غير متاح"
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={comment?.is_hidden ? unhideCommentAction : hideCommentAction}>
                    <input type="hidden" name="commentId" value={comment?.id || ""} />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                    >
                      {comment?.is_hidden ? "إظهار التعليق" : "إخفاء التعليق"}
                    </button>
                  </form>
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="commentId" value={comment?.id || ""} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      حذف التعليق
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
