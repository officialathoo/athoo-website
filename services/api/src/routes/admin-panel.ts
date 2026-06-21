import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@athoo/db";
import { logger } from "../lib/logger.js";
import { sendMail, isSmtpConfigured } from "../lib/mailer.js";

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
      [admin.email || null, action, targetType, targetId, JSON.stringify(details), getIp(req)],
    );
  } catch (err: any) {
    logger.warn({ err: err.message }, "Activity log failed");
  }
}

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
         FROM athoo_admin_users WHERE lower(email) = $1 LIMIT 1`,
        [submittedEmail],
      );
      admin = result.rows[0] || null;
      let passwordOk = Boolean(admin?.password_hash) && verifyPassword(submittedPassword, String(admin?.password_hash || ""));

      const configuredAdminEmail = String(process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.LEAD_NOTIFY_TO || "official@athoo.pk").toLowerCase();
      const configuredPassword = process.env.ADMIN_PASSWORD || "";
      if (!passwordOk && admin && submittedEmail === configuredAdminEmail && configuredPassword) {
        passwordOk =
          submittedPassword.length === configuredPassword.length &&
          crypto.timingSafeEqual(Buffer.from(submittedPassword), Buffer.from(configuredPassword));
        if (passwordOk) {
          await pool.query(`UPDATE athoo_admin_users SET password_hash = $1, role = 'super_admin', permissions = '{"all":true}'::jsonb, is_active = true WHERE id = $2`, [hashPassword(submittedPassword), admin.id]);
          admin.password_hash = "updated";
          admin.role = "super_admin";
          admin.permissions = { all: true };
          admin.is_active = true;
        }
      }

      if (!admin || !admin.is_active || !passwordOk) {
        return res.status(401).json({ ok: false, error: "Invalid email or password" });
      }
    } else {
      const result = await pool.query(
        `SELECT id, name, email, role, permissions, password_hash, is_active
         FROM athoo_admin_users WHERE role = 'super_admin' AND is_active = true ORDER BY id ASC LIMIT 1`,
      );
      admin = result.rows[0] || null;
      if (!admin) return res.status(401).json({ ok: false, error: "No admin account found" });

      const configuredPassword = process.env.ADMIN_PASSWORD;
      let ok = false;
      if (admin.password_hash) {
        ok = verifyPassword(submittedPassword, String(admin.password_hash));
      } else if (configuredPassword) {
        ok =
          submittedPassword.length === configuredPassword.length &&
          crypto.timingSafeEqual(Buffer.from(submittedPassword), Buffer.from(configuredPassword));
      }
      if (!ok) return res.status(401).json({ ok: false, error: "Invalid password" });
    }

    await pool.query(`UPDATE athoo_admin_users SET last_login_at = NOW(), login_count = COALESCE(login_count, 0) + 1 WHERE email = $1`, [admin.email]);
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
         AND ($3 = '' OR status = $3) AND ($4 = '' OR form_type = $4)
         AND ($5 = '' OR city ILIKE $6) AND ($7 = '' OR assigned_to = $7)
         AND ($8 = '' OR priority = $8)
         AND ($9 = '' OR created_at >= $9::timestamptz)
         AND ($10 = '' OR created_at < ($10::date + INTERVAL '1 day'))
       ORDER BY created_at DESC LIMIT $11 OFFSET $12`,
      [search, `%${search}%`, status, formType, city, `%${city}%`, assignedTo, priority, dateFrom || "", dateTo || "", limit, offset],
    );

    const stats = await pool.query(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today,
              count(*) FILTER (WHERE form_type = 'Provider Waitlist')::int AS providers,
              count(*) FILTER (WHERE form_type = 'Waitlist Signup')::int AS waitlist,
              count(*) FILTER (WHERE form_type = 'Contact Form')::int AS contacts,
              count(*) FILTER (WHERE status = 'new')::int AS new_leads
       FROM website_leads`,
    );

    const admins = await pool.query(
      `SELECT name, email, role, is_active FROM athoo_admin_users WHERE is_active = true ORDER BY role, name`,
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
         AND ($3 = '' OR status = $3) AND ($4 = '' OR form_type = $4)
         AND ($5 = '' OR created_at >= $5::timestamptz)
         AND ($6 = '' OR created_at < ($6::date + INTERVAL '1 day'))
       ORDER BY created_at DESC LIMIT 10000`,
      [search, `%${search}%`, status, formType, dateFrom || "", dateTo || ""],
    );

    const headers = ["id", "form_type", "name", "email", "phone", "subject", "message", "service", "city", "experience", "source", "status", "priority", "assigned_to", "admin_notes", "last_contacted_at", "created_at"];
    const csvValue = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.rows.map((r: Record<string, unknown>) => headers.map((h) => csvValue(r[h])).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="athoo-leads.csv"`);
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
      `SELECT id, name, email, form_type, service, city FROM website_leads
       WHERE id = ANY($1) AND email IS NOT NULL AND email <> '' LIMIT 250`,
      [ids],
    );

    if (!leads.rows.length) return res.status(400).json({ ok: false, error: "Selected leads do not have email addresses" });

    const renderTemplate = (bodyText: string, lead: Record<string, unknown>) =>
      bodyText
        .replaceAll("{{name}}", String(lead.name || "there"))
        .replaceAll("{{email}}", String(lead.email || ""))
        .replaceAll("{{service}}", String(lead.service || ""))
        .replaceAll("{{city}}", String(lead.city || ""))
        .replaceAll("{{form_type}}", String(lead.form_type || ""));

    const smtpReady = isSmtpConfigured();
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const lead of leads.rows) {
      const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><p>${renderTemplate(message, lead).replace(/\n/g, "<br/>")}</p><hr/><p style="font-size:12px;color:#666">Athoo | official@athoo.pk | +92 339 0051068</p></div>`;

      if (!smtpReady) {
        await pool.query(
          `INSERT INTO athoo_email_logs (lead_id, recipient, subject, body, status, provider_response)
           VALUES ($1,$2,$3,$4,'skipped',$5)`,
          [lead.id, lead.email, subject, message, JSON.stringify({ reason: "smtp_not_configured" })],
        );
        skipped++;
        continue;
      }

      const ok = await sendMail({ to: lead.email, subject, html });
      if (ok) {
        await pool.query(
          `INSERT INTO athoo_email_logs (lead_id, recipient, subject, body, status, provider_response)
           VALUES ($1,$2,$3,$4,'sent',$5)`,
          [lead.id, lead.email, subject, message, JSON.stringify({ provider: "smtp" })],
        );
        sent++;
      } else {
        await pool.query(
          `INSERT INTO athoo_email_logs (lead_id, recipient, subject, body, status, provider_response)
           VALUES ($1,$2,$3,$4,'failed',$5)`,
          [lead.id, lead.email, subject, message, JSON.stringify({ reason: "smtp_send_failed" })],
        );
        failed++;
      }
    }

    await logActivity(req, admin, "bulk_email_sent", "website_leads", ids.join(","), { subject, sent, failed, skipped });
    return res.json({ ok: true, sent, failed, skipped, smtpConfigured: smtpReady });
  } catch (err: any) {
    logger.error({ err: err.message }, "Bulk email failed");
    return res.status(500).json({ ok: false, error: "Could not send emails" });
  }
});

