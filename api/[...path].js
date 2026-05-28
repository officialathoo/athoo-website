const crypto = require('crypto');
const pg = require('pg');
let Resend = null;
try { Resend = require('resend').Resend; } catch (_) { Resend = null; }

const { Pool } = pg;

let pool;
let schemaReady = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured in Vercel environment variables.');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function getMethod(req) { return String(req.method || 'GET').toUpperCase(); }

function getPath(req) {
  const url = new URL(req.url || '/', 'https://athoo.local');
  return url.pathname.replace(/^\/api/, '') || '/';
}

function getQuery(req) {
  return Object.fromEntries(new URL(req.url || '/', 'https://athoo.local').searchParams.entries());
}

async function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function sanitize(value, max = 2000) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

function normalizeEmail(value) { return sanitize(value, 255).toLowerCase(); }

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

function secret() {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'athoo-admin-secret';
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

function safeCompare(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token) {
  if (!token || !String(token).includes('.')) return null;
  const [encoded, sig] = String(token).split('.');
  const expected = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  try {
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > Number(payload.exp)) return null;
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
  if (perms.all) return true;
  return Boolean(perms[permission]);
}

async function ensureSchema() {
  if (schemaReady) return;
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS website_leads (
      id BIGSERIAL PRIMARY KEY,
      form_type TEXT,
      name TEXT,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT,
      service TEXT,
      city TEXT,
      experience TEXT,
      source TEXT,
      status TEXT DEFAULT 'new',
      priority TEXT DEFAULT 'normal',
      assigned_to TEXT,
      admin_notes TEXT,
      payload JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      user_agent TEXT,
      last_contacted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS athoo_admin_users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'admin',
      permissions JSONB DEFAULT '{}'::jsonb,
      password_hash TEXT,
      is_active BOOLEAN DEFAULT true,
      last_login_at TIMESTAMPTZ,
      login_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id BIGSERIAL PRIMARY KEY,
      admin_email TEXT,
      action TEXT,
      target_type TEXT,
      target_id TEXT,
      details JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
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
      provider_response JSONB DEFAULT '{}'::jsonb,
      sent_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS athoo_email_templates (
      id BIGSERIAL PRIMARY KEY,
      name TEXT,
      subject TEXT,
      body TEXT,
      category TEXT DEFAULT 'general',
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_notes (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT NOT NULL,
      admin_email TEXT,
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const alterStatements = [
    `ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0`,
    `ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS admin_notes TEXT`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS ip_address TEXT`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS user_agent TEXT`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ`,
    `ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`
  ];
  for (const sql of alterStatements) await db.query(sql);

  await db.query(
    `INSERT INTO athoo_admin_users (name, email, role, permissions, is_active)
     VALUES ($1,$2,'super_admin',$3,true)
     ON CONFLICT (email) DO UPDATE SET role='super_admin', permissions=$3, is_active=true, updated_at=NOW()`,
    ['Athoo Enterprise', 'official.athoo@gmail.com', JSON.stringify({ all: true })]
  );

  const defaults = [
    ['site_title', 'Athoo — Pakistan Smart Home Services'],
    ['site_description', 'Athoo connects customers with trusted local service providers in Pakistan.'],
    ['support_email', 'official.athoo@gmail.com'],
    ['support_phone', '+92 339 0051068'],
    ['whatsapp_number', '+92 339 0051068'],
    ['social_instagram', 'https://instagram.com/athoo_services'],
    ['social_facebook', 'https://facebook.com/athoo_services'],
    ['social_tiktok', 'https://tiktok.com/@athoo.pk'],
    ['maintenance_mode', { enabled: false, message: 'Athoo website is under maintenance. Please check back soon.' }]
  ];
  for (const [key, value] of defaults) {
    await db.query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)]
    );
  }

  schemaReady = true;
}

async function logActivity(req, admin, action, targetType = null, targetId = null, details = {}) {
  try {
    await getPool().query(
      `INSERT INTO admin_activity_logs (admin_email, action, target_type, target_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)`,
      [admin?.email || null, action, targetType, targetId, JSON.stringify(details), getIp(req)]
    );
  } catch (_) {}
}

const rolePermissions = {
  super_admin: { all: true },
  admin: { view_leads: true, manage_leads: true, export_leads: true, send_email: true, manage_settings: true },
  manager: { view_leads: true, manage_leads: true, export_leads: true, send_email: true },
  marketing: { view_leads: true, send_email: true },
  support: { view_leads: true, manage_leads: true },
  custom: {},
};

async function handleLogin(req, res) {
  const db = getPool();
  const body = await getBody(req);
  const submittedPassword = String(body.password || '');
  const submittedEmail = normalizeEmail(body.email);

  let admin = null;
  if (submittedEmail) {
    const result = await db.query(
      `SELECT id, name, email, role, permissions, password_hash, is_active FROM athoo_admin_users WHERE lower(email)=$1 LIMIT 1`,
      [submittedEmail]
    );
    admin = result.rows[0] || null;
    if (!admin || !admin.is_active) return json(res, 401, { ok: false, error: 'Invalid email or password' });
    const ok = admin.password_hash
      ? verifyPassword(submittedPassword, admin.password_hash)
      : safeCompare(submittedPassword, process.env.ADMIN_PASSWORD || '');
    if (!ok) return json(res, 401, { ok: false, error: 'Invalid email or password' });
  } else {
    const result = await db.query(
      `SELECT id, name, email, role, permissions, password_hash, is_active FROM athoo_admin_users WHERE role='super_admin' AND is_active=true ORDER BY id ASC LIMIT 1`
    );
    admin = result.rows[0] || null;
    if (!admin) return json(res, 401, { ok: false, error: 'No admin account found' });
    const ok = admin.password_hash
      ? verifyPassword(submittedPassword, admin.password_hash)
      : safeCompare(submittedPassword, process.env.ADMIN_PASSWORD || '');
    if (!ok) return json(res, 401, { ok: false, error: 'Invalid password' });
  }

  await db.query(`UPDATE athoo_admin_users SET last_login_at=NOW(), login_count=COALESCE(login_count,0)+1, updated_at=NOW() WHERE id=$1`, [admin.id]);
  const permissions = admin.permissions || { all: true };
  await logActivity(req, admin, 'admin_login', 'admin_user', String(admin.id), { role: admin.role });
  return json(res, 200, {
    ok: true,
    token: signToken({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions }),
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions }
  });
}

async function handleSubmit(req, res) {
  const db = getPool();
  const body = await getBody(req);
  const formType = sanitize(body.formType || 'Website Lead', 80);
  const email = normalizeEmail(body.email) || null;
  const result = await db.query(
    `INSERT INTO website_leads (form_type,name,email,phone,subject,message,service,city,experience,source,status,priority,payload,ip_address,user_agent,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'new','normal',$11,$12,$13,NOW(),NOW()) RETURNING id`,
    [
      formType,
      sanitize(body.name,120) || null,
      email,
      sanitize(body.phone,30) || null,
      sanitize(body.subject,200) || null,
      sanitize(body.message,2500) || null,
      sanitize(body.service || body.serviceCategory,120) || null,
      sanitize(body.city,120) || null,
      sanitize(body.experience,800) || null,
      sanitize(body.source,500) || 'website',
      JSON.stringify(body),
      getIp(req),
      sanitize(req.headers['user-agent'],500) || null
    ]
  );
  return json(res, 200, { ok: true, id: result.rows[0].id });
}

async function handleLeads(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'view_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const q = getQuery(req);
  const search = sanitize(q.search, 120);
  const status = sanitize(q.status, 40);
  const formType = sanitize(q.formType, 80);
  const city = sanitize(q.city, 80);
  const assignedTo = sanitize(q.assignedTo, 255);
  const priority = sanitize(q.priority, 40);
  const dateFrom = sanitize(q.dateFrom, 30);
  const dateTo = sanitize(q.dateTo, 30);
  const limit = Math.min(Math.max(Number(q.limit || 50), 1), 250);
  const offset = Math.max(Number(q.offset || 0), 0);
  const db = getPool();
  const rows = await db.query(
    `SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source, status, priority, assigned_to, admin_notes, last_contacted_at, created_at, updated_at
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
  const stats = await db.query(
    `SELECT count(*)::int AS total,
      count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today,
      count(*) FILTER (WHERE form_type='Provider Waitlist')::int AS providers,
      count(*) FILTER (WHERE form_type='Waitlist Signup')::int AS waitlist,
      count(*) FILTER (WHERE form_type='Contact Form')::int AS contacts,
      count(*) FILTER (WHERE status='new')::int AS new_leads
     FROM website_leads`
  );
  const admins = await db.query(`SELECT name, email, role, is_active FROM athoo_admin_users WHERE is_active=true ORDER BY role, name`);
  return json(res, 200, { ok: true, rows: rows.rows, stats: stats.rows[0], admins: admins.rows });
}

async function handleAnalytics(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  const db = getPool();
  const [daily, byForm, byStatus, byCity, weekly, totals] = await Promise.all([
    db.query(`SELECT TO_CHAR(created_at::date, 'Mon DD') AS day, created_at::date AS raw_date, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY created_at::date ORDER BY created_at::date ASC`),
    db.query(`SELECT COALESCE(form_type,'Unknown') AS name, COUNT(*)::int AS value FROM website_leads GROUP BY form_type ORDER BY value DESC`),
    db.query(`SELECT COALESCE(status,'new') AS name, COUNT(*)::int AS value FROM website_leads GROUP BY status ORDER BY value DESC`),
    db.query(`SELECT COALESCE(city,'Unknown') AS name, COUNT(*)::int AS value FROM website_leads WHERE city IS NOT NULL AND city <> '' GROUP BY city ORDER BY value DESC LIMIT 10`),
    db.query(`SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS week, DATE_TRUNC('week', created_at) AS raw_week, COUNT(*)::int AS count FROM website_leads WHERE created_at >= NOW() - INTERVAL '12 weeks' GROUP BY DATE_TRUNC('week', created_at) ORDER BY raw_week ASC`),
    db.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days')::int AS last_week, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS this_month, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today, COUNT(*) FILTER (WHERE status='new')::int AS new_leads, COUNT(*) FILTER (WHERE form_type='Provider Waitlist')::int AS providers, COUNT(*) FILTER (WHERE form_type='Waitlist Signup')::int AS waitlist, COUNT(*) FILTER (WHERE form_type='Contact Form')::int AS contacts, COUNT(*) FILTER (WHERE status='approved')::int AS approved, COUNT(*) FILTER (WHERE status='rejected')::int AS rejected FROM website_leads`)
  ]);
  return json(res, 200, { ok: true, daily: daily.rows, byForm: byForm.rows, byStatus: byStatus.rows, byCity: byCity.rows, weekly: weekly.rows, totals: totals.rows[0] });
}

async function handleSettingsGet(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  const rows = await getPool().query(`SELECT key, value FROM app_settings ORDER BY key`);
  return json(res, 200, { ok: true, settings: Object.fromEntries(rows.rows.map(r => [r.key, r.value])) });
}

async function handleSettingsPost(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = await getBody(req);
  const updates = {
    maintenance_mode: { enabled: Boolean(body.maintenanceEnabled), message: sanitize(body.maintenanceMessage, 500) || 'Athoo website is under maintenance. Please check back soon.' },
    support_email: sanitize(body.supportEmail, 255) || 'official.athoo@gmail.com',
    support_phone: sanitize(body.supportPhone, 50) || '+92 339 0051068'
  };
  for (const [key, value] of Object.entries(updates)) {
    await getPool().query(`INSERT INTO app_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, [key, JSON.stringify(value)]);
  }
  await logActivity(req, admin, 'settings_update', 'app_settings', 'global', updates);
  return json(res, 200, { ok: true });
}

async function handleCmsGet(req, res, isPublic = false) {
  if (!isPublic) { const admin = requireAdmin(req, res); if (!admin) return; }
  const rows = await getPool().query(`SELECT key, value FROM app_settings WHERE key LIKE 'cms_%' OR key LIKE 'site_%' OR key LIKE 'social_%' OR key IN ('support_email','support_phone','whatsapp_number','maintenance_mode','launch_date') ORDER BY key`);
  return json(res, 200, { ok: true, cms: Object.fromEntries(rows.rows.map(r => [r.key, r.value])) });
}

async function handleCmsPost(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = await getBody(req);
  const allowed = ['cms_hero','cms_contact','cms_about','cms_faq','site_title','site_description','social_instagram','social_facebook','social_linkedin','social_tiktok','support_email','support_phone','whatsapp_number','launch_date'];
  for (const key of allowed) {
    if (body[key] !== undefined) await getPool().query(`INSERT INTO app_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, [key, JSON.stringify(body[key])]);
  }
  await logActivity(req, admin, 'cms_update', 'app_settings', 'cms', {});
  return json(res, 200, { ok: true });
}

async function handleAdminsGet(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const rows = await getPool().query(`SELECT id,name,email,role,permissions,is_active,last_login_at,login_count,created_at,updated_at FROM athoo_admin_users ORDER BY id DESC`);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleAdminsPost(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = await getBody(req);
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
    await logActivity(req, admin, 'admin_user_update', 'admin_user', String(id), { email, role });
  } else {
    if (!password || password.length < 8) return json(res, 400, { ok: false, error: 'Password must be at least 8 characters' });
    await getPool().query(`INSERT INTO athoo_admin_users (name,email,role,permissions,password_hash,is_active,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`, [name, email, role, JSON.stringify(permissions), hashPassword(password), isActive]);
    await logActivity(req, admin, 'admin_user_create', 'admin_user', email, { role });
  }
  return json(res, 200, { ok: true });
}

async function handleAdminDelete(req, res, id) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (admin.role !== 'super_admin') return json(res, 403, { ok: false, error: 'Only super admins can delete users' });
  if (Number(id) === Number(admin.id)) return json(res, 400, { ok: false, error: 'Cannot delete yourself' });
  await getPool().query(`DELETE FROM athoo_admin_users WHERE id=$1`, [Number(id)]);
  await logActivity(req, admin, 'admin_user_delete', 'admin_user', String(id), {});
  return json(res, 200, { ok: true });
}

async function handleLeadUpdate(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'manage_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = await getBody(req);
  const ids = (Array.isArray(body.ids) ? body.ids : [body.id]).map(Number).filter(Boolean);
  if (!ids.length) return json(res, 400, { ok: false, error: 'No lead selected' });
  const updates = [];
  if (body.status !== undefined) updates.push(['status', sanitize(body.status, 40)]);
  if (body.priority !== undefined) updates.push(['priority', sanitize(body.priority, 40)]);
  if (body.assignedTo !== undefined) updates.push(['assigned_to', sanitize(body.assignedTo, 255) || null]);
  if (body.adminNotes !== undefined) updates.push(['admin_notes', sanitize(body.adminNotes, 2500) || null]);
  for (const [column, value] of updates) await getPool().query(`UPDATE website_leads SET ${column}=$1, updated_at=NOW() WHERE id=ANY($2)`, [value, ids]);
  await logActivity(req, admin, 'lead_update', 'website_leads', ids.join(','), { count: ids.length });
  return json(res, 200, { ok: true });
}

async function handleExport(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'export_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const rows = await getPool().query(`SELECT id,form_type,name,email,phone,subject,message,service,city,experience,source,status,priority,assigned_to,admin_notes,last_contacted_at,created_at FROM website_leads ORDER BY created_at DESC LIMIT 10000`);
  const headers = ['id','form_type','name','email','phone','subject','message','service','city','experience','source','status','priority','assigned_to','admin_notes','last_contacted_at','created_at'];
  const csvValue = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.rows.map(r => headers.map(h => csvValue(r[h])).join(','))].join('\n');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="athoo-filtered-leads.csv"');
  return res.end(csv);
}

async function handleBulkEmail(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'send_email')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = await getBody(req);
  const ids = (Array.isArray(body.ids) ? body.ids : []).map(Number).filter(Boolean);
  const subject = sanitize(body.subject, 200);
  const message = sanitize(body.message, 5000);
  if (!ids.length) return json(res, 400, { ok: false, error: 'Select at least one lead' });
  if (!subject || !message) return json(res, 400, { ok: false, error: 'Subject and message are required' });
  const leads = await getPool().query(`SELECT id,name,email,form_type,service,city FROM website_leads WHERE id=ANY($1) AND email IS NOT NULL AND email <> '' LIMIT 250`, [ids]);
  if (!leads.rows.length) return json(res, 400, { ok: false, error: 'Selected leads do not have email addresses' });
  const from = process.env.LEAD_EMAIL_FROM || 'Athoo Website <onboarding@resend.dev>';
  const resend = process.env.RESEND_API_KEY && Resend ? new Resend(process.env.RESEND_API_KEY) : null;
  let sent = 0, skipped = 0;
  for (const lead of leads.rows) {
    const rendered = message.replaceAll('{{name}}', String(lead.name || 'there')).replaceAll('{{email}}', String(lead.email || '')).replaceAll('{{service}}', String(lead.service || '')).replaceAll('{{city}}', String(lead.city || '')).replaceAll('{{form_type}}', String(lead.form_type || ''));
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><p>${rendered.replace(/\n/g, '<br/>')}</p><hr/><p style="font-size:12px;color:#666">Athoo | official.athoo@gmail.com | +92 339 0051068</p></div>`;
    if (resend) {
      const response = await resend.emails.send({ from, to: lead.email, subject, html });
      await getPool().query(`INSERT INTO athoo_email_logs (lead_id,recipient,subject,body,status,provider_response,sent_by) VALUES ($1,$2,$3,$4,'sent',$5,$6)`, [lead.id, lead.email, subject, message, JSON.stringify(response), admin.email]);
      sent++;
    } else {
      await getPool().query(`INSERT INTO athoo_email_logs (lead_id,recipient,subject,body,status,provider_response,sent_by) VALUES ($1,$2,$3,$4,'skipped_no_resend_key','{}'::jsonb,$5)`, [lead.id, lead.email, subject, message, admin.email]);
      skipped++;
    }
  }
  await getPool().query(`UPDATE website_leads SET last_contacted_at=NOW(), status=CASE WHEN status='new' THEN 'contacted' ELSE status END WHERE id=ANY($1)`, [leads.rows.map(l => l.id)]);
  await logActivity(req, admin, 'bulk_email', 'website_leads', ids.join(','), { sent, skipped, subject });
  return json(res, 200, { ok: true, sent, skipped, note: resend ? `Emails sent: ${sent}` : 'No RESEND_API_KEY configured. Emails were logged but not sent.' });
}

async function handleActivity(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'manage_settings')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const rows = await getPool().query(`SELECT admin_email,action,target_type,target_id,details,ip_address,created_at FROM admin_activity_logs ORDER BY created_at DESC LIMIT 250`);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleTemplatesGet(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  const rows = await getPool().query(`SELECT id,name,subject,body,category,created_by,created_at,updated_at FROM athoo_email_templates ORDER BY category,name`);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleTemplatesPost(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'send_email')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = await getBody(req);
  const name = sanitize(body.name, 120), subject = sanitize(body.subject, 200), bodyText = sanitize(body.body, 5000), category = sanitize(body.category, 50) || 'general';
  if (!name || !subject || !bodyText) return json(res, 400, { ok: false, error: 'Name, subject and body are required' });
  if (body.id) await getPool().query(`UPDATE athoo_email_templates SET name=$1,subject=$2,body=$3,category=$4,updated_at=NOW() WHERE id=$5`, [name, subject, bodyText, category, Number(body.id)]);
  else await getPool().query(`INSERT INTO athoo_email_templates (name,subject,body,category,created_by) VALUES ($1,$2,$3,$4,$5)`, [name, subject, bodyText, category, admin.email]);
  return json(res, 200, { ok: true });
}

async function handleTemplateDelete(req, res, id) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'send_email')) return json(res, 403, { ok: false, error: 'Permission denied' });
  await getPool().query(`DELETE FROM athoo_email_templates WHERE id=$1`, [Number(id)]);
  return json(res, 200, { ok: true });
}

async function handleEmailLogs(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  const rows = await getPool().query(`SELECT id,lead_id,recipient,subject,status,sent_by,created_at FROM athoo_email_logs ORDER BY created_at DESC LIMIT 250`);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleLeadNotesGet(req, res, leadId) {
  const admin = requireAdmin(req, res); if (!admin) return;
  const rows = await getPool().query(`SELECT id,admin_email,note,created_at FROM lead_notes WHERE lead_id=$1 ORDER BY created_at DESC`, [Number(leadId)]);
  return json(res, 200, { ok: true, rows: rows.rows });
}

async function handleLeadNotePost(req, res) {
  const admin = requireAdmin(req, res); if (!admin) return;
  if (!hasPermission(admin, 'manage_leads')) return json(res, 403, { ok: false, error: 'Permission denied' });
  const body = await getBody(req);
  const leadId = Number(body.leadId), note = sanitize(body.note, 2000);
  if (!leadId || !note) return json(res, 400, { ok: false, error: 'Lead ID and note are required' });
  await getPool().query(`INSERT INTO lead_notes (lead_id,admin_email,note) VALUES ($1,$2,$3)`, [leadId, admin.email, note]);
  await logActivity(req, admin, 'lead_note_add', 'website_leads', String(leadId), { note: note.slice(0, 80) });
  return json(res, 200, { ok: true });
}

async function handlePublicSettings(req, res) {
  const rows = await getPool().query(`SELECT key,value FROM app_settings WHERE key LIKE 'social_%' OR key IN ('site_title','site_description','support_email','support_phone','whatsapp_number','maintenance_mode','launch_date') ORDER BY key`);
  const map = Object.fromEntries(rows.rows.map(r => [r.key, r.value]));
  return json(res, 200, { ok: true, settings: map, siteTitle: map.site_title || 'Athoo', contactEmail: map.support_email || 'official.athoo@gmail.com', contactPhone: map.support_phone || '+92 339 0051068', whatsapp: map.whatsapp_number || '+92 339 0051068', maintenanceMode: Boolean(map.maintenance_mode?.enabled), maintenanceMessage: map.maintenance_mode?.message || '', launchDate: map.launch_date || '2026-09-01' });
}

module.exports = async function handler(req, res) {
  try {
    await ensureSchema();
    const method = getMethod(req);
    const path = getPath(req);

    if (method === 'POST' && path === '/submit') return handleSubmit(req, res);
    if (method === 'POST' && path === '/public/waitlist') return handleSubmit(req, res);
    if (method === 'POST' && path === '/public/contact') return handleSubmit(req, res);
    if (method === 'GET' && path === '/public/cms') return handleCmsGet(req, res, true);
    if (method === 'GET' && path === '/public/settings') return handlePublicSettings(req, res);

    if (method === 'POST' && path === '/admin/login') return handleLogin(req, res);
    if (method === 'GET' && path === '/admin/leads') return handleLeads(req, res);
    if (method === 'GET' && path === '/admin/analytics') return handleAnalytics(req, res);
    if (method === 'GET' && path === '/admin/settings') return handleSettingsGet(req, res);
    if (method === 'POST' && path === '/admin/settings') return handleSettingsPost(req, res);
    if (method === 'GET' && path === '/admin/cms') return handleCmsGet(req, res, false);
    if (method === 'POST' && path === '/admin/cms') return handleCmsPost(req, res);
    if (method === 'GET' && path === '/admin/admins') return handleAdminsGet(req, res);
    if (method === 'POST' && path === '/admin/admins') return handleAdminsPost(req, res);
    if (method === 'DELETE' && path.startsWith('/admin/admins/')) return handleAdminDelete(req, res, path.split('/').pop());
    if (method === 'POST' && path === '/admin/lead-update') return handleLeadUpdate(req, res);
    if (method === 'GET' && path === '/admin/export') return handleExport(req, res);
    if (method === 'POST' && path === '/admin/bulk-email') return handleBulkEmail(req, res);
    if (method === 'GET' && path === '/admin/activity') return handleActivity(req, res);
    if (method === 'GET' && path === '/admin/templates') return handleTemplatesGet(req, res);
    if (method === 'POST' && path === '/admin/templates') return handleTemplatesPost(req, res);
    if (method === 'DELETE' && path.startsWith('/admin/templates/')) return handleTemplateDelete(req, res, path.split('/').pop());
    if (method === 'GET' && path === '/admin/email-logs') return handleEmailLogs(req, res);
    if (method === 'GET' && path.startsWith('/admin/lead-notes/')) return handleLeadNotesGet(req, res, path.split('/').pop());
    if (method === 'POST' && path === '/admin/lead-note') return handleLeadNotePost(req, res);

    return json(res, 404, { ok: false, error: `API route not found: ${method} ${path}` });
  } catch (error) {
    console.error('Athoo API fatal error:', error);
    return json(res, 500, { ok: false, error: error?.message || 'Internal server error' });
  }
};
