import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import submitRouter from "./submit.js";
import publicRouter from "./public.js";
import adminPanelRouter from "./admin-panel.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submitRouter);
router.use(publicRouter);
router.use(adminPanelRouter);

export default router;
