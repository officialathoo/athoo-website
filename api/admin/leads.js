import { ensureSchema, json, method, requireAdmin, sanitize, sql } from '../_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const search = sanitize(url.searchParams.get('search'), 120);
    const status = sanitize(url.searchParams.get('status'), 40);
    const formType = sanitize(url.searchParams.get('formType'), 80);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100);
    const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0);
    const db = sql();
    await ensureSchema(db);
    const rows = await db`
      SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source, status, created_at
      FROM website_leads
      WHERE (${search} = '' OR name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`} OR phone ILIKE ${`%${search}%`} OR message ILIKE ${`%${search}%`} OR service ILIKE ${`%${search}%`} OR city ILIKE ${`%${search}%`})
        AND (${status} = '' OR status = ${status})
        AND (${formType} = '' OR form_type = ${formType})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}`;
    const counts = await db`SELECT status, count(*)::int AS count FROM website_leads GROUP BY status`;
    return json(res, 200, { ok: true, rows, counts });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: 'Could not load leads' });
  }
}
