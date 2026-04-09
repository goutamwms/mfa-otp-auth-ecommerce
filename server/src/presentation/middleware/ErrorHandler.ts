import { Response } from 'express';
import { AppError } from '../../domain/errors';

export const errorHandler = (
  error: Error,
  req: any,
  res: Response,
  next: any
): void => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
