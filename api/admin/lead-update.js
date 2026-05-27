import { ensureSchema, json, logActivity, method, readJson, requireAdmin, sanitize, sql } from '../_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  const admin = requireAdmin(req, res, 'manage_leads');
  if (!admin) return;
  try {
    const body = await readJson(req);
    const ids = Array.isArray(body.ids) ? body.ids.map((x) => Number(x)).filter(Boolean) : [Number(body.id)].filter(Boolean);
    if (!ids.length) return json(res, 400, { ok: false, error: 'No lead selected' });
    const status = sanitize(body.status, 40);
    const priority = sanitize(body.priority, 40);
    const assignedTo = sanitize(body.assignedTo, 255);
    const adminNotes = sanitize(body.adminNotes, 2500);
    const db = sql();
    await ensureSchema(db);
    if (status) await db`UPDATE website_leads SET status = ${status}, updated_at = NOW() WHERE id = ANY(${ids})`;
    if (priority) await db`UPDATE website_leads SET priority = ${priority}, updated_at = NOW() WHERE id = ANY(${ids})`;
    if (assignedTo || body.assignedTo === '') await db`UPDATE website_leads SET assigned_to = ${assignedTo || null}, updated_at = NOW() WHERE id = ANY(${ids})`;
    if (adminNotes || body.adminNotes === '') await db`UPDATE website_leads SET admin_notes = ${adminNotes || null}, updated_at = NOW() WHERE id = ANY(${ids})`;
    await logActivity(db, req, admin, 'lead_update', 'website_leads', ids.join(','), { status, priority, assignedTo, count: ids.length });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: 'Could not update lead' });
  }
}
