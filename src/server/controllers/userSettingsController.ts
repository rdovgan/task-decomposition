import { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { encrypt, decrypt } from "../lib/encryption";

/**
 * Get user settings
 */
export const getUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  // Don't return the encrypted API key
  if (settings) {
    res.json({
      data: {
        id: settings.id,
        userId: settings.userId,
        hasApiKey: !!settings.anthropicApiKey,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    });
  } else {
    res.json({
      data: {
        id: null,
        userId,
        hasApiKey: false,
      },
    });
  }
});

/**
 * Update user settings (API key)
 */
export const updateUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { anthropicApiKey } = req.body;

  if (!anthropicApiKey) {
    throw new ApiError(400, "API key is required");
  }

  // Validate the API key by making a test request
  const client = new Anthropic({
    apiKey: anthropicApiKey,
    timeout: 10000,
  });

  try {
    await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 10,
      messages: [{ role: "user", content: "test" }],
    });
  } catch (error: any) {
    console.error("API key validation failed:", error);
    if (error.status === 401) {
      throw new ApiError(401, "Invalid Anthropic API key");
    }
    throw new ApiError(400, `API key validation failed: ${error.message}`);
  }

  // Encrypt and store the API key
  const encryptedKey = encrypt(anthropicApiKey);

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      anthropicApiKey: encryptedKey,
    },
    update: {
      anthropicApiKey: encryptedKey,
    },
  });

  res.json({
    data: {
      id: settings.id,
      userId: settings.userId,
      hasApiKey: true,
      updatedAt: settings.updatedAt,
    },
  });
});

/**
 * Delete API key from user settings
 */
export const deleteApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  await prisma.userSettings.update({
    where: { userId },
    data: {
      anthropicApiKey: null,
    },
  });

  res.status(204).send();
});

/**
 * Validate API key without saving
 */
export const validateApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    throw new ApiError(400, "API key is required");
  }

  const client = new Anthropic({
    apiKey,
    timeout: 10000,
  });

  try {
    await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 10,
      messages: [{ role: "user", content: "test" }],
    });

    res.json({
      data: {
        valid: true,
        message: "API key is valid",
      },
    });
  } catch (error: any) {
    console.error("API key validation failed:", error);
    res.status(400).json({
      data: {
        valid: false,
        message: error.message || "Invalid API key",
      },
    });
  }
});
