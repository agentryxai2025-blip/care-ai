import { Router, type IRouter } from "express";
import { PARTICIPANTS, REQUESTS } from "../data/seed";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function getAssignedRequests(participantIds: string[]) {
  const assignedNdisNumbers = new Set(
    PARTICIPANTS.filter((p) => participantIds.includes(p.id)).map((p) => p.ndisNumber),
  );
  return REQUESTS.filter((r) => assignedNdisNumbers.has(r.ndisNumber));
}

router.get("/requests", requireAuth, (req, res): void => {
  const { caregiver } = req;
  if (!caregiver) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const assigned = getAssignedRequests(caregiver.participantIds);
  const { status } = req.query;
  if (status && typeof status === "string") {
    res.json(assigned.filter((r) => r.status === status));
    return;
  }
  res.json(assigned);
});

router.get("/requests/:id", requireAuth, (req, res): void => {
  const { caregiver } = req;
  if (!caregiver) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = req.params["id"] as string;
  const assigned = getAssignedRequests(caregiver.participantIds);
  const request = assigned.find((r) => r.id === id);
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(request);
});

export default router;
