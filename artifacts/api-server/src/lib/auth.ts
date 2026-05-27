import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db, adminsTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const JWT_SECRET = process.env.SESSION_SECRET ?? "athoo-secret-key-change-in-production";
const TOKEN_EXPIRY = "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(adminId: number): string {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { adminId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: number };
    return decoded;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, decoded.adminId));
  if (!admin || admin.status !== "active") {
    res.status(401).json({ error: "Account inactive or not found" });
    return;
  }

  (req as any).adminId = admin.id;
  (req as any).admin = admin;
  next();
}

export async function logAudit(
  adminId: number | null,
  action: string,
  module: string | null,
  detail: string | null,
  ipAddress: string | null
): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      adminId,
      action,
      module,
      detail,
      ipAddress,
    });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}

export function getIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}
