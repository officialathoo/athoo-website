import { Router } from "express";
import { db, adminUsers } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, verifyPassword, hashPassword } from "../../lib/auth.js";

const router = Router();

type EnvAdmin = {
  email: string;
  password: string;
  name: string;
};

function getEnvAdmin(): EnvAdmin | null {
  const email = process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Athoo Admin";
  if (!email || !password) return null;
  return { email: email.trim().toLowerCase(), password, name };
}

function envMatches(email: string | undefined, password: string | undefined, envAdmin: EnvAdmin | null) {
  if (!envAdmin || !password) return false;
  const requestedEmail = (email || envAdmin.email).trim().toLowerCase();
  return requestedEmail === envAdmin.email && password === envAdmin.password;
}

async function ensureEnvAdmin() {
  const envAdmin = getEnvAdmin();
  const existing = await db.select().from(adminUsers).limit(1);

  if (!envAdmin) return existing;

  const matching = await db.select().from(adminUsers).where(eq(adminUsers.email, envAdmin.email)).limit(1);
  if (matching.length > 0) {
    const admin = matching[0];
    if (!verifyPassword(envAdmin.password, admin.password_hash) || !admin.is_active) {
      await db.update(adminUsers).set({
        name: admin.name || envAdmin.name,
        password_hash: hashPassword(envAdmin.password),
        role: admin.role || "super_admin",
        is_active: true,
      }).where(eq(adminUsers.email, envAdmin.email));
    }
    return db.select().from(adminUsers).where(eq(adminUsers.email, envAdmin.email)).limit(1);
  }

  if (existing.length === 0) {
    await db.insert(adminUsers).values({
      name: envAdmin.name,
      email: envAdmin.email,
      password_hash: hashPassword(envAdmin.password),
      role: "super_admin",
      is_active: true,
    });
    return db.select().from(adminUsers).where(eq(adminUsers.email, envAdmin.email)).limit(1);
  }

  return existing;
}

function sendEnvAdminLogin(res: any, envAdmin: EnvAdmin) {
  const safeAdmin = {
    id: "env-admin",
    name: envAdmin.name,
    email: envAdmin.email,
    role: "super_admin",
    is_active: true,
  };
  const token = signToken({ id: safeAdmin.id, email: safeAdmin.email, role: safeAdmin.role });
  res.json({ token, admin: safeAdmin, warning: "Database admin fallback was used." });
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const envAdmin = getEnvAdmin();

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  try {
    await ensureEnvAdmin();

    const admins = email
      ? await db.select().from(adminUsers).where(eq(adminUsers.email, email.trim().toLowerCase())).limit(1)
      : await db.select().from(adminUsers).limit(1);

    const admin = admins[0];

    if (admin?.is_active && verifyPassword(password, admin.password_hash)) {
      const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
      const { password_hash: _, ...safeAdmin } = admin;
      res.json({ token, admin: safeAdmin });
      return;
    }

    if (envMatches(email, password, envAdmin)) {
      if (envAdmin) {
        try {
          const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, envAdmin.email)).limit(1);
          if (existing.length > 0) {
            await db.update(adminUsers).set({ password_hash: hashPassword(envAdmin.password), is_active: true, role: existing[0].role || "super_admin" }).where(eq(adminUsers.email, envAdmin.email));
          } else {
            await db.insert(adminUsers).values({ name: envAdmin.name, email: envAdmin.email, password_hash: hashPassword(envAdmin.password), role: "super_admin", is_active: true });
          }
          const updated = await db.select().from(adminUsers).where(eq(adminUsers.email, envAdmin.email)).limit(1);
          const adminUser = updated[0];
          const token = signToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role });
          const { password_hash: _, ...safeAdmin } = adminUser;
          res.json({ token, admin: safeAdmin });
          return;
        } catch (innerErr) {
          req.log.warn({ err: innerErr }, "env admin database sync failed; using fallback login");
          sendEnvAdminLogin(res, envAdmin);
          return;
        }
      }
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    req.log.error({ err }, "admin login error");
    if (envMatches(email, password, envAdmin) && envAdmin) {
      sendEnvAdminLogin(res, envAdmin);
      return;
    }
    res.status(500).json({ error: "Login failed. Check DATABASE_URL, admin_users table and ADMIN_EMAIL/ADMIN_PASSWORD." });
  }
});

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

    await db.insert(adminUsers).values({
      name,
      email: email.trim().toLowerCase(),
      password_hash: hashPassword(password),
      role: "super_admin",
      is_active: true,
    });

    res.json({ ok: true, message: "Super admin created. You can now login." });
  } catch (err) {
    req.log.error({ err }, "admin setup error");
    res.status(500).json({ error: "Setup failed" });
  }
});

export default router;
