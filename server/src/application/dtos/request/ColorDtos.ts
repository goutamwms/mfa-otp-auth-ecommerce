import { z } from 'zod';

const localizedTextSchema = z.object({
  en: z.string().min(1, 'English text is required'),
  fr: z.string().min(1, 'French text is required'),
});

const optionalLocalizedTextSchema = z.object({
  en: z.string().optional(),
  fr: z.string().optional(),
});

export const CreateColorSchema = z.object({
  name: localizedTextSchema,
  code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color code must be a valid hex color'),
  isActive: z.boolean().default(true),
});

export const UpdateColorSchema = z.object({
  name: optionalLocalizedTextSchema.optional(),
  code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color code must be a valid hex color').optional(),
  isActive: z.boolean().optional(),
});

export const ColorIdParamSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()),
});

export type CreateColorInput = z.infer<typeof CreateColorSchema>;
export type UpdateColorInput = z.infer<typeof UpdateColorSchema>;
