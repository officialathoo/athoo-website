import { Router } from "express";
import { db, waitlistTable } from "@workspace/db";
import { JoinWaitlistBody } from "@workspace/api-zod";
import { count } from "drizzle-orm";
import { getRequestMeta, notifyAthoo } from "../lib/submissions";

const router = Router();
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

router.post("/waitlist", async (req, res) => {
  const meta = getRequestMeta(req);
  if (!checkRateLimit(meta.ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Please enter valid waitlist details." });
    return;
  }

  let savedToDb = false;
  try {
    await db.insert(waitlistTable).values({
      email: parsed.data.email.trim(),
      name: parsed.data.name?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      city: parsed.data.city?.trim() || null,
    });
    savedToDb = true;
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      res.status(409).json({ error: "This email is already on the waitlist." });
      return;
    }
    req.log.warn({ err }, "Database unavailable; continuing with email/fallback storage");
  }

  const notification = await notifyAthoo({ type: "Waitlist", data: { ...parsed.data, sourcePage: "Waitlist Form", savedToDb }, ...meta });
  req.log.info({ notification }, "Waitlist submission processed");
  res.status(201).json({ success: true, message: "Thank you. You are on the Athoo launch waitlist." });
});

router.get("/waitlist", async (_req, res) => {
  try {
    const [result] = await db.select({ count: count() }).from(waitlistTable);
    res.json({ count: result?.count ?? 0 });
  } catch {
    res.json({ count: 0 });
  }
});

export default router;
