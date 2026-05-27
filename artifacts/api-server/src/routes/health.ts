import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "athoo-api",
    timestamp: new Date().toISOString(),
  });
});

export default router;