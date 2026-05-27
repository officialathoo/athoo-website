import { ensureSchema, json, method, requireAdmin, sql } from '../_lib.js';
export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  const admin = requireAdmin(req, res, 'manage_settings');
  if (!admin) return;
  const db = sql();
  await ensureSchema(db);
  const rows = await db`SELECT admin_email, action, target_type, target_id, details, ip_address, created_at FROM admin_activity_logs ORDER BY created_at DESC LIMIT 100`;
  return json(res, 200, { ok: true, rows });
}
