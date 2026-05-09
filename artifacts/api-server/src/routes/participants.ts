import { Router, type IRouter } from "express";
import { PARTICIPANTS } from "../data/seed";

const router: IRouter = Router();

router.get("/participants", (req, res) => {
  res.json(PARTICIPANTS);
});

router.get("/participants/:id", (req, res) => {
  const participant = PARTICIPANTS.find((p) => p.id === req.params["id"]);
  if (!participant) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }
  res.json(participant);
});

export default router;
