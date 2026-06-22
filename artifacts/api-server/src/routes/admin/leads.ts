import { Router } from "express";
import { db, leads, adminUsers } from "@workspace/db";
import { and, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

function buildWhere(q: Record<string, string>) {
  const conditions = [];
  if (q.search) {
    conditions.push(
      or(
        ilike(leads.name, `%${q.search}%`),
        ilike(leads.email, `%${q.search}%`),
        ilike(leads.phone, `%${q.search}%`),
      )!
    );
  }
  if (q.formType)   conditions.push(eq(leads.form_type, q.formType));
  if (q.status)     conditions.push(eq(leads.status, q.status));
  if (q.priority)   conditions.push(eq(leads.priority, q.priority));
  if (q.assignedTo) conditions.push(eq(leads.assigned_to, q.assignedTo));
  if (q.dateFrom)   conditions.push(gte(leads.created_at, new Date(q.dateFrom)));
  if (q.dateTo)     conditions.push(lte(leads.created_at, new Date(q.dateTo + "T23:59:59")));
  return conditions.length ? and(...conditions) : undefined;
}

// GET /api/admin/leads
router.get("/leads", async (req: AuthRequest, res) => {
  try {
    const q = req.query as Record<string, string>;
    const where = buildWhere(q);
    const rows = await db.select().from(leads).where(where).orderBy(sql`${leads.created_at} DESC`).limit(500);

    const [{ total }]    = await db.select({ total: sql<number>`count(*)::int` }).from(leads);
    const [{ today }]    = await db.select({ today: sql<number>`count(*)::int` }).from(leads)
      .where(gte(leads.created_at, new Date(new Date().toDateString())));
    const [{ providers }] = await db.select({ providers: sql<number>`count(*)::int` }).from(leads).where(eq(leads.form_type, "Provider Waitlist"));
    const [{ waitlist }]  = await db.select({ waitlist: sql<number>`count(*)::int` }).from(leads).where(eq(leads.form_type, "Waitlist Signup"));
    const [{ contacts }]  = await db.select({ contacts: sql<number>`count(*)::int` }).from(leads).where(eq(leads.form_type, "Contact Form"));
    const [{ new_leads }] = await db.select({ new_leads: sql<number>`count(*)::int` }).from(leads).where(eq(leads.status, "new"));

    const admins = await db.select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role }).from(adminUsers).where(eq(adminUsers.is_active, true));

    res.json({ rows, stats: { total, today, providers, waitlist, contacts, new_leads }, admins });
  } catch (err) {
    req.log.error({ err }, "leads error");
    res.status(500).json({ error: "Could not load leads" });
  }
});

// POST /api/admin/lead-update
router.post("/lead-update", async (req: AuthRequest, res) => {
  try {
    const { ids, status, priority, assigned_to, admin_notes } = req.body as Record<string, unknown>;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "ids array required" });
      return;
    }
    const patch: Record<string, unknown> = { updated_at: new Date() };
    if (status)      patch.status       = status;
    if (priority)    patch.priority     = priority;
    if (assigned_to) patch.assigned_to  = assigned_to;
    if (admin_notes) patch.admin_notes  = admin_notes;

    for (const id of ids as number[]) {
      await db.update(leads).set(patch as any).where(eq(leads.id, id));
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "lead-update error");
    res.status(500).json({ error: "Update failed" });
  }
});

// GET /api/admin/export
router.get("/export", async (req: AuthRequest, res) => {
  try {
    const q = req.query as Record<string, string>;
    const where = buildWhere(q);
    const rows = await db.select().from(leads).where(where).orderBy(sql`${leads.created_at} DESC`);

    const cols = ["id","form_type","name","email","phone","subject","message","service","city","experience","source","status","priority","assigned_to","admin_notes","created_at"];
    const lines = [cols.join(",")];
    for (const row of rows) {
      lines.push(cols.map((c) => {
        const v = (row as any)[c];
        if (v == null) return "";
        const s = String(v).replace(/"/g, '""');
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
      }).join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=athoo-leads.csv");
    res.send(lines.join("\n"));
  } catch (err) {
    req.log.error({ err }, "export error");
    res.status(500).json({ error: "Export failed" });
  }
});

// GET /api/admin/subscriber-stats
router.get("/subscriber-stats", async (req: AuthRequest, res) => {
  try {
    const all = await db.select().from(leads).where(eq(leads.form_type, "Waitlist Signup"));
    const withEmail = all.filter((l) => l.email).length;
    const noEmail   = all.length - withEmail;

    const dailyMap: Record<string, number> = {};
    for (const l of all) {
      const d = l.created_at.toISOString().slice(0, 10);
      dailyMap[d] = (dailyMap[d] ?? 0) + 1;
    }
    const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

    const citiesMap: Record<string, number> = {};
    for (const l of all) {
      if (l.city) citiesMap[l.city] = (citiesMap[l.city] ?? 0) + 1;
    }
    const cities = Object.entries(citiesMap).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 10);

    res.json({ ok: true, total: all.length, withEmail, noEmail, daily, cities });
  } catch (err) {
    req.log.error({ err }, "subscriber-stats error");
    res.status(500).json({ error: "Could not load subscriber stats" });
  }
});

export default router;
