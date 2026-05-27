import { Router, type IRouter } from "express";
import { eq, ilike, and, desc, sql, inArray } from "drizzle-orm";
import { db, leadsTable, leadNotesTable, leadActivitiesTable, adminsTable, notificationsTable } from "@workspace/db";
import {
  ListLeadsQueryParams,
  CreateLeadBody,
  UpdateLeadBody,
  UpdateLeadParams,
  DeleteLeadParams,
  GetLeadParams,
  ListLeadNotesParams,
  CreateLeadNoteParams,
  CreateLeadNoteBody,
  BulkLeadActionBody,
} from "@workspace/api-zod";
import { requireAuth, logAudit, getIp } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/leads", requireAuth, async (req, res): Promise<void> => {
  const params = ListLeadsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { status, source, type, search, page = 1, limit = 20, assignedTo } = params.data;

  const conditions = [];
  if (status) conditions.push(eq(leadsTable.status, status));
  if (source) conditions.push(eq(leadsTable.source, source));
  if (type) conditions.push(eq(leadsTable.type, type));
  if (assignedTo) conditions.push(eq(leadsTable.assignedToId, assignedTo));
  if (search) {
    conditions.push(
      sql`(${leadsTable.name} ILIKE ${"%" + search + "%"} OR ${leadsTable.email} ILIKE ${"%" + search + "%"} OR ${leadsTable.phone} ILIKE ${"%" + search + "%"})`
    );
  }

  const offset = (page - 1) * limit;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leadsTable)
    .where(conditions.length ? and(...conditions) : undefined);

  const leads = await db
    .select({
      id: leadsTable.id,
      name: leadsTable.name,
      email: leadsTable.email,
      phone: leadsTable.phone,
      city: leadsTable.city,
      type: leadsTable.type,
      status: leadsTable.status,
      source: leadsTable.source,
      assignedToId: leadsTable.assignedToId,
      serviceCategory: leadsTable.serviceCategory,
      message: leadsTable.message,
      createdAt: leadsTable.createdAt,
      updatedAt: leadsTable.updatedAt,
      assignedToName: adminsTable.name,
    })
    .from(leadsTable)
    .leftJoin(adminsTable, eq(leadsTable.assignedToId, adminsTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(leadsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    data: leads.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      assignedToId: l.assignedToId ?? null,
      assignedToName: l.assignedToName ?? null,
      phone: l.phone ?? null,
      city: l.city ?? null,
      serviceCategory: l.serviceCategory ?? null,
      message: l.message ?? null,
    })),
    total: countResult.count,
    page,
    limit,
  });
});

router.post("/leads", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db.insert(leadsTable).values(parsed.data).returning();
  await logAudit((req as any).adminId, "create_lead", "leads", `Created lead: ${lead.name}`, getIp(req));

  res.status(201).json({
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    assignedToId: lead.assignedToId ?? null,
    assignedToName: null,
    phone: lead.phone ?? null,
    city: lead.city ?? null,
    serviceCategory: lead.serviceCategory ?? null,
    message: lead.message ?? null,
  });
});

