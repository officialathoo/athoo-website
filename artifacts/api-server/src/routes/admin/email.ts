import { Router } from "express";
import { db, emailTemplates, emailLogs, leads } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { sendMail } from "../../lib/mailer.js";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// ── Email Templates ───────────────────────────────────────────────────────

// GET /api/admin/templates
router.get("/templates", async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(emailTemplates).orderBy(sql`${emailTemplates.created_at} DESC`);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "get templates error");
    res.status(500).json({ error: "Could not load templates" });
  }
});

// POST /api/admin/templates
router.post("/templates", async (req: AuthRequest, res) => {
  try {
    const { name, subject, body, category } = req.body as Record<string, string>;
    if (!name || !subject || !body) {
      res.status(400).json({ error: "name, subject and body are required" });
      return;
    }
    const [row] = await db.insert(emailTemplates).values({
      name, subject, body, category: category ?? "general",
    }).returning();
    res.json({ ok: true, id: row.id });
  } catch (err) {
    req.log.error({ err }, "create template error");
    res.status(500).json({ error: "Could not create template" });
  }
});

// PATCH /api/admin/templates/:id
router.patch("/templates/:id", async (req: AuthRequest, res) => {
  try {
    const id   = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = { updated_at: new Date() };
    for (const col of ["name", "subject", "body", "category"]) {
      if (col in body) patch[col] = body[col];
    }
    await db.update(emailTemplates).set(patch as any).where(eq(emailTemplates.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "update template error");
    res.status(500).json({ error: "Could not update template" });
  }
});

// DELETE /api/admin/templates/:id
router.delete("/templates/:id", async (req: AuthRequest, res) => {
  try {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "delete template error");
    res.status(500).json({ error: "Could not delete template" });
  }
});

// ── Bulk Email ────────────────────────────────────────────────────────────

// POST /api/admin/bulk-email
router.post("/bulk-email", async (req: AuthRequest, res) => {
  try {
    const { ids, subject, message } = req.body as { ids?: number[]; subject?: string; message?: string };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "ids array is required" });
      return;
    }
    if (!subject || !message) {
      res.status(400).json({ error: "subject and message are required" });
      return;
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const id of ids) {
      const [lead] = await db.select({ email: leads.email, name: leads.name }).from(leads).where(eq(leads.id, id)).limit(1);
      if (!lead?.email) { skipped++; continue; }

      const personalised = message
        .replace(/\{\{name\}\}/gi, lead.name ?? "Friend")
        .replace(/\{\{email\}\}/gi, lead.email);

      const result = await sendMail({
        to:      lead.email,
        subject,
        html:    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${personalised.replace(/\n/g, "<br>")}</div>`,
      });

      try {
        await db.insert(emailLogs).values({
          recipient: lead.email,
          subject,
          status:    result.ok ? "sent" : result.status,
          sent_by:   req.adminEmail ?? "system",
        });
      } catch { /* log failure is non-fatal */ }

      if (result.ok) sent++;
      else if (result.status === "smtp_not_configured") skipped++;
      else failed++;
    }

    res.json({ ok: true, sent, failed, skipped });
  } catch (err) {
    req.log.error({ err }, "bulk-email error");
    res.status(500).json({ error: "Could not send emails" });
  }
});

// GET /api/admin/email-logs
router.get("/email-logs", async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const rows  = await db.select().from(emailLogs).orderBy(desc(emailLogs.created_at)).limit(limit);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "email logs error");
    res.status(500).json({ error: "Could not load email logs" });
  }
});

export default router;
