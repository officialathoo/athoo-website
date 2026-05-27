import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger.js";

const router = Router();

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;

function getIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function rateLimit(req: any, keyPrefix: string, limit: number): boolean {
  const key = `${keyPrefix}:${getIp(req)}`;
  const now = Date.now();
  const current = rateBuckets.get(key) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + RATE_WINDOW_MS;
  }
  current.count += 1;
  rateBuckets.set(key, current);
  return current.count <= limit;
}

function sanitize(value: unknown, max = 2000): string {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function secret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "athoo-admin-secret";
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const check = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return hash.length === check.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}

function signToken(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): Record<string, unknown> | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  try {
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Record<string, unknown>;
    if (!payload.exp || Date.now() > (payload.exp as number)) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAdmin(req: any, res: any): Record<string, unknown> | null {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return null;
  }
  return payload;
}

function hasPermission(admin: Record<string, unknown>, permission: string): boolean {
  if (!admin) return false;
  if (admin.role === "super_admin") return true;
  const perms = admin.permissions as Record<string, boolean> | undefined;
  if (perms?.all) return true;
  return Boolean(perms?.[permission]);
}

async function logActivity(
  req: any,
  admin: Record<string, unknown>,
  action: string,
  targetType: string | null = null,
  targetId: string | null = null,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO admin_activity_logs (admin_email, action, target_type, target_id, details, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [admin.email || null, action, targetType, targetId, JSON.stringify(details), getIp(req)]
    );
  } catch (err: any) {
    logger.warn({ err: err.message }, "Activity log failed");
  }
}

const rolePermissions: Record<string, Record<string, boolean>> = {
  super_admin: { all: true },
  admin: { view_leads: true, manage_leads: true, export_leads: true, send_email: true, manage_settings: true },
  manager: { view_leads: true, manage_leads: true, export_leads: true, send_email: true },
  custom: {},
};

