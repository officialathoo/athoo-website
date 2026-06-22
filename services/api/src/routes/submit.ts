import { Router } from "express";
import { db } from "@workspace/db";
import { leads, emailLogs } from "@workspace/db";
import {
  sendMail,
  ADMIN_EMAIL,
  adminLeadNotificationHtml,
  userConfirmationHtml,
} from "../lib/mailer.js";

const router = Router();

function clean(value: unknown, max = 2500) {
  return String(value ?? "").replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

async function safeLogEmail(input: { recipient: string; subject: string; status: string; sent_by?: string }) {
  try {
    await db.insert(emailLogs).values({
      recipient: input.recipient,
      subject: input.subject,
      status: input.status,
      sent_by: input.sent_by || "system",
    });
  } catch {
    // Email logging must never make a successful lead submission fail.
  }
}

router.post("/submit", async (req, res) => {
  try {
    const body = req.body as Record<string, string>;
    const formType = clean(body.formType, 80);
    const email = clean(body.email, 255).toLowerCase();
    const name = clean(body.name, 120);
    const phone = clean(body.phone, 40);
    const subject = clean(body.subject, 200);
    const message = clean(body.message, 2500);
    const service = clean(body.service, 140);
    const city = clean(body.city, 140);
    const experience = clean(body.experience, 800);
    const source = clean(body.source, 500) || "website";

    if (!formType) {
      res.status(400).json({ ok: false, error: "formType is required" });
      return;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ ok: false, error: "Invalid email address" });
      return;
    }

    const inserted = await db.insert(leads).values({
      form_type: formType,
      name: name || null,
      email: email || null,
      phone: phone || null,
      subject: subject || null,
      message: message || null,
      service: service || null,
      city: city || null,
      experience: experience || null,
      source,
      status: "new",
    }).returning({ id: leads.id });

    let adminStatus = "skipped";
    let userStatus = "skipped";

    try {
      const adminResult = await sendMail({
        to: ADMIN_EMAIL,
        subject: `[Athoo] New ${formType} — ${name || email || phone || "Anonymous"}`,
        html: adminLeadNotificationHtml({ formType, name, email, phone, service, city, message }),
      });
      adminStatus = adminResult.ok ? "sent" : adminResult.status;
      await safeLogEmail({ recipient: ADMIN_EMAIL, subject: `[Athoo] New ${formType}`, status: adminStatus });
    } catch (mailErr) {
      req.log.warn({ err: mailErr }, "admin lead email failed");
      adminStatus = "failed";
    }

    if (email) {
      try {
        const userResult = await sendMail({
          to: email,
          subject: "You're on Athoo's list!",
          html: userConfirmationHtml(name),
        });
        userStatus = userResult.ok ? "sent" : userResult.status;
        await safeLogEmail({ recipient: email, subject: "You're on Athoo's list!", status: userStatus });
      } catch (mailErr) {
        req.log.warn({ err: mailErr }, "user confirmation email failed");
        userStatus = "failed";
      }
    }

    res.json({
      ok: true,
      id: inserted[0]?.id,
      message: "Thank you! Your request has been received.",
      emailStatus: adminStatus,
      adminEmailStatus: adminStatus,
      userEmailStatus: userStatus,
    });
  } catch (err) {
    req.log.error({ err }, "submit error");
    res.status(500).json({ ok: false, error: "Could not save submission. Please try again or contact Athoo support." });
  }
});

export default router;
