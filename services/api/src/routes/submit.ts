import { Router } from "express";
import { db } from "@workspace/db";
import { leads, emailLogs } from "@workspace/db";
import {
  sendMail,
  ADMIN_EMAIL,
  adminLeadNotificationHtml,
  userConfirmationHtml,
  type MailStatus,
} from "../lib/mailer.js";

const router = Router();

const ALLOWED_FORMS = new Set([
  "Contact Form",
  "Waitlist Signup",
  "Provider Waitlist",
]);

function sanitize(value: unknown, max = 2500): string {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}

async function logEmail(recipient: string, subject: string, status: string, sentBy = "system") {
  try {
    await db.insert(emailLogs).values({ recipient, subject, status, sent_by: sentBy });
  } catch {
    // Email log failure must never make a saved lead look failed to the user.
  }
}

router.post("/submit", async (req, res) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const formType = sanitize(body.formType, 100);
    const name = sanitize(body.name, 120);
    const email = sanitize(body.email, 255).toLowerCase();
    const phone = sanitize(body.phone, 50);
    const subject = sanitize(body.subject, 200);
    const message = sanitize(body.message, 2500);
    const service = sanitize(body.service, 120);
    const city = sanitize(body.city, 120);
    const experience = sanitize(body.experience, 1000);
    const source = sanitize(body.source || req.headers.referer || "website", 500);

    const errors: string[] = [];
    if (!ALLOWED_FORMS.has(formType)) errors.push("Invalid form type");
    if (email && !isEmail(email)) errors.push("Invalid email address");
    if (formType === "Waitlist Signup" && !email) errors.push("Email is required");
    if (formType === "Contact Form") {
      if (name.length < 2) errors.push("Name is required");
      if (!email) errors.push("Email is required");
      if (message.length < 10) errors.push("Message is required");
    }
    if (formType === "Provider Waitlist") {
      if (name.length < 2) errors.push("Name is required");
      if (!phone || phone.length < 10) errors.push("Phone is required");
      if (!service) errors.push("Service is required");
      if (!city) errors.push("City is required");
    }

    if (errors.length) {
      res.status(400).json({ ok: false, error: errors.join(", "), errors });
      return;
    }

    const [lead] = await db
      .insert(leads)
      .values({
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
        priority: "normal",
      })
      .returning({ id: leads.id });

    let emailStatus: MailStatus | "skipped" = "skipped";
    let userEmailStatus: MailStatus | "skipped" = "skipped";

    const adminSubject = `[Athoo] New ${formType} — ${name || email || phone || "Anonymous"}`;
    const adminResult = await sendMail({
      to: ADMIN_EMAIL,
      subject: adminSubject,
      html: adminLeadNotificationHtml({ formType, name, email, phone, service, city, message }),
    });
    emailStatus = adminResult.status;
    await logEmail(ADMIN_EMAIL, adminSubject, adminResult.ok ? "sent" : adminResult.status);

    if (email) {
      const userSubject = "You're on Athoo's list!";
      const userResult = await sendMail({
        to: email,
        subject: userSubject,
        html: userConfirmationHtml(name),
      });
      userEmailStatus = userResult.status;
      await logEmail(email, userSubject, userResult.ok ? "sent" : userResult.status);
    }

    res.json({
      ok: true,
      id: lead?.id,
      message: "Thank you! Your submission has been received.",
      emailStatus,
      userEmailStatus,
    });
  } catch (err) {
    req.log.error({ err }, "submit error");
    res.status(500).json({ ok: false, error: "Could not save submission" });
  }
});

export default router;
