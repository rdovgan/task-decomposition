import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { hashPassword, verifyPassword, signToken, AUTH_COOKIE_NAME, authCookieOptions } from "../lib/auth";

function toSafeUser(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/**
 * Create an account (open signup) and log the user in.
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, password: hashed },
  });

  const token = signToken(user.id);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.status(201).json({ data: toSafeUser(user) });
});

/**
 * Log in with email + password.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message either way — don't leak whether the email exists,
  // and legacy/seed rows with no password can never log in.
  if (!user?.password || !(await verifyPassword(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user.id);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.json({ data: toSafeUser(user) });
});

/**
 * Clear the auth cookie.
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: authCookieOptions.path });
  res.status(204).send();
});

/**
 * Return the currently authenticated user. Requires requireAuth.
 */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });

  if (!user) {
    throw new ApiError(401, "Not authenticated");
  }

  res.json({ data: toSafeUser(user) });
});
