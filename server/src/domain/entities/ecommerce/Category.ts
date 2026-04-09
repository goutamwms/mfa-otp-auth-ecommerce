import { LocalizedText } from './Translation';

export interface Category {
  id: number;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  imageUrl: string | null;
  parentId: number | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
