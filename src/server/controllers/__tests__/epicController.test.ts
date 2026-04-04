/**
 * @jest-environment node
 */

import { Request, Response, NextFunction } from "express";
import {
  getEpics,
  getEpicById,
  createEpic,
  updateEpic,
  deleteEpic,
  aiDecomposeEpic,
} from "../epicController";
import { ApiError } from "../../middleware/errorHandler";
import prisma from "../../lib/prisma";

// Mock Prisma
const mockEpicFindMany = prisma.epic.findMany as jest.Mock;
const mockEpicFindUnique = prisma.epic.findUnique as jest.Mock;
const mockEpicCreate = prisma.epic.create as jest.Mock;
const mockEpicUpdate = prisma.epic.update as jest.Mock;
const mockEpicDelete = prisma.epic.delete as jest.Mock;
const mockEpicCount = prisma.epic.count as jest.Mock;
const mockUserSettingsFindUnique = prisma.userSettings.findUnique as jest.Mock;

jest.mock("../../lib/prisma", () => {
  const mockEpicFindMany = jest.fn();
  const mockEpicFindUnique = jest.fn();
  const mockEpicCreate = jest.fn();
  const mockEpicUpdate = jest.fn();
  const mockEpicDelete = jest.fn();
  const mockEpicCount = jest.fn();
  const mockUserSettingsFindUnique = jest.fn();

  return {
    __esModule: true,
    default: {
      epic: {
        findMany: mockEpicFindMany,
        findUnique: mockEpicFindUnique,
        create: mockEpicCreate,
        update: mockEpicUpdate,
        delete: mockEpicDelete,
        count: mockEpicCount,
      },
      userSettings: {
        findUnique: mockUserSettingsFindUnique,
      },
    },
  };
});

