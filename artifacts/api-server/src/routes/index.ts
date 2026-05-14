import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import participantsRouter from "./participants";
import requestsRouter from "./requests";
import providersRouter from "./providers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(participantsRouter);
router.use(requestsRouter);
router.use(providersRouter);

export default router;
