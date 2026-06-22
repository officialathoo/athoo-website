import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import submitRouter from "./submit.js";
import publicRouter from "./public.js";
import adminPanelRouter from "./admin-panel.js";
import blogRouter from "./blog.js";
import settingsRouter from "./settings.js";
import mediaRouter from "./media.js";
import servicesRouter from "./services.js";
import leadsRouter from "./leads.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submitRouter);
router.use(publicRouter);
router.use(adminPanelRouter);
router.use(blogRouter);
router.use(settingsRouter);
router.use(mediaRouter);
router.use(servicesRouter);
router.use(leadsRouter);

export default router;
