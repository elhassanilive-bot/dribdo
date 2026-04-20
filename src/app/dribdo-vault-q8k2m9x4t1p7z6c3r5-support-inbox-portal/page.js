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
  markAllTicketsAsRead,
  markTicketAsRead,
  updateTicketStatus,
} from "@/lib/support/tickets";

const PAGE_SIZE = 7;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "لوحة الدعم والرسائل",
  description: "لوحة سرية لإدارة طلبات اتصل بنا والشكاوى والإبلاغات وطلبات الحذف.",
  robots: { index: false, follow: false },
};

const typeLabelMap = {
  contact: "اتصل بنا",
  deletion: "طلب حذف الحساب",
  report_issue: "الإبلاغ عن مشكلة",
  complaint: "شكاوى وبلاغات",
};

const statusLabelMap = {
  open: "مفتوح",
  answered: "تم الرد",
  closed: "مغلق",
};

function toPositiveInt(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

function buildQueryString({ type = "", status = "", read = "", page = 1 } = {}) {
  const qs = new URLSearchParams();
  if (type) qs.set("type", type);
  if (status) qs.set("status", status);
  if (read) qs.set("read", read);
  qs.set("page", String(toPositiveInt(page, 1)));
  return `?${qs.toString()}`;
}

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
  const name = String(payload?.attachmentName || payload?.evidenceName || fallbackName || "").trim();
  const mime = String(payload?.attachmentMime || payload?.evidenceMime || "").trim().toLowerCase();
  const data = String(payload?.attachmentData || payload?.evidenceData || "").trim();
  if (!name && !data) return null;
  if (!data || !mime || data === "[base64-hidden]") return { name, mime: "", src: "", hasData: false };
  return { name, mime, src: `data:${mime};base64,${data}`, hasData: true };
}

function AttachmentPreview({ attachment }) {
  if (!attachment) return null;
  if (!attachment.hasData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        المرفق: {attachment.name || "ملف مرفق"} (بدون معاينة لهذا الطلب القديم)
      </div>
    );
  }

  const isImage = attachment.mime.startsWith("image/");
  const isVideo = attachment.mime.startsWith("video/");
  const isPdf = attachment.mime === "application/pdf";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold text-slate-700">المرفق: {attachment.name || "ملف"}</div>
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">المعاينة غير مدعومة لهذا النوع.</div>
      ) : null}
      <a
        href={attachment.src}
        download={attachment.name || "attachment"}
        className="mt-2 inline-block rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        تحميل المرفق
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
  if (result.ok) redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?info=smtp_test_ok`);
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}?error=${encodeURIComponent(result.message || result.code || "smtp_test_failed")}`);
}

