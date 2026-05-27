import { ensureSchema, json, logActivity, method, readJson, requireAdmin, sanitize, sql } from '../_lib.js';
export default async function handler(req, res) {
  const db = sql();
  await ensureSchema(db);
  if (req.method === 'GET') {
    const admin = requireAdmin(req, res, 'view_leads');
    if (!admin) return;
    const rows = await db`SELECT key, value, updated_at FROM app_settings ORDER BY key`;
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return json(res, 200, { ok: true, settings });
  }
  if (req.method === 'POST') {
    const admin = requireAdmin(req, res, 'manage_settings');
    if (!admin) return;
    const body = await readJson(req);
    const maintenance = { enabled: Boolean(body.maintenanceEnabled), message: sanitize(body.maintenanceMessage, 500) || 'Athoo website is under maintenance. Please check back soon.' };
    const supportEmail = sanitize(body.supportEmail, 255) || process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com';
    const supportPhone = sanitize(body.supportPhone, 50) || '+92 339 0051068';
    await db`INSERT INTO app_settings (key, value, updated_at) VALUES ('maintenance_mode', ${JSON.stringify(maintenance)}, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`;
    await db`INSERT INTO app_settings (key, value, updated_at) VALUES ('support_email', ${JSON.stringify(supportEmail)}, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`;
    await db`INSERT INTO app_settings (key, value, updated_at) VALUES ('support_phone', ${JSON.stringify(supportPhone)}, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`;
    await logActivity(db, req, admin, 'settings_update', 'app_settings', 'global', { maintenance });
    return json(res, 200, { ok: true });
  }
  return method(req, res, ['GET', 'POST']);
}
