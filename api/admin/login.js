import crypto from 'node:crypto';
import { ensureSchema, json, method, rateLimit, readJson, signToken, sql, verifyPassword, sanitize, logActivity } from '../_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!rateLimit(req, 'admin-login')) return json(res, 429, { ok: false, error: 'Too many login attempts' });
  try {
    const body = await readJson(req);
    const submittedPassword = String(body.password || '');
    const submittedEmail = sanitize(body.email, 255).toLowerCase();
    const db = sql();
    await ensureSchema(db);

    let admin = null;
    if (submittedEmail) {
      const rows = await db`SELECT id, name, email, role, permissions, password_hash, is_active FROM admin_users WHERE lower(email) = ${submittedEmail} LIMIT 1`;
      admin = rows[0] || null;
      if (!admin || !admin.is_active || !verifyPassword(submittedPassword, admin.password_hash)) {
        return json(res, 401, { ok: false, error: 'Invalid email or password' });
      }
    } else {
      const configured = process.env.ADMIN_PASSWORD;
      if (!configured) return json(res, 500, { ok: false, error: 'ADMIN_PASSWORD is not configured' });
      const ok = submittedPassword.length === configured.length && crypto.timingSafeEqual(Buffer.from(submittedPassword), Buffer.from(configured));
      if (!ok) return json(res, 401, { ok: false, error: 'Invalid password' });
      const rows = await db`SELECT id, name, email, role, permissions, is_active FROM admin_users WHERE role = 'super_admin' AND is_active = true ORDER BY id ASC LIMIT 1`;
      admin = rows[0] || { id: 0, name: 'Super Admin', email: process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com', role: 'super_admin', permissions: { all: true }, is_active: true };
    }

    await db`UPDATE admin_users SET last_login_at = NOW() WHERE email = ${admin.email}`;
    await logActivity(db, req, admin, 'admin_login', 'admin_user', admin.id, { role: admin.role });
    return json(res, 200, {
      ok: true,
      token: signToken({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions || { all: true } }),
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions || { all: true } },
    });
  } catch (error) {
    console.error(error);
    return json(res, 400, { ok: false, error: 'Invalid request' });
  }
}
