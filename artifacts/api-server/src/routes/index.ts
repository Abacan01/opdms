import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import appointmentsRouter from "./appointments";
import doctorsRouter from "./doctors";
import recordsRouter from "./records";
import articlesRouter from "./articles";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/appointments", appointmentsRouter);
router.use("/doctors", doctorsRouter);
router.use("/records", recordsRouter);
router.use("/articles", articlesRouter);
router.use("/notifications", notificationsRouter);

export default router;
