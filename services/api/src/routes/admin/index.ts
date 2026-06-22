import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import authRouter     from "./auth.js";
import leadsRouter    from "./leads.js";
import settingsRouter from "./settings.js";
import blogRouter     from "./blog.js";
import mediaRouter    from "./media.js";
import emailRouter    from "./email.js";
import servicesRouter from "./services.js";
import adminsRouter   from "./admins.js";
import activityRouter from "./activity.js";

const router = Router();

// Public admin routes (no token needed)
router.use(authRouter);

// All routes below require a valid Bearer token
router.use(requireAuth);
router.use(leadsRouter);
router.use(settingsRouter);
router.use(blogRouter);
router.use(mediaRouter);
router.use(emailRouter);
router.use(servicesRouter);
router.use(adminsRouter);
router.use(activityRouter);

export default router;