router.get("/admin/settings", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const rows = await pool.query(`SELECT key, value FROM app_settings ORDER BY key`);
    const settings = Object.fromEntries(rows.rows.map((r: Record<string, unknown>) => [r.key, r.value]));
    return res.json({ ok: true, settings });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load settings" });
  }
});

router.post("/admin/settings", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    for (const [key, val] of Object.entries(body)) {
      await pool.query(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW())
         ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
        [sanitize(key, 100), JSON.stringify(val)],
      );
    }
    await logActivity(req, admin, "settings_update", "app_settings", null, {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not save settings" });
  }
});

router.post("/admin/cms", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });

  try {
    const body = req.body || {};
    const allowed = ["cms_hero", "cms_contact", "cms_about", "site_title", "site_description", "social_instagram", "social_facebook", "social_linkedin", "social_tiktok", "support_email", "support_phone", "whatsapp_number", "cms_faq", "launch_date"];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        await pool.query(
          `INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW())
           ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
          [key, JSON.stringify(body[key])],
        );
      }
    }
    await logActivity(req, admin, "cms_update", "app_settings", "cms", {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not save CMS" });
  }
});

router.get("/admin/templates", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const rows = await pool.query(
      `SELECT id, name, subject, body, category, created_by, created_at, updated_at
       FROM athoo_email_templates ORDER BY category, name`,
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
        `UPDATE athoo_email_templates SET name=$1, subject=$2, body=$3, category=$4, updated_at=NOW() WHERE id=$5`,
        [name, subject, bodyText, category, Number(body.id)],
      );
    } else {
      await pool.query(
        `INSERT INTO athoo_email_templates (name, subject, body, category, created_by) VALUES ($1,$2,$3,$4,$5)`,
        [name, subject, bodyText, category, String(admin.email)],
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
       FROM athoo_email_logs ORDER BY created_at DESC LIMIT 200`,
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
      `SELECT id, admin_email, note, created_at FROM lead_notes WHERE lead_id=$1 ORDER BY created_at DESC`,
      [Number(req.params.leadId)],
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
    if (id === Number(admin.id)) return res.status(400).json({ ok: false, error: "Cannot delete yourself" });
    await pool.query(`DELETE FROM athoo_admin_users WHERE id=$1`, [id]);
    await logActivity(req, admin, "admin_user_delete", "admin_user", String(id), {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not delete admin" });
  }
});

// ─── ADMIN USERS LIST & CREATE ───────────────────────────────────────────────

router.get("/admin/admins", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    const rows = await pool.query(
      `SELECT id, name, email, role, permissions, is_active, last_login_at, created_at
       FROM athoo_admin_users ORDER BY role, name`,
    );
    return res.json({ ok: true, rows: rows.rows });
  } catch {
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
    const role = ["super_admin","admin","manager","custom"].includes(body.role) ? body.role : "manager";
    const password = String(body.password || "");
    if (!name || !email || !password) return res.status(400).json({ ok: false, error: "Name, email and password are required" });
    const hash = hashPassword(password);
    const existing = await pool.query(`SELECT id FROM athoo_admin_users WHERE lower(email)=$1`, [email]);
    if (existing.rows.length) {
      await pool.query(`UPDATE athoo_admin_users SET name=$1, role=$2, password_hash=$3, is_active=true WHERE lower(email)=$4`,
        [name, role, hash, email]);
    } else {
      await pool.query(`INSERT INTO athoo_admin_users (name, email, role, password_hash, is_active) VALUES ($1,$2,$3,$4,true)`,
        [name, email, role, hash]);
    }
    await logActivity(req, admin, "admin_user_create", "admin_user", email, { role });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: "Could not save admin" });
  }
});

// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────

router.get("/admin/activity", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const rows = await pool.query(
      `SELECT id, admin_email, action, target_type, target_id, details, ip_address, created_at
       FROM admin_activity_logs ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return res.json({ ok: true, rows: rows.rows });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load activity logs" });
  }
});

// ─── UPSERT SETTING ──────────────────────────────────────────────────────────

router.post("/admin/upsert-setting", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });
  try {
    const body = req.body || {};
    const key = sanitize(body.key, 100);
    if (!key) return res.status(400).json({ ok: false, error: "key is required" });
    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [key, JSON.stringify(body.value)],
    );
    await logActivity(req, admin, "setting_upsert", "app_settings", key, {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not save setting" });
  }
});

// ─── DB STATS ────────────────────────────────────────────────────────────────

router.get("/admin/db-stats", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  const tables = [
    "website_leads","athoo_admin_users","admin_activity_logs","app_settings",
    "athoo_email_logs","athoo_email_templates","blog_posts","blog_categories",
    "media_library","service_categories","lead_notes","admin_notifications",
  ];
  const stats: { table: string; count: number }[] = [];
  for (const table of tables) {
    try {
      const r = await pool.query(`SELECT count(*)::int AS c FROM ${table}`);
      stats.push({ table, count: r.rows[0].c });
    } catch {
      stats.push({ table, count: -1 });
    }
  }
  return res.json({ ok: true, stats });
});

// ─── BLOG POSTS CRUD ─────────────────────────────────────────────────────────

function parseReadTime(rt: unknown): number {
  if (!rt) return 5;
  const n = parseInt(String(rt));
  return isNaN(n) ? 5 : Math.max(1, Math.min(120, n));
}

router.get("/admin/blog/posts", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    const search = sanitize(req.query.search, 120);
    const status = sanitize(req.query.status, 20);
    const category = sanitize(req.query.category, 80);
    const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 200);
    const offset = Math.max(Number(req.query.offset || 0), 0);

    const rows = await pool.query(
      `SELECT id, slug, title, excerpt, content, category, author,
              is_published, featured, image_url, reading_time_minutes,
              meta_title, meta_description, published_at, tags, created_at, updated_at
       FROM blog_posts
       WHERE ($1 = '' OR title ILIKE $2 OR slug ILIKE $2 OR excerpt ILIKE $2)
         AND ($3 = '' OR (CASE WHEN $3='published' THEN is_published=true ELSE is_published=false END))
         AND ($4 = '' OR category ILIKE $5)
       ORDER BY created_at DESC LIMIT $6 OFFSET $7`,
      [search, `%${search}%`, status, category, `%${category}%`, limit, offset],
    );

    const posts = rows.rows.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      author: p.author,
      status: p.is_published ? "published" : "draft",
      featured: Boolean(p.featured),
      coverImage: p.image_url || "",
      cover_image: p.image_url || "",
      readTime: p.reading_time_minutes ? `${p.reading_time_minutes} min read` : "5 min read",
      read_time: p.reading_time_minutes ? `${p.reading_time_minutes} min read` : "5 min read",
      metaTitle: p.meta_title || "",
      meta_title: p.meta_title || "",
      metaDescription: p.meta_description || "",
      meta_description: p.meta_description || "",
      publishedAt: p.published_at ? String(p.published_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
      published_at: p.published_at,
      tags: Array.isArray(p.tags) ? p.tags : [],
      createdAt: p.created_at,
    }));
    return res.json({ ok: true, posts });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin blog list failed");
    return res.status(500).json({ ok: false, error: "Could not load blog posts" });
  }
});

router.post("/admin/blog/posts", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_content")) return res.status(403).json({ ok: false, error: "Permission denied" });
  try {
    const b = req.body || {};
    const title = sanitize(b.title, 255);
    const slug = sanitize(b.slug, 255).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const excerpt = sanitize(b.excerpt, 1000);
    const content = String(b.content || "").slice(0, 100000);
    const category = sanitize(b.category, 80) || "Insights";
    const author = sanitize(b.author, 120) || "Athoo Team";
    const isPublished = b.status === "published";
    const featured = Boolean(b.featured);
    const imageUrl = sanitize(b.coverImage || b.cover_image || b.imageUrl, 1000);
    const readTime = parseReadTime(b.readTime || b.read_time);
    const metaTitle = sanitize(b.metaTitle || b.meta_title, 255);
    const metaDescription = sanitize(b.metaDescription || b.meta_description, 500);
    const tags = Array.isArray(b.tags) ? b.tags.map((t: unknown) => sanitize(t, 60)).filter(Boolean) : [];
    const publishedAt = b.publishedAt || b.published_at || new Date().toISOString();

    if (!title || !slug) return res.status(400).json({ ok: false, error: "Title and slug are required" });

    const r = await pool.query(
      `INSERT INTO blog_posts
         (slug, title, excerpt, content, category, author, is_published, featured,
          image_url, reading_time_minutes, meta_title, meta_description, published_at, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (slug) DO UPDATE SET
         title=EXCLUDED.title, excerpt=EXCLUDED.excerpt, content=EXCLUDED.content,
         category=EXCLUDED.category, author=EXCLUDED.author, is_published=EXCLUDED.is_published,
         featured=EXCLUDED.featured, image_url=EXCLUDED.image_url,
         reading_time_minutes=EXCLUDED.reading_time_minutes, meta_title=EXCLUDED.meta_title,
         meta_description=EXCLUDED.meta_description, published_at=EXCLUDED.published_at,
         tags=EXCLUDED.tags, updated_at=NOW()
       RETURNING id`,
      [slug, title, excerpt, content, category, author, isPublished, featured,
       imageUrl, readTime, metaTitle, metaDescription, publishedAt, tags],
    );
    await logActivity(req, admin, "blog_post_create", "blog_posts", slug, { title });
    return res.status(201).json({ ok: true, id: r.rows[0].id });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin blog create failed");
    return res.status(500).json({ ok: false, error: err.message || "Could not create blog post" });
  }
});

router.put("/admin/blog/posts/:id", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_content")) return res.status(403).json({ ok: false, error: "Permission denied" });
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    const b = req.body || {};
    const title = sanitize(b.title, 255);
    const slug = sanitize(b.slug, 255).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const excerpt = sanitize(b.excerpt, 1000);
    const content = String(b.content || "").slice(0, 100000);
    const category = sanitize(b.category, 80) || "Insights";
    const author = sanitize(b.author, 120) || "Athoo Team";
    const isPublished = b.status === "published";
    const featured = Boolean(b.featured);
    const imageUrl = sanitize(b.coverImage || b.cover_image || b.imageUrl, 1000);
    const readTime = parseReadTime(b.readTime || b.read_time);
    const metaTitle = sanitize(b.metaTitle || b.meta_title, 255);
    const metaDescription = sanitize(b.metaDescription || b.meta_description, 500);
    const tags = Array.isArray(b.tags) ? b.tags.map((t: unknown) => sanitize(t, 60)).filter(Boolean) : [];
    const publishedAt = b.publishedAt || b.published_at || new Date().toISOString();

    const r = await pool.query(
      `UPDATE blog_posts SET
         slug=$1, title=$2, excerpt=$3, content=$4, category=$5, author=$6,
         is_published=$7, featured=$8, image_url=$9, reading_time_minutes=$10,
         meta_title=$11, meta_description=$12, published_at=$13, tags=$14, updated_at=NOW()
       WHERE id=$15 RETURNING id`,
      [slug, title, excerpt, content, category, author, isPublished, featured,
       imageUrl, readTime, metaTitle, metaDescription, publishedAt, tags, id],
    );
    if (!r.rows.length) return res.status(404).json({ ok: false, error: "Post not found" });
    await logActivity(req, admin, "blog_post_update", "blog_posts", String(id), { title });
    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin blog update failed");
    return res.status(500).json({ ok: false, error: err.message || "Could not update post" });
  }
});

router.delete("/admin/blog/posts/:id", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_content")) return res.status(403).json({ ok: false, error: "Permission denied" });
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    await pool.query(`DELETE FROM blog_posts WHERE id=$1`, [id]);
    await logActivity(req, admin, "blog_post_delete", "blog_posts", String(id), {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not delete post" });
  }
});

// ─── BLOG CATEGORIES ─────────────────────────────────────────────────────────

router.get(["/admin/blog/categories", "/public/blog/categories"], async (req: any, res: any) => {
  try {
    const rows = await pool.query(`SELECT id, name, slug, description FROM blog_categories ORDER BY name`);
    return res.json({ ok: true, categories: rows.rows });
  } catch {
    return res.json({ ok: true, categories: [] });
  }
});

router.post("/admin/blog/categories", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    const b = req.body || {};
    const name = sanitize(b.name, 80);
    if (!name) return res.status(400).json({ ok: false, error: "Name is required" });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const description = sanitize(b.description, 300);
    const r = await pool.query(
      `INSERT INTO blog_categories (name, slug, description) VALUES ($1,$2,$3)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description
       RETURNING *`,
      [name, slug, description],
    );
    return res.status(201).json({ ok: true, category: r.rows[0] });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not save category" });
  }
});

router.delete("/admin/blog/categories/:id", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    await pool.query(`DELETE FROM blog_categories WHERE id=$1`, [Number(req.params.id)]);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not delete category" });
  }
});

// ─── EMAIL LOGS ───────────────────────────────────────────────────────────────

router.get("/admin/email-logs", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const rows = await pool.query(
      `SELECT id, lead_id, recipient, subject, status, sent_by, created_at
       FROM athoo_email_logs ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return res.json({ ok: true, rows: rows.rows });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load email logs" });
  }
});

