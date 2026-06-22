import { Router } from "express";
import { pool } from "@athoo/db";
import { logger } from "../lib/logger.js";
import { sendMail, brandedEmail, notificationRows, ADMIN_EMAIL, SUPPORT_EMAIL } from "../lib/mailer.js";

const router = Router();

function sanitize(value: unknown, max = 2000): string {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeEmail(value: unknown): string {
  return sanitize(value, 255).toLowerCase();
}

function parseSettingValue(value: unknown): any {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return "";
  try { return JSON.parse(trimmed); } catch { return trimmed; }
}

function settingsMap(rows: any[]): Record<string, any> {
  return Object.fromEntries(rows.map((row: any) => [row.key, parseSettingValue(row.value)]));
}

async function createAdminNotification(
  message: string,
  linkTo: string | null = null,
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO admin_notifications
        (admin_email, type, title, message, link_to, is_read, created_at)
       VALUES ($1,$2,$3,$4,$5,false,NOW())`,
      [null, "new_lead", "New Website Lead", message, linkTo],
    );
  } catch (err: any) {
    logger.warn({ err: err?.message || err }, "Failed to create admin notification");
  }
}

router.post("/public/waitlist", async (req: any, res: any) => {
  try {
    const body = req.body || {};
    const name = sanitize(body.name, 120);
    const email = normalizeEmail(body.email);
    const phone = sanitize(body.phone, 30);
    const city = sanitize(body.city, 120);
    const serviceCategory = sanitize(body.serviceCategory || body.service, 120);
    const experience = sanitize(body.experience, 800);
    const message = sanitize(body.message || experience, 2500);

    if (!name || !email || !phone || !city || !serviceCategory) {
      return res.status(400).json({
        ok: false,
        error: "Name, email, phone, city and service category are required.",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Invalid email address." });
    }

    const duplicate = await pool.query(
      `SELECT id FROM website_leads WHERE lower(email) = $1 AND form_type = 'Provider Waitlist' LIMIT 1`,
      [email],
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "This email is already registered on the provider waitlist.",
      });
    }

    const result = await pool.query(
      `INSERT INTO website_leads
        (form_type, name, email, phone, message, service, city, experience,
         source, status, priority, payload, created_at, updated_at)
       VALUES ('Provider Waitlist', $1,$2,$3,$4,$5,$6,$7, 'provider_form', 'new', 'normal', $8, NOW(), NOW())
       RETURNING id, form_type, name, email, phone, city, service, message, status, source, created_at, updated_at`,
      [name, email, phone, message || null, serviceCategory, city, experience || null,
       JSON.stringify({ ...body, serviceCategory })],
    );

    const lead = result.rows[0];

    await createAdminNotification(
      `New provider waitlist submission from ${name} (${city}).`,
      `/admin/leads/${lead.id}`,
    );

    sendMail({
      to: ADMIN_EMAIL,
      subject: `[Athoo] New Provider Waitlist — ${name} (${city}) #${lead.id}`,
      html: brandedEmail(
        `New Provider Waitlist — ${name}`,
        `<h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#0057FF">New Provider Waitlist</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#718096">Lead ID: <strong style="color:#2d3748">#${lead.id}</strong></p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8effe;border-radius:10px;overflow:hidden;border-collapse:collapse">
          <tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568;width:140px">Name</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${name}</td></tr>
          <tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568">Email</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${email}</td></tr>
          <tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568">Phone</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${phone}</td></tr>
          <tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568">Service</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${serviceCategory}</td></tr>
          <tr><td style="padding:10px 14px;font-size:13px;font-weight:700;color:#4a5568">City</td><td style="padding:10px 14px;font-size:13px;color:#2d3748">${city}</td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#718096">View in <a href="https://www.athoo.pk/admin" style="color:#0057FF;font-weight:700">Admin Panel</a></p>`,
        "New provider waitlist submission received"
      ),
    }).catch(() => {});

    sendMail({
      to: email,
      replyTo: ADMIN_EMAIL,
      subject: "Provider Application Received — Athoo",
      html: brandedEmail(
        "Athoo Provider Application",
        `<h2 style="margin:0 0 12px;font-size:24px;font-weight:900;color:#0057FF">Application Received ✅</h2>
        <p style="margin:0 0 16px;font-size:15px;color:#2d3748;line-height:1.7">Hi <strong>${name}</strong>,</p>
        <p style="margin:0 0 16px;font-size:15px;color:#2d3748;line-height:1.7">Thank you for your interest in becoming an <strong>Athoo Service Partner</strong>. Our team has received your application and will contact you shortly.</p>
        <div style="background:#f0f7f0;border-left:4px solid #22c55e;border-radius:0 12px 12px 0;padding:16px 20px;margin:0 0 20px">
          <p style="margin:0;font-size:14px;color:#2d3748;line-height:2">
            ✅ &nbsp;Application submitted successfully<br/>
            📞 &nbsp;We will call you on your provided phone number<br/>
            📋 &nbsp;Verification process begins when onboarding opens
          </p>
        </div>
        <p style="margin:0;font-size:14px;color:#718096">Questions? WhatsApp us at <a href="https://wa.me/923390051068" style="color:#0057FF;font-weight:700">+92 339 0051068</a></p>`,
        "Your Athoo provider application has been received."
      ),
    }).catch(() => {});

    return res.status(201).json({
      ok: true,
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      type: "provider",
      formType: lead.form_type,
      status: lead.status,
      source: lead.source,
      serviceCategory: lead.service,
      message: lead.message,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err: any) {
    logger.error({ err: err?.message || err }, "Provider waitlist submission failed");
    return res.status(500).json({ ok: false, error: "Could not submit provider waitlist form." });
  }
});

