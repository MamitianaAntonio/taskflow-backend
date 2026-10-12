import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

// authMiddleware function to verify token and go to the next route
export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];

  if (!header) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token) as { userId: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expered token" });
  }
}