router.get("/leads/export", requireAuth, async (req, res): Promise<void> => {
  const { status, source } = req.query;
  const conditions = [];
  if (status && typeof status === "string") conditions.push(eq(leadsTable.status, status));
  if (source && typeof source === "string") conditions.push(eq(leadsTable.source, source));

  const leads = await db
    .select()
    .from(leadsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(leadsTable.createdAt));

  const headers = ["ID", "Name", "Email", "Phone", "City", "Type", "Status", "Source", "Service Category", "Message", "Created At"];
  const rows = leads.map((l) => [
    l.id,
    l.name,
    l.email,
    l.phone ?? "",
    l.city ?? "",
    l.type,
    l.status,
    l.source,
    l.serviceCategory ?? "",
    (l.message ?? "").replace(/,/g, ";"),
    l.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
  res.send(csv);
});

router.post("/leads/bulk-action", requireAuth, async (req, res): Promise<void> => {
  const parsed = BulkLeadActionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { ids, action, assignedToId, status } = parsed.data;
  const adminId = (req as any).adminId;
  let affected = 0;

  if (action === "delete") {
    const result = await db.delete(leadsTable).where(inArray(leadsTable.id, ids));
    affected = ids.length;
    await logAudit(adminId, "bulk_delete_leads", "leads", `Deleted ${ids.length} leads`, getIp(req));
  } else if (action === "assign" && assignedToId !== undefined) {
    await db.update(leadsTable).set({ assignedToId }).where(inArray(leadsTable.id, ids));
    affected = ids.length;
    await logAudit(adminId, "bulk_assign_leads", "leads", `Assigned ${ids.length} leads`, getIp(req));
  } else if (action === "update_status" && status) {
    await db.update(leadsTable).set({ status }).where(inArray(leadsTable.id, ids));
    affected = ids.length;
    await logAudit(adminId, "bulk_update_status", "leads", `Updated status for ${ids.length} leads`, getIp(req));
  }

  res.json({ affected });
});

router.get("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lead] = await db
    .select({
      id: leadsTable.id,
      name: leadsTable.name,
      email: leadsTable.email,
      phone: leadsTable.phone,
      city: leadsTable.city,
      type: leadsTable.type,
      status: leadsTable.status,
      source: leadsTable.source,
      assignedToId: leadsTable.assignedToId,
      serviceCategory: leadsTable.serviceCategory,
      message: leadsTable.message,
      createdAt: leadsTable.createdAt,
      updatedAt: leadsTable.updatedAt,
      assignedToName: adminsTable.name,
    })
    .from(leadsTable)
    .leftJoin(adminsTable, eq(leadsTable.assignedToId, adminsTable.id))
    .where(eq(leadsTable.id, params.data.id));

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const notes = await db
    .select({
      id: leadNotesTable.id,
      leadId: leadNotesTable.leadId,
      content: leadNotesTable.content,
      authorId: leadNotesTable.authorId,
      authorName: adminsTable.name,
      createdAt: leadNotesTable.createdAt,
    })
    .from(leadNotesTable)
    .leftJoin(adminsTable, eq(leadNotesTable.authorId, adminsTable.id))
    .where(eq(leadNotesTable.leadId, lead.id))
    .orderBy(desc(leadNotesTable.createdAt));

  const activities = await db
    .select({
      id: leadActivitiesTable.id,
      leadId: leadActivitiesTable.leadId,
      action: leadActivitiesTable.action,
      detail: leadActivitiesTable.detail,
      adminId: leadActivitiesTable.adminId,
      adminName: adminsTable.name,
      createdAt: leadActivitiesTable.createdAt,
    })
    .from(leadActivitiesTable)
    .leftJoin(adminsTable, eq(leadActivitiesTable.adminId, adminsTable.id))
    .where(eq(leadActivitiesTable.leadId, lead.id))
    .orderBy(desc(leadActivitiesTable.createdAt));

  res.json({
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    assignedToId: lead.assignedToId ?? null,
    assignedToName: lead.assignedToName ?? null,
    phone: lead.phone ?? null,
    city: lead.city ?? null,
    serviceCategory: lead.serviceCategory ?? null,
    message: lead.message ?? null,
    notes: notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString(), authorId: n.authorId ?? null, authorName: n.authorName ?? null })),
    activities: activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString(), adminId: a.adminId ?? null, adminName: a.adminName ?? null, detail: a.detail ?? null })),
  });
});

router.patch("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db
    .update(leadsTable)
    .set(parsed.data)
    .where(eq(leadsTable.id, params.data.id))
    .returning();

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  // Log activity
  await db.insert(leadActivitiesTable).values({
    leadId: lead.id,
    action: "updated",
    detail: `Lead updated by admin`,
    adminId: (req as any).adminId,
  });

  await logAudit((req as any).adminId, "update_lead", "leads", `Updated lead ${lead.id}`, getIp(req));

  res.json({
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    assignedToId: lead.assignedToId ?? null,
    assignedToName: null,
    phone: lead.phone ?? null,
    city: lead.city ?? null,
    serviceCategory: lead.serviceCategory ?? null,
    message: lead.message ?? null,
  });
});

router.delete("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lead] = await db.delete(leadsTable).where(eq(leadsTable.id, params.data.id)).returning();
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  await logAudit((req as any).adminId, "delete_lead", "leads", `Deleted lead ${params.data.id}`, getIp(req));
  res.sendStatus(204);
});

router.get("/leads/:id/notes", requireAuth, async (req, res): Promise<void> => {
  const params = ListLeadNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const notes = await db
    .select({
      id: leadNotesTable.id,
      leadId: leadNotesTable.leadId,
      content: leadNotesTable.content,
      authorId: leadNotesTable.authorId,
      authorName: adminsTable.name,
      createdAt: leadNotesTable.createdAt,
    })
    .from(leadNotesTable)
    .leftJoin(adminsTable, eq(leadNotesTable.authorId, adminsTable.id))
    .where(eq(leadNotesTable.leadId, params.data.id))
    .orderBy(desc(leadNotesTable.createdAt));

  res.json(notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString(), authorId: n.authorId ?? null, authorName: n.authorName ?? null })));
});

router.post("/leads/:id/notes", requireAuth, async (req, res): Promise<void> => {
  const params = CreateLeadNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateLeadNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const adminId = (req as any).adminId;
  const [note] = await db
    .insert(leadNotesTable)
    .values({ leadId: params.data.id, content: parsed.data.content, authorId: adminId })
    .returning();

  await db.insert(leadActivitiesTable).values({
    leadId: params.data.id,
    action: "note_added",
    detail: parsed.data.content.slice(0, 100),
    adminId,
  });

  const admin = (req as any).admin;
  res.status(201).json({
    ...note,
    createdAt: note.createdAt.toISOString(),
    authorId: note.authorId ?? null,
    authorName: admin?.name ?? null,
  });
});

export default router;
