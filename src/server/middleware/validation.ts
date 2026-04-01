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

        throw new ApiError(400, 'Validation failed', true);
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
        throw new ApiError(400, 'Query validation failed', true);
      }
      next(error);
    }
  };
};
