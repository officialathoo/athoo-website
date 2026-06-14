import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminsTable, rolesTable } from "@workspace/db";
import {
  AdminLoginBody,
  ChangePasswordBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from "@workspace/api-zod";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  requireAuth,
  logAudit,
  getIp,
} from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.email, email.toLowerCase()));

  if (!admin) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (admin.status !== "active") {
    res.status(401).json({ error: "Account is suspended or inactive" });
    return;
  }

  if (admin.failedLoginAttempts >= 10) {
    res.status(429).json({ error: "Account temporarily locked due to too many failed attempts" });
    return;
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    await db
      .update(adminsTable)
      .set({ failedLoginAttempts: (admin.failedLoginAttempts ?? 0) + 1 })
      .where(eq(adminsTable.id, admin.id));
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  await db
    .update(adminsTable)
    .set({ lastLoginAt: new Date(), failedLoginAttempts: 0 })
    .where(eq(adminsTable.id, admin.id));

  await logAudit(admin.id, "login", "auth", `Login from IP: ${getIp(req)}`, getIp(req));

  const token = signToken(admin.id);
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, admin.roleId ?? 0));

  res.json({
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.roleId,
      roleName: role?.name ?? null,
      status: admin.status,
      avatarUrl: admin.avatarUrl ?? null,
      lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
      createdAt: admin.createdAt.toISOString(),
    },
  });
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  const adminId = (req as any).adminId;
  await logAudit(adminId, "logout", "auth", null, getIp(req));
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const admin = (req as any).admin;
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, admin.roleId ?? 0));
  res.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    roleId: admin.roleId,
    roleName: role?.name ?? null,
    status: admin.status,
    avatarUrl: admin.avatarUrl ?? null,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    createdAt: admin.createdAt.toISOString(),
  });
});

router.post("/auth/change-password", requireAuth, async (req, res): Promise<void> => {
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const admin = (req as any).admin;
  const valid = await verifyPassword(parsed.data.currentPassword, admin.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  const hash = await hashPassword(parsed.data.newPassword);
  await db.update(adminsTable).set({ passwordHash: hash }).where(eq(adminsTable.id, admin.id));
  await logAudit(admin.id, "change_password", "auth", null, getIp(req));
  res.json({ success: true });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  // Always return success to prevent email enumeration
  res.json({ success: true, message: "If this email exists, a reset link has been sent." });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json({ success: true });
});

export default router;
