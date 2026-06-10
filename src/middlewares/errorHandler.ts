import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { error as sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  console.error('Unexpected error:', err);
  return sendError(res, 'INTERNAL_ERROR', 'Internal server error', 500);
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  return sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
}