async function changeStatusAction(formData) {
  "use server";
  const session = await requireSessionOrRedirect();

  const ticketId = String(formData.get("ticketId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const statusFilter = String(formData.get("statusFilter") || "").trim();
  const read = String(formData.get("read") || "").trim();
  const page = toPositiveInt(formData.get("page"), 1);

  if (!ticketId || !status) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status: statusFilter, read, page })}&error=invalid_status_input`);
  }
  if (status === "closed" && !isOwnerRole(session.role)) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status: statusFilter, read, page })}&error=owner_only_close_action`);
  }

  const result = await updateTicketStatus({ ticketId, status });
  if (!result.ok) {
    redirect(
      `${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status: statusFilter, read, page })}&error=${encodeURIComponent(
        result.error || "status_update_failed"
      )}`
    );
  }

  revalidatePath(SECRET_SUPPORT_DASHBOARD_PATH);
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status: statusFilter, read, page })}&info=status_updated`);
}

async function markReadAction(formData) {
  "use server";
  await requireSessionOrRedirect();

  const ticketId = String(formData.get("ticketId") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const read = String(formData.get("read") || "").trim();
  const page = toPositiveInt(formData.get("page"), 1);

  const result = await markTicketAsRead(ticketId);
  if (!result.ok) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page })}&error=${encodeURIComponent(result.error || "mark_read_failed")}`);
  }

  revalidatePath(SECRET_SUPPORT_DASHBOARD_PATH);
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page })}&info=marked_read`);
}

async function markAllReadAction(formData) {
  "use server";
  await requireSessionOrRedirect();

  const type = String(formData.get("type") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const read = String(formData.get("read") || "").trim();

  const result = await markAllTicketsAsRead({ type, status, readState: read });
  if (!result.ok) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page: 1 })}&error=${encodeURIComponent(result.error || "mark_all_read_failed")}`);
  }

  revalidatePath(SECRET_SUPPORT_DASHBOARD_PATH);
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page: 1 })}&info=all_marked_read`);
}

async function replyAction(formData) {
  "use server";
  await requireSessionOrRedirect();

  const ticketId = String(formData.get("ticketId") || "").trim();
  const toEmail = String(formData.get("toEmail") || "").trim();
  const subjectBase = String(formData.get("subject") || "").trim();
  const replyMessage = String(formData.get("replyMessage") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const status = String(formData.get("statusFilter") || "").trim();
  const read = String(formData.get("read") || "").trim();
  const page = toPositiveInt(formData.get("page"), 1);

  if (!ticketId || !toEmail || !replyMessage) {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page })}&error=missing_reply_fields`);
  }

  let emailDeliveryStatus = "pending";
  let emailError = "";

  if (!isSmtpConfigured()) {
    emailDeliveryStatus = "failed";
    emailError = "smtp_not_configured";
  } else {
    try {
      const subject = `رد من فريق دريبدو${subjectBase ? ` - ${subjectBase}` : ""}`;
      const text = `مرحبًا،\n\n${replyMessage}\n\n---\nهذا الرد مرسل من فريق دعم دريبدو.`;
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
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page })}&error=${encodeURIComponent(addResult.error || "reply_save_failed")}`);
  }

  revalidatePath(SECRET_SUPPORT_DASHBOARD_PATH);
  if (emailDeliveryStatus === "sent") {
    redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page })}&info=reply_sent`);
  }
  redirect(`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page })}&error=${encodeURIComponent(emailError || "reply_saved_but_email_failed")}`);
}

