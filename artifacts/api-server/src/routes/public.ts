import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger.js";

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

async function createAdminNotification(
  message: string,
  linkTo: string | null = null,
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO admin_notifications
        (admin_email, type, title, message, link_to, is_read, created_at)
       VALUES ($1,$2,$3,$4,$5,false,NOW())`,
      [
        null,
        "new_lead",
        "New Website Lead",
        message,
        linkTo,
      ],
    );
  } catch (err: any) {
    logger.warn(
      { err: err?.message || err },
      "Failed to create admin notification",
    );
  }
}

router.post("/public/waitlist", async (req: any, res: any) => {
  try {
    const body = req.body || {};

    const name = sanitize(body.name, 120);
    const email = normalizeEmail(body.email);
    const phone = sanitize(body.phone, 30);
    const city = sanitize(body.city, 120);
    const serviceCategory = sanitize(
      body.serviceCategory || body.service,
      120,
    );
    const experience = sanitize(body.experience, 800);
    const message = sanitize(body.message || experience, 2500);

    if (!name || !email || !phone || !city || !serviceCategory) {
      return res.status(400).json({
        ok: false,
        error:
          "Name, email, phone, city and service category are required.",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid email address.",
      });
    }

    const duplicate = await pool.query(
      `SELECT id
       FROM website_leads
       WHERE lower(email) = $1
         AND form_type = 'Provider Waitlist'
       LIMIT 1`,
      [email],
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        error:
          "This email is already registered on the provider waitlist.",
      });
    }

    const result = await pool.query(
      `INSERT INTO website_leads
        (
          form_type,
          name,
          email,
          phone,
          message,
          service,
          city,
          experience,
          source,
          status,
          priority,
          payload,
          created_at,
          updated_at
        )
       VALUES
        (
          'Provider Waitlist',
          $1,$2,$3,$4,$5,$6,$7,
          'provider_form',
          'new',
          'normal',
          $8,
          NOW(),
          NOW()
        )
       RETURNING
        id,
        form_type,
        name,
        email,
        phone,
        city,
        service,
        message,
        status,
        source,
        created_at,
        updated_at`,
      [
        name,
        email,
        phone,
        message || null,
        serviceCategory,
        city,
        experience || null,
        JSON.stringify({
          ...body,
          serviceCategory,
        }),
      ],
    );

    const lead = result.rows[0];

    await createAdminNotification(
      `New provider waitlist submission from ${name} (${city}).`,
      `/admin/leads/${lead.id}`,
    );

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
      assignedToId: null,
      assignedToName: null,
      serviceCategory: lead.service,
      message: lead.message,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err: any) {
    logger.error(
      { err: err?.message || err },
      "Provider waitlist submission failed",
    );

    return res.status(500).json({
      ok: false,
      error: "Could not submit provider waitlist form.",
    });
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
      return res.status(400).json({
        ok: false,
        error: "Name, email and message are required.",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid email address.",
      });
    }

    const result = await pool.query(
      `INSERT INTO website_leads
        (
          form_type,
          name,
          email,
          phone,
          subject,
          message,
          city,
          source,
          status,
          priority,
          payload,
          created_at,
          updated_at
        )
       VALUES
        (
          'Contact Form',
          $1,$2,$3,$4,$5,$6,
          'customer_form',
          'new',
          'normal',
          $7,
          NOW(),
          NOW()
        )
       RETURNING
        id,
        form_type,
        name,
        email,
        phone,
        city,
        message,
        status,
        source,
        created_at,
        updated_at`,
      [
        name,
        email,
        phone || null,
        subject || null,
        message,
        city || null,
        JSON.stringify(body),
      ],
    );

    const lead = result.rows[0];

    await createAdminNotification(
      `New contact form submission from ${name}.`,
      `/admin/leads/${lead.id}`,
    );

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
      assignedToId: null,
      assignedToName: null,
      serviceCategory: null,
      message: lead.message,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err: any) {
    logger.error(
      { err: err?.message || err },
      "Contact submission failed",
    );

    return res.status(500).json({
      ok: false,
      error: "Could not submit contact form.",
    });
  }
});

router.get("/public/cms", async (_req: any, res: any) => {
  try {
    const rows = await pool.query(
      `SELECT key, value
       FROM app_settings
       WHERE key LIKE 'cms_%'
          OR key LIKE 'site_%'
          OR key LIKE 'social_%'
          OR key = 'support_email'
          OR key = 'support_phone'
          OR key = 'whatsapp_number'
          OR key = 'maintenance_mode'
          OR key = 'launch_date'
       ORDER BY key`,
    );

    const cms = Object.fromEntries(
      rows.rows.map((row: any) => [row.key, row.value]),
    );

    return res.json({
      ok: true,
      cms,
    });
  } catch (err: any) {
    logger.warn(
      { err: err?.message || err },
      "Public CMS load failed",
    );

    return res.json({
      ok: false,
      cms: {},
    });
  }
});

router.get("/public/settings", async (_req: any, res: any) => {
  try {
    const rows = await pool.query(
      `SELECT key, value
       FROM app_settings
       WHERE key IN (
        'site_title',
        'site_description',
        'support_email',
        'support_phone',
        'whatsapp_number',
        'maintenance_mode',
        'launch_date'
       )
       OR key LIKE 'social_%'
       ORDER BY key`,
    );

    const map = Object.fromEntries(
      rows.rows.map((row: any) => [row.key, row.value]),
    );

    return res.json({
      ok: true,
      siteTitle: map.site_title || "Athoo",
      siteDescription:
        map.site_description ||
        "Athoo connects customers with trusted local service providers.",
      contactEmail:
        map.support_email || "official.athoo@gmail.com",
      contactPhone:
        map.support_phone || "+92 339 0051068",
      whatsapp:
        map.whatsapp_number || "+92 339 0051068",
      instagramUrl:
        map.social_instagram || "https://instagram.com/athoo_services",
      facebookUrl:
        map.social_facebook || "https://facebook.com/athoo_services",
      tiktokUrl:
        map.social_tiktok || "https://tiktok.com/@athoo.pk",
      linkedinUrl:
        map.social_linkedin || "",
      maintenanceMode:
        Boolean(map.maintenance_mode?.enabled) ||
        map.maintenance_mode === true,
      maintenanceMessage:
        map.maintenance_mode?.message ||
        "Athoo website is under maintenance. Please check back soon.",
      launchDate:
        map.launch_date || "2026-09-01",
    });
  } catch (err: any) {
    logger.warn(
      { err: err?.message || err },
      "Public settings load failed",
    );

    return res.json({
      ok: false,
      siteTitle: "Athoo",
      contactEmail: "official.athoo@gmail.com",
      contactPhone: "+92 339 0051068",
      whatsapp: "+92 339 0051068",
      instagramUrl: "https://instagram.com/athoo_services",
      facebookUrl: "https://facebook.com/athoo_services",
      tiktokUrl: "https://tiktok.com/@athoo.pk",
      maintenanceMode: false,
      maintenanceMessage: "Athoo website is under maintenance. Please check back soon.",
      launchDate: "2026-09-01",
    });
  }
});

export default router;