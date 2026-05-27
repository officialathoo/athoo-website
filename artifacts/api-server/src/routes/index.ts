import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submitRouter from "./submit";
import adminPanelRouter from "./admin-panel";
import publicRouter from "./public";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submitRouter);
router.use(adminPanelRouter);
router.use(publicRouter);

export default router;