router.post("/admin/login", async (req: any, res: any) => {
  if (!rateLimit(req, "admin-login", 10)) {
    return res.status(429).json({ ok: false, error: "Too many login attempts" });
  }

  try {
    const body = req.body || {};
    const submittedPassword = String(body.password || "");
    const submittedEmail = sanitize(body.email, 255).toLowerCase();

    let admin: Record<string, any> | null = null;

    if (submittedEmail) {
      const result = await pool.query(
        `SELECT id, name, email, role, permissions, password_hash, is_active
         FROM athoo_admin_users
         WHERE lower(email) = $1
         LIMIT 1`,
        [submittedEmail]
      );

      admin = result.rows[0] || null;

      if (!admin || !admin.is_active || !verifyPassword(submittedPassword, String(admin.password_hash || ""))) {
        return res.status(401).json({ ok: false, error: "Invalid email or password" });
      }
    } else {
      const result = await pool.query(
        `SELECT id, name, email, role, permissions, password_hash, is_active
         FROM athoo_admin_users
         WHERE role = 'super_admin' AND is_active = true
         ORDER BY id ASC
         LIMIT 1`
      );

      admin = result.rows[0] || null;

      if (!admin) {
        return res.status(401).json({ ok: false, error: "No admin account found" });
      }

      const configuredPassword = process.env.ADMIN_PASSWORD;
      let ok = false;

      if (admin.password_hash) {
        ok = verifyPassword(submittedPassword, String(admin.password_hash));
      } else if (configuredPassword) {
        ok =
          submittedPassword.length === configuredPassword.length &&
          crypto.timingSafeEqual(Buffer.from(submittedPassword), Buffer.from(configuredPassword));
      }

      if (!ok) {
        return res.status(401).json({ ok: false, error: "Invalid password" });
      }
    }

    await pool.query(`UPDATE athoo_admin_users SET last_login_at = NOW() WHERE email = $1`, [admin.email]);
    await logActivity(req, admin, "admin_login", "admin_user", String(admin.id), { role: admin.role });

    const permissions = (admin.permissions as Record<string, boolean>) || { all: true };

    return res.json({
      ok: true,
      token: signToken({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions }),
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions },
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin login failed");
    return res.status(400).json({ ok: false, error: "Invalid request" });
  }
});

router.get("/admin/leads", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "view_leads")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const search = sanitize(req.query.search, 120);
    const status = sanitize(req.query.status, 40);
    const formType = sanitize(req.query.formType, 80);
    const city = sanitize(req.query.city, 80);
    const assignedTo = sanitize(req.query.assignedTo, 255);
    const priority = sanitize(req.query.priority, 40);
    const dateFrom = sanitize(req.query.dateFrom, 30);
    const dateTo = sanitize(req.query.dateTo, 30);
    const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 250);
    const offset = Math.max(Number(req.query.offset || 0), 0);

    const rows = await pool.query(
      `SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source,
              status, priority, assigned_to, admin_notes, last_contacted_at, created_at, updated_at
       FROM website_leads
       WHERE ($1 = '' OR name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2 OR message ILIKE $2 OR service ILIKE $2 OR city ILIKE $2)
         AND ($3 = '' OR status = $3)
         AND ($4 = '' OR form_type = $4)
         AND ($5 = '' OR city ILIKE $6)
         AND ($7 = '' OR assigned_to = $7)
         AND ($8 = '' OR priority = $8)
         AND ($9 = '' OR created_at >= $9::timestamptz)
         AND ($10 = '' OR created_at < ($10::date + INTERVAL '1 day'))
       ORDER BY created_at DESC
       LIMIT $11 OFFSET $12`,
      [search, `%${search}%`, status, formType, city, `%${city}%`, assignedTo, priority, dateFrom || "", dateTo || "", limit, offset]
    );

    const stats = await pool.query(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today,
              count(*) FILTER (WHERE form_type = 'Provider Waitlist')::int AS providers,
              count(*) FILTER (WHERE form_type = 'Waitlist Signup')::int AS waitlist,
              count(*) FILTER (WHERE form_type = 'Contact Form')::int AS contacts,
              count(*) FILTER (WHERE status = 'new')::int AS new_leads
       FROM website_leads`
    );

    const admins = await pool.query(
      `SELECT name, email, role, is_active
       FROM athoo_admin_users
       WHERE is_active = true
       ORDER BY role, name`
    );

    return res.json({ ok: true, rows: rows.rows, stats: stats.rows[0], admins: admins.rows });
  } catch (err: any) {
    logger.error({ err: err.message }, "Load leads failed");
    return res.status(500).json({ ok: false, error: "Could not load leads" });
  }
});

router.post("/admin/lead-update", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_leads")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const ids = (Array.isArray(body.ids) ? body.ids : [body.id]).map((x: unknown) => Number(x)).filter(Boolean);

    if (!ids.length) return res.status(400).json({ ok: false, error: "No lead selected" });

    const status = sanitize(body.status, 40);
    const priority = sanitize(body.priority, 40);
    const assignedTo = sanitize(body.assignedTo, 255);
    const adminNotes = sanitize(body.adminNotes, 2500);

    if (status) await pool.query(`UPDATE website_leads SET status = $1, updated_at = NOW() WHERE id = ANY($2)`, [status, ids]);
    if (priority) await pool.query(`UPDATE website_leads SET priority = $1, updated_at = NOW() WHERE id = ANY($2)`, [priority, ids]);
    if (assignedTo || body.assignedTo === "") await pool.query(`UPDATE website_leads SET assigned_to = $1, updated_at = NOW() WHERE id = ANY($2)`, [assignedTo || null, ids]);
    if (adminNotes || body.adminNotes === "") await pool.query(`UPDATE website_leads SET admin_notes = $1, updated_at = NOW() WHERE id = ANY($2)`, [adminNotes || null, ids]);

    await logActivity(req, admin, "lead_update", "website_leads", ids.join(","), { status, priority, assignedTo, count: ids.length });

    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err.message }, "Lead update failed");
    return res.status(500).json({ ok: false, error: "Could not update lead" });
  }
});

router.get("/admin/export", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "export_leads")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const search = sanitize(req.query.search, 120);
    const status = sanitize(req.query.status, 40);
    const formType = sanitize(req.query.formType, 80);
    const dateFrom = sanitize(req.query.dateFrom, 30);
    const dateTo = sanitize(req.query.dateTo, 30);

    const rows = await pool.query(
      `SELECT id, form_type, name, email, phone, subject, message, service, city, experience,
              source, status, priority, assigned_to, admin_notes, last_contacted_at, created_at
       FROM website_leads
       WHERE ($1 = '' OR name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2 OR message ILIKE $2)
         AND ($3 = '' OR status = $3)
         AND ($4 = '' OR form_type = $4)
         AND ($5 = '' OR created_at >= $5::timestamptz)
         AND ($6 = '' OR created_at < ($6::date + INTERVAL '1 day'))
       ORDER BY created_at DESC
       LIMIT 10000`,
      [search, `%${search}%`, status, formType, dateFrom || "", dateTo || ""]
    );

    const headers = ["id", "form_type", "name", "email", "phone", "subject", "message", "service", "city", "experience", "source", "status", "priority", "assigned_to", "admin_notes", "last_contacted_at", "created_at"];
    const csvValue = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.rows.map((r: Record<string, unknown>) => headers.map((h) => csvValue(r[h])).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="athoo-filtered-leads.csv"`);
    return res.send(csv);
  } catch (err: any) {
    logger.error({ err: err.message }, "Export failed");
    return res.status(500).json({ ok: false, error: "Export failed" });
  }
});

