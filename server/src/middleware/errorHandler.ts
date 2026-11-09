import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
}

function handleCastError(err: MongoError): AppError {
  return new AppError(`Invalid value for field: ${err.path ?? 'unknown'}.`, 400);
}

function handleDuplicateKey(err: MongoError): AppError {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  return new AppError(`Duplicate value for ${field}. Please use a different value.`, 409);
}

function handleValidationError(err: MongoError): AppError {
  return new AppError(`Validation error: ${err.message}`, 400);
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let error = err as AppError;

  if (err.name === 'CastError') {
    error = handleCastError(err as MongoError);
  }

  if ((err as MongoError).code === 11000) {
    error = handleDuplicateKey(err as MongoError);
  }

  if (err.name === 'ValidationError') {
    error = handleValidationError(err as MongoError);
  }

  if (err instanceof ZodError) {
    error = new AppError(err.errors.map((e) => e.message).join(', '), 400);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please log in again.', 401);
  }

  const statusCode = error.statusCode ?? 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (statusCode >= 500 || !error.isOperational) {
    logger.error('Unexpected server error', {
      message: err.message,
      stack: isProd ? undefined : err.stack,
      statusCode,
    });
  }

  res.status(statusCode).json({
    status: error.status ?? 'error',
    message: isProd && !error.isOperational ? 'Something went wrong. Please try again later.' : error.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
}
