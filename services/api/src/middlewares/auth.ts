import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

export interface AuthRequest extends Request {
  adminId?: number;
  adminEmail?: string;
  adminRole?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token   = header.slice(7);
  const payload = verifyToken(token);
  if (!payload || typeof payload.id !== "number") {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.adminId    = payload.id as number;
  req.adminEmail = payload.email as string;
  req.adminRole  = payload.role as string;
  next();
}