router.post("/admin/bulk-email", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "send_email")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const ids = (Array.isArray(body.ids) ? body.ids : []).map((x: unknown) => Number(x)).filter(Boolean);
    const subject = sanitize(body.subject, 200);
    const message = sanitize(body.message, 5000);

    if (!ids.length) return res.status(400).json({ ok: false, error: "Select at least one lead" });
    if (!subject || !message) return res.status(400).json({ ok: false, error: "Subject and message are required" });

    const leads = await pool.query(
      `SELECT id, name, email, form_type, service, city
       FROM website_leads
       WHERE id = ANY($1) AND email IS NOT NULL AND email <> ''
       LIMIT 250`,
      [ids]
    );

    if (!leads.rows.length) return res.status(400).json({ ok: false, error: "Selected leads do not have email addresses" });

    const renderTemplate = (bodyText: string, lead: Record<string, unknown>) =>
      bodyText
        .replaceAll("{{name}}", String(lead.name || "there"))
        .replaceAll("{{email}}", String(lead.email || ""))
        .replaceAll("{{service}}", String(lead.service || ""))
        .replaceAll("{{city}}", String(lead.city || ""))
        .replaceAll("{{form_type}}", String(lead.form_type || ""));

    const hasResend = Boolean(process.env.RESEND_API_KEY);
    let Resend: any = null;

    if (hasResend) {
      try {
        ({ Resend } = (await import("resend")) as any);
      } catch {
        Resend = null;
      }
    }

    const resend = Resend ? new Resend(process.env.RESEND_API_KEY) : null;
    const from = process.env.LEAD_EMAIL_FROM || "Athoo Website <onboarding@resend.dev>";

    let sent = 0;
    let skipped = 0;

    for (const lead of leads.rows) {
      const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><p>${renderTemplate(message, lead).replace(/\n/g, "<br/>")}</p><hr/><p style="font-size:12px;color:#666">Athoo | official.athoo@gmail.com | +92 339 0051068</p></div>`;

      if (resend) {
        const response = await resend.emails.send({ from, to: lead.email, subject, html });
        await pool.query(
          `INSERT INTO athoo_email_logs (lead_id, recipient, subject, body, status, provider_response)
           VALUES ($1,$2,$3,$4,'sent',$5)`,
          [lead.id, lead.email, subject, message, JSON.stringify(response)]
        );
        sent++;
      } else {
        await pool.query(
          `INSERT INTO athoo_email_logs (lead_id, recipient, subject, body, status, provider_response)
           VALUES ($1,$2,$3,$4,'skipped_no_resend_key','{}'::jsonb)`,
          [lead.id, lead.email, subject, message]
        );
        skipped++;
      }
    }

    await pool.query(
      `UPDATE website_leads
       SET last_contacted_at = NOW(),
           status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END
       WHERE id = ANY($1)`,
      [leads.rows.map((l: Record<string, unknown>) => l.id)]
    );

    await logActivity(req, admin, "bulk_email", "website_leads", ids.join(","), { sent, skipped, subject });

    return res.json({
      ok: true,
      sent,
      skipped,
      note: hasResend ? "Emails sent." : "No RESEND_API_KEY configured. Emails were logged but not sent.",
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Bulk email failed");
    return res.status(500).json({ ok: false, error: "Could not send email" });
  }
});

router.get("/admin/admins", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const rows = await pool.query(
      `SELECT id, name, email, role, permissions, is_active, last_login_at, created_at
       FROM athoo_admin_users
       ORDER BY id DESC`
    );

    return res.json({ ok: true, rows: rows.rows });
  } catch (err: any) {
    logger.error({ err: err.message }, "Load admins failed");
    return res.status(500).json({ ok: false, error: "Could not load admins" });
  }
});

router.post("/admin/admins", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const name = sanitize(body.name, 120);
    const email = sanitize(body.email, 255).toLowerCase();
    const role = sanitize(body.role, 50) || "manager";
    const password = String(body.password || "");
    const isActive = body.isActive !== false;
    const permissions = role === "custom" ? (body.permissions || {}) : (rolePermissions[role] || rolePermissions.manager);

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid name and email are required" });
    }

    if (body.id) {
      const id = Number(body.id);

      if (password) {
        await pool.query(
          `UPDATE athoo_admin_users
           SET name=$1, email=$2, role=$3, permissions=$4, password_hash=$5, is_active=$6
           WHERE id=$7`,
          [name, email, role, JSON.stringify(permissions), hashPassword(password), isActive, id]
        );
      } else {
        await pool.query(
          `UPDATE athoo_admin_users
           SET name=$1, email=$2, role=$3, permissions=$4, is_active=$5
           WHERE id=$6`,
          [name, email, role, JSON.stringify(permissions), isActive, id]
        );
      }

      await logActivity(req, admin, "admin_user_update", "admin_user", String(id), { email, role });
    } else {
      if (!password || password.length < 8) {
        return res.status(400).json({ ok: false, error: "Password must be at least 8 characters" });
      }

      await pool.query(
        `INSERT INTO athoo_admin_users (name, email, role, permissions, password_hash, is_active)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [name, email, role, JSON.stringify(permissions), hashPassword(password), isActive]
      );

      await logActivity(req, admin, "admin_user_create", "admin_user", email, { role });
    }

    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err.message }, "Save admin failed");
    return res.status(500).json({ ok: false, error: "Could not save admin user" });
  }
});

