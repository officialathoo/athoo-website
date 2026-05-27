import { ensureSchema, method, requireAdmin, sql } from '../_lib.js';

function csvValue(value) {
  const s = String(value ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;
  const db = sql();
  await ensureSchema(db);
  const rows = await db`SELECT id, form_type, name, email, phone, subject, message, service, city, experience, source, status, created_at FROM website_leads ORDER BY created_at DESC LIMIT 5000`;
  const headers = ['id','form_type','name','email','phone','subject','message','service','city','experience','source','status','created_at'];
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => csvValue(r[h])).join(','))].join('\n');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="athoo-website-leads.csv"');
  res.end(csv);
}
