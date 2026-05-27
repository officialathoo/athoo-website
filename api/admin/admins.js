import { ensureSchema, hashPassword, json, logActivity, method, readJson, requireAdmin, sanitize, sql } from '../_lib.js';

const rolePermissions = {
  super_admin: { all: true },
  admin: { view_leads: true, manage_leads: true, export_leads: true, send_email: true, manage_settings: true },
  manager: { view_leads: true, manage_leads: true, export_leads: true, send_email: true },
  custom: {},
};

export default async function handler(req, res) {
  const db = sql();
  await ensureSchema(db);
  if (req.method === 'GET') {
    const admin = requireAdmin(req, res, 'manage_settings');
    if (!admin) return;
    const rows = await db`SELECT id, name, email, role, permissions, is_active, last_login_at, created_at FROM admin_users ORDER BY id DESC`;
    return json(res, 200, { ok: true, rows });
  }
  if (req.method === 'POST') {
    const admin = requireAdmin(req, res, 'manage_settings');
    if (!admin) return;
    try {
      const body = await readJson(req);
      const name = sanitize(body.name, 120);
      const email = sanitize(body.email, 255).toLowerCase();
      const role = sanitize(body.role, 50) || 'manager';
      const password = String(body.password || '');
      const isActive = body.isActive !== false;
      if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: 'Valid name and email are required' });
      const permissions = role === 'custom' ? (body.permissions || {}) : (rolePermissions[role] || rolePermissions.manager);
      if (body.id) {
        const id = Number(body.id);
        if (password) {
          await db`UPDATE admin_users SET name=${name}, email=${email}, role=${role}, permissions=${JSON.stringify(permissions)}, password_hash=${hashPassword(password)}, is_active=${isActive} WHERE id=${id}`;
        } else {
          await db`UPDATE admin_users SET name=${name}, email=${email}, role=${role}, permissions=${JSON.stringify(permissions)}, is_active=${isActive} WHERE id=${id}`;
        }
        await logActivity(db, req, admin, 'admin_user_update', 'admin_user', id, { email, role });
      } else {
        if (!password || password.length < 8) return json(res, 400, { ok: false, error: 'Password must be at least 8 characters' });
        await db`INSERT INTO admin_users (name, email, role, permissions, password_hash, is_active) VALUES (${name}, ${email}, ${role}, ${JSON.stringify(permissions)}, ${hashPassword(password)}, ${isActive})`;
        await logActivity(db, req, admin, 'admin_user_create', 'admin_user', email, { role });
      }
      return json(res, 200, { ok: true });
    } catch (error) {
      console.error(error);
      return json(res, 500, { ok: false, error: 'Could not save admin user' });
    }
  }
  return method(req, res, ['GET', 'POST']);
}
