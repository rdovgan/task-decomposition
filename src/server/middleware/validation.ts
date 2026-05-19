import { type Request, type Response, type NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiError } from "./errorHandler";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(e => ({
          path: e.path.map(String).join("."),
          message: e.message,
        }));

        // Include detailed validation errors in development mode
        const message =
          process.env.NODE_ENV === "development"
            ? `Validation failed: ${errorMessages.map(e => `${e.path}: ${e.message}`).join(", ")}`
            : "Validation failed";

        throw new ApiError(400, message, true);
      }
      // Handle other errors or errors without proper structure
      const msg = error instanceof Error ? error.message : "Validation failed";
      throw new ApiError(400, msg, true);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(e => ({
          path: e.path.map(String).join("."),
          message: e.message,
        }));

        // Include detailed validation errors in development mode
        const message =
          process.env.NODE_ENV === "development"
            ? `Query validation failed: ${errorMessages.map(e => `${e.path}: ${e.message}`).join(", ")}`
            : "Query validation failed";

        throw new ApiError(400, message, true);
      }
      // Handle other errors or errors without proper structure
      const msg = error instanceof Error ? error.message : "Query validation failed";
      throw new ApiError(400, msg, true);
    }
  };
};
