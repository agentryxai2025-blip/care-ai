import { Router, type IRouter } from "express";
import { PARTICIPANTS, REQUESTS, getDashboardSummary } from "../data/seed";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard", requireAuth, (req, res): void => {
  const { caregiver } = req;
  if (!caregiver) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const assignedParticipants = PARTICIPANTS.filter((p) =>
    caregiver.participantIds.includes(p.id),
  );
  const assignedNdisNumbers = new Set(assignedParticipants.map((p) => p.ndisNumber));
  const assignedRequests = REQUESTS.filter((r) => assignedNdisNumbers.has(r.ndisNumber));

  res.json(getDashboardSummary(assignedParticipants, assignedRequests));
});

export default router;