// ─── SERVICES CRUD ────────────────────────────────────────────────────────────

router.get("/admin/services", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    const rows = await pool.query(
      `SELECT id, slug, name, description, icon, cities, starting_price, is_active, sort_order
       FROM service_categories ORDER BY sort_order, name`,
    );
    return res.json({ ok: true, services: rows.rows });
  } catch {
    return res.json({ ok: true, services: [] });
  }
});

router.post("/admin/services", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });
  try {
    const b = req.body || {};
    const name = sanitize(b.name, 120);
    if (!name) return res.status(400).json({ ok: false, error: "Name is required" });
    const slug = (b.slug ? sanitize(b.slug, 80) : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    const description = sanitize(b.description, 500);
    const icon = sanitize(b.icon, 50) || "Wrench";
    const cities = Array.isArray(b.cities) ? b.cities : ["Islamabad", "Rawalpindi"];
    const startingPrice = b.startingPrice ? Number(b.startingPrice) : null;
    const isActive = b.isActive !== false;
    const sortOrder = Number(b.sortOrder || 0);
    const r = await pool.query(
      `INSERT INTO service_categories (slug, name, description, icon, cities, starting_price, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET
         name=EXCLUDED.name, description=EXCLUDED.description, icon=EXCLUDED.icon,
         cities=EXCLUDED.cities, starting_price=EXCLUDED.starting_price,
         is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order
       RETURNING *`,
      [slug, name, description, icon, cities, startingPrice, isActive, sortOrder],
    );
    await logActivity(req, admin, "service_create", "service_categories", slug, { name });
    return res.status(201).json({ ok: true, service: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || "Could not save service" });
  }
});

router.put("/admin/services/:id", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    await pool.query(
      `UPDATE service_categories SET
         name=$1, description=$2, icon=$3, cities=$4, starting_price=$5,
         is_active=$6, sort_order=$7
       WHERE id=$8`,
      [sanitize(b.name, 120), sanitize(b.description, 500), sanitize(b.icon, 50) || "Wrench",
       Array.isArray(b.cities) ? b.cities : ["Islamabad", "Rawalpindi"],
       b.startingPrice ? Number(b.startingPrice) : null, b.isActive !== false,
       Number(b.sortOrder || 0), id],
    );
    await logActivity(req, admin, "service_update", "service_categories", String(id), {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not update service" });
  }
});

router.delete("/admin/services/:id", async (req: any, res: any) => {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!hasPermission(admin, "manage_settings")) return res.status(403).json({ ok: false, error: "Permission denied" });
  try {
    await pool.query(`DELETE FROM service_categories WHERE id=$1`, [Number(req.params.id)]);
    await logActivity(req, admin, "service_delete", "service_categories", req.params.id, {});
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Could not delete service" });
  }
});

export default router;
