import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const SMTP_CONFIGURED = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
);

export const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? "official@athoo.pk";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_CONFIGURED) return null;
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST!,
      port:   Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });
  }
  return _transporter;
}

export interface MailOptions {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
}

export type MailStatus = "sent" | "failed" | "smtp_not_configured";

export interface MailResult {
  ok:     boolean;
  status: MailStatus;
  error?: string;
}

export async function sendMail(opts: MailOptions): Promise<MailResult> {
  const fromAddress = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "official@athoo.pk";
  const fromName = process.env.SMTP_FROM_NAME ?? "Athoo";
  const from = fromAddress.includes("<") ? fromAddress : `${fromName} <${fromAddress}>`;

  const t = getTransporter();

  if (!t) {
    logger.warn(
      { to: opts.to, subject: opts.subject },
      "SMTP not configured — email not sent (set SMTP_HOST, SMTP_USER, SMTP_PASS)",
    );
    return { ok: false, status: "smtp_not_configured", error: "SMTP credentials not set" };
  }

  try {
    await t.sendMail({
      from,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      text:    opts.text ?? opts.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });
    logger.info({ to: opts.to, subject: opts.subject }, "email sent");
    return { ok: true, status: "sent" };
  } catch (err: any) {
    logger.error({ err, to: opts.to }, "sendMail failed");
    return { ok: false, status: "failed", error: String(err?.message ?? err) };
  }
}

function escape(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function adminLeadNotificationHtml(lead: {
  formType: string;
  name?:    string;
  email?:   string;
  phone?:   string;
  service?: string;
  city?:    string;
  message?: string;
}): string {
  const rows = [
    ["Form Type",  lead.formType],
    ["Name",       lead.name],
    ["Email",      lead.email],
    ["Phone",      lead.phone],
    ["Service",    lead.service],
    ["City",       lead.city],
    ["Message",    lead.message],
  ]
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap">${escape(k)}</td>`
        + `<td style="padding:6px 12px;color:#111">${escape(v)}</td></tr>`,
    )
    .join("\n");

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <div style="background:#0057FF;padding:24px 32px">
    <h1 style="margin:0;color:#fff;font-size:20px">New Lead — Athoo Admin</h1>
    <p style="margin:4px 0 0;color:#bdd5ff;font-size:14px">${escape(lead.formType)}</p>
  </div>
  <div style="padding:24px 32px">
    <table style="border-collapse:collapse;width:100%">
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
    <p style="margin:0;font-size:12px;color:#9ca3af">
      Athoo Admin · <a href="https://athoo.pk/admin" style="color:#0057FF">Open Admin Panel</a>
    </p>
  </div>
</div>`;
}

export function userConfirmationHtml(name: string | null | undefined): string {
  const greeting = name ? `Hi ${escape(name)},` : "Hi there,";
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <div style="background:#0057FF;padding:24px 32px">
    <h1 style="margin:0;color:#fff;font-size:22px">You're on Athoo's list! 🎉</h1>
  </div>
  <div style="padding:24px 32px;color:#374151;line-height:1.6">
    <p>${greeting}</p>
    <p>
      Thank you for reaching out to <strong>Athoo</strong> — Pakistan's smart home services platform.
      We've received your submission and our team will be in touch very soon.
    </p>
    <p>
      In the meantime, follow us on social media for launch updates:
    </p>
    <p>
      <a href="https://www.instagram.com/athoo_services" style="color:#0057FF">Instagram</a> &nbsp;|&nbsp;
      <a href="https://www.facebook.com/Athoo.Services/" style="color:#0057FF">Facebook</a> &nbsp;|&nbsp;
      <a href="https://www.tiktok.com/@athoo.pk" style="color:#0057FF">TikTok</a>
    </p>
    <p style="margin-top:24px;font-size:13px;color:#9ca3af">
      Questions? Email us at
      <a href="mailto:official@athoo.pk" style="color:#0057FF">official@athoo.pk</a>
      or WhatsApp <a href="https://wa.me/923390051068" style="color:#0057FF">+92 339 0051068</a>.
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
    <p style="margin:0;font-size:12px;color:#9ca3af">Athoo · Rawalpindi &amp; Islamabad, Pakistan</p>
  </div>
</div>`;
}
