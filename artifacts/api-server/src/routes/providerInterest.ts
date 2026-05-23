import { Router } from "express";
import { db, providerInterestsTable } from "@workspace/db";
import { SubmitProviderInterestBody } from "@workspace/api-zod";

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
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const parsed = SubmitProviderInterestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Please check your details." });
    return;
  }

  try {
    await db.insert(providerInterestsTable).values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email ?? null,
      service: parsed.data.service,
      city: parsed.data.city ?? null,
      experience: parsed.data.experience ?? null,
    });
    res.status(201).json({ success: true, message: "Thank you for your interest! We will reach out to you soon." });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      res.status(409).json({ error: "This phone number is already registered as a provider interest." });
      return;
    }
    req.log.error({ err }, "Failed to save provider interest");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
