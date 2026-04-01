import { type Request, type Response, type NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ApiError } from './errorHandler';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));

        // Include detailed validation errors in development mode
        const message = process.env.NODE_ENV === 'development'
          ? `Validation failed: ${errorMessages.map((e) => `${e.path}: ${e.message}`).join(', ')}`
          : 'Validation failed';

        throw new ApiError(400, message, true);
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));

        // Include detailed validation errors in development mode
        const message = process.env.NODE_ENV === 'development'
          ? `Query validation failed: ${errorMessages.map((e) => `${e.path}: ${e.message}`).join(', ')}`
          : 'Query validation failed';

        throw new ApiError(400, message, true);
      }
      next(error);
    }
  };
};