import { Router } from "express";
import { pool } from "@athoo/db";
import { logger } from "../lib/logger.js";
import { sendMail, ADMIN_EMAIL, SUPPORT_EMAIL } from "../lib/mailer.js";

const router = Router();

const ALLOWED_FORMS = new Set([
  "Contact Form",
  "Waitlist Signup",
  "Provider Waitlist",
]);

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;

function getIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];

  return String(
    Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded || req.socket?.remoteAddress || "unknown",
  )
    .split(",")[0]
    .trim();
}

function rateLimit(req: any, keyPrefix = "global"): boolean {
  const key = `${keyPrefix}:${getIp(req)}`;
  const now = Date.now();

  const current = rateBuckets.get(key) || {
    count: 0,
    resetAt: now + RATE_WINDOW_MS,
  };

  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + RATE_WINDOW_MS;
  }

  current.count += 1;
  rateBuckets.set(key, current);

  return current.count <= RATE_LIMIT;
}

function sanitize(value: unknown, max = 2000): string {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function validate(formType: string, body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  const email = sanitize(body.email, 255);
  const phone = sanitize(body.phone, 30);
  const name = sanitize(body.name, 120);
  const message = sanitize(body.message, 2500);

  if (!ALLOWED_FORMS.has(formType)) errors.push("Invalid form type");

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Invalid email");
  }

  if (formType === "Waitlist Signup" && !email) {
    errors.push("Email is required");
  }

  if (formType === "Contact Form") {
    if (name.length < 2) errors.push("Name is required");
    if (!email) errors.push("Email is required");
    if (message.length < 10) errors.push("Message is required");
  }

  if (formType === "Provider Waitlist") {
    if (name.length < 2) errors.push("Name is required");
    if (phone.length < 10) errors.push("Phone is required");
    if (!sanitize(body.service, 100)) errors.push("Service is required");
    if (!sanitize(body.city, 100)) errors.push("City is required");
  }

  return errors;
}

