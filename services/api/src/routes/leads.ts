import { Router, type IRouter } from "express";
import { eq, sql, and, gte } from "drizzle-orm";
import { db, websiteLeadsTable } from "@athoo/db";
import { SubmitLeadBody } from "@athoo/validation";

const router: IRouter = Router();

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = SubmitLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  // Duplicate check: same email + formType within 24 hours
  if (data.email) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [existing] = await db
      .select({ id: websiteLeadsTable.id })
      .from(websiteLeadsTable)
      .where(
        and(
          eq(websiteLeadsTable.email, data.email),
          eq(websiteLeadsTable.formType, data.formType),
          gte(websiteLeadsTable.createdAt, since),
        ),
      )
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "You already submitted this form recently. We will be in touch soon!" });
      return;
    }
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;
  const ua = req.headers["user-agent"] || null;

  const [lead] = await db
    .insert(websiteLeadsTable)
    .values({
      formType: data.formType,
      name: data.name ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      subject: data.subject ?? null,
      message: data.message ?? null,
      service: data.service ?? null,
      city: data.city ?? null,
      experience: data.experience ?? null,
      source: data.source ?? "website",
      ipAddress: ip,
      userAgent: ua,
      payload: {},
    })
    .returning({ id: websiteLeadsTable.id });

  req.log.info({ leadId: lead.id, formType: data.formType }, "Lead submitted");

  res.status(201).json({
    success: true,
    message: "Thank you! We will be in touch soon.",
    id: lead.id,
  });
});

router.get("/leads/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(websiteLeadsTable);

  const [todayRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(websiteLeadsTable)
    .where(gte(websiteLeadsTable.createdAt, today));

  const byFormType = await db
    .select({
      formType: websiteLeadsTable.formType,
      count: sql<number>`count(*)::int`,
    })
    .from(websiteLeadsTable)
    .groupBy(websiteLeadsTable.formType);

  const byCity = await db
    .select({
      city: websiteLeadsTable.city,
      count: sql<number>`count(*)::int`,
    })
    .from(websiteLeadsTable)
    .where(sql`${websiteLeadsTable.city} is not null`)
    .groupBy(websiteLeadsTable.city);

  const byFormTypeMap: Record<string, number> = {};
  for (const row of byFormType) {
    byFormTypeMap[row.formType] = row.count;
  }

  const byCityMap: Record<string, number> = {};
  for (const row of byCity) {
    if (row.city) byCityMap[row.city] = row.count;
  }

  res.json({
    total: totalRow?.count ?? 0,
    newToday: todayRow?.count ?? 0,
    byFormType: byFormTypeMap,
    byCity: byCityMap,
  });
});

export default router;
