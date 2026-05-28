const crypto = require('node:crypto');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

let schemaReady = null;

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function sanitize(value, max = 2000) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

function secret() {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'athoo-admin-secret';
}

function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  try {
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const check = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return hash.length === check.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}

function auth(req, res) {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const admin = verifyToken(token);
  if (!admin) {
    json(res, 401, { ok: false, error: 'Unauthorized' });
    return null;
  }
  return admin;
}

function hasPermission(admin, permission) {
  if (!admin) return false;
  if (admin.role === 'super_admin') return true;
  const perms = admin.permissions || {};
  if (perms.all) return true;
  return Boolean(perms[permission]);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

async function ensureSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS website_leads (
        id BIGSERIAL PRIMARY KEY,
        form_type TEXT NOT NULL,
        name TEXT, email TEXT, phone TEXT, subject TEXT, message TEXT, service TEXT, city TEXT, experience TEXT,
        source TEXT, ip_address TEXT, user_agent TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'new', priority TEXT NOT NULL DEFAULT 'normal', assigned_to TEXT, admin_notes TEXT,
        last_contacted_at TIMESTAMPTZ, tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
      CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
      CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status);
      CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type);
      CREATE INDEX IF NOT EXISTS website_leads_email_idx ON website_leads (email);

      CREATE TABLE IF NOT EXISTS lead_notes (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT REFERENCES website_leads(id) ON DELETE CASCADE,
        admin_email TEXT,
        note TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link_to TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS athoo_email_logs (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        sent_by TEXT,
        provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS athoo_email_templates (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      INSERT INTO app_settings (key, value) VALUES
      ('maintenance_mode', '{"enabled":false,"message":"Athoo website is under maintenance. Please check back soon."}'::jsonb),
      ('support_email', '"official.athoo@gmail.com"'::jsonb),
      ('support_phone', '"+92 339 0051068"'::jsonb),
      ('site_title', '"Athoo — Pakistan Smart Home Services"'::jsonb),
      ('site_description', '"Athoo is an upcoming Pakistani home services app for customers and verified providers."'::jsonb),
      ('whatsapp_number', '"923390051068"'::jsonb),
      ('social_instagram', '"https://instagram.com/athoo_services"'::jsonb),
      ('social_facebook', '"https://facebook.com/athoo_services"'::jsonb),
      ('social_tiktok', '"https://tiktok.com/@athoo.pk"'::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `);
    await pool.query(`
      INSERT INTO athoo_email_templates (name, subject, body, category) VALUES
      ('Waitlist Welcome', 'Welcome to Athoo Waitlist!', 'Hi {{name}}, thank you for joining the Athoo waitlist.', 'waitlist'),
      ('Provider Onboarding', 'Athoo Provider Application Received', 'Hi {{name}}, thank you for registering as a service provider on Athoo.', 'provider')
      ON CONFLICT (name) DO NOTHING;
    `);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com';
    await pool.query(
      `INSERT INTO athoo_admin_users (name, email, role, permissions, is_active)
       VALUES ('Super Admin', $1, 'super_admin', '{"all":true}'::jsonb, true)
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail.toLowerCase()],
    );
  })();
  return schemaReady;
}

