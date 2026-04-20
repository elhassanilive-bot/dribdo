import { NextResponse } from "next/server";
import { reportTypes } from "@/app/complaints/reportTypes";
import { isSmtpConfigured, sendSupportEmail } from "@/lib/support/mailer";
import { createSupportTicket } from "@/lib/support/tickets";

const RATE_LIMIT_WINDOW_MS = 90 * 1000;
const MAX_REQUESTS_PER_WINDOW = 4;
const MAX_BASE64_CHARS = 900000;
const rateLimitStore = new Map();

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function enforceRateLimit(request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || { count: 0, expires: 0 };

  if (entry.expires < now) {
    entry.count = 0;
    entry.expires = now + RATE_LIMIT_WINDOW_MS;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return true;
}

function sanitizeEvidenceMime(value) {
  const mime = String(value || "").trim().toLowerCase();
  if (!mime) return "";
  if (mime.startsWith("image/")) return mime;
  if (mime === "application/pdf") return mime;
  return "";
}

function sanitizeEvidenceData(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const cleaned = raw.replace(/[^A-Za-z0-9+/=]/g, "");
  if (cleaned.length > MAX_BASE64_CHARS) return "";
  return cleaned;
}

function buildMessage(payload) {
  const now = new Date().toISOString();
  return `نوع البلاغ: ${payload.reportTypeLabel}
المرسل: ${payload.name || "غير معروف"}
البريد الإلكتروني: ${payload.email}
الرابط أو الحساب: ${payload.target}
الوصف:
${payload.description}

تاريخ الإرسال: ${now}`;
}

export async function POST(request) {
  if (!enforceRateLimit(request)) {
    return NextResponse.json({ message: "تم الوصول للحد الأقصى للإرسال. حاول لاحقًا." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "الطلب غير صالح." }, { status: 400 });
  }

  const errors = {};
  if (!body.email?.trim()) errors.email = "البريد الإلكتروني مطلوب.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = "الرجاء إدخال بريد إلكتروني صالح.";
  if (!body.reportType) errors.reportType = "نوع البلاغ مطلوب.";
  if (!body.target?.trim()) errors.target = "الرابط أو اسم المستخدم مطلوب.";
  if (!body.description?.trim()) errors.description = "وصف المشكلة مطلوب.";

  const typeMeta = reportTypes.find((type) => type.value === body.reportType);
  if (!typeMeta) errors.reportType = "نوع البلاغ غير صالح.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors, message: "استكمل الحقول المطلوبة." }, { status: 400 });
  }

  const payload = {
    name: body.name?.trim() || "غير مذكور",
    email: body.email.trim(),
    reportType: body.reportType,
    reportTypeLabel: typeMeta?.label || body.reportType,
    target: body.target.trim(),
    description: body.description.trim(),
    evidenceName: String(body.evidenceName || "").trim(),
    evidenceMime: sanitizeEvidenceMime(body.evidenceMime),
    evidenceData: sanitizeEvidenceData(body.evidenceData),
  };

  const ticketPayload = { ...payload, evidenceData: payload.evidenceData ? "[base64-hidden]" : "" };

  const ticket = await createSupportTicket({
    requestType: "complaint",
    source: "complaints_form",
    requesterName: payload.name,
    requesterEmail: payload.email,
    subject: `بلاغ جديد - ${payload.reportTypeLabel}`,
    message: payload.description,
    payload: ticketPayload,
    attachmentName: payload.evidenceName,
  });

  if (!ticket.ok) {
    return NextResponse.json({ message: `تعذر حفظ الطلب: ${ticket.error || "unknown"}` }, { status: 500 });
  }

  if (isSmtpConfigured()) {
    try {
      await sendSupportEmail({
        replyTo: payload.email,
        subject: `بلاغ جديد - ${payload.reportTypeLabel}`,
        text: buildMessage(payload),
        attachments:
          payload.evidenceData && payload.evidenceName
            ? [{ filename: payload.evidenceName, content: Buffer.from(payload.evidenceData, "base64") }]
            : undefined,
      });
    } catch (error) {
      console.error("complaint mail error", error);
    }
  }

  return NextResponse.json({ success: true, ticketId: ticket.ticket?.id || null });
}
