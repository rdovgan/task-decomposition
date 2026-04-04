import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "./errorHandler";
import { TaskStatus } from "../../types";

/**
 * Valid status transitions for tasks
 *
 * TODO → IN_PROGRESS, CANCELLED
 * IN_PROGRESS → IN_REVIEW, BLOCKED, CANCELLED
 * IN_REVIEW → DONE, IN_PROGRESS
 * BLOCKED → IN_PROGRESS, CANCELLED
 * DONE → (no transitions, terminal state)
 * CANCELLED → (no transitions, terminal state)
 */
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_REVIEW", "BLOCKED", "CANCELLED"],
  IN_REVIEW: ["DONE", "IN_PROGRESS"],
  BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  DONE: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Check if a status transition is valid
 *
 * @param currentStatus - The current status of the task
 * @param newStatus - The new status being requested
 * @returns true if the transition is valid, false otherwise
 */
export const isValidStatusTransition = (
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean => {
  // If status is not changing, it's valid (no-op)
  if (currentStatus === newStatus) {
    return true;
  }

  // Check if the transition is in the valid transitions list
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
};

/**
 * Get a user-friendly error message for an invalid status transition
 *
 * @param currentStatus - The current status of the task
 * @param newStatus - The new status being requested
 * @returns A descriptive error message
 */
export const getTransitionErrorMessage = (
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): string => {
  const statusNames: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    BLOCKED: "Blocked",
    DONE: "Done",
    CANCELLED: "Cancelled",
  };

  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (allowedTransitions.length === 0) {
    return `Cannot change status from "${statusNames[currentStatus]}" to "${statusNames[newStatus]}". "${statusNames[currentStatus]}" is a terminal state and cannot be changed.`;
  }

  const allowedNames = allowedTransitions.map(s => statusNames[s]).join(", ");
  return `Invalid status transition from "${statusNames[currentStatus]}" to "${statusNames[newStatus]}". Valid transitions are: ${allowedNames}.`;
};

/**
 * Express middleware to validate task status transitions
 *
 * This middleware fetches the current task from the database and validates
 * that any status change follows the defined workflow rules.
 *
 * Must be used after authentication and task lookup middleware
 * that sets req.task with the current task object.
 *
 * @throws {ApiError} 400 Bad Request if the status transition is invalid
 */
export const validateTaskStatusTransition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // If no status change is requested, skip validation
    if (!status) {
      return next();
    }

    // Import prisma here to avoid initialization issues
    const prisma = (await import("../lib/prisma")).default;

    // Fetch the current task to get its existing status
    const task = await prisma.task.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Validate the status transition
    const isValid = isValidStatusTransition(task.status as TaskStatus, status as TaskStatus);

    if (!isValid) {
      const errorMessage = getTransitionErrorMessage(
        task.status as TaskStatus,
        status as TaskStatus
      );
      throw new ApiError(400, errorMessage, true);
    }

    // Transition is valid, proceed to next middleware
    next();
  } catch (error: any) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle unexpected errors
    throw new ApiError(500, "Failed to validate status transition");
  }
};
