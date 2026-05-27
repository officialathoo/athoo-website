import crypto from 'node:crypto';
import { json, method, rateLimit, readJson, signToken } from '../_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!rateLimit(req, 'admin-login')) return json(res, 429, { ok: false, error: 'Too many login attempts' });
  try {
    const body = await readJson(req);
    const configured = process.env.ADMIN_PASSWORD;
    if (!configured) return json(res, 500, { ok: false, error: 'ADMIN_PASSWORD is not configured' });
    const submitted = String(body.password || '');
    const ok = submitted.length === configured.length && crypto.timingSafeEqual(Buffer.from(submitted), Buffer.from(configured));
    if (!ok) return json(res, 401, { ok: false, error: 'Invalid password' });
    return json(res, 200, { ok: true, token: signToken({ role: 'admin' }) });
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid request' });
  }
}
