import { Router, type IRouter } from "express";
import { PARTICIPANTS } from "../data/seed";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/participants", requireAuth, (req, res): void => {
  const { caregiver } = req;
  if (!caregiver) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const filtered = PARTICIPANTS.filter((p) =>
    caregiver.participantIds.includes(p.id),
  );
  res.json(filtered);
});

router.get("/participants/:id", requireAuth, (req, res): void => {
  const id = req.params["id"] as string;
  const { caregiver } = req;
  if (!caregiver) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!caregiver.participantIds.includes(id)) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const participant = PARTICIPANTS.find((p) => p.id === id);
  if (!participant) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }
  res.json(participant);
});

export default router;
