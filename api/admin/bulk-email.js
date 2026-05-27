import { Resend } from 'resend';
import { ensureSchema, json, logActivity, method, readJson, requireAdmin, sanitize, sql } from '../_lib.js';

function renderTemplate(body, lead) {
  return body
    .replaceAll('{{name}}', lead.name || 'there')
    .replaceAll('{{email}}', lead.email || '')
    .replaceAll('{{service}}', lead.service || '')
    .replaceAll('{{city}}', lead.city || '')
    .replaceAll('{{form_type}}', lead.form_type || '');
}

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  const admin = requireAdmin(req, res, 'send_email');
  if (!admin) return;
  try {
    const body = await readJson(req);
    const ids = Array.isArray(body.ids) ? body.ids.map((x) => Number(x)).filter(Boolean) : [];
    const subject = sanitize(body.subject, 200);
    const message = sanitize(body.message, 5000);
    if (!ids.length) return json(res, 400, { ok: false, error: 'Select at least one lead' });
    if (!subject || !message) return json(res, 400, { ok: false, error: 'Subject and message are required' });
    const db = sql();
    await ensureSchema(db);
    const leads = await db`SELECT id, name, email, form_type, service, city FROM website_leads WHERE id = ANY(${ids}) AND email IS NOT NULL AND email <> '' LIMIT 250`;
    if (!leads.length) return json(res, 400, { ok: false, error: 'Selected leads do not have email addresses' });
    const from = process.env.LEAD_EMAIL_FROM || 'Athoo Website <onboarding@resend.dev>';
    const hasResend = Boolean(process.env.RESEND_API_KEY);
    const resend = hasResend ? new Resend(process.env.RESEND_API_KEY) : null;
    let sent = 0;
    let skipped = 0;
    for (const lead of leads) {
      const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><p>${renderTemplate(message, lead).replace(/\n/g, '<br/>')}</p><hr/><p style="font-size:12px;color:#666">Athoo | official.athoo@gmail.com | +92 339 0051068</p></div>`;
      if (resend) {
        const response = await resend.emails.send({ from, to: lead.email, subject, html });
        await db`INSERT INTO email_logs (lead_id, recipient, subject, body, status, provider_response) VALUES (${lead.id}, ${lead.email}, ${subject}, ${message}, 'sent', ${JSON.stringify(response)})`;
        sent += 1;
      } else {
        await db`INSERT INTO email_logs (lead_id, recipient, subject, body, status, provider_response) VALUES (${lead.id}, ${lead.email}, ${subject}, ${message}, 'skipped_no_resend_key', '{}'::jsonb)`;
        skipped += 1;
      }
    }
    await db`UPDATE website_leads SET last_contacted_at = NOW(), status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END WHERE id = ANY(${leads.map((l) => l.id)})`;
    await logActivity(db, req, admin, 'bulk_email', 'website_leads', ids.join(','), { sent, skipped, subject });
    return json(res, 200, { ok: true, sent, skipped, note: hasResend ? 'Emails sent.' : 'No RESEND_API_KEY configured. Emails were logged but not sent.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: 'Could not send email' });
  }
}
