import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ALLOWED_FORMS = new Set(["Contact Form", "Waitlist Signup", "Provider Waitlist"]);
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;

function getIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function rateLimit(req: Request, keyPrefix = "global"): boolean {
  const key = `${keyPrefix}:${getIp(req)}`;
  const now = Date.now();
  const current = rateBuckets.get(key) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > current.resetAt) { current.count = 0; current.resetAt = now + RATE_WINDOW_MS; }
  current.count += 1;
  rateBuckets.set(key, current);
  return current.count <= RATE_LIMIT;
}

function sanitize(value: unknown, max = 2000): string {
  return String(value ?? "").replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

function validate(formType: string, body: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const email = sanitize(body.email, 255);
  const phone = sanitize(body.phone, 30);
  const name = sanitize(body.name, 120);
  const message = sanitize(body.message, 2500);
  if (!ALLOWED_FORMS.has(formType)) errors.push("Invalid form type");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push("Invalid email");
  if (formType === "Waitlist Signup" && !email) errors.push("Email is required");
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

async function sendEmail(lead: Record<string, unknown>): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import("resend" as string) as any;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.LEAD_NOTIFY_TO || "official.athoo@gmail.com";
    const from = process.env.LEAD_EMAIL_FROM || "Athoo Website <onboarding@resend.dev>";
    const payload = lead.payload as Record<string, string>;
    const lines = Object.entries(payload)
      .map(([k, v]) => `<tr><td style="padding:6px;border:1px solid #ddd"><b>${k}</b></td><td style="padding:6px;border:1px solid #ddd">${sanitize(v, 1000)}</td></tr>`)
      .join("");
    await resend.emails.send({
      from,
      to,
      subject: `New Athoo ${lead.form_type}`,
      html: `<h2>New Athoo Website Lead</h2><p><b>Form:</b> ${lead.form_type}</p><table style="border-collapse:collapse">${lines}</table>`,
    });
  } catch (err: any) {
    logger.warn({ err: err.message }, "Email notification failed");
  }
}

router.post("/submit", async (req: Request, res: Response): Promise<void> => {
  if (!rateLimit(req, "submit")) {
    res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
    return;
  }
  try {
    const body = req.body as Record<string, unknown>;
    const formType = sanitize(body.formType, 80);
    const errors = validate(formType, body);
    if (errors.length) { res.status(400).json({ ok: false, errors }); return; }

    const cleanPayload: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      cleanPayload[sanitize(k, 80)] = sanitize(v, 2500);
    }

    const email = sanitize(body.email, 255) || null;
    const duplicate = email
      ? await pool.query(`SELECT id FROM website_leads WHERE email = $1 AND email <> '' LIMIT 1`, [email])
      : { rows: [] };

    const result = await pool.query(
      `INSERT INTO website_leads (form_type, name, email, phone, subject, message, service, city, experience, source, ip_address, user_agent, payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, form_type, payload`,
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
        sanitize(body.source, 500) || sanitize(req.headers.referer, 500) || null,
        getIp(req),
        sanitize(req.headers["user-agent"], 500) || null,
        JSON.stringify(cleanPayload),
      ]
    );

    const lead = result.rows[0];
    if (duplicate.rows.length) {
      await pool.query(
        `UPDATE website_leads SET admin_notes = COALESCE(admin_notes || E'\\n', '') || $1, updated_at = NOW() WHERE id = $2`,
        [`Possible duplicate of lead #${duplicate.rows[0].id}`, lead.id]
      );
    }

    sendEmail(lead).catch(() => {});
    res.json({ ok: true, id: lead.id });
  } catch (err: any) {
    logger.error({ err: err.message }, "Form submission failed");
    res.status(500).json({ ok: false, error: "Submission failed" });
  }
});

export default router;
