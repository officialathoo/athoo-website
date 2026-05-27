import { Router } from "express";

const router = Router();

router.get("/", (_req: any, res: any) => {
  res.status(200).json({
    status: "ok",
    service: "athoo-api",
    timestamp: new Date().toISOString(),
  });
});

export default router;