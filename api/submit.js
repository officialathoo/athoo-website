import { Resend } from 'resend';
import { ensureSchema, getIp, json, method, rateLimit, readJson, sanitize, sql } from './_lib.js';

const ALLOWED_FORMS = new Set(['Contact Form', 'Waitlist Signup', 'Provider Waitlist']);

function validate(formType, payload) {
  const errors = [];
  const email = sanitize(payload.email, 255);
  const phone = sanitize(payload.phone, 30);
  const name = sanitize(payload.name, 120);
  const message = sanitize(payload.message, 2500);
  if (!ALLOWED_FORMS.has(formType)) errors.push('Invalid form type');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push('Invalid email');
  if (formType === 'Waitlist Signup' && !email) errors.push('Email is required');
  if (formType === 'Contact Form') {
    if (name.length < 2) errors.push('Name is required');
    if (!email) errors.push('Email is required');
    if (message.length < 10) errors.push('Message is required');
  }
  if (formType === 'Provider Waitlist') {
    if (name.length < 2) errors.push('Name is required');
    if (phone.length < 10) errors.push('Phone is required');
    if (!sanitize(payload.service, 100)) errors.push('Service is required');
    if (!sanitize(payload.city, 100)) errors.push('City is required');
  }
  return errors;
}

async function sendEmail(lead) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.LEAD_NOTIFY_TO || 'official.athoo@gmail.com';
  const from = process.env.LEAD_EMAIL_FROM || 'Athoo Website <onboarding@resend.dev>';
  const lines = Object.entries(lead.payload).map(([k, v]) => `<tr><td style="padding:6px;border:1px solid #ddd"><b>${k}</b></td><td style="padding:6px;border:1px solid #ddd">${sanitize(v, 1000)}</td></tr>`).join('');
  await resend.emails.send({
    from,
    to,
    subject: `New Athoo ${lead.form_type}`,
    html: `<h2>New Athoo Website Lead</h2><p><b>Form:</b> ${lead.form_type}</p><p><b>Source:</b> ${lead.source || ''}</p><table style="border-collapse:collapse">${lines}</table>`,
  });
}

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!rateLimit(req, 'submit')) return json(res, 429, { ok: false, error: 'Too many requests. Please try again later.' });

  try {
    const body = await readJson(req);
    const formType = sanitize(body.formType, 80);
    const errors = validate(formType, body);
    if (errors.length) return json(res, 400, { ok: false, errors });

    const cleanPayload = Object.fromEntries(Object.entries(body).map(([k, v]) => [sanitize(k, 80), sanitize(v, 2500)]));
    const db = sql();
    await ensureSchema(db);
    const duplicate = await db`SELECT id FROM website_leads WHERE email = ${sanitize(body.email, 255) || ''} AND email <> '' LIMIT 1`;
    const rows = await db`
      INSERT INTO website_leads (
        form_type, name, email, phone, subject, message, service, city, experience,
        source, ip_address, user_agent, payload
      ) VALUES (
        ${formType}, ${sanitize(body.name, 120) || null}, ${sanitize(body.email, 255) || null},
        ${sanitize(body.phone, 30) || null}, ${sanitize(body.subject, 200) || null},
        ${sanitize(body.message, 2500) || null}, ${sanitize(body.service, 120) || null},
        ${sanitize(body.city, 120) || null}, ${sanitize(body.experience, 800) || null},
        ${sanitize(body.source, 500) || sanitize(req.headers.referer, 500) || null}, ${getIp(req)},
        ${sanitize(req.headers['user-agent'], 500) || null}, ${JSON.stringify(cleanPayload)}
      ) RETURNING id, form_type, source, payload, email, name`;

    if (duplicate.length) {
      await db`UPDATE website_leads SET admin_notes = COALESCE(admin_notes || '\n', '') || ${`Possible duplicate of lead #${duplicate[0].id}`}, updated_at = NOW() WHERE id = ${rows[0].id}`;
    }

    const lead = rows[0];
    sendEmail(lead).catch((err) => console.error('Email failed:', err.message));
    return json(res, 200, { ok: true, id: lead.id });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: 'Submission failed' });
  }
}
