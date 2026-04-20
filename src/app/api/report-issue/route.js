import { NextResponse } from "next/server";
import { isSmtpConfigured, sendSupportEmail } from "@/lib/support/mailer";
import { createSupportTicket } from "@/lib/support/tickets";

const RATE_LIMIT_WINDOW_MS = 90 * 1000;
const MAX_REQUESTS_PER_WINDOW = 4;
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

function buildMessage(payload) {
  return [
    `الاسم: ${payload.fullName}`,
    `البريد الإلكتروني: ${payload.email}`,
    `القسم المتأثر: ${payload.issueArea}`,
    `الرابط أو المسار: ${payload.pageUrl || "غير مذكور"}`,
    `الجهاز أو النظام: ${payload.device || "غير مذكور"}`,
    `المتصفح أو النسخة: ${payload.browser || "غير مذكور"}`,
    "",
    "ما المتوقع:",
    payload.expectedResult || "غير مذكور",
    "",
    "ما الذي حدث فعليًا:",
    payload.actualResult,
    "",
    "خطوات إعادة ظهور المشكلة:",
    payload.steps,
  ].join("\n");
}

function sanitizeAttachmentMime(value) {
  const mime = String(value || "").trim().toLowerCase();
  if (!mime) return "";
  if (mime.startsWith("image/")) return mime;
  if (mime.startsWith("video/")) return mime;
  if (mime === "application/pdf") return mime;
  if (mime === "text/plain") return mime;
  return "";
}

function sanitizeAttachmentData(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const cleaned = raw.replace(/[^A-Za-z0-9+/=]/g, "");
  const MAX_BASE64_CHARS = 1_500_000;
  if (cleaned.length > MAX_BASE64_CHARS) return "";
  return cleaned;
}

export async function POST(request) {
  if (!enforceRateLimit(request)) {
    return NextResponse.json({ message: "تم الوصول للحد الأقصى من البلاغات. حاول لاحقًا." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "الطلب غير صالح." }, { status: 400 });
  }

  const errors = {};
  if (!body.fullName?.trim()) errors.fullName = "الاسم الكامل مطلوب.";
  if (!body.email?.trim()) errors.email = "البريد الإلكتروني مطلوب.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = "أدخل بريدًا إلكترونيًا صالحًا.";
  if (!body.issueArea?.trim()) errors.issueArea = "القسم المتأثر مطلوب.";
  if (!body.actualResult?.trim()) errors.actualResult = "اشرح ما الذي حدث فعليًا.";
  if (!body.steps?.trim()) errors.steps = "اكتب خطوات إعادة ظهور المشكلة.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors, message: "يرجى استكمال الحقول المطلوبة." }, { status: 400 });
  }

  const payload = {
    fullName: body.fullName.trim(),
    email: body.email.trim(),
    issueArea: body.issueArea.trim(),
    pageUrl: body.pageUrl?.trim() || "",
    device: body.device?.trim() || "",
    browser: body.browser?.trim() || "",
    expectedResult: body.expectedResult?.trim() || "",
    actualResult: body.actualResult.trim(),
    steps: body.steps.trim(),
    attachmentName: body.attachmentName || "",
    attachmentMime: sanitizeAttachmentMime(body.attachmentMime),
    attachmentData: sanitizeAttachmentData(body.attachmentData),
  };

  let ticket = await createSupportTicket({
    requestType: "report_issue",
    source: "report_issue_form",
    requesterName: payload.fullName,
    requesterEmail: payload.email,
    subject: `بلاغ تقني - ${payload.issueArea}`,
    message: payload.actualResult,
    payload,
    attachmentName: payload.attachmentName,
  });

  if (!ticket.ok && payload.attachmentData) {
    const fallbackPayload = { ...payload, attachmentData: "", attachmentMime: "", attachmentDropped: true };
    ticket = await createSupportTicket({
      requestType: "report_issue",
      source: "report_issue_form",
      requesterName: fallbackPayload.fullName,
      requesterEmail: fallbackPayload.email,
      subject: `بلاغ تقني - ${fallbackPayload.issueArea}`,
      message: fallbackPayload.actualResult,
      payload: fallbackPayload,
      attachmentName: fallbackPayload.attachmentName,
    });
  }

  if (!ticket.ok) {
    return NextResponse.json({ message: `تعذر حفظ الطلب: ${ticket.error || "unknown"}` }, { status: 500 });
  }

  if (isSmtpConfigured()) {
    try {
      await sendSupportEmail({
        replyTo: payload.email,
        subject: `بلاغ تقني جديد - ${payload.issueArea}`,
        text: buildMessage(payload),
        attachments:
          payload.attachmentName && payload.attachmentData
            ? [{ filename: payload.attachmentName, content: Buffer.from(payload.attachmentData, "base64") }]
            : undefined,
      });
    } catch (error) {
      console.error("report issue mail error", error);
    }
  }

  return NextResponse.json({ success: true, ticketId: ticket.ticket?.id || null });
}
