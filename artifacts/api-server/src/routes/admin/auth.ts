import { Router } from "express";
import { db, adminUsers, pool } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, verifyPassword, hashPassword } from "../../lib/auth.js";

const router = Router();

async function ensureAuthTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id serial PRIMARY KEY,
      name text NOT NULL DEFAULT 'Athoo Admin',
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      role varchar(50) NOT NULL DEFAULT 'super_admin',
      is_active boolean NOT NULL DEFAULT true,
      permissions json,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
}

async function ensureEnvAdmin() {
  await ensureAuthTables();
  const email = (process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || "official@athoo.pk").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Athoo Admin";

  if (password) {
    const password_hash = hashPassword(password);
    await pool.query(
      `INSERT INTO admin_users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'super_admin', true)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
           role = 'super_admin',
           is_active = true`,
      [name, email, password_hash],
    );
  }

  return db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    await ensureEnvAdmin();
    const loginEmail = (email || process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || "official@athoo.pk").trim().toLowerCase();
    const admins = await db.select().from(adminUsers).where(eq(adminUsers.email, loginEmail)).limit(1);
    const admin = admins[0];

    if (!admin || !admin.is_active || !admin.password_hash || !verifyPassword(password, admin.password_hash)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
    const { password_hash: _, ...safeAdmin } = admin;
    res.json({ token, admin: safeAdmin });
  } catch (err) {
    req.log.error({ err }, "admin login error");
    res.status(500).json({ error: "Login failed. Check DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD and admin_users table." });
  }
});

router.post("/setup", async (req, res) => {
  try {
    await ensureAuthTables();
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
    await db.insert(adminUsers).values({ name, email: email.toLowerCase(), password_hash, role: "super_admin", is_active: true });
    res.json({ ok: true, message: "Super admin created. You can now login." });
  } catch (err) {
    req.log.error({ err }, "admin setup error");
    res.status(500).json({ error: "Setup failed" });
  }
});

export default router;
