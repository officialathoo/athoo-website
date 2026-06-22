import { Router } from "express";
import { db, pool } from "@workspace/db";
import { leads, emailLogs } from "@workspace/db";
import { sendMail, ADMIN_EMAIL, adminLeadNotificationHtml, userConfirmationHtml } from "../lib/mailer.js";

const router = Router();

async function ensureLeadTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id serial PRIMARY KEY,
      form_type varchar(100) NOT NULL,
      name text,
      email text,
      phone varchar(50),
      subject text,
      message text,
      service text,
      city text,
      experience text,
      source text,
      status varchar(50) NOT NULL DEFAULT 'new',
      priority varchar(50) DEFAULT 'normal',
      assigned_to text,
      admin_notes text,
      last_contacted_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS email_logs (
      id serial PRIMARY KEY,
      recipient text NOT NULL,
      subject text NOT NULL,
      status varchar(50) NOT NULL DEFAULT 'sent',
      sent_by text,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
}

router.post("/submit", async (req, res) => {
  try {
    await ensureLeadTables();
    const { formType, name, email, phone, subject, message, service, city, experience, source } = req.body as Record<string, string>;
    if (!formType) {
      res.status(400).json({ error: "formType is required" });
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ error: "Please enter a valid email address" });
      return;
    }

    await db.insert(leads).values({
      form_type: formType,
      name: name || null,
      email: email || null,
      phone: phone || null,
      subject: subject || null,
      message: message || null,
      service: service || null,
      city: city || null,
      experience: experience || null,
      source: source || null,
      status: "new",
    });

    let emailStatus = "skipped";
    try {
      const adminResult = await sendMail({
        to: ADMIN_EMAIL,
        subject: `[Athoo] New ${formType} — ${name || email || phone || "Anonymous"}`,
        html: adminLeadNotificationHtml({ formType, name, email, phone, service, city, message }),
      });
      emailStatus = adminResult.status;
      await db.insert(emailLogs).values({ recipient: ADMIN_EMAIL, subject: `[Athoo] New ${formType}`, status: adminResult.ok ? "sent" : adminResult.status, sent_by: "system" });
    } catch (mailLogErr) {
      req.log.warn({ err: mailLogErr }, "admin email/log failed after lead saved");
      emailStatus = "failed";
    }

    if (email) {
      try {
        const userResult = await sendMail({ to: email, subject: "You're on Athoo's list!", html: userConfirmationHtml(name) });
        await db.insert(emailLogs).values({ recipient: email, subject: "You're on Athoo's list!", status: userResult.ok ? "sent" : userResult.status, sent_by: "system" });
      } catch (mailLogErr) {
        req.log.warn({ err: mailLogErr }, "user confirmation/log failed after lead saved");
      }
    }

    res.json({ ok: true, message: "Thank you! Your submission has been received.", emailStatus });
  } catch (err) {
    req.log.error({ err }, "submit error");
    res.status(500).json({ error: "Could not save submission. Please try again or contact Athoo on WhatsApp." });
  }
});

export default router;
