const crypto = require('crypto');
const pg = require('pg');

const { Pool } = pg;

let pool;
let schemaReady;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured in Vercel environment variables.');
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function text(res, status, body, type = 'text/plain; charset=utf-8') {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.end(body);
}

function sanitize(value, max = 2000) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

function normalizeEmail(value) {
  return sanitize(value, 255).toLowerCase();
}

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch { return {}; }
  }
  return req.body;
}

function secret() {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'athoo-admin-secret-change-me';
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !String(stored).includes(':')) return false;
  const [salt, hash] = String(stored).split(':');
  const check = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return hash.length === check.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
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
  } catch { return null; }
}

function requireAdmin(req, res) {
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
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
  return Boolean(perms.all || perms[permission]);
}

async function ensureSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
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
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS form_type TEXT NOT NULL DEFAULT 'Website Lead';
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS subject TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS message TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS service TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS experience TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS source TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS ip_address TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS user_agent TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
      CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status);
      CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type);
      CREATE INDEX IF NOT EXISTS website_leads_email_idx ON website_leads (email);

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
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'manager';
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS login_count INT NOT NULL DEFAULT 0;
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

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
      CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON admin_activity_logs (created_at DESC);

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
      CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx ON admin_notifications (created_at DESC);

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
      ALTER TABLE athoo_email_logs ADD COLUMN IF NOT EXISTS sent_by TEXT;
      ALTER TABLE athoo_email_logs ADD COLUMN IF NOT EXISTS provider_response JSONB NOT NULL DEFAULT '{}'::jsonb;

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
      CREATE UNIQUE INDEX IF NOT EXISTS athoo_email_templates_name_idx ON athoo_email_templates (name);

      CREATE TABLE IF NOT EXISTS lead_notes (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT NOT NULL REFERENCES website_leads(id) ON DELETE CASCADE,
        admin_email TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes (lead_id);
    `);

    await db.query(`
      INSERT INTO app_settings (key, value) VALUES
      ('maintenance_mode', '{"enabled":false,"message":"Athoo website is under maintenance. Please check back soon."}'::jsonb),
      ('support_email', '"official.athoo@gmail.com"'::jsonb),
      ('support_phone', '"+92 339 0051068"'::jsonb),
      ('site_title', '"Athoo — Pakistan Smart Home Services"'::jsonb),
      ('site_description', '"Athoo is an upcoming Pakistani home services app for customers and verified providers."'::jsonb),
      ('whatsapp_number', '"+92 339 0051068"'::jsonb),
      ('social_instagram', '"https://instagram.com/athoo_services"'::jsonb),
      ('social_facebook', '"https://facebook.com/athoo_services"'::jsonb),
      ('social_tiktok', '"https://tiktok.com/@athoo.pk"'::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `);

    await db.query(`
      INSERT INTO athoo_email_templates (name, subject, body, category) VALUES
      ('Waitlist Welcome', 'Welcome to Athoo Waitlist!', 'Hi {{name}}, thank you for joining the Athoo waitlist.', 'waitlist'),
      ('Provider Onboarding', 'Athoo Provider Application Received', 'Hi {{name}}, thank you for registering as a service provider on Athoo.', 'provider')
      ON CONFLICT (name) DO NOTHING;
    `);

    const adminEmail = process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com';
    await db.query(
      `INSERT INTO athoo_admin_users (name, email, role, permissions, is_active)
       VALUES ('Super Admin', $1, 'super_admin', '{"all":true}'::jsonb, true)
       ON CONFLICT (email) DO UPDATE SET role='super_admin', permissions='{"all":true}'::jsonb, is_active=true`,
      [adminEmail]
    );
  })();
  return schemaReady;
}

async function logActivity(req, admin, action, targetType = null, targetId = null, details = {}) {
  try {
    await getPool().query(
      `INSERT INTO admin_activity_logs (admin_email, action, target_type, target_id, details, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [admin?.email || null, action, targetType, targetId, JSON.stringify(details || {}), getIp(req)]
    );
  } catch (error) {
    console.warn('Activity log failed:', error?.message || error);
  }
}