function LoginCard({ error, info }) {
  return (
    <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-right shadow-sm" dir="rtl">
      <h1 className="text-2xl font-black text-slate-900">لوحة الرسائل السرية</h1>
      <p className="mt-3 text-sm text-slate-600">هذه الصفحة خاصة بالإدارة فقط. أدخل مفتاح المالك أو مفتاح المشرف للوصول.</p>
      {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">فشل الدخول: {error}</div> : null}
      {info ? <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">{info}</div> : null}
      <form action={unlockAction} className="mt-6 space-y-3">
        <label className="block text-sm font-semibold text-slate-700">مفتاح الدخول</label>
        <input
          name="accessKey"
          type="password"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="SUPPORT_DASHBOARD_OWNER_KEY / SUPPORT_DASHBOARD_ADMIN_KEYS"
        />
        <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">
          فتح اللوحة
        </button>
      </form>
    </section>
  );
}

function Pagination({ page, totalPages, type, status, read }) {
  const current = toPositiveInt(page, 1);
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className="mt-3 flex flex-wrap items-center justify-center gap-2" aria-label="pagination">
      <a
        href={`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page: Math.max(1, current - 1) })}`}
        className={`rounded-xl border px-3 py-1 text-xs ${current <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50"}`}
      >
        السابق
      </a>
      {pages.map((p) => (
        <a
          key={p}
          href={`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page: p })}`}
          className={`rounded-xl border px-3 py-1 text-xs ${p === current ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}
        >
          {p}
        </a>
      ))}
      <a
        href={`${SECRET_SUPPORT_DASHBOARD_PATH}${buildQueryString({ type, status, read, page: Math.min(totalPages, current + 1) })}`}
        className={`rounded-xl border px-3 py-1 text-xs ${current >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50"}`}
      >
        التالي
      </a>
    </nav>
  );
}

export default async function SecretSupportDashboard({ searchParams }) {
  const params = await searchParams;
  const type = String(params?.type || "").trim();
  const status = String(params?.status || "").trim();
  const read = String(params?.read || "").trim();
  const page = toPositiveInt(params?.page, 1);
  const error = String(params?.error || "").trim();
  const info = String(params?.info || "").trim();

  if (!isSupportAccessConfigured()) {
    return (
      <section className="mx-auto mt-16 max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-right" dir="rtl">
        <h1 className="text-2xl font-black text-amber-900">لوحة الدعم غير مفعلة</h1>
        <p className="mt-3 text-sm text-amber-800">
          أضف متغير البيئة <code>SUPPORT_DASHBOARD_OWNER_KEY</code> (أو <code>SUPPORT_DASHBOARD_KEY</code>) ثم أعد النشر.
        </p>
      </section>
    );
  }

  const session = await getSupportSession();
  if (!session.allowed) return <LoginCard error={error} info={info} />;

  const ticketsResult = await listSupportTickets({ page, pageSize: PAGE_SIZE, type, status, readState: read });
  const ticketIds = ticketsResult?.tickets?.map((ticket) => ticket.id) || [];
  const [repliesResult, statsResult] = await Promise.all([listRepliesForTickets(ticketIds), getSupportInboxStats()]);
  const { ok, tickets, error: queryError, total = 0, totalPages = 1 } = ticketsResult;
  const repliesByTicket = repliesResult?.ok ? repliesResult.repliesByTicket || {} : {};
  const initialUnreadCount = statsResult?.ok ? statsResult.stats?.unreadCount || 0 : 0;
  const initialLatestTicketId = statsResult?.ok ? statsResult.stats?.latestTicketId || "" : "";
  const roleLabel = isOwnerRole(session.role) ? "مالك" : "مشرف";

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">صندوق رسائل الدعم</h1>
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">{initialUnreadCount}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">عرض منظم وقابل للتوسع حتى ملايين الرسائل عبر صفحات.</p>
              <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">الصلاحية الحالية: {roleLabel}</div>
            </div>
            <div className="flex items-center gap-2">
              <SupportRealtimeNotifier initialLatestTicketId={initialLatestTicketId} initialUnreadCount={initialUnreadCount} />
              <form action={markAllReadAction}>
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="status" value={status} />
                <input type="hidden" name="read" value={read} />
                <button type="submit" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  تحديد الكل كمقروء
                </button>
              </form>
              <form action={smtpTestAction}>
                <button type="submit" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  اختبار SMTP
                </button>
              </form>
              <form action={logoutAction}>
                <button type="submit" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  تسجيل خروج
                </button>
              </form>
            </div>
          </div>

          <form method="get" className="mt-4 grid gap-3 sm:grid-cols-4">
            <select name="type" defaultValue={type} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">كل الصفحات</option>
              <option value="contact">اتصل بنا</option>
              <option value="report_issue">الإبلاغ عن مشكلة</option>
              <option value="complaint">شكاوى وبلاغات</option>
              <option value="deletion">طلب حذف الحساب</option>
            </select>
            <select name="status" defaultValue={status} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">كل الحالات</option>
              <option value="open">مفتوح</option>
              <option value="answered">تم الرد</option>
              <option value="closed">مغلق</option>
            </select>
            <select name="read" defaultValue={read} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">كل الرسائل</option>
              <option value="unread">غير مقروءة</option>
              <option value="read">مقروءة</option>
            </select>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              تطبيق الفلترة
            </button>
          </form>

          <div className="mt-3 text-xs text-slate-500">إجمالي النتائج: {total} - المعروض في الصفحة: {PAGE_SIZE}</div>
          {info ? <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{info}</div> : null}
          {error ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div> : null}
          {!ok && queryError ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">تعذر تحميل الرسائل: {queryError}</div> : null}
        </header>

        <section className="space-y-3">
          {tickets?.length ? (
            tickets.map((ticket) => {
              const subject = String(ticket?.subject || "").trim();
              const message = String(ticket?.message || "").trim();
              const payload = ticket?.payload && typeof ticket.payload === "object" ? ticket.payload : {};
              const attachment = getAttachmentFromPayload(payload, ticket?.attachment_name);
              const safePayload = { ...payload };
              if (safePayload.attachmentData) safePayload.attachmentData = "[base64-hidden-for-preview]";
              if (safePayload.evidenceData) safePayload.evidenceData = "[base64-hidden-for-preview]";
              const typeLabel = typeLabelMap[ticket?.request_type] || ticket?.request_type || "غير محدد";
              const statusLabel = statusLabelMap[ticket?.status] || ticket?.status || "-";
              const replies = Array.isArray(repliesByTicket[ticket.id]) ? repliesByTicket[ticket.id] : [];
              const canClose = isOwnerRole(session.role);
              const isUnread = ticket?.is_read === false;

              return (
                <article key={ticket.id} className={`rounded-3xl border bg-white p-5 shadow-sm ${isUnread ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">{typeLabel}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{statusLabel}</span>
                      <span className={`rounded-full px-2.5 py-1 font-semibold ${isUnread ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {isUnread ? "غير مقروء" : "مقروء"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{formatDate(ticket.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <form action={markReadAction}>
                          <input type="hidden" name="ticketId" value={ticket.id} />
                          <input type="hidden" name="type" value={type} />
                          <input type="hidden" name="status" value={status} />
                          <input type="hidden" name="read" value={read} />
                          <input type="hidden" name="page" value={page} />
                          <button type="submit" className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                            تحديد كمقروء
                          </button>
                        </form>
                      ) : null}
                      <form action={changeStatusAction} className="flex items-center gap-2">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="statusFilter" value={status} />
                        <input type="hidden" name="read" value={read} />
                        <input type="hidden" name="page" value={page} />
                        <select name="status" defaultValue={ticket.status || "open"} className="rounded-xl border border-slate-200 px-2 py-1 text-xs">
                          <option value="open">مفتوح</option>
                          <option value="answered">تم الرد</option>
                          {canClose ? <option value="closed">مغلق</option> : null}
                        </select>
                        <button type="submit" className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          حفظ الحالة
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-2 text-sm text-slate-700">
                      <div><span className="font-semibold">المرسل:</span> {ticket.requester_name || "-"}</div>
                      <div><span className="font-semibold">البريد:</span> {ticket.requester_email || "-"}</div>
                      <div><span className="font-semibold">العنوان:</span> {subject || "-"}</div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 whitespace-pre-wrap">{message || "بدون رسالة"}</div>
                      <AttachmentPreview attachment={attachment} />

                      <details className="rounded-2xl border border-slate-200 bg-white p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-600">سجل المحادثة</summary>
                        {replies.length ? (
                          <div className="mt-2 space-y-2">
                            {replies.map((reply) => (
                              <div key={reply.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs">
                                <div className="font-semibold text-slate-800">{reply.author_name || "Support"}</div>
                                <div className="mt-1 whitespace-pre-wrap text-slate-700">{reply.message || "-"}</div>
                                <div className="mt-1 text-[11px] text-slate-500">
                                  {formatDate(reply.created_at)} - البريد: {reply.email_delivery_status === "sent" ? "تم الإرسال" : "فشل الإرسال"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-slate-500">لا يوجد ردود حتى الآن.</div>
                        )}
                      </details>

                      <details className="rounded-2xl border border-slate-200 bg-white p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-600">عرض التفاصيل الخام للطلب</summary>
                        <pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-700">{JSON.stringify(safePayload, null, 2)}</pre>
                      </details>
                    </div>

                    <form action={replyAction} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input type="hidden" name="toEmail" value={ticket.requester_email || ""} />
                      <input type="hidden" name="subject" value={subject} />
                      <input type="hidden" name="type" value={type} />
                      <input type="hidden" name="statusFilter" value={status} />
                      <input type="hidden" name="read" value={read} />
                      <input type="hidden" name="page" value={page} />
                      <div className="text-sm font-bold text-slate-800">الرد على المستخدم</div>
                      <textarea
                        name="replyMessage"
                        required
                        rows={6}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="اكتب الرد الذي سيصل إلى بريد المستخدم"
                      />
                      <button type="submit" className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                        إرسال الرد عبر البريد
                      </button>
                    </form>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">لا توجد رسائل حاليًا.</div>
          )}
        </section>

        <Pagination page={page} totalPages={totalPages} type={type} status={status} read={read} />
      </main>
    </div>
  );
}
