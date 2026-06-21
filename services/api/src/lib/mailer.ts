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
  return clean(
    process.env.SMTP_HOST ||
      process.env.ZOHO_SMTP_HOST ||
      process.env.MAIL_HOST ||
      process.env.EMAIL_HOST ||
      "smtp.zoho.com",
  );
}

function smtpUser(): string {
  return clean(
    process.env.SMTP_USER ||
      process.env.ZOHO_SMTP_USER ||
      process.env.MAIL_USER ||
      process.env.EMAIL_USER ||
      process.env.SMTP_FROM ||
      "",
  );
}

function smtpPass(): string {
  return clean(
    process.env.SMTP_PASS ||
      process.env.ZOHO_SMTP_PASS ||
      process.env.MAIL_PASS ||
      process.env.MAIL_PASSWORD ||
      process.env.EMAIL_PASS ||
      process.env.EMAIL_PASSWORD ||
      "",
  );
}

function smtpPort(): number {
  const raw = Number(
    process.env.SMTP_PORT ||
      process.env.ZOHO_SMTP_PORT ||
      process.env.MAIL_PORT ||
      process.env.EMAIL_PORT ||
      "465",
  );
  return Number.isFinite(raw) && raw > 0 ? raw : 465;
}

function smtpSecure(): boolean {
  const forced = clean(process.env.SMTP_SECURE || process.env.MAIL_SECURE || process.env.EMAIL_SECURE).toLowerCase();
  if (["true", "1", "yes"].includes(forced)) return true;
  if (["false", "0", "no"].includes(forced)) return false;
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
    const transporter = nodemailer.createTransport({
      host: smtpHost(),
      port: smtpPort(),
      secure: smtpSecure(),
      auth: {
        user: smtpUser(),
        pass: smtpPass(),
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 25_000,
    });

    await transporter.sendMail({
      from: fromAddress(),
      replyTo: opts.replyTo || ADMIN_EMAIL,
      ...opts,
    });

    logger.info({ to: opts.to, subject: opts.subject }, "Email sent");
    return true;
  } catch (err: any) {
    logger.warn(
      {
        err: err?.message || err,
        code: err?.code,
        command: err?.command,
        response: err?.response,
        to: opts.to,
        subject: opts.subject,
      },
      "Email send failed",
    );
    return false;
  }
}