router.post("/public/contact", async (req: any, res: any) => {
  try {
    const body = req.body || {};
    const name = sanitize(body.name, 120);
    const email = normalizeEmail(body.email);
    const phone = sanitize(body.phone, 30);
    const city = sanitize(body.city, 120);
    const subject = sanitize(body.subject, 200);
    const message = sanitize(body.message, 2500);

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Name, email and message are required." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Invalid email address." });
    }

    const result = await pool.query(
      `INSERT INTO website_leads
        (form_type, name, email, phone, subject, message, city,
         source, status, priority, payload, created_at, updated_at)
       VALUES ('Contact Form', $1,$2,$3,$4,$5,$6, 'customer_form', 'new', 'normal', $7, NOW(), NOW())
       RETURNING id, form_type, name, email, phone, city, message, status, source, created_at, updated_at`,
      [name, email, phone || null, subject || null, message, city || null, JSON.stringify(body)],
    );

    const lead = result.rows[0];

    await createAdminNotification(
      `New contact form submission from ${name}.`,
      `/admin/leads/${lead.id}`,
    );

    sendMail({
      to: SUPPORT_EMAIL,
      subject: `[Athoo] Contact Form — ${subject || name} #${lead.id}`,
      replyTo: email,
      html: brandedEmail(
        `Contact Form — ${name}`,
        `<h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#0057FF">New Contact Form Message</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#718096">From <strong style="color:#2d3748">${name}</strong> · Lead #${lead.id}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8effe;border-radius:10px;overflow:hidden;border-collapse:collapse">
          <tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568;width:120px">Name</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${name}</td></tr>
          <tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568">Email</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748"><a href="mailto:${email}" style="color:#0057FF">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568">Phone</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${phone}</td></tr>` : ""}
          ${subject ? `<tr><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;font-weight:700;color:#4a5568">Subject</td><td style="padding:10px 14px;border-bottom:1px solid #e8effe;font-size:13px;color:#2d3748">${subject}</td></tr>` : ""}
          <tr><td style="padding:10px 14px;font-size:13px;font-weight:700;color:#4a5568;vertical-align:top">Message</td><td style="padding:10px 14px;font-size:13px;color:#2d3748;line-height:1.7">${message.replace(/\n/g, "<br>")}</td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#718096">Reply directly to this email or view in <a href="https://www.athoo.pk/admin" style="color:#0057FF;font-weight:700">Admin Panel</a></p>`,
        `New contact from ${name}`
      ),
    }).catch(() => {});

    return res.status(201).json({
      ok: true,
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      type: "customer",
      formType: lead.form_type,
      status: lead.status,
      source: lead.source,
      message: lead.message,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err: any) {
    logger.error({ err: err?.message || err }, "Contact submission failed");
    return res.status(500).json({ ok: false, error: "Could not submit contact form." });
  }
});

router.get("/public/cms", async (_req: any, res: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const rows = await pool.query(
      `SELECT key, value FROM app_settings
       WHERE key LIKE 'cms_%' OR key LIKE 'site_%' OR key LIKE 'social_%'
          OR key = 'support_email' OR key = 'support_phone' OR key = 'whatsapp_number'
          OR key = 'maintenance_mode' OR key = 'maintenanceEnabled' OR key = 'maintenanceMessage' OR key = 'launch_date'
       ORDER BY key`,
    );
    const cms = settingsMap(rows.rows);
    return res.json({ ok: true, cms });
  } catch (err: any) {
    logger.warn({ err: err?.message || err }, "Public CMS load failed");
    return res.json({ ok: false, cms: {} });
  }
});

router.get("/public/settings", async (_req: any, res: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const rows = await pool.query(
      `SELECT key, value FROM app_settings
       WHERE key IN ('site_title','site_description','support_email','support_phone',
                     'whatsapp_number','maintenance_mode','maintenanceEnabled','maintenanceMessage','launch_date')
          OR key LIKE 'social_%'
       ORDER BY key`,
    );
    const map = settingsMap(rows.rows);
    return res.json({
      ok: true,
      siteTitle: map.site_title || "Athoo",
      siteDescription: map.site_description || "Athoo connects customers with trusted local service providers.",
      contactEmail: map.support_email || "official@athoo.pk",
      contactPhone: map.support_phone || "+92 339 0051068",
      whatsapp: map.whatsapp_number || "+92 339 0051068",
      instagramUrl: map.social_instagram || "https://instagram.com/athoo_services",
      facebookUrl: map.social_facebook || "https://facebook.com/Athoo.Services/",
      tiktokUrl: map.social_tiktok || "https://tiktok.com/@athoo.pk",
      linkedinUrl: map.social_linkedin || "",
      maintenanceMode: Boolean(map.maintenance_mode?.enabled) || map.maintenance_mode === true || map.maintenanceEnabled === true || map.maintenanceEnabled === "true",
      maintenanceMessage: map.maintenance_mode?.message || map.maintenanceMessage || "Athoo website is under maintenance. Please check back soon.",
      launchDate: map.launch_date || "2026-09-01",
    });
  } catch (err: any) {
    logger.warn({ err: err?.message || err }, "Public settings load failed");
    return res.json({
      ok: false,
      siteTitle: "Athoo",
      contactEmail: "official@athoo.pk",
      contactPhone: "+92 339 0051068",
      whatsapp: "+92 339 0051068",
      instagramUrl: "https://instagram.com/athoo_services",
      facebookUrl: "https://facebook.com/Athoo.Services/",
      tiktokUrl: "https://tiktok.com/@athoo.pk",
      maintenanceMode: false,
      maintenanceMessage: "Athoo website is under maintenance. Please check back soon.",
      launchDate: "2026-09-01",
    });
  }
});

export default router;
