import { z } from 'zod';

const localizedTextSchema = z.object({
  en: z.string().min(1, 'English text is required'),
  fr: z.string().optional(),
});

const optionalLocalizedTextSchema = z.object({
  en: z.string().optional(),
  fr: z.string().optional(),
});

export const CreateCategorySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  name: localizedTextSchema,
  description: localizedTextSchema,
  imageUrl: z.string().url().optional().nullable(),
  parentId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const UpdateCategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').optional(),
  name: optionalLocalizedTextSchema.optional(),
  description: optionalLocalizedTextSchema.optional(),
  imageUrl: z.string().url().nullable().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const ReorderCategorySchema = z.object({
  order: z.number().int().min(0),
});

export const CategoryIdParamSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
