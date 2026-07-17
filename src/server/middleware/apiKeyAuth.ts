import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { ApiError } from "./errorHandler";

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Protects public-facing API routes (called by external clients, not the web UI)
 * with a static API key passed in the X-API-Key header.
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.DECOMPOSE_API_KEY;

  if (!configuredKey) {
    throw new ApiError(503, "Public API is not configured. Set DECOMPOSE_API_KEY on the server to enable it.");
  }

  const providedKey = req.header("X-API-Key");

  if (!providedKey || !timingSafeEqual(providedKey, configuredKey)) {
    throw new ApiError(401, "Invalid or missing API key");
  }

  next();
}