async function createNotification(message, linkTo = null) {
  try {
    await getPool().query(
      `INSERT INTO admin_notifications (admin_email, type, title, message, link_to, is_read, created_at)
       VALUES (NULL, 'new_lead', 'New Website Lead', $1, $2, false, NOW())`,
      [message, linkTo]
    );
  } catch (error) {
    console.warn('Notification create failed:', error?.message || error);
  }
}

async function handleLogin(req, res) {
  const body = getBody(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  if (!password) return json(res, 400, { ok: false, error: 'Password is required' });

  let admin;
  if (email) {
    const result = await getPool().query(
      `SELECT id, name, email, role, permissions, password_hash, is_active FROM athoo_admin_users WHERE lower(email)=$1 LIMIT 1`,
      [email]
    );
    admin = result.rows[0];
  } else {
    const result = await getPool().query(
      `SELECT id, name, email, role, permissions, password_hash, is_active FROM athoo_admin_users WHERE role='super_admin' AND is_active=true ORDER BY id ASC LIMIT 1`
    );
    admin = result.rows[0];
  }

  if (!admin || !admin.is_active) return json(res, 401, { ok: false, error: 'Invalid email or password' });

  let ok = false;
  if (admin.password_hash) ok = verifyPassword(password, admin.password_hash);
  if (!ok && process.env.ADMIN_PASSWORD) {
    ok = password.length === process.env.ADMIN_PASSWORD.length && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(process.env.ADMIN_PASSWORD));
    if (ok && !admin.password_hash) {
      await getPool().query(`UPDATE athoo_admin_users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [hashPassword(password), admin.id]);
    }
  }
  if (!ok) return json(res, 401, { ok: false, error: 'Invalid email or password' });

  await getPool().query(`UPDATE athoo_admin_users SET last_login_at=NOW(), login_count=COALESCE(login_count,0)+1, updated_at=NOW() WHERE id=$1`, [admin.id]);
  await logActivity(req, admin, 'admin_login', 'admin_user', String(admin.id), { role: admin.role });

  const permissions = admin.permissions || { all: true };
  const publicAdmin = { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions, is_active: admin.is_active };
  return json(res, 200, { ok: true, token: signToken(publicAdmin), admin: publicAdmin });
}

async function handleLeads(req, res, url, admin) {
  if (!hasPermission(admin, 'view_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const q = url.searchParams;
  const search = sanitize(q.get('search'), 120);
  const status = sanitize(q.get('status'), 40);
  const formType = sanitize(q.get('formType'), 80);
  const city = sanitize(q.get('city'), 80);
  const assignedTo = sanitize(q.get('assignedTo'), 255);
  const priority = sanitize(q.get('priority'), 40);
  const dateFrom = sanitize(q.get('dateFrom'), 30);
  const dateTo = sanitize(q.get('dateTo'), 30);
  const limit = Math.min(Math.max(Number(q.get('limit') || 100), 1), 250);
  const offset = Math.max(Number(q.get('offset') || 0), 0);
  const rows = await getPool().query(
    `SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source,
            status, priority, assigned_to, admin_notes, last_contacted_at, created_at, updated_at
     FROM website_leads
     WHERE ($1='' OR name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2 OR message ILIKE $2 OR service ILIKE $2 OR city ILIKE $2)
       AND ($3='' OR status=$3)
       AND ($4='' OR form_type=$4)
       AND ($5='' OR city ILIKE $6)
       AND ($7='' OR assigned_to=$7)
       AND ($8='' OR priority=$8)
       AND ($9='' OR created_at >= $9::timestamptz)
       AND ($10='' OR created_at < ($10::date + INTERVAL '1 day'))
     ORDER BY created_at DESC LIMIT $11 OFFSET $12`,
    [search, `%${search}%`, status, formType, city, `%${city}%`, assignedTo, priority, dateFrom || '', dateTo || '', limit, offset]
  );
  const stats = await getPool().query(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today,
            count(*) FILTER (WHERE form_type='Provider Waitlist')::int AS providers,
            count(*) FILTER (WHERE form_type='Waitlist Signup')::int AS waitlist,
            count(*) FILTER (WHERE form_type='Contact Form')::int AS contacts,
            count(*) FILTER (WHERE status='new')::int AS new_leads
     FROM website_leads`
  );
  const admins = await getPool().query(`SELECT name, email, role, is_active FROM athoo_admin_users WHERE is_active=true ORDER BY role, name`);
  return json(res, 200, { ok: true, rows: rows.rows, stats: stats.rows[0], admins: admins.rows });
}

async function handleAnalytics(req, res, admin) {
  if (!hasPermission(admin, 'view_analytics') && !hasPermission(admin, 'view_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const [daily, byForm, byStatus, byCity, weekly, totals] = await Promise.all([
    getPool().query(`SELECT TO_CHAR(created_at::date, 'Mon DD') AS day, created_at::date AS raw_date, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY created_at::date ORDER BY created_at::date ASC`),
    getPool().query(`SELECT form_type AS name, COUNT(*)::int AS value FROM website_leads GROUP BY form_type ORDER BY value DESC`),
    getPool().query(`SELECT status AS name, COUNT(*)::int AS value FROM website_leads GROUP BY status ORDER BY value DESC`),
    getPool().query(`SELECT COALESCE(city,'Unknown') AS name, COUNT(*)::int AS value FROM website_leads WHERE city IS NOT NULL AND city <> '' GROUP BY city ORDER BY value DESC LIMIT 10`),
    getPool().query(`SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS week, DATE_TRUNC('week', created_at) AS raw_week, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '12 weeks' GROUP BY DATE_TRUNC('week', created_at) ORDER BY raw_week ASC`),
    getPool().query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days')::int AS last_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS this_month, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today, COUNT(*) FILTER (WHERE status='new')::int AS new_leads, COUNT(*) FILTER (WHERE form_type='Provider Waitlist')::int AS providers, COUNT(*) FILTER (WHERE form_type='Waitlist Signup')::int AS waitlist, COUNT(*) FILTER (WHERE form_type='Contact Form')::int AS contacts, COUNT(*) FILTER (WHERE status='approved')::int AS approved, COUNT(*) FILTER (WHERE status='rejected')::int AS rejected FROM website_leads`),
  ]);
  return json(res, 200, { ok: true, daily: daily.rows, byForm: byForm.rows, byStatus: byStatus.rows, byCity: byCity.rows, weekly: weekly.rows, totals: totals.rows[0] });
}

async function handleSettingsGet(req, res, admin) {
  const rows = await getPool().query(`SELECT key, value, updated_at FROM app_settings ORDER BY key`);
  return json(res, 200, { ok: true, settings: Object.fromEntries(rows.rows.map(r => [r.key, r.value])) });
}

async function handleSettingsPost(req, res, admin) {
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = getBody(req);
  const values = {
    maintenance_mode: { enabled: Boolean(body.maintenanceEnabled), message: sanitize(body.maintenanceMessage, 500) || 'Athoo website is under maintenance. Please check back soon.' },
    support_email: sanitize(body.supportEmail, 255) || 'official.athoo@gmail.com',
    support_phone: sanitize(body.supportPhone, 50) || '+92 339 0051068',
  };
  for (const [key, value] of Object.entries(values)) {
    await getPool().query(`INSERT INTO app_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, [key, JSON.stringify(value)]);
  }
  await logActivity(req, admin, 'settings_update', 'app_settings', 'global', values);
  return json(res, 200, { ok: true });
}

async function handleCmsGet(req, res) {
  const rows = await getPool().query(`SELECT key, value FROM app_settings WHERE key LIKE 'cms_%' OR key LIKE 'site_%' OR key LIKE 'social_%' OR key IN ('support_email','support_phone','whatsapp_number','maintenance_mode','launch_date') ORDER BY key`);
  return json(res, 200, { ok: true, cms: Object.fromEntries(rows.rows.map(r => [r.key, r.value])) });
}

async function handleCmsPost(req, res, admin) {
  if (!hasPermission(admin, 'manage_settings') && !hasPermission(admin, 'manage_cms')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = getBody(req);
  const allowed = ['cms_hero','cms_contact','cms_about','site_title','site_description','social_instagram','social_facebook','social_linkedin','social_tiktok','support_email','support_phone','whatsapp_number','cms_faq'];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      await getPool().query(`INSERT INTO app_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, [key, JSON.stringify(body[key])]);
    }
  }
  await logActivity(req, admin, 'cms_update', 'app_settings', 'cms', {});
  return json(res, 200, { ok: true });
}

async function handleLeadUpdate(req, res, admin) {
  if (!hasPermission(admin, 'manage_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = getBody(req);
  const ids = (Array.isArray(body.ids) ? body.ids : [body.id]).map(Number).filter(Boolean);
  if (!ids.length) return json(res, 400, { ok: false, error: 'No lead selected' });
  const status = sanitize(body.status, 40);
  const priority = sanitize(body.priority, 40);
  const assignedTo = sanitize(body.assignedTo, 255);
  const adminNotes = sanitize(body.adminNotes, 2500);
  if (status) await getPool().query(`UPDATE website_leads SET status=$1, updated_at=NOW() WHERE id=ANY($2)`, [status, ids]);
  if (priority) await getPool().query(`UPDATE website_leads SET priority=$1, updated_at=NOW() WHERE id=ANY($2)`, [priority, ids]);
  if (assignedTo || body.assignedTo === '') await getPool().query(`UPDATE website_leads SET assigned_to=$1, updated_at=NOW() WHERE id=ANY($2)`, [assignedTo || null, ids]);
  if (adminNotes || body.adminNotes === '') await getPool().query(`UPDATE website_leads SET admin_notes=$1, updated_at=NOW() WHERE id=ANY($2)`, [adminNotes || null, ids]);
  await logActivity(req, admin, 'lead_update', 'website_leads', ids.join(','), { status, priority, assignedTo, count: ids.length });
  return json(res, 200, { ok: true });
}

async function handleExport(req, res, url, admin) {
  if (!hasPermission(admin, 'export_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const q = url.searchParams;
  const search = sanitize(q.get('search'), 120);
  const status = sanitize(q.get('status'), 40);
  const formType = sanitize(q.get('formType'), 80);
  const dateFrom = sanitize(q.get('dateFrom'), 30);
  const dateTo = sanitize(q.get('dateTo'), 30);
  const rows = await getPool().query(
    `SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source, status, priority, assigned_to, admin_notes, last_contacted_at, created_at
     FROM website_leads
     WHERE ($1='' OR name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2 OR message ILIKE $2)
       AND ($3='' OR status=$3)
       AND ($4='' OR form_type=$4)
       AND ($5='' OR created_at >= $5::timestamptz)
       AND ($6='' OR created_at < ($6::date + INTERVAL '1 day'))
     ORDER BY created_at DESC LIMIT 10000`,
    [search, `%${search}%`, status, formType, dateFrom || '', dateTo || '']
  );
  const headers = ['id','form_type','name','email','phone','subject','message','service','city','experience','source','status','priority','assigned_to','admin_notes','last_contacted_at','created_at'];
  const csvValue = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.rows.map(r => headers.map(h => csvValue(r[h])).join(','))].join('\n');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="athoo-filtered-leads.csv"');
  res.end(csv);
}

async function handleBulkEmail(req, res, admin) {
  if (!hasPermission(admin, 'send_email')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = getBody(req);
  const ids = (Array.isArray(body.ids) ? body.ids : []).map(Number).filter(Boolean);
  const subject = sanitize(body.subject, 200);
  const message = sanitize(body.message, 5000);
  if (!ids.length) return json(res, 400, { ok: false, error: 'Select at least one lead' });
  if (!subject || !message) return json(res, 400, { ok: false, error: 'Subject and message are required' });
  const leads = await getPool().query(`SELECT id, name, email, form_type, service, city FROM website_leads WHERE id=ANY($1) AND email IS NOT NULL AND email<>'' LIMIT 250`, [ids]);
  if (!leads.rows.length) return json(res, 400, { ok: false, error: 'Selected leads do not have email addresses' });
  let resend = null;
  if (process.env.RESEND_API_KEY) {
    try { const { Resend } = require('resend'); resend = new Resend(process.env.RESEND_API_KEY); } catch (error) { console.warn('Resend unavailable:', error?.message || error); }
  }
  const from = process.env.LEAD_EMAIL_FROM || 'Athoo Website <onboarding@resend.dev>';
  let sent = 0;
  let skipped = 0;
  for (const lead of leads.rows) {
    const rendered = message
      .replaceAll('{{name}}', String(lead.name || 'there'))
      .replaceAll('{{email}}', String(lead.email || ''))
      .replaceAll('{{service}}', String(lead.service || ''))
      .replaceAll('{{city}}', String(lead.city || ''))
      .replaceAll('{{form_type}}', String(lead.form_type || ''));
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><p>${sanitize(rendered, 5000).replace(/\n/g, '<br/>')}</p><hr/><p style="font-size:12px;color:#666">Athoo | official.athoo@gmail.com | +92 339 0051068</p></div>`;
    if (resend) {
      const response = await resend.emails.send({ from, to: lead.email, subject, html });
      await getPool().query(`INSERT INTO athoo_email_logs (lead_id,recipient,subject,body,status,provider_response,sent_by) VALUES ($1,$2,$3,$4,'sent',$5,$6)`, [lead.id, lead.email, subject, message, JSON.stringify(response), admin.email || null]);
      sent++;
    } else {
      await getPool().query(`INSERT INTO athoo_email_logs (lead_id,recipient,subject,body,status,provider_response,sent_by) VALUES ($1,$2,$3,$4,'skipped_no_resend_key','{}'::jsonb,$5)`, [lead.id, lead.email, subject, message, admin.email || null]);
      skipped++;
    }
  }
  await getPool().query(`UPDATE website_leads SET last_contacted_at=NOW(), status=CASE WHEN status='new' THEN 'contacted' ELSE status END WHERE id=ANY($1)`, [leads.rows.map(l => l.id)]);
  await logActivity(req, admin, 'bulk_email', 'website_leads', ids.join(','), { sent, skipped, subject });
  return json(res, 200, { ok: true, sent, skipped, note: resend ? 'Emails sent.' : 'No RESEND_API_KEY configured. Emails were logged but not sent.' });
}

async function handleAdminsGet(req, res, admin) {
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const rows = await getPool().query(`SELECT id, name, email, role, permissions, is_active, last_login_at, login_count, created_at, updated_at FROM athoo_admin_users ORDER BY id DESC`);
  return json(res, 200, { ok: true, rows: rows.rows });
}

const rolePermissions = {
  super_admin: { all: true },
  admin: { view_leads: true, manage_leads: true, export_leads: true, send_email: true, manage_settings: true, view_analytics: true, manage_cms: true },
  manager: { view_leads: true, manage_leads: true, export_leads: true, send_email: true, view_analytics: true },
  marketing: { view_leads: true, send_email: true, view_analytics: true, manage_cms: true },
  support: { view_leads: true, manage_leads: true },
  custom: {},
};

async function handleAdminsPost(req, res, admin) {
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = getBody(req);
  const name = sanitize(body.name, 120);
  const email = normalizeEmail(body.email);
  const role = sanitize(body.role, 50) || 'manager';
  const password = String(body.password || '');
  const isActive = body.is_active !== false && body.isActive !== false;
  const permissions = role === 'custom' ? (body.permissions || {}) : (rolePermissions[role] || rolePermissions.manager);
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: 'Valid name and email are required' });
  if (body.id) {
    const id = Number(body.id);
    if (password) {
      await getPool().query(`UPDATE athoo_admin_users SET name=$1,email=$2,role=$3,permissions=$4,password_hash=$5,is_active=$6,updated_at=NOW() WHERE id=$7`, [name, email, role, JSON.stringify(permissions), hashPassword(password), isActive, id]);
    } else {
      await getPool().query(`UPDATE athoo_admin_users SET name=$1,email=$2,role=$3,permissions=$4,is_active=$5,updated_at=NOW() WHERE id=$6`, [name, email, role, JSON.stringify(permissions), isActive, id]);
    }
    await logActivity(req, admin, 'admin_user_update', 'admin_user', String(id), { email, role, isActive });
  } else {
    if (!password || password.length < 8) return json(res, 400, { ok: false, error: 'Password must be at least 8 characters' });
    await getPool().query(`INSERT INTO athoo_admin_users (name,email,role,permissions,password_hash,is_active) VALUES ($1,$2,$3,$4,$5,$6)`, [name, email, role, JSON.stringify(permissions), hashPassword(password), isActive]);
    await logActivity(req, admin, 'admin_user_create', 'admin_user', email, { role, isActive });
  }
  return json(res, 200, { ok: true });
}

async function handleAdminDelete(req, res, admin, path) {
  if (admin.role !== 'super_admin') return json(res, 403, { ok: false, error: 'Only super admins can delete users' });
  const id = Number(path.split('/').pop());
  if (!id) return json(res, 400, { ok: false, error: 'Invalid admin id' });
  if (id === Number(admin.id)) return json(res, 400, { ok: false, error: 'Cannot delete yourself' });
  await getPool().query(`DELETE FROM athoo_admin_users WHERE id=$1`, [id]);
  await logActivity(req, admin, 'admin_user_delete', 'admin_user', String(id), {});
  return json(res, 200, { ok: true });
}

async function handleActivity(req, res, url, admin) {
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const limit = Math.min(Number(url.searchParams.get('limit') || 200), 500);
  const rows = await getPool().query(`SELECT admin_email, action, target_type, target_id, details, ip_address, created_at FROM admin_activity_logs ORDER BY created_at DESC LIMIT $1`, [limit]);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleTemplatesGet(req, res, admin) {
  const rows = await getPool().query(`SELECT id, name, subject, body, category, created_by, created_at, updated_at FROM athoo_email_templates ORDER BY category, name`);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleTemplatesPost(req, res, admin) {
  if (!hasPermission(admin, 'send_email')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = getBody(req);
  const name = sanitize(body.name, 120);
  const subject = sanitize(body.subject, 200);
  const bodyText = sanitize(body.body, 5000);
  const category = sanitize(body.category, 50) || 'general';
  if (!name || !subject || !bodyText) return json(res, 400, { ok: false, error: 'Name, subject and body are required' });
  if (body.id) {
    await getPool().query(`UPDATE athoo_email_templates SET name=$1,subject=$2,body=$3,category=$4,updated_at=NOW() WHERE id=$5`, [name, subject, bodyText, category, Number(body.id)]);
  } else {
    await getPool().query(`INSERT INTO athoo_email_templates (name,subject,body,category,created_by) VALUES ($1,$2,$3,$4,$5)`, [name, subject, bodyText, category, admin.email || null]);
  }
  await logActivity(req, admin, body.id ? 'template_update' : 'template_create', 'email_template', name, {});
  return json(res, 200, { ok: true });
}

async function handleTemplateDelete(req, res, admin, path) {
  if (!hasPermission(admin, 'send_email')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const id = Number(path.split('/').pop());
  await getPool().query(`DELETE FROM athoo_email_templates WHERE id=$1`, [id]);
  await logActivity(req, admin, 'template_delete', 'email_template', String(id), {});
  return json(res, 200, { ok: true });
}

async function handleEmailLogs(req, res, admin) {
  const rows = await getPool().query(`SELECT id, lead_id, recipient, subject, status, sent_by, created_at FROM athoo_email_logs ORDER BY created_at DESC LIMIT 200`);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleLeadNotesGet(req, res, admin, path) {
  const leadId = Number(path.split('/').pop());
  if (!leadId) return json(res, 400, { ok: false, error: 'Invalid lead id' });
  const rows = await getPool().query(`SELECT id, admin_email, note, created_at FROM lead_notes WHERE lead_id=$1 ORDER BY created_at DESC`, [leadId]);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleLeadNotePost(req, res, admin) {
  if (!hasPermission(admin, 'manage_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = getBody(req);
  const leadId = Number(body.leadId);
  const note = sanitize(body.note, 2000);
  if (!leadId || !note) return json(res, 400, { ok: false, error: 'Lead ID and note are required' });
  await getPool().query(`INSERT INTO lead_notes (lead_id, admin_email, note) VALUES ($1,$2,$3)`, [leadId, admin.email || 'admin', note]);
  await logActivity(req, admin, 'lead_note_add', 'website_leads', String(leadId), { note: note.slice(0, 80) });
  return json(res, 200, { ok: true });
}

async function handleSubmit(req, res, formTypeOverride = null) {
  const body = getBody(req);
  const formType = formTypeOverride || sanitize(body.formType || body.form_type || 'Website Lead', 80);
  const name = sanitize(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = sanitize(body.phone, 30);
  const subject = sanitize(body.subject, 200);
  const message = sanitize(body.message || body.experience, 2500);
  const service = sanitize(body.service || body.serviceCategory, 120);
  const city = sanitize(body.city, 120);
  const experience = sanitize(body.experience, 800);
  if (formType === 'Provider Waitlist' && (!name || !email || !phone || !city || !service)) return json(res, 400, { ok: false, error: 'Name, email, phone, city and service are required.' });
  if (formType === 'Contact Form' && (!name || !email || !message)) return json(res, 400, { ok: false, error: 'Name, email and message are required.' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: 'Invalid email address.' });
  if (email && formType === 'Provider Waitlist') {
    const duplicate = await getPool().query(`SELECT id FROM website_leads WHERE lower(email)=$1 AND form_type='Provider Waitlist' LIMIT 1`, [email]);
    if (duplicate.rows.length) return json(res, 409, { ok: false, error: 'This email is already registered on the provider waitlist.' });
  }
  const result = await getPool().query(
    `INSERT INTO website_leads (form_type,name,email,phone,subject,message,service,city,experience,source,ip_address,user_agent,payload,status,priority,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'new','normal',NOW(),NOW()) RETURNING id`,
    [formType, name || null, email || null, phone || null, subject || null, message || null, service || null, city || null, experience || null, sanitize(body.source, 500) || 'website', getIp(req), sanitize(req.headers['user-agent'], 500) || null, JSON.stringify(body || {})]
  );
  const id = result.rows[0]?.id;
  await createNotification(`New ${formType} submission${name ? ` from ${name}` : ''}${city ? ` (${city})` : ''}.`, `/admin/leads/${id}`);
  return json(res, 201, { ok: true, id });
}

async function handlePublicSettings(req, res) {
  const rows = await getPool().query(`SELECT key, value FROM app_settings WHERE key LIKE 'cms_%' OR key LIKE 'site_%' OR key LIKE 'social_%' OR key IN ('support_email','support_phone','whatsapp_number','maintenance_mode','launch_date') ORDER BY key`);
  const map = Object.fromEntries(rows.rows.map(r => [r.key, r.value]));
  return json(res, 200, {
    ok: true,
    siteTitle: map.site_title || 'Athoo',
    siteDescription: map.site_description || 'Athoo connects customers with trusted local service providers.',
    contactEmail: map.support_email || 'official.athoo@gmail.com',
    contactPhone: map.support_phone || '+92 339 0051068',
    whatsapp: map.whatsapp_number || '+92 339 0051068',
    instagramUrl: map.social_instagram || 'https://instagram.com/athoo_services',
    facebookUrl: map.social_facebook || 'https://facebook.com/athoo_services',
    tiktokUrl: map.social_tiktok || 'https://tiktok.com/@athoo.pk',
    linkedinUrl: map.social_linkedin || '',
    maintenanceMode: Boolean(map.maintenance_mode?.enabled) || map.maintenance_mode === true,
    maintenanceMessage: map.maintenance_mode?.message || 'Athoo website is under maintenance. Please check back soon.',
    launchDate: map.launch_date || '2026-09-01',
  });
}

module.exports = async function handler(req, res) {
  try {
    await ensureSchema();
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const method = req.method || 'GET';
    let path = url.pathname.replace(/^\/api/, '') || '/';
    if (path === '/health') return json(res, 200, { ok: true, service: 'athoo-api', time: new Date().toISOString() });
    if (method === 'POST' && path === '/submit') return handleSubmit(req, res, getBody(req).formType || null);
    if (method === 'POST' && (path === '/public/waitlist' || path === '/public/lead')) return handleSubmit(req, res, 'Provider Waitlist');
    if (method === 'POST' && path === '/public/contact') return handleSubmit(req, res, 'Contact Form');
    if (method === 'GET' && (path === '/public/settings' || path === '/settings')) return handlePublicSettings(req, res);
    if (method === 'GET' && (path === '/public/cms' || path === '/cms')) return handleCmsGet(req, res);
    if (method === 'POST' && path === '/admin/login') return handleLogin(req, res);

    const admin = requireAdmin(req, res);
    if (!admin) return;

    if (method === 'GET' && path === '/admin/leads') return handleLeads(req, res, url, admin);
    if (method === 'GET' && path === '/admin/analytics') return handleAnalytics(req, res, admin);
    if (method === 'GET' && path === '/admin/settings') return handleSettingsGet(req, res, admin);
    if (method === 'POST' && path === '/admin/settings') return handleSettingsPost(req, res, admin);
    if (method === 'GET' && path === '/admin/cms') return handleCmsGet(req, res, admin);
    if (method === 'POST' && path === '/admin/cms') return handleCmsPost(req, res, admin);
    if (method === 'POST' && path === '/admin/lead-update') return handleLeadUpdate(req, res, admin);
    if (method === 'GET' && path === '/admin/export') return handleExport(req, res, url, admin);
    if (method === 'POST' && path === '/admin/bulk-email') return handleBulkEmail(req, res, admin);
    if (method === 'GET' && path === '/admin/admins') return handleAdminsGet(req, res, admin);
    if (method === 'POST' && path === '/admin/admins') return handleAdminsPost(req, res, admin);
    if (method === 'DELETE' && path.startsWith('/admin/admins/')) return handleAdminDelete(req, res, admin, path);
    if (method === 'GET' && path === '/admin/activity') return handleActivity(req, res, url, admin);
    if (method === 'GET' && path === '/admin/templates') return handleTemplatesGet(req, res, admin);
    if (method === 'POST' && path === '/admin/templates') return handleTemplatesPost(req, res, admin);
    if (method === 'DELETE' && path.startsWith('/admin/templates/')) return handleTemplateDelete(req, res, admin, path);
    if (method === 'GET' && path === '/admin/email-logs') return handleEmailLogs(req, res, admin);
    if (method === 'GET' && path.startsWith('/admin/lead-notes/')) return handleLeadNotesGet(req, res, admin, path);
    if (method === 'POST' && path === '/admin/lead-note') return handleLeadNotePost(req, res, admin);

    return json(res, 404, { ok: false, error: `API route not found: ${method} ${path}` });
  } catch (error) {
    console.error('Athoo API fatal error:', error);
    return json(res, 500, { ok: false, error: error?.message || 'Internal server error' });
  }
};
