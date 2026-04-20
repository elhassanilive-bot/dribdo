import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";
import SupportRealtimeNotifier from "./SupportRealtimeNotifier";
import {
  clearSupportSession,
  createSupportSession,
  getSupportSession,
  isOwnerRole,
  isSupportAccessConfigured,
  resolveSupportRoleByKey,
} from "@/lib/support/auth";
import { isSmtpConfigured, sendEmailToUser, testSmtpConnection } from "@/lib/support/mailer";
import { SECRET_SUPPORT_DASHBOARD_PATH } from "@/lib/support/paths";
import {
  addTicketReply,
  getSupportInboxStats,
  listRepliesForTickets,
  listSupportTickets,
  updateTicketStatus,
} from "@/lib/support/tickets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Ù„ÙˆØ­Ø© Ø§Ù„Ø¯Ø¹Ù… ÙˆØ§Ù„Ø±Ø³Ø§Ø¦Ù„",
  description: "Ù„ÙˆØ­Ø© Ø³Ø±ÙŠØ© Ù„Ø¥Ø¯Ø§Ø±Ø© Ø·Ù„Ø¨Ø§Øª Ø§ØªØµÙ„ Ø¨Ù†Ø§ ÙˆØ§Ù„Ø´ÙƒØ§ÙˆÙ‰ ÙˆØ§Ù„Ø¥Ø¨Ù„Ø§ØºØ§Øª ÙˆØ·Ù„Ø¨Ø§Øª Ø§Ù„Ø­Ø°Ù.",
  robots: { index: false, follow: false },
};

const typeLabelMap = {
  contact: "Ø§ØªØµÙ„ Ø¨Ù†Ø§",
  deletion: "Ø·Ù„Ø¨ Ø­Ø°Ù Ø§Ù„Ø­Ø³Ø§Ø¨",
  report_issue: "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø´ÙƒÙ„Ø©",
  complaint: "Ø´ÙƒØ§ÙˆÙ‰ ÙˆØ¨Ù„Ø§ØºØ§Øª",
};

const statusLabelMap = {
  open: "Ù…ÙØªÙˆØ­",
  answered: "ØªÙ… Ø§Ù„Ø±Ø¯",
  closed: "Ù…ØºÙ„Ù‚",
};

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function getAttachmentFromPayload(payload, fallbackName) {
  const name = String(payload?.attachmentName || fallbackName || "").trim();
  const mime = String(payload?.attachmentMime || "").trim().toLowerCase();
  const data = String(payload?.attachmentData || "").trim();
  if (!name && !data) return null;
  if (!data || !mime) return { name, mime: "", src: "", hasData: false };
  return { name, mime, src: `data:${mime};base64,${data}`, hasData: true };
}

function AttachmentPreview({ attachment }) {
  if (!attachment) return null;
  if (!attachment.hasData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        Ø§Ù„Ù…Ø±ÙÙ‚: {attachment.name || "Ù…Ù„Ù Ù…Ø±ÙÙ‚"} (Ø¨Ø¯ÙˆÙ† Ù…Ø¹Ø§ÙŠÙ†Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ù‚Ø¯ÙŠÙ…)
      </div>
    );
  }

  const isImage = attachment.mime.startsWith("image/");
  const isVideo = attachment.mime.startsWith("video/");
  const isPdf = attachment.mime === "application/pdf";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold text-slate-700">Ø§Ù„Ù…Ø±ÙÙ‚: {attachment.name || "Ù…Ù„Ù"}</div>
      {isImage ? (
        <Image
          src={attachment.src}
          alt={attachment.name || "attachment"}
          width={900}
          height={540}
          unoptimized
          className="max-h-72 w-auto rounded-xl border border-slate-200 object-contain"
        />
      ) : null}
      {isVideo ? (
        <video controls className="max-h-72 w-full rounded-xl border border-slate-200">
          <source src={attachment.src} type={attachment.mime} />
        </video>
      ) : null}
      {isPdf ? <iframe title={attachment.name || "PDF"} src={attachment.src} className="h-80 w-full rounded-xl border border-slate-200" /> : null}
      {!isImage && !isVideo && !isPdf ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„Ù†ÙˆØ¹.</div>
      ) : null}
      <a
        href={attachment.src}
        download={attachment.name || "attachment"}
        className="mt-2 inline-block rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø±ÙÙ‚
      </a>
    </div>
  );
}

