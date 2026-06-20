import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, serviceCategoriesTable } from "@athoo/db";

const router: IRouter = Router();

router.get("/services", async (_req, res): Promise<void> => {
  const services = await db
    .select()
    .from(serviceCategoriesTable)
    .where(eq(serviceCategoriesTable.isActive, true))
    .orderBy(asc(serviceCategoriesTable.sortOrder));

  res.json(services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    icon: s.icon,
    cities: s.cities ?? [],
    startingPrice: s.startingPrice ?? null,
  })));
});

export default router;