router.get("/admin/settings", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const rows = await pool.query(`SELECT key, value, updated_at FROM app_settings ORDER BY key`);
    const settings = Object.fromEntries(rows.rows.map((r: Record<string, unknown>) => [r.key, r.value]));
    return res.json({ ok: true, settings });
  } catch (err: any) {
    logger.error({ err: err.message }, "Load settings failed");
    return res.status(500).json({ ok: false, error: "Could not load settings" });
  }
});

router.post("/admin/settings", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const maintenance = {
      enabled: Boolean(body.maintenanceEnabled),
      message: sanitize(body.maintenanceMessage, 500) || "Athoo website is under maintenance. Please check back soon.",
    };

    const supportEmail = sanitize(body.supportEmail, 255) || process.env.LEAD_NOTIFY_TO || "official.athoo@gmail.com";
    const supportPhone = sanitize(body.supportPhone, 50) || "+92 339 0051068";

    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('maintenance_mode',$1,NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [JSON.stringify(maintenance)]
    );

    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('support_email',$1,NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [JSON.stringify(supportEmail)]
    );

    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('support_phone',$1,NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [JSON.stringify(supportPhone)]
    );

    await logActivity(req, admin, "settings_update", "app_settings", "global", { maintenance });

    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err.message }, "Save settings failed");
    return res.status(500).json({ ok: false, error: "Could not save settings" });
  }
});

router.get("/admin/activity", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const limit = Math.min(Number(req.query.limit || 200), 500);
    const rows = await pool.query(
      `SELECT admin_email, action, target_type, target_id, details, ip_address, created_at
       FROM admin_activity_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return res.json({ ok: true, rows: rows.rows });
  } catch (err: any) {
    logger.error({ err: err.message }, "Load activity failed");
    return res.status(500).json({ ok: false, error: "Could not load activity" });
  }
});

router.get("/admin/analytics", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const [daily, byForm, byStatus, byCity, weekly, totals] = await Promise.all([
      pool.query(`
        SELECT TO_CHAR(created_at::date, 'Mon DD') AS day, created_at::date AS raw_date, COUNT(*)::int AS count
        FROM website_leads
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY created_at::date
        ORDER BY created_at::date ASC
      `),
      pool.query(`SELECT form_type AS name, COUNT(*)::int AS value FROM website_leads GROUP BY form_type ORDER BY value DESC`),
      pool.query(`SELECT status AS name, COUNT(*)::int AS value FROM website_leads GROUP BY status ORDER BY value DESC`),
      pool.query(`SELECT COALESCE(city,'Unknown') AS name, COUNT(*)::int AS value FROM website_leads WHERE city IS NOT NULL AND city <> '' GROUP BY city ORDER BY value DESC LIMIT 10`),
      pool.query(`
        SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS week, DATE_TRUNC('week', created_at) AS raw_week, COUNT(*)::int AS count
        FROM website_leads
        WHERE created_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY raw_week ASC
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days')::int AS last_week,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS this_month,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today,
          COUNT(*) FILTER (WHERE status = 'new')::int AS new_leads,
          COUNT(*) FILTER (WHERE form_type = 'Provider Waitlist')::int AS providers,
          COUNT(*) FILTER (WHERE form_type = 'Waitlist Signup')::int AS waitlist,
          COUNT(*) FILTER (WHERE form_type = 'Contact Form')::int AS contacts,
          COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
        FROM website_leads
      `),
    ]);

    return res.json({
      ok: true,
      daily: daily.rows,
      byForm: byForm.rows,
      byStatus: byStatus.rows,
      byCity: byCity.rows,
      weekly: weekly.rows,
      totals: totals.rows[0],
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Analytics failed");
    return res.status(500).json({ ok: false, error: "Could not load analytics" });
  }
});

router.get("/admin/cms", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

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
       ORDER BY key`
    );

    const cms = Object.fromEntries(rows.rows.map((r: Record<string, unknown>) => [r.key, r.value]));

    return res.json({ ok: true, cms });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load CMS" });
  }
});

