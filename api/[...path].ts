import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured in Vercel environment variables");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

function json(res: VercelResponse, status: number, data: unknown) {
  return res.status(status).json(data);
}

function sanitize(value: unknown, max = 2000): string {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function secret(): string {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "athoo-admin-secret";
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

function verifyToken(token: string): Record<string, any> | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  try {
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > Number(payload.exp)) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAdmin(req: VercelRequest): Record<string, any> | null {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return verifyToken(token);
}

function hasPermission(admin: Record<string, any>, permission: string): boolean {
  if (!admin) return false;
  if (admin.role === "super_admin") return true;
  const perms = admin.permissions || {};
  if (perms.all) return true;
  return Boolean(perms[permission]);
}

function getIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

async function ensureSchema() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS website_leads (
      id BIGSERIAL PRIMARY KEY,
      form_type TEXT NOT NULL DEFAULT 'Website Lead',
      name TEXT,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT,
      service TEXT,
      city TEXT,
      experience TEXT,
      source TEXT,
      ip_address TEXT,
      user_agent TEXT,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'new',
      priority TEXT NOT NULL DEFAULT 'normal',
      assigned_to TEXT,
      admin_notes TEXT,
      last_contacted_at TIMESTAMPTZ,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS athoo_admin_users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'manager',
      permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMPTZ,
      login_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id BIGSERIAL PRIMARY KEY,
      admin_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id BIGSERIAL PRIMARY KEY,
      admin_email TEXT,
      type TEXT,
      title TEXT,
      message TEXT,
      link_to TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS athoo_email_logs (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT,
      recipient TEXT,
      subject TEXT,
      body TEXT,
      status TEXT,
      provider_response JSONB,
      sent_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS athoo_email_templates (
      id BIGSERIAL PRIMARY KEY,
      name TEXT,
      subject TEXT,
      body TEXT,
      category TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS lead_notes (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT,
      admin_email TEXT,
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
    CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status);
    CREATE INDEX IF NOT EXISTS website_leads_email_idx ON website_leads (email);
  `);
  await db.query(
    `INSERT INTO athoo_admin_users (name, email, role, permissions, is_active)
     VALUES ($1,$2,'super_admin',$3,true)
     ON CONFLICT (email) DO NOTHING`,
    ["Super Admin", process.env.LEAD_NOTIFY_TO || "official.athoo@gmail.com", JSON.stringify({ all: true })]
  );
}

async function ensureSchemaOnce() {
  if (!schemaReady) schemaReady = ensureSchema();
  await schemaReady;
}

async function logActivity(req: VercelRequest, admin: Record<string, any>, action: string, targetType?: string, targetId?: string, details: Record<string, unknown> = {}) {
  try {
    await getPool().query(
      `INSERT INTO admin_activity_logs (admin_email, action, target_type, target_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)`,
      [admin?.email || null, action, targetType || null, targetId || null, JSON.stringify(details), getIp(req)]
    );
  } catch (error) {
    console.warn("Activity log failed", error);
  }
}

async function readBody(req: VercelRequest): Promise<Record<string, any>> {
  if (req.body && typeof req.body === "object") return req.body as Record<string, any>;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const body = await readBody(req);
  const submittedPassword = String(body.password || "");
  const submittedEmail = sanitize(body.email, 255).toLowerCase();
  let admin: Record<string, any> | null = null;

  if (submittedEmail) {
    const result = await getPool().query(
      `SELECT id, name, email, role, permissions, password_hash, is_active FROM athoo_admin_users WHERE lower(email) = $1 LIMIT 1`,
      [submittedEmail]
    );
    admin = result.rows[0] || null;
    if (!admin || !admin.is_active) return json(res, 401, { ok: false, error: "Invalid email or password" });
    if (admin.password_hash) {
      if (!verifyPassword(submittedPassword, String(admin.password_hash))) return json(res, 401, { ok: false, error: "Invalid email or password" });
    } else if (process.env.ADMIN_PASSWORD) {
      if (submittedPassword !== process.env.ADMIN_PASSWORD) return json(res, 401, { ok: false, error: "Invalid email or password" });
    } else {
      return json(res, 500, { ok: false, error: "ADMIN_PASSWORD is not configured" });
    }
  } else {
    const result = await getPool().query(
      `SELECT id, name, email, role, permissions, password_hash, is_active FROM athoo_admin_users WHERE role = 'super_admin' AND is_active = true ORDER BY id ASC LIMIT 1`
    );
    admin = result.rows[0] || null;
    if (!admin) return json(res, 401, { ok: false, error: "No admin account found" });
    let ok = false;
    if (admin.password_hash) ok = verifyPassword(submittedPassword, String(admin.password_hash));
    else if (process.env.ADMIN_PASSWORD) ok = submittedPassword === process.env.ADMIN_PASSWORD;
    if (!ok) return json(res, 401, { ok: false, error: "Invalid password" });
  }

  await getPool().query(`UPDATE athoo_admin_users SET last_login_at = NOW(), login_count = COALESCE(login_count,0)+1 WHERE id = $1`, [admin.id]);
  const permissions = admin.permissions || { all: true };
  await logActivity(req, admin, "admin_login", "admin_user", String(admin.id), { role: admin.role });

  return json(res, 200, {
    ok: true,
    token: signToken({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions }),
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions },
  });
}

async function handleLeads(req: VercelRequest, res: VercelResponse, admin: Record<string, any>) {
  if (!hasPermission(admin, "view_leads")) return json(res, 403, { ok: false, error: "Permission denied" });
  const q = req.query;
  const search = sanitize(q.search, 120);
  const status = sanitize(q.status, 40);
  const formType = sanitize(q.formType, 80);
  const city = sanitize(q.city, 80);
  const limit = Math.min(Math.max(Number(q.limit || 100), 1), 250);
  const offset = Math.max(Number(q.offset || 0), 0);

  const rows = await getPool().query(
    `SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source,
            status, priority, assigned_to, admin_notes, last_contacted_at, created_at, updated_at
     FROM website_leads
     WHERE ($1 = '' OR name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2 OR message ILIKE $2 OR service ILIKE $2 OR city ILIKE $2)
       AND ($3 = '' OR status = $3)
       AND ($4 = '' OR form_type = $4)
       AND ($5 = '' OR city ILIKE $6)
     ORDER BY created_at DESC LIMIT $7 OFFSET $8`,
    [search, `%${search}%`, status, formType, city, `%${city}%`, limit, offset]
  );
  const stats = await getPool().query(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today,
            count(*) FILTER (WHERE form_type = 'Provider Waitlist')::int AS providers,
            count(*) FILTER (WHERE form_type = 'Waitlist Signup')::int AS waitlist,
            count(*) FILTER (WHERE form_type = 'Contact Form')::int AS contacts,
            count(*) FILTER (WHERE status = 'new')::int AS new_leads
     FROM website_leads`
  );
  const admins = await getPool().query(`SELECT name, email, role, is_active FROM athoo_admin_users WHERE is_active = true ORDER BY role, name`);
  return json(res, 200, { ok: true, rows: rows.rows, stats: stats.rows[0], admins: admins.rows });
}

async function handleAnalytics(_req: VercelRequest, res: VercelResponse) {
  const [daily, byForm, byStatus, byCity, weekly, totals] = await Promise.all([
    getPool().query(`SELECT TO_CHAR(created_at::date, 'Mon DD') AS day, created_at::date AS raw_date, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY created_at::date ORDER BY created_at::date ASC`),
    getPool().query(`SELECT form_type AS name, COUNT(*)::int AS value FROM website_leads GROUP BY form_type ORDER BY value DESC`),
    getPool().query(`SELECT status AS name, COUNT(*)::int AS value FROM website_leads GROUP BY status ORDER BY value DESC`),
    getPool().query(`SELECT COALESCE(city,'Unknown') AS name, COUNT(*)::int AS value FROM website_leads WHERE city IS NOT NULL AND city <> '' GROUP BY city ORDER BY value DESC LIMIT 10`),
    getPool().query(`SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS week, DATE_TRUNC('week', created_at) AS raw_week, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '12 weeks' GROUP BY DATE_TRUNC('week', created_at) ORDER BY raw_week ASC`),
    getPool().query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days')::int AS last_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS this_month, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today, COUNT(*) FILTER (WHERE status = 'new')::int AS new_leads, COUNT(*) FILTER (WHERE form_type = 'Provider Waitlist')::int AS providers, COUNT(*) FILTER (WHERE form_type = 'Waitlist Signup')::int AS waitlist, COUNT(*) FILTER (WHERE form_type = 'Contact Form')::int AS contacts, COUNT(*) FILTER (WHERE status = 'approved')::int AS approved, COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected FROM website_leads`),
  ]);
  return json(res, 200, { ok: true, daily: daily.rows, byForm: byForm.rows, byStatus: byStatus.rows, byCity: byCity.rows, weekly: weekly.rows, totals: totals.rows[0] });
}

async function saveLead(req: VercelRequest, res: VercelResponse, formTypeDefault: string) {
  const body = await readBody(req);
  const formType = sanitize(body.formType || formTypeDefault, 80);
  const result = await getPool().query(
    `INSERT INTO website_leads (form_type, name, email, phone, subject, message, service, city, experience, source, ip_address, user_agent, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
    [formType, sanitize(body.name, 120) || null, sanitize(body.email, 255).toLowerCase() || null, sanitize(body.phone, 30) || null, sanitize(body.subject, 200) || null, sanitize(body.message, 2500) || null, sanitize(body.service || body.serviceCategory, 120) || null, sanitize(body.city, 120) || null, sanitize(body.experience, 800) || null, sanitize(body.source, 500) || "website", getIp(req), sanitize(req.headers["user-agent"], 500) || null, JSON.stringify(body)]
  );
  return json(res, 200, { ok: true, id: result.rows[0]?.id });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchemaOnce();
    const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
    const path = url.pathname.replace(/^\/api/, "") || "/";
    const method = String(req.method || "GET").toUpperCase();

    if (method === "GET" && (path === "/health" || path === "/admin/health")) return json(res, 200, { ok: true, status: "ok", service: "athoo-api" });
    if (method === "POST" && path === "/admin/login") return await handleLogin(req, res);
    if (method === "POST" && (path === "/submit" || path === "/public/lead")) return await saveLead(req, res, "Website Lead");
    if (method === "POST" && path === "/public/contact") return await saveLead(req, res, "Contact Form");
    if (method === "POST" && path === "/public/waitlist") return await saveLead(req, res, "Provider Waitlist");
    if (method === "GET" && path === "/public/settings") return json(res, 200, { ok: true, siteTitle: "Athoo", contactEmail: process.env.LEAD_NOTIFY_TO || "official.athoo@gmail.com", contactPhone: "+92 339 0051068", whatsapp: "+92 339 0051068", maintenanceMode: false });
    if (method === "GET" && path === "/public/cms") return json(res, 200, { ok: true, cms: {} });

    const admin = requireAdmin(req);
    if (!admin) return json(res, 401, { ok: false, error: "Unauthorized" });

    if (method === "GET" && path === "/admin/leads") return await handleLeads(req, res, admin);
    if (method === "GET" && path === "/admin/analytics") return await handleAnalytics(req, res);
    if (method === "GET" && path === "/admin/settings") {
      const rows = await getPool().query(`SELECT key, value, updated_at FROM app_settings ORDER BY key`);
      return json(res, 200, { ok: true, settings: Object.fromEntries(rows.rows.map((r: any) => [r.key, r.value])) });
    }
    if (method === "GET" && path === "/admin/admins") {
      const rows = await getPool().query(`SELECT id, name, email, role, permissions, is_active, last_login_at, created_at FROM athoo_admin_users ORDER BY id DESC`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }
    if (method === "GET" && path === "/admin/activity") {
      const rows = await getPool().query(`SELECT admin_email, action, target_type, target_id, details, ip_address, created_at FROM admin_activity_logs ORDER BY created_at DESC LIMIT 200`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }
    if (method === "GET" && path === "/admin/email-logs") {
      const rows = await getPool().query(`SELECT id, lead_id, recipient, subject, status, sent_by, created_at FROM athoo_email_logs ORDER BY created_at DESC LIMIT 200`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }
    if (method === "GET" && path === "/admin/templates") {
      const rows = await getPool().query(`SELECT id, name, subject, body, category, created_by, created_at, updated_at FROM athoo_email_templates ORDER BY category, name`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }

    return json(res, 404, { ok: false, error: `API route not found: ${method} ${path}` });
  } catch (error: any) {
    console.error("Athoo API fatal error:", error);
    return json(res, 500, { ok: false, error: error?.message || "Internal server error" });
  }
}
