import { Router, type IRouter } from "express";
import { PROVIDERS } from "../data/seed";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/providers", requireAuth, (req, res): void => {
  res.json(PROVIDERS);
});

router.get("/providers/:id", requireAuth, (req, res): void => {
  const id = req.params["id"] as string;
  const provider = PROVIDERS.find((p) => p.id === id);
  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
    return;
  }
  res.json(provider);
});

export default router;
