import nodemailer from "nodemailer";

let transporter;

export function isSmtpConfigured() {
  return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

export function getSupportRecipient() {
  return process.env.CONTACT_RECIPIENT || "support@dribdo.com";
}

export function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = port === 465;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP configuration. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendSupportEmail({ subject, text, replyTo, attachments }) {
  const currentTransporter = getTransporter();

  return currentTransporter.sendMail({
    from: process.env.EMAIL_FROM || "Dribdo <no-reply@dribdo.com>",
    to: getSupportRecipient(),
    replyTo: replyTo || undefined,
    subject,
    text,
    attachments,
  });
}

export async function sendEmailToUser({ to, subject, text }) {
  const currentTransporter = getTransporter();

  return currentTransporter.sendMail({
    from: process.env.EMAIL_FROM || "Dribdo <no-reply@dribdo.com>",
    to,
    subject,
    text,
  });
}

export async function testSmtpConnection({ sendProbe = false } = {}) {
  if (!isSmtpConfigured()) {
    return { ok: false, code: "smtp_not_configured", message: "Missing SMTP configuration." };
  }

  const currentTransporter = getTransporter();

  try {
    await currentTransporter.verify();
  } catch (error) {
    return {
      ok: false,
      code: "smtp_verify_failed",
      message: error instanceof Error ? error.message : "SMTP verify failed",
    };
  }

  if (!sendProbe) {
    return { ok: true, code: "smtp_verified", message: "SMTP connection verified." };
  }

  try {
    await currentTransporter.sendMail({
      from: process.env.EMAIL_FROM || "Dribdo <no-reply@dribdo.com>",
      to: getSupportRecipient(),
      subject: "SMTP Test - Dribdo Support Dashboard",
      text: `SMTP test succeeded at ${new Date().toISOString()}.`,
    });

    return { ok: true, code: "smtp_probe_sent", message: "SMTP verified and test email sent." };
  } catch (error) {
    return {
      ok: false,
      code: "smtp_probe_failed",
      message: error instanceof Error ? error.message : "SMTP test mail failed",
    };
  }
}
