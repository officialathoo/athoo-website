import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import submitRouter from "./submit.js";
import publicRouter from "./public.js";
import adminRouter  from "./admin/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submitRouter);
router.use(publicRouter);
router.use("/admin", adminRouter);

export default router;
