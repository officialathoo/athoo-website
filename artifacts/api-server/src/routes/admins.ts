import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminsTable, rolesTable } from "@workspace/db";
import {
  CreateAdminBody,
  UpdateAdminBody,
  UpdateAdminParams,
  DeleteAdminParams,
  GetAdminParams,
  UpdateAdminStatusParams,
  UpdateAdminStatusBody,
} from "@workspace/api-zod";
import { hashPassword, requireAuth, logAudit, getIp } from "../lib/auth";

const router: IRouter = Router();

async function formatAdmin(admin: typeof adminsTable.$inferSelect, roleName?: string | null) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    roleId: admin.roleId,
    roleName: roleName ?? null,
    status: admin.status,
    avatarUrl: admin.avatarUrl ?? null,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    createdAt: admin.createdAt.toISOString(),
  };
}

router.get("/admins", requireAuth, async (req, res): Promise<void> => {
  const admins = await db
    .select({
      id: adminsTable.id,
      name: adminsTable.name,
      email: adminsTable.email,
      roleId: adminsTable.roleId,
      roleName: rolesTable.name,
      status: adminsTable.status,
      avatarUrl: adminsTable.avatarUrl,
      lastLoginAt: adminsTable.lastLoginAt,
      createdAt: adminsTable.createdAt,
    })
    .from(adminsTable)
    .leftJoin(rolesTable, eq(adminsTable.roleId, rolesTable.id));

  res.json(admins.map((a) => ({
    ...a,
    roleName: a.roleName ?? null,
    avatarUrl: a.avatarUrl ?? null,
    lastLoginAt: a.lastLoginAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.post("/admins", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = await hashPassword(password);

  const [admin] = await db
    .insert(adminsTable)
    .values({ ...rest, email: rest.email.toLowerCase(), passwordHash })
    .returning();

  await logAudit((req as any).adminId, "create_admin", "admins", `Created admin: ${admin.name}`, getIp(req));
  res.status(201).json(await formatAdmin(admin));
});

router.get("/admins/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetAdminParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [result] = await db
    .select({
      admin: adminsTable,
      roleName: rolesTable.name,
    })
    .from(adminsTable)
    .leftJoin(rolesTable, eq(adminsTable.roleId, rolesTable.id))
    .where(eq(adminsTable.id, params.data.id));

  if (!result) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  res.json(await formatAdmin(result.admin, result.roleName));
});

router.patch("/admins/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAdminParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [admin] = await db
    .update(adminsTable)
    .set(parsed.data)
    .where(eq(adminsTable.id, params.data.id))
    .returning();

  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  await logAudit((req as any).adminId, "update_admin", "admins", `Updated admin ${admin.id}`, getIp(req));
  res.json(await formatAdmin(admin));
});

router.delete("/admins/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteAdminParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (params.data.id === (req as any).adminId) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }

  const [admin] = await db.delete(adminsTable).where(eq(adminsTable.id, params.data.id)).returning();
  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  await logAudit((req as any).adminId, "delete_admin", "admins", `Deleted admin ${params.data.id}`, getIp(req));
  res.sendStatus(204);
});

router.patch("/admins/:id/status", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAdminStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAdminStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [admin] = await db
    .update(adminsTable)
    .set({ status: parsed.data.status })
    .where(eq(adminsTable.id, params.data.id))
    .returning();

  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  await logAudit((req as any).adminId, "update_admin_status", "admins", `Set admin ${admin.id} status to ${parsed.data.status}`, getIp(req));
  res.json(await formatAdmin(admin));
});

export default router;
