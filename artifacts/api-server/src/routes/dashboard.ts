import { Router, type IRouter } from "express";
import { getDashboardSummary } from "../data/seed";

const router: IRouter = Router();

router.get("/dashboard", (_req, res) => {
  res.json(getDashboardSummary());
});

export default router;
