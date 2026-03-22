import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getSupabaseClient } from "@/lib/supabase/client";
import AdminOwnerGate from "@/components/admin/AdminOwnerGate";
import { hasValidAdminSession, requireAdminSession, setAdminSessionCookie, validateAdminAccessToken } from "@/lib/admin/access";

export const metadata = {
  title: "Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª",
  description: "Ù…Ø±Ø§Ø¬Ø¹Ø© Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª ÙÙŠ Ø§Ù„Ù…Ù†ØªØ¯Ù‰ ÙˆØ§Ù„Ù…Ø¯ÙˆÙ†Ø©.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/reports" },
};

function buildAdminErrorMessage(searchParams) {
  if (searchParams?.auth !== "denied") return null;

  const details = [];
  if (searchParams?.reason === "email_mismatch") {
    if (searchParams?.uid) details.push(`Ø§Ù„Ù…Ø¹Ø±Ù Ø§Ù„Ø­Ø§Ù„ÙŠ: ${searchParams.uid}`);
    if (searchParams?.expected) details.push(`Ø§Ù„Ù…Ø¹Ø±Ù Ø§Ù„Ù…Ø³Ù…ÙˆØ­: ${searchParams.expected}`);
    if (searchParams?.email) details.push(`Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø­Ø§Ù„ÙŠ: ${searchParams.email}`);
  }

  return details.length
    ? `Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…Ø®ÙˆÙ„ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©. ${details.join(" | ")}`
    : "Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…Ø®ÙˆÙ„ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©.";
}

async function fetchReports() {
  const adminReady = isSupabaseAdminConfigured();
  const client = adminReady ? await getSupabaseAdminClient() : await getSupabaseClient();
  if (!client) {
    return { reports: [], error: "Supabase client ØºÙŠØ± Ù…ØªØ§Ø­" };
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

export default async function AdminReportsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const loginError = buildAdminErrorMessage(resolvedSearchParams);
  const sessionValid = await hasValidAdminSession();

  async function authorizeAction(formData) {
    "use server";

    const result = await validateAdminAccessToken(formData.get("accessToken"));
    if (!result.ok) {
      if (result.code === "email_mismatch") {
        const uid = encodeURIComponent(result.actualUserId || "");
        const expected = encodeURIComponent(result.expectedEmail || "");
        const email = encodeURIComponent(result.actualEmail || "");
        redirect(`/admin/reports?auth=denied&reason=email_mismatch&uid=${uid}&expected=${expected}&email=${email}`);
      }

      redirect("/admin/reports?auth=denied");
    }

    await setAdminSessionCookie();
    redirect("/admin/reports");
  }

  if (!sessionValid) {
    return (
      <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 28%,#f8fafc_100%)]">
        <AdminOwnerGate
          authorizeAction={authorizeAction}
          title="Ø¯Ø®ÙˆÙ„ ØµÙØ­Ø© Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª"
          description={loginError || "ÙŠØ¬Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø§Ù„Ùƒ Ù„ÙØªØ­ ØµÙØ­Ø© Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª."}
        />
      </div>
    );
  }

  const { reports, error } = await fetchReports();

  const reportCounts = reports.reduce((acc, report) => {
    const commentId = report.comment?.id;
    if (!commentId) return acc;
    acc[commentId] = (acc[commentId] || 0) + 1;
    return acc;
  }, {});

  async function hideCommentAction(formData) {
    "use server";
    const access = await requireAdminSession();
    if (!access.ok) return;
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
    const access = await requireAdminSession();
    if (!access.ok) return;
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
    const access = await requireAdminSession();
    if (!access.ok) return;
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
          <h1 className="text-3xl font-black text-slate-950">Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª ÙˆØ§ØªØ®Ø° Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ (Ø¥Ø®ÙØ§Ø¡/Ø¥Ø¸Ù‡Ø§Ø±/Ø­Ø°Ù).
          </p>
        </div>
        <Link href="/admin" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ÙˆØ­Ø© Ø§Ù„Ø£Ø¯Ù…Ù†
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª: {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600">
          Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨Ù„Ø§ØºØ§Øª Ø¨Ø¹Ø¯.
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
                    {new Date(report.created_at).toLocaleString("ar-MA")} â€¢ {report.reason}
                  </div>
                  <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    {count} Ø¨Ù„Ø§ØºØ§Øª
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-700">
                  <span className="font-semibold">Ø§Ù„ØªØ¹Ù„ÙŠÙ‚:</span> {comment?.content || "ØºÙŠØ± Ù…ØªØ§Ø­"}
                </div>

                {report.details ? (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {report.details}
                  </div>
                ) : null}

                <div className="mt-4 text-xs text-slate-500">
                  Ø§Ù„ÙƒØ§ØªØ¨: {comment?.author_name || "ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ"} â€¢ Ø§Ù„Ù…Ù‚Ø§Ù„:{" "}
                  {post ? (
                    <Link href={`/blog/${post.id}-${post.slug}`} className="text-orange-600 hover:text-orange-700">
                      {post.title}
                    </Link>
                  ) : (
                    "ØºÙŠØ± Ù…ØªØ§Ø­"
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={comment?.is_hidden ? unhideCommentAction : hideCommentAction}>
                    <input type="hidden" name="commentId" value={comment?.id || ""} />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                    >
                      {comment?.is_hidden ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„ØªØ¹Ù„ÙŠÙ‚" : "Ø¥Ø®ÙØ§Ø¡ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚"}
                    </button>
                  </form>
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="commentId" value={comment?.id || ""} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Ø­Ø°Ù Ø§Ù„ØªØ¹Ù„ÙŠÙ‚
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

