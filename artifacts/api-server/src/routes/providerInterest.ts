import { Router } from "express";
import { db, providerInterestsTable } from "@workspace/db";
import { SubmitProviderInterestBody } from "@workspace/api-zod";
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

router.post("/provider-interest", async (req, res) => {
  const meta = getRequestMeta(req);
  if (!checkRateLimit(meta.ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const parsed = SubmitProviderInterestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Please check your provider details." });
    return;
  }

  let savedToDb = false;
  try {
    await db.insert(providerInterestsTable).values({
      name: parsed.data.name.trim(),
      phone: parsed.data.phone.trim(),
      email: parsed.data.email?.trim() || null,
      service: parsed.data.service.trim(),
      city: parsed.data.city?.trim() || null,
      experience: parsed.data.experience?.trim() || null,
    });
    savedToDb = true;
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      res.status(409).json({ error: "This phone number is already on the provider waitlist." });
      return;
    }
    req.log.warn({ err }, "Database unavailable; continuing with email/fallback storage");
  }

  const notification = await notifyAthoo({ type: "Provider Interest", data: { ...parsed.data, sourcePage: "Provider Waitlist Form", savedToDb }, ...meta });
  req.log.info({ notification }, "Provider interest submission processed");
  res.status(201).json({ success: true, message: "Thank you. Your provider waitlist request has been received." });
});

export default router;
