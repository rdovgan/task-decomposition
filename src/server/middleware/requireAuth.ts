import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "./errorHandler";
import { AUTH_COOKIE_NAME, verifyToken } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Requires a valid auth cookie. Attaches req.userId and calls next(),
 * or throws 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    throw new ApiError(401, "Not authenticated");
  }

  req.userId = payload.userId;
  next();
}

/**
 * Attaches req.userId if a valid auth cookie is present, but never blocks
 * the request — for routes that optionally personalize behavior (e.g. using
 * a logged-in user's saved API key) without requiring login.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  const payload = token ? verifyToken(token) : null;

  if (payload) {
    req.userId = payload.userId;
  }

  next();
}
