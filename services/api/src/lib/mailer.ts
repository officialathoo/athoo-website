import nodemailer from "nodemailer";
import { logger } from "./logger.js";

export const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  process.env.LEAD_NOTIFY_TO ||
  process.env.ADMIN_EMAIL ||
  "official@athoo.pk";

export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || ADMIN_EMAIL;
export const INFO_EMAIL = process.env.INFO_EMAIL || ADMIN_EMAIL;

function clean(value: string | undefined): string {
  return String(value || "").trim();
}

function smtpHost(): string {
  return clean(process.env.SMTP_HOST || process.env.ZOHO_SMTP_HOST || process.env.MAIL_HOST || process.env.EMAIL_HOST || "smtp.zoho.com");
}
function smtpUser(): string {
  return clean(process.env.SMTP_USER || process.env.ZOHO_SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER || process.env.SMTP_FROM || "");
}
function smtpPass(): string {
  return clean(process.env.SMTP_PASS || process.env.ZOHO_SMTP_PASS || process.env.MAIL_PASS || process.env.MAIL_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "");
}
function smtpPort(): number {
  const raw = Number(process.env.SMTP_PORT || process.env.ZOHO_SMTP_PORT || process.env.MAIL_PORT || process.env.EMAIL_PORT || "465");
  return Number.isFinite(raw) && raw > 0 ? raw : 465;
}
function smtpSecure(): boolean {
  const forced = clean(process.env.SMTP_SECURE || process.env.MAIL_SECURE || process.env.EMAIL_SECURE).toLowerCase();
  if (["true","1","yes"].includes(forced)) return true;
  if (["false","0","no"].includes(forced)) return false;
  return smtpPort() === 465;
}
function fromAddress(): string {
  const addr = clean(process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_FROM || smtpUser() || ADMIN_EMAIL);
  const name = clean(process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || "Athoo");
  return `${name} <${addr}>`;
}

export function getSmtpStatus() {
  return {
    configured: isSmtpConfigured(),
    host: smtpHost(),
    port: smtpPort(),
    secure: smtpSecure(),
    user: smtpUser() ? smtpUser().replace(/^(.{2}).*(@.*)?$/, (_m, a, b) => `${a}***${b || ""}`) : "",
    from: fromAddress(),
    adminEmail: ADMIN_EMAIL,
    supportEmail: SUPPORT_EMAIL,
  };
}

export function isSmtpConfigured(): boolean {
  return Boolean(smtpHost() && smtpUser() && smtpPass());
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

// ─── Shared branded email wrapper ────────────────────────────────────────────
export function brandedEmail(title: string, bodyHtml: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:Arial,Helvetica,sans-serif">
${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${previewText}</div>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4ff;padding:32px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,87,255,0.10)">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0057FF 0%,#174bff 60%,#003ACC 100%);padding:28px 32px;text-align:center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 18px">
                  <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px">Athoo</span>
                </span>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:6px">
                <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase">Pakistan's Home Services Marketplace</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px 32px 24px">
          ${bodyHtml}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f8faff;border-top:1px solid #e8effe;padding:20px 32px;text-align:center">
          <p style="margin:0 0 6px;font-size:13px;color:#4a5568;font-weight:600">Athoo — Trusted Home Services in Pakistan</p>
          <p style="margin:0 0 6px;font-size:12px;color:#718096">
            <a href="mailto:official@athoo.pk" style="color:#0057FF;text-decoration:none">official@athoo.pk</a>
            &nbsp;·&nbsp;
            <a href="https://wa.me/923390051068" style="color:#0057FF;text-decoration:none">+92 339 0051068</a>
          </p>
          <p style="margin:0;font-size:11px;color:#a0aec0">
            <a href="https://www.athoo.pk" style="color:#a0aec0;text-decoration:none">www.athoo.pk</a>
            &nbsp;·&nbsp;Rawalpindi &amp; Islamabad, Pakistan
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Notification row builder ─────────────────────────────────────────────────
export function notificationRows(payload: Record<string, unknown>): string {
  return Object.entries(payload)
    .filter(([k]) => !["formType","submittedAt","source"].includes(k))
    .map(([k, v]) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568;white-space:nowrap;width:140px">${k.replace(/_/g," ")}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${String(v ?? "").replace(/[<>]/g,"").slice(0,500) || "—"}</td>
      </tr>
    `).join("");
}

export async function sendMail(opts: MailOptions): Promise<boolean> {
  if (!isSmtpConfigured()) {
    logger.warn({ to: opts.to, subject: opts.subject, missing: { host: !smtpHost(), user: !smtpUser(), pass: !smtpPass() } }, "SMTP not configured — email skipped");
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost(),
      port: smtpPort(),
      secure: smtpSecure(),
      auth: { user: smtpUser(), pass: smtpPass() },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 25_000,
    });
    await transporter.sendMail({ from: fromAddress(), replyTo: opts.replyTo || ADMIN_EMAIL, ...opts });
    logger.info({ to: opts.to, subject: opts.subject }, "Email sent");
    return true;
  } catch (err: any) {
    logger.warn({ err: err?.message || err, code: err?.code, command: err?.command, response: err?.response, to: opts.to, subject: opts.subject }, "Email send failed");
    return false;
  }
}
