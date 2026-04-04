/**
 * @jest-environment node
 */

import { Request, Response, NextFunction } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../projectController";
import { ApiError } from "../../middleware/errorHandler";
import prisma from "../../lib/prisma";

// Mock Prisma
const mockProjectFindMany = prisma.project.findMany as jest.Mock;
const mockProjectFindUnique = prisma.project.findUnique as jest.Mock;
const mockProjectCreate = prisma.project.create as jest.Mock;
const mockProjectUpdate = prisma.project.update as jest.Mock;
const mockProjectDelete = prisma.project.delete as jest.Mock;
const mockProjectCount = prisma.project.count as jest.Mock;

jest.mock("../../lib/prisma", () => {
  const mockProjectFindMany = jest.fn();
  const mockProjectFindUnique = jest.fn();
  const mockProjectCreate = jest.fn();
  const mockProjectUpdate = jest.fn();
  const mockProjectDelete = jest.fn();
  const mockProjectCount = jest.fn();

  return {
    __esModule: true,
    default: {
      project: {
        findMany: mockProjectFindMany,
        findUnique: mockProjectFindUnique,
        create: mockProjectCreate,
        update: mockProjectUpdate,
        delete: mockProjectDelete,
        count: mockProjectCount,
      },
    },
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

describe("Project Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProjects", () => {
    it("returns projects with pagination", async () => {
      const mockProjects = [
        {
          id: "1",
          name: "Project 1",
          status: "ACTIVE",
          owner: { id: "user-1", name: "John Doe", email: "john@example.com" },
          _count: { epics: 3 },
        },
        {
          id: "2",
          name: "Project 2",
          status: "ACTIVE",
          owner: { id: "user-1", name: "John Doe", email: "john@example.com" },
          _count: { epics: 1 },
        },
      ];

      mockProjectFindMany.mockResolvedValue(mockProjects);
      mockProjectCount.mockResolvedValue(2);

      const req = {
        query: { page: "1", limit: "10" },
      } as unknown as Request;

      const res = mockResponse();

      await getProjects(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({
        data: mockProjects,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it("filters projects by status", async () => {
      mockProjectFindMany.mockResolvedValue([]);
      mockProjectCount.mockResolvedValue(0);

      const req = {
        query: { status: "ACTIVE" },
      } as unknown as Request;

      const res = mockResponse();

      await getProjects(req, res, jest.fn() as NextFunction);

      expect(mockProjectFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "ACTIVE" },
        })
      );
    });

    it("filters projects by ownerId", async () => {
      mockProjectFindMany.mockResolvedValue([]);
      mockProjectCount.mockResolvedValue(0);

      const req = {
        query: { ownerId: "user-1" },
      } as unknown as Request;

      const res = mockResponse();

      await getProjects(req, res, jest.fn() as NextFunction);

      expect(mockProjectFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: "user-1" },
        })
      );
    });

    it("orders projects by updatedAt descending", async () => {
      mockProjectFindMany.mockResolvedValue([]);
      mockProjectCount.mockResolvedValue(0);

      const req = { query: {} } as unknown as Request;
      const res = mockResponse();

      await getProjects(req, res, jest.fn() as NextFunction);

      expect(mockProjectFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: "desc" },
        })
      );
    });
  });

  describe("getProjectById", () => {
    it("returns a single project with epics", async () => {
      const mockProject = {
        id: "1",
        name: "Test Project",
        description: "A test project",
        status: "ACTIVE",
        owner: { id: "user-1", name: "John Doe", email: "john@example.com" },
        epics: [
          {
            id: "epic-1",
            title: "Epic 1",
            _count: { tasks: 5 },
          },
        ],
      };

      mockProjectFindUnique.mockResolvedValue(mockProject);

      const req = {
        params: { id: "1" },
      } as unknown as Request;

      const res = mockResponse();

      await getProjectById(req, res, jest.fn() as NextFunction);

      expect(res.json).toHaveBeenCalledWith({
        data: mockProject,
      });
    });

    it("throws 404 when project not found", async () => {
      mockProjectFindUnique.mockResolvedValue(null);

      const req = {
        params: { id: "nonexistent" },
      } as unknown as Request;

      const res = mockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await expect(getProjectById(req, res, next)).rejects.toThrow(ApiError);
    });

    it("includes epics ordered by createdAt descending", async () => {
      mockProjectFindUnique.mockResolvedValue({
        id: "1",
        name: "Test Project",
        owner: { id: "user-1", name: "John Doe", email: "john@example.com" },
        epics: [],
      });

      const req = {
        params: { id: "1" },
      } as unknown as Request;

      const res = mockResponse();

      await getProjectById(req, res, jest.fn() as NextFunction);

      expect(mockProjectFindUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.objectContaining({
          epics: expect.objectContaining({
            orderBy: { createdAt: "desc" },
          }),
        }),
      });
    });
  });

  describe("createProject", () => {
    it("creates a new project", async () => {
      const mockProject = {
        id: "1",
        name: "New Project",
        description: "A new project",
        ownerId: "user-1",
        owner: { id: "user-1", name: "John Doe", email: "john@example.com" },
      };

      mockProjectCreate.mockResolvedValue(mockProject);

      const req = {
        body: {
          name: "New Project",
          description: "A new project",
          ownerId: "user-1",
        },
      } as unknown as Request;

      const res = mockResponse();

      await createProject(req, res, jest.fn() as NextFunction);

      expect(mockProjectCreate).toHaveBeenCalledWith({
        data: {
          name: "New Project",
          description: "A new project",
          ownerId: "user-1",
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: mockProject,
      });
    });
  });

  describe("updateProject", () => {
    it("updates a project", async () => {
      const mockProject = {
        id: "1",
        name: "Updated Project",
        description: "Updated description",
        status: "ACTIVE",
        ownerId: "user-1",
        owner: { id: "user-1", name: "John Doe", email: "john@example.com" },
      };

      mockProjectUpdate.mockResolvedValue(mockProject);

      const req = {
        params: { id: "1" },
        body: {
          name: "Updated Project",
          description: "Updated description",
        },
      } as unknown as Request;

      const res = mockResponse();

      await updateProject(req, res, jest.fn() as NextFunction);

      expect(mockProjectUpdate).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          name: "Updated Project",
          description: "Updated description",
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        data: mockProject,
      });
    });

    it("allows partial updates", async () => {
      const mockProject = {
        id: "1",
        name: "Project 1",
        status: "ARCHIVED",
        ownerId: "user-1",
        owner: { id: "user-1", name: "John Doe", email: "john@example.com" },
      };

      mockProjectUpdate.mockResolvedValue(mockProject);

      const req = {
        params: { id: "1" },
        body: { status: "ARCHIVED" },
      } as unknown as Request;

      const res = mockResponse();

      await updateProject(req, res, jest.fn() as NextFunction);

      expect(mockProjectUpdate).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { status: "ARCHIVED" },
        include: expect.anything(),
      });
    });
  });

  describe("deleteProject", () => {
    it("deletes a project", async () => {
      mockProjectDelete.mockResolvedValue({ id: "1" });

      const req = {
        params: { id: "1" },
      } as unknown as Request;

      const res = mockResponse();

      await deleteProject(req, res, jest.fn() as NextFunction);

      expect(mockProjectDelete).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
