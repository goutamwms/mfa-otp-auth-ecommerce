export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<E extends AppError = AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

import { AppError } from '../../domain/errors';
