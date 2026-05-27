import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';

const MAX_BODY_BYTES = 100_000;
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await db`CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status)`;
  await db`CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type)`;
}

function secret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'change-this-secret';
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
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (!payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

export function requireAdmin(req, res) {
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const payload = verifyToken(token);
  if (!payload) {
    json(res, 401, { ok: false, error: 'Unauthorized' });
    return null;
  }
  return payload;
}
