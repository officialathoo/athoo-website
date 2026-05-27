import { ensureSchema, json, method, requireAdmin, sanitize, sql } from '../_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  const admin = requireAdmin(req, res, 'view_leads');
  if (!admin) return;
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const search = sanitize(url.searchParams.get('search'), 120);
    const status = sanitize(url.searchParams.get('status'), 40);
    const formType = sanitize(url.searchParams.get('formType'), 80);
    const city = sanitize(url.searchParams.get('city'), 80);
    const assignedTo = sanitize(url.searchParams.get('assignedTo'), 255);
    const priority = sanitize(url.searchParams.get('priority'), 40);
    const dateFrom = sanitize(url.searchParams.get('dateFrom'), 30);
    const dateTo = sanitize(url.searchParams.get('dateTo'), 30);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 250);
    const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0);
    const db = sql();
    await ensureSchema(db);
    const rows = await db`
      SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source, status, priority, assigned_to, admin_notes, last_contacted_at, created_at, updated_at
      FROM website_leads
      WHERE (${search} = '' OR name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`} OR phone ILIKE ${`%${search}%`} OR message ILIKE ${`%${search}%`} OR service ILIKE ${`%${search}%`} OR city ILIKE ${`%${search}%`})
        AND (${status} = '' OR status = ${status})
        AND (${formType} = '' OR form_type = ${formType})
        AND (${city} = '' OR city ILIKE ${`%${city}%`})
        AND (${assignedTo} = '' OR assigned_to = ${assignedTo})
        AND (${priority} = '' OR priority = ${priority})
        AND (${dateFrom} = '' OR created_at >= ${dateFrom || '1970-01-01'}::timestamptz)
        AND (${dateTo} = '' OR created_at < (${dateTo || '2999-01-01'}::date + INTERVAL '1 day'))
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}`;
    const counts = await db`SELECT status, count(*)::int AS count FROM website_leads GROUP BY status`;
    const stats = await db`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS today,
        count(*) FILTER (WHERE form_type = 'Provider Waitlist')::int AS providers,
        count(*) FILTER (WHERE form_type = 'Waitlist Signup')::int AS waitlist,
        count(*) FILTER (WHERE form_type = 'Contact Form')::int AS contacts,
        count(*) FILTER (WHERE status = 'new')::int AS new_leads
      FROM website_leads`;
    const admins = await db`SELECT name, email, role, is_active FROM admin_users WHERE is_active = true ORDER BY role, name`;
    return json(res, 200, { ok: true, rows, counts, stats: stats[0], admins });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: 'Could not load leads' });
  }
}