async function logActivity(req, admin, action, targetType = null, targetId = null, details = {}) {
  try {
    await pool.query(
      `INSERT INTO admin_activity_logs (admin_email, action, target_type, target_id, details, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [admin?.email || null, action, targetType, targetId, JSON.stringify(details), getIp(req)],
    );
  } catch {}
}

async function notifyAdmin(message, linkTo = null) {
  try {
    await pool.query(
      `INSERT INTO admin_notifications (admin_email, type, title, message, link_to, is_read)
       VALUES (NULL,'new_lead','New Website Lead',$1,$2,false)`,
      [message, linkTo],
    );
  } catch {}
}

async function saveLead(req, body, forcedType = null) {
  const formType = sanitize(forcedType || body.formType || body.form_type || 'Website Lead', 80);
  const result = await pool.query(
    `INSERT INTO website_leads
      (form_type, name, email, phone, subject, message, service, city, experience, source, ip_address, user_agent, payload, status, priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'new','normal')
     RETURNING *`,
    [
      formType,
      sanitize(body.name, 120) || null,
      sanitize(body.email, 255).toLowerCase() || null,
      sanitize(body.phone, 40) || null,
      sanitize(body.subject, 200) || null,
      sanitize(body.message || body.experience, 2500) || null,
      sanitize(body.service || body.serviceCategory, 120) || null,
      sanitize(body.city, 120) || null,
      sanitize(body.experience, 800) || null,
      sanitize(body.source, 500) || 'website',
      getIp(req),
      sanitize(req.headers['user-agent'], 500) || null,
      JSON.stringify(body || {}),
    ],
  );
  const lead = result.rows[0];
  await notifyAdmin(`New ${formType} submission from ${lead.name || lead.email || 'website visitor'}.`, `/admin/leads/${lead.id}`);
  return lead;
}

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return { skipped: true, reason: 'No RESEND_API_KEY configured' };
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.LEAD_EMAIL_FROM || 'Athoo Website <onboarding@resend.dev>';
  return resend.emails.send({ from, to, subject, html });
}

function normalizePath(req) {
  let urlPath = (req.url || '').split('?')[0] || '/';
  urlPath = urlPath.replace(/^\/api\/?/, '');
  if (!urlPath) urlPath = '/';
  if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`;
  return urlPath;
}

module.exports = async function handler(req, res) {
  try {
    await ensureSchema();
    const path = normalizePath(req);
    const method = req.method || 'GET';

    if (method === 'GET' && path === '/health') return json(res, 200, { ok: true, status: 'ok', service: 'athoo-api' });

    if (method === 'POST' && (path === '/submit' || path === '/public/lead' || path === '/public/waitlist' || path === '/public/contact')) {
      const body = await readBody(req);
      const forced = path.includes('contact') ? 'Contact Form' : path.includes('waitlist') ? 'Provider Waitlist' : null;
      const lead = await saveLead(req, body, forced);
      return json(res, 200, { ok: true, success: true, id: lead.id });
    }

    if (method === 'GET' && (path === '/public/cms' || path === '/public/settings')) {
      const rows = await pool.query(`SELECT key, value FROM app_settings ORDER BY key`);
      const settings = Object.fromEntries(rows.rows.map((r) => [r.key, r.value]));
      return json(res, 200, { ok: true, cms: settings, settings });
    }

    if (method === 'POST' && path === '/admin/login') {
      const body = await readBody(req);
      const email = sanitize(body.email, 255).toLowerCase();
      const password = String(body.password || '');
      if (!password) return json(res, 400, { ok: false, error: 'Password is required' });
      let admin = null;
      if (email) {
        const found = await pool.query(`SELECT * FROM athoo_admin_users WHERE lower(email)=$1 AND is_active=true LIMIT 1`, [email]);
        admin = found.rows[0] || null;
        if (!admin) return json(res, 401, { ok: false, error: 'Invalid email or password' });
        if (admin.password_hash && !verifyPassword(password, admin.password_hash)) return json(res, 401, { ok: false, error: 'Invalid email or password' });
        if (!admin.password_hash && process.env.ADMIN_PASSWORD && password !== process.env.ADMIN_PASSWORD) return json(res, 401, { ok: false, error: 'Invalid email or password' });
      } else {
        const found = await pool.query(`SELECT * FROM athoo_admin_users WHERE role='super_admin' AND is_active=true ORDER BY id ASC LIMIT 1`);
        admin = found.rows[0] || { id: 0, name: 'Super Admin', email: process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com', role: 'super_admin', permissions: { all: true } };
        if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return json(res, 401, { ok: false, error: 'Invalid password' });
      }
      await pool.query(`UPDATE athoo_admin_users SET last_login_at=NOW(), login_count=COALESCE(login_count,0)+1 WHERE id=$1`, [admin.id]).catch(() => {});
      const permissions = admin.permissions || { all: true };
      const safeAdmin = { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions };
      await logActivity(req, safeAdmin, 'admin_login', 'admin_user', String(admin.id), { role: admin.role });
      return json(res, 200, { ok: true, token: signToken(safeAdmin), admin: safeAdmin });
    }

    const admin = path.startsWith('/admin/') ? auth(req, res) : null;
    if (path.startsWith('/admin/') && !admin) return;

    if (method === 'GET' && path === '/admin/leads') {
      if (!hasPermission(admin, 'view_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
      const u = new URL(req.url, 'https://athoo.local');
      const search = sanitize(u.searchParams.get('search'), 120);
      const status = sanitize(u.searchParams.get('status'), 40);
      const formType = sanitize(u.searchParams.get('formType'), 80);
      const city = sanitize(u.searchParams.get('city'), 80);
      const limit = Math.min(Math.max(Number(u.searchParams.get('limit') || 100), 1), 250);
      const offset = Math.max(Number(u.searchParams.get('offset') || 0), 0);
      const rows = await pool.query(
        `SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source,
                status, priority, assigned_to, admin_notes, last_contacted_at, created_at, updated_at
         FROM website_leads
         WHERE ($1='' OR name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2 OR message ILIKE $2 OR service ILIKE $2 OR city ILIKE $2)
           AND ($3='' OR status=$3)
           AND ($4='' OR form_type=$4)
           AND ($5='' OR city ILIKE $6)
         ORDER BY created_at DESC LIMIT $7 OFFSET $8`,
        [search, `%${search}%`, status, formType, city, `%${city}%`, limit, offset],
      );
      const stats = await pool.query(`SELECT count(*)::int AS total, count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today, count(*) FILTER (WHERE form_type='Provider Waitlist')::int AS providers, count(*) FILTER (WHERE form_type='Waitlist Signup')::int AS waitlist, count(*) FILTER (WHERE form_type='Contact Form')::int AS contacts, count(*) FILTER (WHERE status='new')::int AS new_leads FROM website_leads`);
      const admins = await pool.query(`SELECT name,email,role,is_active FROM athoo_admin_users WHERE is_active=true ORDER BY role,name`);
      return json(res, 200, { ok: true, rows: rows.rows, stats: stats.rows[0], admins: admins.rows });
    }

    if (method === 'GET' && path === '/admin/analytics') {
      const [daily, byForm, byStatus, byCity, weekly, totals] = await Promise.all([
        pool.query(`SELECT TO_CHAR(created_at::date,'Mon DD') AS day, created_at::date AS raw_date, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY created_at::date ORDER BY created_at::date ASC`),
        pool.query(`SELECT form_type AS name, COUNT(*)::int AS value FROM website_leads GROUP BY form_type ORDER BY value DESC`),
        pool.query(`SELECT status AS name, COUNT(*)::int AS value FROM website_leads GROUP BY status ORDER BY value DESC`),
        pool.query(`SELECT COALESCE(city,'Unknown') AS name, COUNT(*)::int AS value FROM website_leads WHERE city IS NOT NULL AND city <> '' GROUP BY city ORDER BY value DESC LIMIT 10`),
        pool.query(`SELECT TO_CHAR(DATE_TRUNC('week', created_at),'Mon DD') AS week, DATE_TRUNC('week', created_at) AS raw_week, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '12 weeks' GROUP BY DATE_TRUNC('week', created_at) ORDER BY raw_week ASC`),
        pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days')::int AS last_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS this_month, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today, COUNT(*) FILTER (WHERE status='new')::int AS new_leads, COUNT(*) FILTER (WHERE form_type='Provider Waitlist')::int AS providers, COUNT(*) FILTER (WHERE form_type='Waitlist Signup')::int AS waitlist, COUNT(*) FILTER (WHERE form_type='Contact Form')::int AS contacts, COUNT(*) FILTER (WHERE status='approved')::int AS approved, COUNT(*) FILTER (WHERE status='rejected')::int AS rejected FROM website_leads`),
      ]);
      return json(res, 200, { ok: true, daily: daily.rows, byForm: byForm.rows, byStatus: byStatus.rows, byCity: byCity.rows, weekly: weekly.rows, totals: totals.rows[0] });
    }

    if (method === 'POST' && path === '/admin/lead-update') {
      if (!hasPermission(admin, 'manage_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
      const body = await readBody(req);
      const ids = (Array.isArray(body.ids) ? body.ids : [body.id]).map(Number).filter(Boolean);
      if (!ids.length) return json(res, 400, { ok: false, error: 'No lead selected' });
      if (body.status) await pool.query(`UPDATE website_leads SET status=$1, updated_at=NOW() WHERE id=ANY($2)`, [sanitize(body.status, 40), ids]);
      if (body.priority) await pool.query(`UPDATE website_leads SET priority=$1, updated_at=NOW() WHERE id=ANY($2)`, [sanitize(body.priority, 40), ids]);
      if (body.assignedTo !== undefined) await pool.query(`UPDATE website_leads SET assigned_to=$1, updated_at=NOW() WHERE id=ANY($2)`, [sanitize(body.assignedTo, 255) || null, ids]);
      if (body.adminNotes !== undefined) await pool.query(`UPDATE website_leads SET admin_notes=$1, updated_at=NOW() WHERE id=ANY($2)`, [sanitize(body.adminNotes, 2500) || null, ids]);
      await logActivity(req, admin, 'lead_update', 'website_leads', ids.join(','), body);
      return json(res, 200, { ok: true });
    }

    if (method === 'GET' && path === '/admin/export') {
      if (!hasPermission(admin, 'export_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
      const rows = await pool.query(`SELECT * FROM website_leads ORDER BY created_at DESC LIMIT 10000`);
      const headers = ['id','form_type','name','email','phone','subject','message','service','city','experience','source','status','priority','assigned_to','admin_notes','last_contacted_at','created_at'];
      const csvValue = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const csv = [headers.join(','), ...rows.rows.map((r) => headers.map((h) => csvValue(r[h])).join(','))].join('\n');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="athoo-leads.csv"');
      return res.end(csv);
    }

    if (method === 'POST' && path === '/admin/bulk-email') {
      if (!hasPermission(admin, 'send_email')) return json(res, 403, { ok: false, error: 'Permission denied' });
      const body = await readBody(req);
      const ids = (Array.isArray(body.ids) ? body.ids : []).map(Number).filter(Boolean);
      const subject = sanitize(body.subject, 200);
      const message = sanitize(body.message, 5000);
      if (!ids.length || !subject || !message) return json(res, 400, { ok: false, error: 'Select leads and enter subject/message' });
      const leads = await pool.query(`SELECT id,name,email,service,city,form_type FROM website_leads WHERE id=ANY($1) AND email IS NOT NULL AND email<>'' LIMIT 250`, [ids]);
      let sent = 0; let skipped = 0;
      for (const lead of leads.rows) {
        const html = `<div style="font-family:Arial,sans-serif;line-height:1.6"><p>${message.replace(/\n/g, '<br/>')}</p><hr/><p>Athoo | official.athoo@gmail.com | +92 339 0051068</p></div>`;
        let status = 'skipped_no_resend_key'; let provider = {};
        try { if (process.env.RESEND_API_KEY) { provider = await sendEmail(lead.email, subject, html); status = 'sent'; sent++; } else skipped++; } catch (e) { status = 'failed'; provider = { error: e?.message || String(e) }; }
        await pool.query(`INSERT INTO athoo_email_logs (lead_id, recipient, subject, body, status, provider_response, sent_by) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [lead.id, lead.email, subject, message, status, JSON.stringify(provider), admin.email]);
      }
      await pool.query(`UPDATE website_leads SET last_contacted_at=NOW(), status=CASE WHEN status='new' THEN 'contacted' ELSE status END WHERE id=ANY($1)`, [ids]);
      return json(res, 200, { ok: true, sent, skipped, note: process.env.RESEND_API_KEY ? 'Emails sent.' : 'No RESEND_API_KEY configured. Emails were logged but not sent.' });
    }

    if (method === 'GET' && path === '/admin/settings') {
      const rows = await pool.query(`SELECT key,value,updated_at FROM app_settings ORDER BY key`);
      const settings = Object.fromEntries(rows.rows.map((r) => [r.key, r.value]));
      return json(res, 200, { ok: true, settings });
    }

    if (method === 'POST' && path === '/admin/settings') {
      if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
      const body = await readBody(req);
      const maintenance = { enabled: Boolean(body.maintenanceEnabled), message: sanitize(body.maintenanceMessage, 500) || 'Athoo website is under maintenance. Please check back soon.' };
      const supportEmail = sanitize(body.supportEmail, 255) || process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com';
      const supportPhone = sanitize(body.supportPhone, 50) || '+92 339 0051068';
      for (const [key, value] of Object.entries({ maintenance_mode: maintenance, support_email: supportEmail, support_phone: supportPhone })) {
        await pool.query(`INSERT INTO app_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, [key, JSON.stringify(value)]);
      }
      return json(res, 200, { ok: true });
    }

    if (method === 'GET' && path === '/admin/cms') {
      const rows = await pool.query(`SELECT key,value FROM app_settings WHERE key LIKE 'cms_%' OR key LIKE 'site_%' OR key LIKE 'social_%' OR key IN ('support_email','support_phone','whatsapp_number') ORDER BY key`);
      return json(res, 200, { ok: true, cms: Object.fromEntries(rows.rows.map((r) => [r.key, r.value])) });
    }

    if (method === 'POST' && path === '/admin/cms') {
      if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
      const body = await readBody(req);
      for (const [key, value] of Object.entries(body)) {
        if (/^(cms_|site_|social_|support_|whatsapp_)/.test(key)) {
          await pool.query(`INSERT INTO app_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, [key, JSON.stringify(value)]);
        }
      }
      return json(res, 200, { ok: true });
    }

    if (method === 'GET' && path === '/admin/admins') {
      const rows = await pool.query(`SELECT id,name,email,role,permissions,is_active,last_login_at,created_at FROM athoo_admin_users ORDER BY id DESC`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }

    if (method === 'POST' && path === '/admin/admins') {
      if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
      const body = await readBody(req);
      const name = sanitize(body.name, 120); const email = sanitize(body.email, 255).toLowerCase(); const role = sanitize(body.role, 50) || 'manager'; const password = String(body.password || ''); const permissions = body.permissions || (role === 'super_admin' ? { all: true } : {}); const active = body.isActive !== false;
      if (!name || !email) return json(res, 400, { ok: false, error: 'Name and email required' });
      if (body.id) {
        if (password) await pool.query(`UPDATE athoo_admin_users SET name=$1,email=$2,role=$3,permissions=$4,password_hash=$5,is_active=$6 WHERE id=$7`, [name, email, role, JSON.stringify(permissions), hashPassword(password), active, Number(body.id)]);
        else await pool.query(`UPDATE athoo_admin_users SET name=$1,email=$2,role=$3,permissions=$4,is_active=$5 WHERE id=$6`, [name, email, role, JSON.stringify(permissions), active, Number(body.id)]);
      } else {
        if (!password || password.length < 8) return json(res, 400, { ok: false, error: 'Password must be at least 8 characters' });
        await pool.query(`INSERT INTO athoo_admin_users (name,email,role,permissions,password_hash,is_active) VALUES ($1,$2,$3,$4,$5,$6)`, [name, email, role, JSON.stringify(permissions), hashPassword(password), active]);
      }
      return json(res, 200, { ok: true });
    }

    const adminDelete = path.match(/^\/admin\/admins\/(\d+)$/);
    if (method === 'DELETE' && adminDelete) {
      if (admin.role !== 'super_admin') return json(res, 403, { ok: false, error: 'Only super admins can delete users' });
      await pool.query(`DELETE FROM athoo_admin_users WHERE id=$1 AND id<>$2`, [Number(adminDelete[1]), Number(admin.id)]);
      return json(res, 200, { ok: true });
    }

    if (method === 'GET' && path === '/admin/activity') {
      const rows = await pool.query(`SELECT admin_email, action, target_type, target_id, details, ip_address, created_at FROM admin_activity_logs ORDER BY created_at DESC LIMIT 200`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }

    if (method === 'GET' && path === '/admin/templates') {
      const rows = await pool.query(`SELECT id,name,subject,body,category,created_by,created_at,updated_at FROM athoo_email_templates ORDER BY category,name`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }

    if (method === 'POST' && path === '/admin/templates') {
      const body = await readBody(req);
      const name = sanitize(body.name, 120), subject = sanitize(body.subject, 200), bodyText = sanitize(body.body, 5000), category = sanitize(body.category, 50) || 'general';
      if (!name || !subject || !bodyText) return json(res, 400, { ok: false, error: 'Name, subject and body are required' });
      if (body.id) await pool.query(`UPDATE athoo_email_templates SET name=$1,subject=$2,body=$3,category=$4,updated_at=NOW() WHERE id=$5`, [name, subject, bodyText, category, Number(body.id)]);
      else await pool.query(`INSERT INTO athoo_email_templates (name,subject,body,category,created_by) VALUES ($1,$2,$3,$4,$5)`, [name, subject, bodyText, category, admin.email]);
      return json(res, 200, { ok: true });
    }

    const templateDelete = path.match(/^\/admin\/templates\/(\d+)$/);
    if (method === 'DELETE' && templateDelete) {
      await pool.query(`DELETE FROM athoo_email_templates WHERE id=$1`, [Number(templateDelete[1])]);
      return json(res, 200, { ok: true });
    }

    if (method === 'GET' && path === '/admin/email-logs') {
      const rows = await pool.query(`SELECT id,lead_id,recipient,subject,status,sent_by,created_at FROM athoo_email_logs ORDER BY created_at DESC LIMIT 200`);
      return json(res, 200, { ok: true, rows: rows.rows });
    }

    const notesMatch = path.match(/^\/admin\/lead-notes\/(\d+)$/);
    if (method === 'GET' && notesMatch) {
      const rows = await pool.query(`SELECT id,admin_email,note,created_at FROM lead_notes WHERE lead_id=$1 ORDER BY created_at DESC`, [Number(notesMatch[1])]);
      return json(res, 200, { ok: true, rows: rows.rows });
    }

    if (method === 'POST' && path === '/admin/lead-note') {
      const body = await readBody(req);
      const leadId = Number(body.leadId); const note = sanitize(body.note, 2000);
      if (!leadId || !note) return json(res, 400, { ok: false, error: 'Lead ID and note are required' });
      await pool.query(`INSERT INTO lead_notes (lead_id, admin_email, note) VALUES ($1,$2,$3)`, [leadId, admin.email, note]);
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { ok: false, error: `Route not found: ${method} ${path}` });
  } catch (error) {
    console.error('Athoo API error:', error);
    return json(res, 500, { ok: false, error: error?.message || 'Server error' });
  }
};
