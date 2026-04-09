import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../domain/errors';

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new ValidationError(message);
  }
  return result.data;
}

export function asyncValidate<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<T> {
  return new Promise((resolve, reject) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      reject(new ValidationError(message));
    } else {
      resolve(result.data);
    }
  });
}