router.post("/admin/cms", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const allowed = ["cms_hero", "cms_contact", "cms_about", "site_title", "site_description", "social_instagram", "social_facebook", "social_linkedin", "support_email", "support_phone", "whatsapp_number", "cms_faq"];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        await pool.query(
          `INSERT INTO app_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
          [key, JSON.stringify(body[key])]
        );
      }
    }

    await logActivity(req, admin, "cms_update", "app_settings", "cms", {});

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not save CMS" });
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
          OR key = 'maintenance_mode'`
    );

    const cms = Object.fromEntries(rows.rows.map((r: Record<string, unknown>) => [r.key, r.value]));

    return res.json({ ok: true, cms });
  } catch {
    return res.json({ ok: false, cms: {} });
  }
});

router.get("/admin/templates", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const rows = await pool.query(
      `SELECT id, name, subject, body, category, created_by, created_at, updated_at
       FROM athoo_email_templates
       ORDER BY category, name`
    );

    return res.json({ ok: true, rows: rows.rows });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load templates" });
  }
});

router.post("/admin/templates", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "send_email")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const name = sanitize(body.name, 120);
    const subject = sanitize(body.subject, 200);
    const bodyText = sanitize(body.body, 5000);
    const category = sanitize(body.category, 50) || "general";

    if (!name || !subject || !bodyText) {
      return res.status(400).json({ ok: false, error: "Name, subject and body are required" });
    }

    if (body.id) {
      await pool.query(
        `UPDATE athoo_email_templates
         SET name=$1, subject=$2, body=$3, category=$4, updated_at=NOW()
         WHERE id=$5`,
        [name, subject, bodyText, category, Number(body.id)]
      );
    } else {
      await pool.query(
        `INSERT INTO athoo_email_templates (name, subject, body, category, created_by)
         VALUES ($1,$2,$3,$4,$5)`,
        [name, subject, bodyText, category, String(admin.email)]
      );
    }

    await logActivity(req, admin, body.id ? "template_update" : "template_create", "email_template", name, {});

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not save template" });
  }
});

router.delete("/admin/templates/:id", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "send_email")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    await pool.query(`DELETE FROM athoo_email_templates WHERE id=$1`, [Number(req.params.id)]);
    await logActivity(req, admin, "template_delete", "email_template", req.params.id, {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not delete template" });
  }
});

router.get("/admin/email-logs", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const rows = await pool.query(
      `SELECT id, lead_id, recipient, subject, status, sent_by, created_at
       FROM athoo_email_logs
       ORDER BY created_at DESC
       LIMIT 200`
    );

    return res.json({ ok: true, rows: rows.rows });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load email logs" });
  }
});

router.get("/admin/lead-notes/:leadId", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const rows = await pool.query(
      `SELECT id, admin_email, note, created_at
       FROM lead_notes
       WHERE lead_id=$1
       ORDER BY created_at DESC`,
      [Number(req.params.leadId)]
    );

    return res.json({ ok: true, rows: rows.rows });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load notes" });
  }
});

router.post("/admin/lead-note", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_leads")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const leadId = Number(body.leadId);
    const note = sanitize(body.note, 2000);

    if (!leadId || !note) return res.status(400).json({ ok: false, error: "Lead ID and note are required" });

    await pool.query(`INSERT INTO lead_notes (lead_id, admin_email, note) VALUES ($1,$2,$3)`, [leadId, String(admin.email), note]);
    await logActivity(req, admin, "lead_note_add", "website_leads", String(leadId), { note: note.slice(0, 80) });

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not save note" });
  }
});

router.delete("/admin/admins/:id", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (admin.role !== "super_admin") return res.status(403).json({ ok: false, error: "Only super admins can delete users" });

  try {
    const id = Number(req.params.id);

    if (id === Number(admin.id)) {
      return res.status(400).json({ ok: false, error: "Cannot delete yourself" });
    }

    await pool.query(`DELETE FROM athoo_admin_users WHERE id=$1`, [id]);
    await logActivity(req, admin, "admin_user_delete", "admin_user", String(id), {});

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not delete admin" });
  }
});

export default router;