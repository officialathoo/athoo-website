import { ensureSchema, method, requireAdmin, sanitize, sql } from '../_lib.js';
function csvValue(value) { const s = String(value ?? ''); return `"${s.replace(/"/g, '""')}"`; }
export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  const admin = requireAdmin(req, res, 'export_leads');
  if (!admin) return;
  const url = new URL(req.url, `https://${req.headers.host}`);
  const search = sanitize(url.searchParams.get('search'), 120);
  const status = sanitize(url.searchParams.get('status'), 40);
  const formType = sanitize(url.searchParams.get('formType'), 80);
  const dateFrom = sanitize(url.searchParams.get('dateFrom'), 30);
  const dateTo = sanitize(url.searchParams.get('dateTo'), 30);
  const db = sql();
  await ensureSchema(db);
  const rows = await db`
    SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source, status, priority, assigned_to, admin_notes, last_contacted_at, created_at
    FROM website_leads
    WHERE (${search} = '' OR name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`} OR phone ILIKE ${`%${search}%`} OR message ILIKE ${`%${search}%`} OR service ILIKE ${`%${search}%`} OR city ILIKE ${`%${search}%`})
      AND (${status} = '' OR status = ${status})
      AND (${formType} = '' OR form_type = ${formType})
      AND (${dateFrom} = '' OR created_at >= ${dateFrom || '1970-01-01'}::timestamptz)
      AND (${dateTo} = '' OR created_at < (${dateTo || '2999-01-01'}::date + INTERVAL '1 day'))
    ORDER BY created_at DESC LIMIT 10000`;
  const headers = ['id','form_type','name','email','phone','subject','message','service','city','experience','source','status','priority','assigned_to','admin_notes','last_contacted_at','created_at'];
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => csvValue(r[h])).join(','))].join('\n');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="athoo-filtered-leads.csv"');
  res.end(csv);
}