function safeJsonParse(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, unknown>;

  try {
    return JSON.parse(String(value)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function tableRows(payload: Record<string, unknown>): string {
  return Object.entries(payload)
    .filter(([key]) => !["formType", "submittedAt", "source"].includes(key))
    .map(([key, value]) => {
      return (
        "<tr>" +
        `<td style="padding:6px 12px;border:1px solid #ddd"><b>${sanitize(key, 100)}</b></td>` +
        `<td style="padding:6px 12px;border:1px solid #ddd">${sanitize(value, 1000) || "-"}</td>` +
        "</tr>"
      );
    })
    .join("");
}

async function sendEmails(lead: Record<string, any>): Promise<void> {
  const payload = safeJsonParse(lead.payload);
  const formType = sanitize(lead.form_type, 80);
  const userEmail = sanitize(lead.email, 255);
  const userName = sanitize(lead.name, 120) || "there";

  const notifyTo = formType === "Contact Form" ? SUPPORT_EMAIL : ADMIN_EMAIL;
  const rows = tableRows(payload);

  await sendMail({
    to: notifyTo,
    subject: `New Athoo ${formType}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#111">
        <h2 style="color:#0057FF">New ${formType}</h2>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
        <p style="font-size:12px;color:#999;margin-top:16px">
          Athoo Admin | official@athoo.pk
        </p>
      </div>
    `,
  });

  if (!userEmail) return;

  if (formType === "Waitlist Signup") {
    await sendMail({
      to: userEmail,
      replyTo: ADMIN_EMAIL,
      subject: "You're on the Athoo Waitlist!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;color:#111">
          <h2 style="color:#0057FF">Welcome to the Athoo Waitlist</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for joining the Athoo waitlist. We'll notify you as soon as our app launches in Rawalpindi and Islamabad.</p>
          <p>
            Stay updated:<br/>
            Instagram: <a href="https://instagram.com/athoo_services">@athoo_services</a><br/>
            Facebook: <a href="https://facebook.com/Athoo.Services/">Athoo.Services</a><br/>
            TikTok: <a href="https://tiktok.com/@athoo.pk">@athoo.pk</a>
          </p>
          <p style="color:#666;font-size:12px">
            Athoo | official@athoo.pk | +92 339 0051068
          </p>
        </div>
      `,
    });
  }

  if (formType === "Provider Waitlist") {
    await sendMail({
      to: userEmail,
      replyTo: ADMIN_EMAIL,
      subject: "Provider Application Received — Athoo",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;color:#111">
          <h2 style="color:#0057FF">Application Received</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for your interest in becoming an Athoo Service Partner. Our team will review your application and contact you shortly.</p>
          <p style="color:#666;font-size:12px">
            Athoo | official@athoo.pk | +92 339 0051068
          </p>
        </div>
      `,
    });
  }
}

router.options("/submit", (_req, res) => {
  return res.status(204).send();
});

router.post("/submit", async (req: any, res: any) => {
  if (!rateLimit(req, "submit")) {
    return res.status(429).json({
      ok: false,
      error: "Too many requests. Please try again later.",
    });
  }

  try {
    const body = req.body || {};
    const formType = sanitize(body.formType, 80);
    const errors = validate(formType, body);

    if (errors.length) {
      return res.status(400).json({
        ok: false,
        error: errors.join(", "),
        errors,
      });
    }

    const cleanPayload: Record<string, string> = {};

    for (const [key, value] of Object.entries(body)) {
      const cleanKey = sanitize(key, 80);
      if (!cleanKey) continue;
      cleanPayload[cleanKey] = sanitize(value, 2500);
    }

    const email = sanitize(body.email, 255).toLowerCase() || null;

    const duplicate = email
      ? await pool.query(
        `SELECT id FROM website_leads
           WHERE lower(email) = $1 AND form_type = $2
           LIMIT 1`,
        [email, formType],
      )
      : { rows: [] };

    const result = await pool.query(
      `INSERT INTO website_leads (
        form_type,
        name,
        email,
        phone,
        subject,
        message,
        service,
        city,
        experience,
        source,
        ip_address,
        user_agent,
        payload,
        status,
        priority,
        created_at,
        updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
        'new','normal',NOW(),NOW()
      )
      RETURNING id, form_type, name, email, payload`,
      [
        formType,
        sanitize(body.name, 120) || null,
        email,
        sanitize(body.phone, 30) || null,
        sanitize(body.subject, 200) || null,
        sanitize(body.message, 2500) || null,
        sanitize(body.service, 120) || null,
        sanitize(body.city, 120) || null,
        sanitize(body.experience, 800) || null,
        sanitize(body.source, 500) ||
        sanitize(req.headers.referer, 500) ||
        "website",
        getIp(req),
        sanitize(req.headers["user-agent"], 500) || null,
        JSON.stringify({
          ...cleanPayload,
          submittedAt: new Date().toISOString(),
        }),
      ],
    );

    const lead = result.rows[0];

    if (duplicate.rows.length) {
      await pool.query(
        `UPDATE website_leads
         SET admin_notes = COALESCE(admin_notes || E'\\n', '') || $1,
             updated_at = NOW()
         WHERE id = $2`,
        [`Possible duplicate of lead #${duplicate.rows[0].id}`, lead.id],
      );
    }

    let emailStatus: "sent" | "failed" | "skipped" = "skipped";

    try {
      await sendEmails(lead);
      emailStatus = "sent";
    } catch (mailErr: any) {
      emailStatus = "failed";
      logger.warn(
        {
          err: mailErr?.message || mailErr,
          leadId: lead.id,
        },
        "Lead saved but email notification failed",
      );
    }

    return res.status(200).json({
      ok: true,
      id: lead.id,
      emailStatus,
    });
  } catch (err: any) {
    logger.error(
      {
        err: err?.message || err,
        stack: err?.stack,
      },
      "Form submission failed",
    );

    return res.status(500).json({
      ok: false,
      error: "Submission failed",
    });
  }
});

export default router;