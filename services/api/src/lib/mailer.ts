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
  return clean(process.env.SMTP_HOST || process.env.ZOHO_SMTP_HOST || "smtp.zoho.com");
}

function smtpUser(): string {
  return clean(process.env.SMTP_USER || process.env.ZOHO_SMTP_USER || process.env.SMTP_FROM || "");
}

function smtpPass(): string {
  return clean(process.env.SMTP_PASS || process.env.ZOHO_SMTP_PASS || "");
}

function smtpPort(): number {
  const raw = Number(process.env.SMTP_PORT || process.env.ZOHO_SMTP_PORT || "465");
  return Number.isFinite(raw) && raw > 0 ? raw : 465;
}

function fromAddress(): string {
  const addr = clean(process.env.SMTP_FROM || smtpUser() || ADMIN_EMAIL);
  return `Athoo <${addr}>`;
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

export async function sendMail(opts: MailOptions): Promise<boolean> {
  if (!isSmtpConfigured()) {
    logger.warn(
      {
        to: opts.to,
        subject: opts.subject,
        missing: {
          host: !smtpHost(),
          user: !smtpUser(),
          pass: !smtpPass(),
        },
      },
      "SMTP not configured — email skipped",
    );
    return false;
  }

  try {
    const port = smtpPort();
    const transporter = nodemailer.createTransport({
      host: smtpHost(),
      port,
      secure: port === 465,
      auth: {
        user: smtpUser(),
        pass: smtpPass(),
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    });

    await transporter.sendMail({
      from: fromAddress(),
      replyTo: opts.replyTo || ADMIN_EMAIL,
      ...opts,
    });

    logger.info({ to: opts.to, subject: opts.subject }, "Email sent");
    return true;
  } catch (err: any) {
    logger.warn({ err: err?.message || err, to: opts.to, subject: opts.subject }, "Email send failed");
    return false;
  }
}