// Mock encryption
jest.mock("../../lib/encryption", () => ({
  decrypt: jest.fn(key => `decrypted-${key}`),
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

describe("Epic Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-api-key";
    process.env.ANTHROPIC_MODEL = "claude-sonnet-4-6";
  });

  describe("getEpics", () => {
    it("returns epics with pagination", async () => {
      const mockEpics = [
        {
          id: "1",
          title: "Epic 1",
          status: "TODO",
          project: { id: "project-1", name: "Test Project" },
          _count: { tasks: 5 },
        },
      ];

      mockEpicFindMany.mockResolvedValue(mockEpics);
      mockEpicCount.mockResolvedValue(1);

      const req = { query: { page: "1", limit: "10" } } as unknown as Request;
      const res = mockResponse();

      await getEpics(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({
        data: mockEpics,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });

    it("filters epics by projectId", async () => {
      mockEpicFindMany.mockResolvedValue([]);
      mockEpicCount.mockResolvedValue(0);

      const req = { query: { projectId: "project-1" } } as unknown as Request;
      const res = mockResponse();

      await getEpics(req, res, jest.fn() as NextFunction);

      expect(mockEpicFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: "project-1" },
        })
      );
    });

    it("filters epics by status", async () => {
      mockEpicFindMany.mockResolvedValue([]);
      mockEpicCount.mockResolvedValue(0);

      const req = { query: { status: "IN_PROGRESS" } } as unknown as Request;
      const res = mockResponse();

      await getEpics(req, res, jest.fn() as NextFunction);

      expect(mockEpicFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "IN_PROGRESS" },
        })
      );
    });
  });

  describe("getEpicById", () => {
    it("returns a single epic with tasks", async () => {
      const mockEpic = {
        id: "1",
        title: "Test Epic",
        status: "TODO",
        project: { id: "project-1", name: "Test Project" },
        tasks: [],
      };

      mockEpicFindUnique.mockResolvedValue(mockEpic);

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await getEpicById(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({ data: mockEpic });
    });

    it("throws 404 when epic not found", async () => {
      mockEpicFindUnique.mockResolvedValue(null);

      const req = { params: { id: "nonexistent" } } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await expect(getEpicById(req, res, next)).rejects.toThrow(ApiError);
    });
  });

  describe("createEpic", () => {
    it("creates a new epic", async () => {
      const mockEpic = {
        id: "1",
        title: "New Epic",
        projectId: "project-1",
        project: { id: "project-1", name: "Test Project" },
      };

      mockEpicCreate.mockResolvedValue(mockEpic);

      const req = {
        body: { title: "New Epic", projectId: "project-1" },
      } as unknown as Request;
      const res = mockResponse();

      await createEpic(req, res, jest.fn() as NextFunction);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: mockEpic });
    });
  });

  describe("updateEpic", () => {
    it("updates an epic", async () => {
      const mockEpic = {
        id: "1",
        title: "Updated Epic",
        status: "IN_PROGRESS",
        project: { id: "project-1", name: "Test Project" },
      };

      mockEpicUpdate.mockResolvedValue(mockEpic);

      const req = {
        params: { id: "1" },
        body: { title: "Updated Epic", status: "IN_PROGRESS" },
      } as unknown as Request;
      const res = mockResponse();

      await updateEpic(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({ data: mockEpic });
    });
  });

  describe("deleteEpic", () => {
    it("deletes an epic", async () => {
      mockEpicDelete.mockResolvedValue({ id: "1" });

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await deleteEpic(req, res, jest.fn() as NextFunction);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("aiDecomposeEpic", () => {
    const Anthropic = require("@anthropic-ai/sdk").default;

    it("decomposes an epic into tasks using AI", async () => {
      const mockEpic = {
        id: "epic-1",
        title: "Build User Authentication",
        description: "Implement login, signup, and password reset",
        project: {
          id: "project-1",
          name: "Web App",
          description: "A web application",
        },
      };

      mockEpicFindUnique.mockResolvedValue(mockEpic);

      const mockAIResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              tasks: [
                {
                  title: "Setup authentication database",
                  description: "Create user table with required fields",
                  storyPoints: 3,
                  priority: "HIGH",
                },
                {
                  title: "Implement login endpoint",
                  description: "Create POST /login with JWT authentication",
                  storyPoints: 5,
                  priority: "HIGH",
                },
              ],
            }),
          },
        ],
      };

      const mockClient = new Anthropic();
      (mockClient.messages.create as jest.Mock).mockResolvedValue(mockAIResponse);

      const req = {
        params: { id: "epic-1" },
        body: {},
      } as unknown as Request;
      const res = mockResponse();

      await aiDecomposeEpic(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalled();
      const responseArgs = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseArgs.data).toHaveLength(2);
      expect(responseArgs.meta.epicId).toBe("epic-1");
    });

    it("throws 404 when epic not found", async () => {
      mockEpicFindUnique.mockResolvedValue(null);

      const req = {
        params: { id: "nonexistent" },
        body: {},
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await expect(aiDecomposeEpic(req, res, next)).rejects.toThrow(ApiError);
    });

    it("uses custom prompt when provided", async () => {
      const mockEpic = {
        id: "epic-1",
        title: "Test Epic",
        description: "Test Description",
        project: { id: "project-1", name: "Test Project" },
      };

      mockEpicFindUnique.mockResolvedValue(mockEpic);

      const mockAIResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({ tasks: [] }),
          },
        ],
      };

      const mockClient = new Anthropic();
      (mockClient.messages.create as jest.Mock).mockResolvedValue(mockAIResponse);

      const req = {
        params: { id: "epic-1" },
        body: { customPrompt: "Custom decomposition request" },
      } as unknown as Request;
      const res = mockResponse();

      await aiDecomposeEpic(req, res, jest.fn() as NextFunction);

      expect(mockClient.messages.create).toHaveBeenCalled();
      const callArgs = (mockClient.messages.create as jest.Mock).mock.calls[0];
      expect(callArgs[0].messages[0].content).toContain("Custom decomposition request");
    });
  });
});
