import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';

const MAX_BODY_BYTES = 200_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE || 10);
const buckets = new Map();

export function json(res, status, data, extraHeaders = {}) {
  res.statusCode = status;
  Object.entries({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  }).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(data));
}

export function method(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return false;
  }
  return true;
}

export async function readJson(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error('Payload too large');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(raw);
}

export function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

export function rateLimit(req, keyPrefix = 'global') {
  const key = `${keyPrefix}:${getIp(req)}`;
  const now = Date.now();
  const current = buckets.get(key) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + RATE_WINDOW_MS;
  }
  current.count += 1;
  buckets.set(key, current);
  return current.count <= RATE_LIMIT;
}

export function sanitize(value, max = 2000) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function sql() {
  return neon(requireEnv('DATABASE_URL'));
}

export async function ensureSchema(db) {
  await db`
    CREATE TABLE IF NOT EXISTS website_leads (
      id BIGSERIAL PRIMARY KEY,
      form_type TEXT NOT NULL,
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await db`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'`;
  await db`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT`;
  await db`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS admin_notes TEXT`;
  await db`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ`;
  await db`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
  await db`CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status)`;
  await db`CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type)`;
  await db`CREATE INDEX IF NOT EXISTS website_leads_email_idx ON website_leads (email)`;

  await db`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'manager',
      permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await db`
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id BIGSERIAL PRIMARY KEY,
      admin_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await db`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await db`
    CREATE TABLE IF NOT EXISTS email_logs (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

  await db`
    INSERT INTO app_settings (key, value)
    VALUES
      ('maintenance_mode', '{"enabled":false,"message":"Athoo website is under maintenance. Please check back soon."}'::jsonb),
      ('support_email', ${JSON.stringify(process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com')}::jsonb),
      ('support_phone', '"+92 339 0051068"'::jsonb)
    ON CONFLICT (key) DO NOTHING`;

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com';
  await db`
    INSERT INTO admin_users (name, email, role, permissions, is_active)
    VALUES ('Super Admin', ${adminEmail}, 'super_admin', '{"all":true}'::jsonb, true)
    ON CONFLICT (email) DO NOTHING`;
}

function secret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'change-this-secret';
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const check = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return hash.length === check.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}

export function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token) {
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

export function hasPermission(admin, permission) {
  if (!admin) return false;
  if (admin.role === 'super_admin') return true;
  if (admin.permissions?.all) return true;
  return Boolean(admin.permissions?.[permission]);
}

export function requireAdmin(req, res, permission = null) {
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const payload = verifyToken(token);
  if (!payload) {
    json(res, 401, { ok: false, error: 'Unauthorized' });
    return null;
  }
  if (permission && !hasPermission(payload, permission)) {
    json(res, 403, { ok: false, error: 'Permission denied' });
    return null;
  }
  return payload;
}

export async function logActivity(db, req, admin, action, targetType = null, targetId = null, details = {}) {
  try {
    await db`INSERT INTO admin_activity_logs (admin_email, action, target_type, target_id, details, ip_address)
      VALUES (${admin?.email || null}, ${action}, ${targetType}, ${targetId ? String(targetId) : null}, ${JSON.stringify(details)}, ${getIp(req)})`;
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
}
