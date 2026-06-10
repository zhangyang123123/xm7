import { Response } from 'express';
import { ApiResponse, PaginationInfo } from '../types';

export function success<T>(res: Response, data: T, statusCode = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(body);
}

export function successWithPagination<T>(
  res: Response,
  data: T,
  pagination: PaginationInfo,
  statusCode = 200,
): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    pagination,
  };
  return res.status(statusCode).json(body);
}

export function error(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: any,
): Response {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };
  return res.status(statusCode).json(body);
}
