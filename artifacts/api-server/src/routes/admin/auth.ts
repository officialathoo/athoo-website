import { Router } from "express";
import { db, adminUsers } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, verifyPassword, hashPassword } from "../../lib/auth.js";

const router = Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    // Find admin — if email provided, match by email; else try the first active super_admin
    let admins;
    if (email) {
      admins = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    } else {
      admins = await db.select().from(adminUsers).limit(1);
    }

    const admin = admins[0];

    if (!admin || !admin.is_active) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // On first run the table might be empty — auto-create super admin
    if (!admin.password_hash) {
      res.status(401).json({ error: "Account not configured" });
      return;
    }

    if (!verifyPassword(password, admin.password_hash)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
    const { password_hash: _, ...safeAdmin } = admin;
    res.json({ token, admin: safeAdmin });
  } catch (err) {
    req.log.error({ err }, "admin login error");
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/admin/setup  (creates first super-admin if table is empty)
router.post("/setup", async (req, res) => {
  try {
    const existing = await db.select().from(adminUsers).limit(1);
    if (existing.length > 0) {
      res.status(403).json({ error: "Setup already complete" });
      return;
    }
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email and password are required" });
      return;
    }
    const password_hash = hashPassword(password);
    await db.insert(adminUsers).values({ name, email, password_hash, role: "super_admin", is_active: true });
    res.json({ ok: true, message: "Super admin created. You can now login." });
  } catch (err) {
    req.log.error({ err }, "admin setup error");
    res.status(500).json({ error: "Setup failed" });
  }
});

export default router;
