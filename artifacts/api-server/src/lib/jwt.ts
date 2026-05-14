import jwt from "jsonwebtoken";
import { logger } from "./logger";

const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET) {
  if (isProduction) {
    logger.error("JWT_SECRET environment variable is not set. Refusing to start in production without a secret.");
    process.exit(1);
  } else {
    logger.warn("JWT_SECRET is not set — using insecure dev fallback. Set JWT_SECRET before deploying.");
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-only-not-for-production";
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  participantIds: string[];
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    logger.debug({ err }, "JWT verification failed");
    return null;
  }
}
