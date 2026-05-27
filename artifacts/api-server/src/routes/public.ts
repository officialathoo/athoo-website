import { Router, type IRouter } from "express";
import { db, leadsTable, cmsContentTable, settingsTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/public/waitlist", async (req, res): Promise<void> => {
  const { name, email, phone, city, serviceCategory, experience, message } = req.body;

  if (!name || !email || !phone || !city || !serviceCategory) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // Duplicate detection
  const existing = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.email, email.toLowerCase()));

  if (existing.length > 0 && existing.some((l) => l.type === "provider")) {
    res.status(409).json({ error: "This email is already registered on the provider waitlist." });
    return;
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      name,
      email: email.toLowerCase(),
      phone,
      city,
      type: "provider",
      status: "new",
      source: "provider_form",
      serviceCategory,
      message: message ?? experience ?? null,
    })
    .returning();

  // Create notification for admins
  try {
    await db.insert(notificationsTable).values({
      adminId: null,
      type: "new_lead",
      message: `New provider waitlist submission from ${name} (${city})`,
      linkTo: `/admin/leads/${lead.id}`,
    });
  } catch (err) {
    logger.warn({ err }, "Failed to create notification");
  }

  res.status(201).json({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    city: lead.city,
    type: lead.type,
    status: lead.status,
    source: lead.source,
    assignedToId: lead.assignedToId ?? null,
    assignedToName: null,
    serviceCategory: lead.serviceCategory ?? null,
    message: lead.message ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  });
});

router.post("/public/contact", async (req, res): Promise<void> => {
  const { name, email, phone, city, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      name,
      email: email.toLowerCase(),
      phone: phone ?? null,
      city: city ?? null,
      type: "customer",
      status: "new",
      source: "customer_form",
      message,
    })
    .returning();

  try {
    await db.insert(notificationsTable).values({
      adminId: null,
      type: "new_lead",
      message: `New contact form submission from ${name}`,
      linkTo: `/admin/leads/${lead.id}`,
    });
  } catch (err) {
    logger.warn({ err }, "Failed to create notification");
  }

  res.status(201).json({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    city: lead.city,
    type: lead.type,
    status: lead.status,
    source: lead.source,
    assignedToId: lead.assignedToId ?? null,
    assignedToName: null,
    serviceCategory: lead.serviceCategory ?? null,
    message: lead.message ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  });
});

router.get("/public/cms", async (_req, res): Promise<void> => {
  const rows = await db.select().from(cmsContentTable);
  const result = rows.map((r) => ({
    id: r.id,
    section: r.section,
    content: JSON.parse(r.content || "{}"),
    updatedAt: r.updatedAt.toISOString(),
  }));
  res.json(result);
});

router.get("/public/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  res.json({
    siteTitle: map["siteTitle"] ?? "Athoo",
    contactEmail: map["contactEmail"] ?? "hello@athoo.ae",
    contactPhone: map["contactPhone"] ?? "+971 50 000 0000",
    whatsapp: map["whatsapp"] ?? "+971500000000",
    instagramUrl: map["instagramUrl"] ?? "",
    twitterUrl: map["twitterUrl"] ?? "",
    linkedinUrl: map["linkedinUrl"] ?? "",
    maintenanceMode: map["maintenanceMode"] === "true",
    maintenanceMessage: map["maintenanceMessage"] ?? "We'll be back soon!",
    launchDate: map["launchDate"] ?? "2025-09-01",
  });
});

export default router;
