import { Router } from "express";
import { db, contactsTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";
import { getRequestMeta, notifyAthoo } from "../lib/submissions";

const router = Router();
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

router.post("/contact", async (req, res) => {
  const meta = getRequestMeta(req);
  if (!checkRateLimit(meta.ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Please check your fields." });
    return;
  }

  let savedToDb = false;
  try {
    await db.insert(contactsTable).values({
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim(),
      phone: parsed.data.phone?.trim() || null,
      subject: parsed.data.subject?.trim() || null,
      message: parsed.data.message.trim(),
    });
    savedToDb = true;
  } catch (err) {
    req.log.warn({ err }, "Database unavailable; continuing with email/fallback storage");
  }

  const notification = await notifyAthoo({ type: "Contact", data: { ...parsed.data, sourcePage: "Contact Form", savedToDb }, ...meta });
  req.log.info({ notification }, "Contact submission processed");
  res.status(201).json({ success: true, message: "Thank you. Your request has been received. Athoo team will contact you soon." });
});

export default router;
