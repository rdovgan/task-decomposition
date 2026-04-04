/**
 * @jest-environment node
 */

import { Request, Response, NextFunction } from "express";
import {
  isValidStatusTransition,
  getTransitionErrorMessage,
  validateTaskStatusTransition,
} from "../statusValidation";
import { ApiError } from "../errorHandler";
import { TaskStatus } from "../../../types";
import prisma from "../../lib/prisma";

// Mock the Prisma client
const mockTaskFindUnique = jest.fn();

jest.mock("../../lib/prisma", () => {
  return {
    __esModule: true,
    default: {
      task: {
        findUnique: mockTaskFindUnique,
      },
    },
  };
});

describe("Status Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: { id: "task-123" },
      body: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("isValidStatusTransition", () => {
    describe("TODO status transitions", () => {
      it("should allow TODO → IN_PROGRESS", () => {
        expect(isValidStatusTransition("TODO", "IN_PROGRESS")).toBe(true);
      });

      it("should allow TODO → CANCELLED", () => {
        expect(isValidStatusTransition("TODO", "CANCELLED")).toBe(true);
      });

      it("should reject TODO → IN_REVIEW", () => {
        expect(isValidStatusTransition("TODO", "IN_REVIEW")).toBe(false);
      });

      it("should reject TODO → BLOCKED", () => {
        expect(isValidStatusTransition("TODO", "BLOCKED")).toBe(false);
      });

      it("should reject TODO → DONE", () => {
        expect(isValidStatusTransition("TODO", "DONE")).toBe(false);
      });
    });

    describe("IN_PROGRESS status transitions", () => {
      it("should allow IN_PROGRESS → IN_REVIEW", () => {
        expect(isValidStatusTransition("IN_PROGRESS", "IN_REVIEW")).toBe(true);
      });

      it("should allow IN_PROGRESS → BLOCKED", () => {
        expect(isValidStatusTransition("IN_PROGRESS", "BLOCKED")).toBe(true);
      });

      it("should allow IN_PROGRESS → CANCELLED", () => {
        expect(isValidStatusTransition("IN_PROGRESS", "CANCELLED")).toBe(true);
      });

      it("should reject IN_PROGRESS → TODO", () => {
        expect(isValidStatusTransition("IN_PROGRESS", "TODO")).toBe(false);
      });

      it("should reject IN_PROGRESS → DONE", () => {
        expect(isValidStatusTransition("IN_PROGRESS", "DONE")).toBe(false);
      });
    });

    describe("IN_REVIEW status transitions", () => {
      it("should allow IN_REVIEW → DONE", () => {
        expect(isValidStatusTransition("IN_REVIEW", "DONE")).toBe(true);
      });

      it("should allow IN_REVIEW → IN_PROGRESS", () => {
        expect(isValidStatusTransition("IN_REVIEW", "IN_PROGRESS")).toBe(true);
      });

      it("should reject IN_REVIEW → TODO", () => {
        expect(isValidStatusTransition("IN_REVIEW", "TODO")).toBe(false);
      });

      it("should reject IN_REVIEW → BLOCKED", () => {
        expect(isValidStatusTransition("IN_REVIEW", "BLOCKED")).toBe(false);
      });
    });

    describe("BLOCKED status transitions", () => {
      it("should allow BLOCKED → IN_PROGRESS", () => {
        expect(isValidStatusTransition("BLOCKED", "IN_PROGRESS")).toBe(true);
      });

      it("should allow BLOCKED → CANCELLED", () => {
        expect(isValidStatusTransition("BLOCKED", "CANCELLED")).toBe(true);
      });

      it("should reject BLOCKED → TODO", () => {
        expect(isValidStatusTransition("BLOCKED", "TODO")).toBe(false);
      });

      it("should reject BLOCKED → IN_REVIEW", () => {
        expect(isValidStatusTransition("BLOCKED", "IN_REVIEW")).toBe(false);
      });

      it("should reject BLOCKED → DONE", () => {
        expect(isValidStatusTransition("BLOCKED", "DONE")).toBe(false);
      });
    });

    describe("DONE terminal state", () => {
      it("should reject DONE → TODO", () => {
        expect(isValidStatusTransition("DONE", "TODO")).toBe(false);
      });

      it("should reject DONE → IN_PROGRESS", () => {
        expect(isValidStatusTransition("DONE", "IN_PROGRESS")).toBe(false);
      });

      it("should reject DONE → any other status", () => {
        expect(isValidStatusTransition("DONE", "IN_REVIEW")).toBe(false);
        expect(isValidStatusTransition("DONE", "BLOCKED")).toBe(false);
        expect(isValidStatusTransition("DONE", "CANCELLED")).toBe(false);
      });
    });

    describe("CANCELLED terminal state", () => {
      it("should reject CANCELLED → TODO", () => {
        expect(isValidStatusTransition("CANCELLED", "TODO")).toBe(false);
      });

      it("should reject CANCELLED → IN_PROGRESS", () => {
        expect(isValidStatusTransition("CANCELLED", "IN_PROGRESS")).toBe(false);
      });

      it("should reject CANCELLED → any other status", () => {
        expect(isValidStatusTransition("CANCELLED", "IN_REVIEW")).toBe(false);
        expect(isValidStatusTransition("CANCELLED", "BLOCKED")).toBe(false);
        expect(isValidStatusTransition("CANCELLED", "DONE")).toBe(false);
      });
    });

    describe("No-op transitions", () => {
      it("should allow status to remain the same", () => {
        expect(isValidStatusTransition("TODO", "TODO")).toBe(true);
        expect(isValidStatusTransition("IN_PROGRESS", "IN_PROGRESS")).toBe(true);
        expect(isValidStatusTransition("DONE", "DONE")).toBe(true);
      });
    });
  });

  describe("getTransitionErrorMessage", () => {
    it("should provide helpful message for invalid transitions from non-terminal states", () => {
      const message = getTransitionErrorMessage("TODO", "DONE");
      expect(message).toContain("To Do");
      expect(message).toContain("Done");
      expect(message).toContain("In Progress");
      expect(message).toContain("Cancelled");
    });

    it("should indicate terminal state for DONE", () => {
      const message = getTransitionErrorMessage("DONE", "TODO");
      expect(message).toContain("terminal state");
      expect(message).toContain("cannot be changed");
    });

    it("should indicate terminal state for CANCELLED", () => {
      const message = getTransitionErrorMessage("CANCELLED", "TODO");
      expect(message).toContain("terminal state");
      expect(message).toContain("cannot be changed");
    });
  });

  describe("validateTaskStatusTransition middleware", () => {
    it("should skip validation if no status change is requested", async () => {
      mockRequest.body = { title: "Updated title" };

      await validateTaskStatusTransition(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockTaskFindUnique).not.toHaveBeenCalled();
    });

    it("should allow valid status transition", async () => {
      mockRequest.body = { status: "IN_PROGRESS" };
      mockTaskFindUnique.mockResolvedValue({ status: "TODO" });

      await validateTaskStatusTransition(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskFindUnique).toHaveBeenCalledWith({
        where: { id: "task-123" },
        select: { status: true },
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should reject invalid status transition", async () => {
      mockRequest.body = { status: "DONE" };
      mockTaskFindUnique.mockResolvedValue({ status: "TODO" });

      await expect(
        validateTaskStatusTransition(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow(ApiError);

      try {
        await validateTaskStatusTransition(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain("Invalid status transition");
      }
    });

    it("should throw 404 if task not found", async () => {
      mockRequest.body = { status: "IN_PROGRESS" };
      mockTaskFindUnique.mockResolvedValue(null);

      await expect(
        validateTaskStatusTransition(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow(ApiError);

      try {
        await validateTaskStatusTransition(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Task not found");
      }
    });

    it("should allow same status (no-op)", async () => {
      mockRequest.body = { status: "TODO" };
      mockTaskFindUnique.mockResolvedValue({ status: "TODO" });

      await validateTaskStatusTransition(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should reject transition from DONE terminal state", async () => {
      mockRequest.body = { status: "TODO" };
      mockTaskFindUnique.mockResolvedValue({ status: "DONE" });

      await expect(
        validateTaskStatusTransition(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow(ApiError);

      try {
        await validateTaskStatusTransition(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain("terminal state");
      }
    });

    it("should reject transition from CANCELLED terminal state", async () => {
      mockRequest.body = { status: "IN_PROGRESS" };
      mockTaskFindUnique.mockResolvedValue({ status: "CANCELLED" });

      await expect(
        validateTaskStatusTransition(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow(ApiError);

      try {
        await validateTaskStatusTransition(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain("terminal state");
      }
    });

    it("should handle database errors", async () => {
      mockRequest.body = { status: "IN_PROGRESS" };
      mockTaskFindUnique.mockRejectedValue(new Error("Database error"));

      await expect(
        validateTaskStatusTransition(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow(ApiError);

      try {
        await validateTaskStatusTransition(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (error: any) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toContain("Failed to validate status transition");
      }
    });
  });
});
