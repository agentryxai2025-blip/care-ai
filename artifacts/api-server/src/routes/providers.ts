import { Router, type IRouter } from "express";
import { PROVIDERS } from "../data/seed";

const router: IRouter = Router();

router.get("/providers", (req, res) => {
  res.json(PROVIDERS);
});

router.get("/providers/:id", (req, res) => {
  const provider = PROVIDERS.find((p) => p.id === req.params["id"]);
  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
    return;
  }
  res.json(provider);
});

export default router;
