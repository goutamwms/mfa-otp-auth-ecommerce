import { z } from 'zod';

export const DeleteUserParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()),
});

export type DeleteUserParams = z.infer<typeof DeleteUserParamsSchema>;
