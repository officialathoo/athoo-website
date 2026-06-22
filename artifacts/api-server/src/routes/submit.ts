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

router.post("/submit", async (req, res) => {
  try {
    const {
      formType, name, email, phone, subject, message,
      service, city, experience, source,
    } = req.body as Record<string, string>;

    if (!formType) {
      res.status(400).json({ error: "formType is required" });
      return;
    }

    await db.insert(leads).values({
      form_type:  formType,
      name:       name    || null,
      email:      email   || null,
      phone:      phone   || null,
      subject:    subject || null,
      message:    message || null,
      service:    service || null,
      city:       city    || null,
      experience: experience || null,
      source:     source  || null,
      status:     "new",
    });

    // ── Admin notification ────────────────────────────────────────────────
    const adminResult = await sendMail({
      to:      ADMIN_EMAIL,
      subject: `[Athoo] New ${formType} — ${name || email || phone || "Anonymous"}`,
      html:    adminLeadNotificationHtml({ formType, name, email, phone, service, city, message }),
    });

    await db.insert(emailLogs).values({
      recipient: ADMIN_EMAIL,
      subject:   `[Athoo] New ${formType}`,
      status:    adminResult.ok ? "sent" : adminResult.status,
      sent_by:   "system",
    });

    // ── User confirmation (only if they provided an email) ────────────────
    if (email) {
      const userResult = await sendMail({
        to:      email,
        subject: "You're on Athoo's list! 🎉",
        html:    userConfirmationHtml(name),
      });

      await db.insert(emailLogs).values({
        recipient: email,
        subject:   "You're on Athoo's list!",
        status:    userResult.ok ? "sent" : userResult.status,
        sent_by:   "system",
      });
    }

    res.json({
      ok:          true,
      message:     "Thank you! We'll be in touch soon.",
      emailStatus: adminResult.status,
    });
  } catch (err) {
    req.log.error({ err }, "submit error");
    res.status(500).json({ error: "Could not save submission" });
  }
});

export default router;
