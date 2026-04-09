import { z } from 'zod';

const localizedTextSchema = z.object({
  en: z.string().min(1, 'English text is required'),
  fr: z.string().min(1, 'French text is required'),
});

const optionalLocalizedTextSchema = z.object({
  en: z.string().optional(),
  fr: z.string().optional(),
});

const imageInputSchema = z.object({
  url: z.string().url(),
  altText: z.string().optional(),
  colorId: z.number().int().positive().optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).optional(),
});

const colorInputSchema = z.object({
  colorId: z.number().int().positive(),
  priceModifier: z.number().min(0).default(0),
});

export const CreateProductSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  name: localizedTextSchema,
  description: localizedTextSchema,
  basePrice: z.number().positive('Price must be positive'),
  discountedPrice: z.number().min(0).nullable().optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  categoryIds: z.array(z.number().int().positive()).optional(),
  colorOptions: z.array(colorInputSchema).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(imageInputSchema).optional(),
});

export const UpdateProductSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').optional(),
  name: optionalLocalizedTextSchema.optional(),
  description: optionalLocalizedTextSchema.optional(),
  basePrice: z.number().positive().optional(),
  discountedPrice: z.number().min(0).nullable().optional(),
  sku: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const AddProductImagesSchema = z.object({
  images: z.array(imageInputSchema).min(1, 'At least one image is required'),
});

export const SetProductCategoriesSchema = z.object({
  categoryIds: z.array(z.number().int().positive()),
});

export const SetProductColorsSchema = z.object({
  colors: z.array(colorInputSchema),
});

export const SetProductTagsSchema = z.object({
  tags: z.array(z.string()),
});

export const ProductFiltersSchema = z.object({
  categoryId: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).optional(),
  tagId: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).optional(),
  colorId: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).optional(),
  minPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().optional(),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  language: z.enum(['en', 'fr']).default('en'),
});

export const ProductIdParamSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()),
});

export const ImageIdParamSchema = z.object({
  imageId: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
