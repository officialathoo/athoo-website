import { Router } from "express";
import { db, waitlistTable } from "@workspace/db";
import { JoinWaitlistBody } from "@workspace/api-zod";
import { count } from "drizzle-orm";

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
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Please enter a valid email." });
    return;
  }

  try {
    await db.insert(waitlistTable).values({
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      phone: parsed.data.phone ?? null,
      city: parsed.data.city ?? null,
    });
    res.status(201).json({ success: true, message: "You are on the list! We will notify you when Athoo launches." });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      res.status(409).json({ error: "This email is already on the waitlist!" });
      return;
    }
    req.log.error({ err }, "Failed to add to waitlist");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.get("/waitlist", async (req, res) => {
  try {
    const [result] = await db.select({ count: count() }).from(waitlistTable);
    res.json({ count: result?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to get waitlist count");
    res.json({ count: 0 });
  }
});

export default router;
