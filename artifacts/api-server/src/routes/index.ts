import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import submitRouter from "./submit.js";
import publicRouter from "./public.js";
import adminPanelRouter from "./admin-panel.js";
import blogRouter from "./blog.js";
import settingsRouter from "./settings.js";
import mediaRouter from "./media.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submitRouter);
router.use(publicRouter);
router.use(adminPanelRouter);
router.use(blogRouter);
router.use(settingsRouter);
router.use(mediaRouter);

export default router;
