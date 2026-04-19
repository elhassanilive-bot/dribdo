import { NextResponse } from "next/server";
import { isSmtpConfigured, sendSupportEmail } from "@/lib/support/mailer";
import { createSupportTicket } from "@/lib/support/tickets";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;
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

function buildMessage({ fullName, email, subject, message }) {
  const now = new Date().toISOString();
  return `اسم المرسل: ${fullName}\nالبريد الإلكتروني: ${email}\nالموضوع: ${subject || "بدون موضوع"}\nنص الرسالة:\n${message}\n\nتاريخ الإرسال: ${now}`;
}

export async function POST(request) {
  if (!enforceRateLimit(request)) {
    return NextResponse.json({ message: "تم الوصول للحد الأقصى للإرسال. حاول لاحقاً." }, { status: 429 });
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
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = "الرجاء إدخال بريد إلكتروني صالح.";
  if (!body.message?.trim()) errors.message = "نص الرسالة مطلوب.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors, message: "استكمل الحقول المطلوبة." }, { status: 400 });
  }

  const payload = {
    fullName: body.fullName.trim(),
    email: body.email.trim(),
    subject: body.subject?.trim() || "",
    message: body.message.trim(),
  };

  const ticket = await createSupportTicket({
    requestType: "contact",
    source: "contact_form",
    requesterName: payload.fullName,
    requesterEmail: payload.email,
    subject: payload.subject,
    message: payload.message,
    payload,
  });

  if (!ticket.ok) {
    return NextResponse.json({ message: `تعذر حفظ الطلب: ${ticket.error || "unknown"}` }, { status: 500 });
  }

  if (isSmtpConfigured()) {
    try {
      await sendSupportEmail({
        replyTo: payload.email,
        subject: `رسالة من ${payload.fullName}${payload.subject ? ` - ${payload.subject}` : ""}`,
        text: buildMessage(payload),
      });
    } catch (error) {
      console.error("contact mail error", error);
    }
  }

  return NextResponse.json({ success: true, ticketId: ticket.ticket?.id || null });
}