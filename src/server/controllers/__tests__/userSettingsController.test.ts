/**
 * @jest-environment node
 */

import { Request, Response, NextFunction } from "express";
import {
  getUserSettings,
  updateUserSettings,
  deleteApiKey,
  validateApiKey,
} from "../userSettingsController";
import { ApiError } from "../../middleware/errorHandler";
import prisma from "../../lib/prisma";

// Mock Prisma
const mockUserSettingsFindUnique = prisma.userSettings.findUnique as jest.Mock;
const mockUserSettingsUpsert = prisma.userSettings.upsert as jest.Mock;
const mockUserSettingsUpdate = prisma.userSettings.update as jest.Mock;

jest.mock("../../lib/prisma", () => {
  const mockUserSettingsFindUnique = jest.fn();
  const mockUserSettingsUpsert = jest.fn();
  const mockUserSettingsUpdate = jest.fn();

  return {
    __esModule: true,
    default: {
      userSettings: {
        findUnique: mockUserSettingsFindUnique,
        upsert: mockUserSettingsUpsert,
        update: mockUserSettingsUpdate,
      },
    },
  };
});

// Mock encryption
jest.mock("../../lib/encryption", () => ({
  encrypt: jest.fn(key => `encrypted-${key}`),
  decrypt: jest.fn(key => key.replace("encrypted-", "")),
}));

// Mock Anthropic SDK
jest.mock("@anthropic-ai/sdk", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

const mockResponse = () => {
  const res: Partial<Response> = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

describe("User Settings Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserSettings", () => {
    it("returns user settings with hasApiKey true when API key exists", async () => {
      const mockSettings = {
        id: "settings-1",
        userId: "user-1",
        anthropicApiKey: "encrypted-key",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserSettingsFindUnique.mockResolvedValue(mockSettings);

      const req = {
        params: { userId: "user-1" },
      } as unknown as Request;

      const res = mockResponse();

      await getUserSettings(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: "settings-1",
          userId: "user-1",
          hasApiKey: true,
          createdAt: mockSettings.createdAt,
          updatedAt: mockSettings.updatedAt,
        },
      });

      // Ensure API key is not exposed
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          anthropicApiKey: expect.any(String),
        })
      );
    });

    it("returns user settings with hasApiKey false when no API key", async () => {
      mockUserSettingsFindUnique.mockResolvedValue(null);

      const req = {
        params: { userId: "user-1" },
      } as unknown as Request;

      const res = mockResponse();

      await getUserSettings(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: null,
          userId: "user-1",
          hasApiKey: false,
        },
      });
    });
  });

  describe("updateUserSettings", () => {
    const Anthropic = require("@anthropic-ai/sdk").default;

    it("validates API key and saves encrypted version", async () => {
      const mockSettings = {
        id: "settings-1",
        userId: "user-1",
        anthropicApiKey: "encrypted-test-api-key",
        updatedAt: new Date(),
      };

      // Mock successful API validation
      const mockClient = new Anthropic();
      (mockClient.messages.create as jest.Mock).mockResolvedValue({
        content: [{ type: "text", text: "test" }],
      });

      mockUserSettingsUpsert.mockResolvedValue(mockSettings);

      const req = {
        params: { userId: "user-1" },
        body: { anthropicApiKey: "test-api-key" },
      } as unknown as Request;

      const res = mockResponse();

      await updateUserSettings(req, res, jest.fn() as NextFunction);

      expect(mockClient.messages.create).toHaveBeenCalledWith({
        model: "claude-sonnet-4-6",
        max_tokens: 10,
        messages: [{ role: "user", content: "test" }],
      });

      expect(mockUserSettingsUpsert).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        create: {
          userId: "user-1",
          anthropicApiKey: "encrypted-test-api-key",
        },
        update: {
          anthropicApiKey: "encrypted-test-api-key",
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: "settings-1",
          userId: "user-1",
          hasApiKey: true,
          updatedAt: mockSettings.updatedAt,
        },
      });
    });

    it("throws 400 when API key is missing", async () => {
      const req = {
        params: { userId: "user-1" },
        body: {},
      } as unknown as Request;

      const res = mockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await expect(updateUserSettings(req, res, next)).rejects.toThrow(ApiError);
    });

    it("throws 401 when API key is invalid", async () => {
      const mockClient = new Anthropic();
      const error: any = new Error("Unauthorized");
      error.status = 401;
      (mockClient.messages.create as jest.Mock).mockRejectedValue(error);

      const req = {
        params: { userId: "user-1" },
        body: { anthropicApiKey: "invalid-key" },
      } as unknown as Request;

      const res = mockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await expect(updateUserSettings(req, res, next)).rejects.toThrow(ApiError);
    });

    it("throws 400 when API key validation fails", async () => {
      const mockClient = new Anthropic();
      const error: any = new Error("Network error");
      (mockClient.messages.create as jest.Mock).mockRejectedValue(error);

      const req = {
        params: { userId: "user-1" },
        body: { anthropicApiKey: "test-key" },
      } as unknown as Request;

      const res = mockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await expect(updateUserSettings(req, res, next)).rejects.toThrow(ApiError);
    });
  });

  describe("deleteApiKey", () => {
    it("removes API key from user settings", async () => {
      mockUserSettingsUpdate.mockResolvedValue({
        id: "settings-1",
        userId: "user-1",
        anthropicApiKey: null,
      });

      const req = {
        params: { userId: "user-1" },
      } as unknown as Request;

      const res = mockResponse();

      await deleteApiKey(req, res, jest.fn() as NextFunction);

      expect(mockUserSettingsUpdate).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { anthropicApiKey: null },
      });

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("validateApiKey", () => {
    const Anthropic = require("@anthropic-ai/sdk").default;

    it("returns valid: true for a good API key", async () => {
      const mockClient = new Anthropic();
      (mockClient.messages.create as jest.Mock).mockResolvedValue({
        content: [{ type: "text", text: "test" }],
      });

      const req = {
        body: { apiKey: "test-api-key" },
      } as unknown as Request;

      const res = mockResponse();

      await validateApiKey(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({
        data: {
          valid: true,
          message: "API key is valid",
        },
      });
    });

    it("returns valid: false for invalid API key", async () => {
      const mockClient = new Anthropic();
      const error: any = new Error("Invalid API key");
      (mockClient.messages.create as jest.Mock).mockRejectedValue(error);

      const req = {
        body: { apiKey: "invalid-key" },
      } as unknown as Request;

      const res = mockResponse();

      await validateApiKey(req, res, jest.fn() as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          valid: false,
          message: "Invalid API key",
        },
      });
    });

    it("throws 400 when API key is missing", async () => {
      const req = {
        body: {},
      } as unknown as Request;

      const res = mockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await expect(validateApiKey(req, res, next)).rejects.toThrow(ApiError);
    });
  });
});
