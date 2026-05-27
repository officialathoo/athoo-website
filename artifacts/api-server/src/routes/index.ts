import { Router } from "express";

import healthRouter from "./health.js";
import submitRouter from "./submit.js";
import adminPanelRouter from "./admin-panel.js";
import publicRouter from "./public.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/", submitRouter);
router.use("/", adminPanelRouter);
router.use("/", publicRouter);

export default router;
