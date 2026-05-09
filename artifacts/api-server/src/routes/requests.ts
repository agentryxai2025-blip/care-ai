import { Router, type IRouter } from "express";
import { REQUESTS } from "../data/seed";

const router: IRouter = Router();

router.get("/requests", (req, res) => {
  const { status } = req.query;
  if (status && typeof status === "string") {
    res.json(REQUESTS.filter((r) => r.status === status));
    return;
  }
  res.json(REQUESTS);
});

router.get("/requests/:id", (req, res) => {
  const request = REQUESTS.find((r) => r.id === req.params["id"]);
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(request);
});

export default router;
