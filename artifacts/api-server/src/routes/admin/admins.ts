import { Router } from "express";
import { db, adminUsers } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "../../lib/auth.js";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// GET /api/admin/admins
router.get("/admins", async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role, is_active: adminUsers.is_active, permissions: adminUsers.permissions, created_at: adminUsers.created_at })
      .from(adminUsers)
      .orderBy(sql`${adminUsers.created_at} DESC`);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "get admins error");
    res.status(500).json({ error: "Could not load admins" });
  }
});

// POST /api/admin/admins
router.post("/admins", async (req: AuthRequest, res) => {
  try {
    const { name, email, role, password, is_active, permissions } = req.body as Record<string, unknown>;
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email and password are required" });
      return;
    }
    const password_hash = hashPassword(String(password));
    await db.insert(adminUsers).values({
      name:        String(name),
      email:       String(email),
      password_hash,
      role:        String(role ?? "manager"),
      is_active:   is_active !== false,
      permissions: (permissions as Record<string, boolean>) ?? null,
    });
    res.json({ ok: true });
  } catch (err: any) {
    if (String(err?.message).includes("unique")) {
      res.status(409).json({ error: "Email already exists" });
    } else {
      req.log.error({ err }, "create admin error");
      res.status(500).json({ error: "Could not create admin" });
    }
  }
});

// PATCH /api/admin/admins/:id
router.patch("/admins/:id", async (req: AuthRequest, res) => {
  try {
    const id   = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if ("name"        in body) patch.name        = body.name;
    if ("role"        in body) patch.role        = body.role;
    if ("is_active"   in body) patch.is_active   = body.is_active;
    if ("permissions" in body) patch.permissions = body.permissions;
    if (body.password) patch.password_hash = hashPassword(String(body.password));
    await db.update(adminUsers).set(patch as any).where(eq(adminUsers.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "update admin error");
    res.status(500).json({ error: "Could not update admin" });
  }
});

// DELETE /api/admin/admins/:id
router.delete("/admins/:id", async (req: AuthRequest, res) => {
  try {
    await db.delete(adminUsers).where(eq(adminUsers.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "delete admin error");
    res.status(500).json({ error: "Could not delete admin" });
  }
});

export default router;