async function requireSessionOrRedirect() {
  const session = await getSupportSession();
  if (!session.allowed) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=unauthorized`);
  }
  return session;
}

async function unlockAction(formData) {
  "use server";

  const key = String(formData.get("accessKey") || "").trim();
  const role = resolveSupportRoleByKey(key);
  if (!role) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=invalid_key`);
  }

  await createSupportSession(role);
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?info=logged_in`);
}

async function logoutAction() {
  "use server";
  await clearSupportSession();
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?info=logged_out`);
}

async function smtpTestAction() {
  "use server";

  await requireSessionOrRedirect();
  const result = await testSmtpConnection({ sendProbe: true });
  revalidatePath(SECRET_SUPPORT_DASHBOARD_PATH);

  if (result.ok) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?info=smtp_test_ok`);
  }

  const message = result.message || result.code || "smtp_test_failed";
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=${encodeURIComponent(message)}`);
}

async function changeStatusAction(formData) {
  "use server";

  const session = await requireSessionOrRedirect();
  const ticketId = String(formData.get("ticketId") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!ticketId || !status) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=invalid_status_input`);
  }

  if (status === "closed" && !isOwnerRole(session.role)) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=owner_only_close_action`);
  }

  const result = await updateTicketStatus({ ticketId, status });
  if (!result.ok) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=${encodeURIComponent(result.error || "status_update_failed")}`);
  }

  revalidatePath(SECRET_SUPPORT_DASHBOARD_PATH);
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?info=status_updated`);
}

async function replyAction(formData) {
  "use server";

  await requireSessionOrRedirect();

  const ticketId = String(formData.get("ticketId") || "").trim();
  const toEmail = String(formData.get("toEmail") || "").trim();
  const subjectBase = String(formData.get("subject") || "").trim();
  const replyMessage = String(formData.get("replyMessage") || "").trim();

  if (!ticketId || !toEmail || !replyMessage) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=missing_reply_fields`);
  }

  let emailDeliveryStatus = "pending";
  let emailError = "";

  if (!isSmtpConfigured()) {
    emailDeliveryStatus = "failed";
    emailError = "smtp_not_configured";
  } else {
    try {
      const subject = `Ø±Ø¯ Ù…Ù† ÙØ±ÙŠÙ‚ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ${subjectBase ? ` - ${subjectBase}` : ""}`;
      const text = `Ù…Ø±Ø­Ø¨Ù‹Ø§ØŒ\n\n${replyMessage}\n\n---\nÙ‡Ø°Ø§ Ø§Ù„Ø±Ø¯ Ù…Ø±Ø³Ù„ Ù…Ù† ÙØ±ÙŠÙ‚ Ø¯Ø¹Ù… Ø¯Ø±ÙŠØ¨Ø¯Ùˆ.`;

      await sendEmailToUser({ to: toEmail, subject, text });
      emailDeliveryStatus = "sent";
    } catch (error) {
      emailDeliveryStatus = "failed";
      emailError = error instanceof Error ? error.message : "email_send_failed";
    }
  }

  const addResult = await addTicketReply({
    ticketId,
    authorName: "Dribdo Support",
    authorEmail: process.env.CONTACT_RECIPIENT || "support@dribdo.com",
    message: replyMessage,
    sentToEmail: toEmail,
    emailDeliveryStatus,
    emailError,
  });

  if (!addResult.ok) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=${encodeURIComponent(addResult.error || "reply_save_failed")}`);
  }

  revalidatePath(SECRET_SUPPORT_DASHBOARD_PATH);
  if (emailDeliveryStatus === "sent") {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?info=reply_sent`);
  }

  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=${encodeURIComponent(emailError || "reply_saved_but_email_failed")}`);
}

