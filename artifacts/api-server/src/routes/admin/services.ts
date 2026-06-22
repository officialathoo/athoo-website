import { Router } from "express";
import { db, services } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// GET /api/admin/services
router.get("/services", async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(services).orderBy(sql`${services.sort_order} ASC NULLS LAST, ${services.created_at} ASC`);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "get services error");
    res.status(500).json({ error: "Could not load services" });
  }
});

// POST /api/admin/services
router.post("/services", async (req: AuthRequest, res) => {
  try {
    const { name, description, icon, startingPrice, cities, isActive, sortOrder } = req.body as Record<string, unknown>;
    if (!name) { res.status(400).json({ error: "name is required" }); return; }
    const [row] = await db.insert(services).values({
      name:           String(name),
      description:    (description as string) ?? null,
      icon:           (icon as string) ?? "Wrench",
      starting_price: (startingPrice as string) ?? null,
      cities:         (cities as string) ?? null,
      is_active:      isActive !== false,
      sort_order:     Number(sortOrder ?? 0),
    }).returning();
    res.json({ ok: true, id: row.id });
  } catch (err) {
    req.log.error({ err }, "create service error");
    res.status(500).json({ error: "Could not create service" });
  }
});

// PATCH /api/admin/services/:id
router.patch("/services/:id", async (req: AuthRequest, res) => {
  try {
    const id   = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = { updated_at: new Date() };
    const map: Record<string, string> = {
      name: "name", description: "description", icon: "icon",
      startingPrice: "starting_price", cities: "cities",
      isActive: "is_active", sortOrder: "sort_order",
    };
    for (const [k, col] of Object.entries(map)) {
      if (k in body) patch[col] = body[k];
    }
    await db.update(services).set(patch as any).where(eq(services.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "update service error");
    res.status(500).json({ error: "Could not update service" });
  }
});

// DELETE /api/admin/services/:id
router.delete("/services/:id", async (req: AuthRequest, res) => {
  try {
    await db.delete(services).where(eq(services.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "delete service error");
    res.status(500).json({ error: "Could not delete service" });
  }
});

export default router;
