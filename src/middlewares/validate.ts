import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({
      field: (e as any).path || (e as any).param || 'unknown',
      message: e.msg,
    }));
    const firstMsg = details[0]?.message || 'Validation failed';
    throw new ValidationError(firstMsg, details);
  }
  next();
}
