import { Category, CategoryWithChildren } from '../entities/ecommerce/Category';

export interface ICategoryRepository {
  findById(id: number): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(activeOnly?: boolean): Promise<Category[]>;
  findWithChildren(): Promise<CategoryWithChildren[]>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: number, data: UpdateCategoryInput): Promise<Category>;
  delete(id: number): Promise<boolean>;
  reorder(id: number, order: number): Promise<void>;
}

export interface CreateCategoryInput {
  slug: string;
  name: { en: string; fr?: string };
  description: { en: string; fr?: string };
  imageUrl?: string | null;
  parentId?: number | null;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryInput {
  slug?: string;
  name?: { en?: string; fr?: string };
  description?: { en?: string; fr?: string };
  imageUrl?: string | null;
  parentId?: number | null;
  isActive?: boolean;
  order?: number;
}