function LoginCard({ error, info }) {
  return (
    <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-right shadow-sm" dir="rtl">
      <h1 className="text-2xl font-black text-slate-900">Ù„ÙˆØ­Ø© Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø³Ø±ÙŠØ©</h1>
      <p className="mt-3 text-sm text-slate-600">Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ø®Ø§ØµØ© Ø¨Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙÙ‚Ø·. Ø£Ø¯Ø®Ù„ Ù…ÙØªØ§Ø­ Ø§Ù„Ù…Ø§Ù„Ùƒ Ø£Ùˆ Ù…ÙØªØ§Ø­ Ø§Ù„Ù…Ø´Ø±Ù Ù„Ù„ÙˆØµÙˆÙ„.</p>

      {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">ÙØ´Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„: {error}</div> : null}
      {info ? <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">{info}</div> : null}

      <form action={unlockAction} className="mt-6 space-y-3">
        <label className="block text-sm font-semibold text-slate-700">Ù…ÙØªØ§Ø­ Ø§Ù„Ø¯Ø®ÙˆÙ„</label>
        <input
          name="accessKey"
          type="password"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="SUPPORT_DASHBOARD_OWNER_KEY / SUPPORT_DASHBOARD_ADMIN_KEYS"
        />
        <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">
          ÙØªØ­ Ø§Ù„Ù„ÙˆØ­Ø©
        </button>
      </form>
    </section>
  );
}

export default async function SecretSupportDashboard({ searchParams }) {
  const params = await searchParams;
  const type = String(params?.type || "").trim();
  const status = String(params?.status || "").trim();
  const error = String(params?.error || "").trim();
  const info = String(params?.info || "").trim();

  if (!isSupportAccessConfigured()) {
    return (
      <section className="mx-auto mt-16 max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-right" dir="rtl">
        <h1 className="text-2xl font-black text-amber-900">Ù„ÙˆØ­Ø© Ø§Ù„Ø¯Ø¹Ù… ØºÙŠØ± Ù…ÙØ¹Ù„Ø©</h1>
        <p className="mt-3 text-sm text-amber-800">
          Ø£Ø¶Ù Ù…ØªØºÙŠØ± Ø§Ù„Ø¨ÙŠØ¦Ø© <code>SUPPORT_DASHBOARD_OWNER_KEY</code> (Ø£Ùˆ <code>SUPPORT_DASHBOARD_KEY</code>) Ø«Ù… Ø£Ø¹Ø¯ Ø§Ù„Ù†Ø´Ø±.
        </p>
      </section>
    );
  }

  const session = await getSupportSession();
  if (!session.allowed) {
    return <LoginCard error={error} info={info} />;
  }

  const ticketsResult = await listSupportTickets({ limit: 250, type, status });
  const ticketIds = ticketsResult?.tickets?.map((ticket) => ticket.id) || [];
  const [repliesResult, statsResult] = await Promise.all([listRepliesForTickets(ticketIds), getSupportInboxStats()]);
  const { ok, tickets, error: queryError } = ticketsResult;

  const repliesByTicket = repliesResult?.ok ? repliesResult.repliesByTicket || {} : {};
  const initialOpenCount = statsResult?.ok ? statsResult.stats?.openCount || 0 : 0;
  const initialLatestTicketId = statsResult?.ok ? statsResult.stats?.latestTicketId || "" : "";
  const roleLabel = isOwnerRole(session.role) ? "Ù…Ø§Ù„Ùƒ" : "Ù…Ø´Ø±Ù";

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900">ØµÙ†Ø¯ÙˆÙ‚ Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø¯Ø¹Ù…</h1>
              <p className="mt-1 text-sm text-slate-600">ØªØµÙ„ Ù‡Ù†Ø§ ÙƒÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ù…Ù† Ø§ØªØµÙ„ Ø¨Ù†Ø§ØŒ Ø§Ù„Ø¥Ø¨Ù„Ø§ØºØ§ØªØŒ Ø§Ù„Ø´ÙƒØ§ÙˆÙ‰ØŒ ÙˆØ·Ù„Ø¨Ø§Øª Ø­Ø°Ù Ø§Ù„Ø­Ø³Ø§Ø¨.</p>
              <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ø­Ø§Ù„ÙŠØ©: {roleLabel}</div>
            </div>
            <div className="flex items-center gap-2">
              <SupportRealtimeNotifier initialLatestTicketId={initialLatestTicketId} initialOpenCount={initialOpenCount} />
              <form action={smtpTestAction}>
                <button type="submit" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  اختبار SMTP
                </button>
              </form>
              <form action={logoutAction}>
                <button type="submit" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  ØªØ³Ø¬ÙŠÙ„ Ø®Ø±ÙˆØ¬
                </button>
              </form>
            </div>
          </div>

          <form method="get" className="mt-4 grid gap-3 sm:grid-cols-3">
            <select name="type" defaultValue={type} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">ÙƒÙ„ Ø§Ù„ØµÙØ­Ø§Øª</option>
              <option value="contact">Ø§ØªØµÙ„ Ø¨Ù†Ø§</option>
              <option value="report_issue">Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø´ÙƒÙ„Ø©</option>
              <option value="complaint">Ø´ÙƒØ§ÙˆÙ‰ ÙˆØ¨Ù„Ø§ØºØ§Øª</option>
              <option value="deletion">Ø·Ù„Ø¨ Ø­Ø°Ù Ø§Ù„Ø­Ø³Ø§Ø¨</option>
            </select>
            <select name="status" defaultValue={status} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">ÙƒÙ„ Ø§Ù„Ø­Ø§Ù„Ø§Øª</option>
              <option value="open">Ù…ÙØªÙˆØ­</option>
              <option value="answered">ØªÙ… Ø§Ù„Ø±Ø¯</option>
              <option value="closed">Ù…ØºÙ„Ù‚</option>
            </select>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„ÙÙ„ØªØ±Ø©
            </button>
          </form>

          {info ? <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{info}</div> : null}
          {error ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div> : null}
          {!ok && queryError ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„: {queryError}</div> : null}
        </header>

        <section className="space-y-3">
          {tickets?.length ? (
            tickets.map((ticket) => {
              const subject = String(ticket?.subject || "").trim();
              const message = String(ticket?.message || "").trim();
              const payload = ticket?.payload && typeof ticket.payload === "object" ? ticket.payload : {};
              const attachment = getAttachmentFromPayload(payload, ticket?.attachment_name);
              const safePayload = { ...payload };
              if (safePayload.attachmentData) {
                safePayload.attachmentData = "[base64-hidden-for-preview]";
              }
              const typeLabel = typeLabelMap[ticket?.request_type] || ticket?.request_type || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
              const statusLabel = statusLabelMap[ticket?.status] || ticket?.status || "-";
              const replies = Array.isArray(repliesByTicket[ticket.id]) ? repliesByTicket[ticket.id] : [];
              const canClose = isOwnerRole(session.role);

              return (
                <article key={ticket.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">{typeLabel}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{statusLabel}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{formatDate(ticket.created_at)}</span>
                    </div>

                    <form action={changeStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <select name="status" defaultValue={ticket.status || "open"} className="rounded-xl border border-slate-200 px-2 py-1 text-xs">
                        <option value="open">Ù…ÙØªÙˆØ­</option>
                        <option value="answered">ØªÙ… Ø§Ù„Ø±Ø¯</option>
                        {canClose ? <option value="closed">Ù…ØºÙ„Ù‚</option> : null}
                      </select>
                      <button type="submit" className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        Ø­ÙØ¸ Ø§Ù„Ø­Ø§Ù„Ø©
                      </button>
                    </form>
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-2 text-sm text-slate-700">
                      <div>
                        <span className="font-semibold">Ø§Ù„Ù…Ø±Ø³Ù„:</span> {ticket.requester_name || "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Ø§Ù„Ø¨Ø±ÙŠØ¯:</span> {ticket.requester_email || "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Ø§Ù„Ø¹Ù†ÙˆØ§Ù†:</span> {subject || "-"}
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 whitespace-pre-wrap">{message || "Ø¨Ø¯ÙˆÙ† Ø±Ø³Ø§Ù„Ø©"}</div>
                      <AttachmentPreview attachment={attachment} />

                      <details className="rounded-2xl border border-slate-200 bg-white p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-600">Ø³Ø¬Ù„ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©</summary>
                        {replies.length ? (
                          <div className="mt-2 space-y-2">
                            {replies.map((reply) => (
                              <div key={reply.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs">
                                <div className="font-semibold text-slate-800">{reply.author_name || "Support"}</div>
                                <div className="mt-1 whitespace-pre-wrap text-slate-700">{reply.message || "-"}</div>
                                <div className="mt-1 text-[11px] text-slate-500">
                                  {formatDate(reply.created_at)} - Ø§Ù„Ø¨Ø±ÙŠØ¯: {reply.email_delivery_status === "sent" ? "ØªÙ… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„" : "ÙØ´Ù„ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-slate-500">Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ø¯ÙˆØ¯ Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.</div>
                        )}
                      </details>

                      <details className="rounded-2xl border border-slate-200 bg-white p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-600">Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø®Ø§Ù… Ù„Ù„Ø·Ù„Ø¨</summary>
                        <pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-700">{JSON.stringify(safePayload, null, 2)}</pre>
                      </details>
                    </div>

                    <form action={replyAction} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input type="hidden" name="toEmail" value={ticket.requester_email || ""} />
                      <input type="hidden" name="subject" value={subject} />
                      <div className="text-sm font-bold text-slate-800">Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…</div>
                      <textarea
                        name="replyMessage"
                        required
                        rows={6}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Ø§ÙƒØªØ¨ Ø§Ù„Ø±Ø¯ Ø§Ù„Ø°ÙŠ Ø³ÙŠØµÙ„ Ø¥Ù„Ù‰ Ø¨Ø±ÙŠØ¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…"
                      />
                      <button type="submit" className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                        Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø¯ Ø¹Ø¨Ø± Ø§Ù„Ø¨Ø±ÙŠØ¯
                      </button>
                    </form>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø±Ø³Ø§Ø¦Ù„ Ø­Ø§Ù„ÙŠÙ‹Ø§.</div>
          )}
        </section>
      </main>
    </div>
  );
}

