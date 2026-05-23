import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import waitlistRouter from "./waitlist";
import providerInterestRouter from "./providerInterest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(waitlistRouter);
router.use(providerInterestRouter);

export default router;
