import nodemailer from "nodemailer";
import { logger } from "./logger.js";

export const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "official@athoo.pk";
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@athoo.pk";
export const INFO_EMAIL = process.env.INFO_EMAIL || "info@athoo.pk";

function fromAddress(): string {
  const addr = process.env.SMTP_FROM || "official@athoo.pk";
  return `Athoo <${addr}>`;
}

export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  if (!isSmtpConfigured()) {
    logger.warn({ to: opts.to, subject: opts.subject }, "SMTP not configured — email skipped");
    return;
  }
  try {
    const port = Number(process.env.SMTP_PORT || "465");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({ from: fromAddress(), ...opts });
    logger.info({ to: opts.to, subject: opts.subject }, "Email sent");
  } catch (err: any) {
    logger.warn({ err: err?.message || err, to: opts.to }, "Email send failed — skipped");
  }
}
