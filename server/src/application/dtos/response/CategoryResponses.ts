import { Category, CategoryWithChildren } from '../../../domain/entities/ecommerce';
import { getTranslation, SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';

export interface CategoryResponse {
  id: number;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  parentId: number | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CategoryListResponse {
  categories: CategoryResponse[];
}

export interface CategoryTreeResponse {
  categories: CategoryWithChildrenResponse[];
}

export interface CategoryWithChildrenResponse extends CategoryResponse {
  children: CategoryWithChildrenResponse[];
}

export function toCategoryResponse(category: Category, lang: SupportedLanguage = 'en'): CategoryResponse {
  return {
    id: category.id,
    slug: category.slug,
    name: getTranslation(category.name, lang),
    description: getTranslation(category.description, lang),
    imageUrl: category.imageUrl,
    parentId: category.parentId,
    isActive: category.isActive,
    order: category.order,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt?.toISOString() || null,
  };
}

export function toCategoryWithChildrenResponse(category: CategoryWithChildren, lang: SupportedLanguage = 'en'): CategoryWithChildrenResponse {
  return {
    ...toCategoryResponse(category, lang),
    children: category.children.map(child => toCategoryWithChildrenResponse(child, lang)),
  };
}

export function toCategoryListResponse(categories: Category[], lang: SupportedLanguage = 'en'): CategoryListResponse {
  return {
    categories: categories.map(c => toCategoryResponse(c, lang)),
  };
}

export function toCategoryTreeResponse(categories: CategoryWithChildren[], lang: SupportedLanguage = 'en'): CategoryTreeResponse {
  return {
    categories: categories.map(c => toCategoryWithChildrenResponse(c, lang)),
  };
}
