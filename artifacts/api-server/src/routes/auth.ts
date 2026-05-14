import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { CAREGIVERS } from "../data/caregivers";
import { signToken } from "../lib/jwt";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const candidate = CAREGIVERS.find(
    (c) => c.email.toLowerCase() === email.toLowerCase(),
  );

  const passwordMatch = candidate
    ? await bcrypt.compare(password, candidate.passwordHash)
    : false;

  const caregiver = passwordMatch ? candidate : undefined;

  if (!caregiver) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({
    sub: caregiver.id,
    email: caregiver.email,
    role: caregiver.role,
    participantIds: caregiver.participantIds,
  });

  req.log.info({ caregiverId: caregiver.id }, "Caregiver logged in");

  res.json({
    token,
    caregiver: {
      id: caregiver.id,
      name: caregiver.name,
      email: caregiver.email,
      role: caregiver.role,
      participantIds: caregiver.participantIds,
    },
  });
});

router.get("/auth/me", requireAuth, (req, res): void => {
  const { caregiver } = req;
  if (!caregiver) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const record = CAREGIVERS.find((c) => c.id === caregiver.sub);
  if (!record) {
    res.status(404).json({ error: "Caregiver not found" });
    return;
  }

  res.json({
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    participantIds: record.participantIds,
  });
});

export default router;
