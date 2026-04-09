import { LocalizedText, Translation } from './Translation';
import { ProductImage } from './ProductImage';
import { ProductColor } from './Color';
import { Tag } from './Tag';

export interface Product {
  id: number;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  basePrice: number;
  discountedPrice: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  categoryIds: number[];
  colorOptions: ProductColor[];
  images: ProductImage[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  basePrice: number;
  discountedPrice: number | null;
  finalPrice: number;
  discountPercentage: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
  categoryNames: string[];
  tagNames: string[];
  createdAt: Date;
}

export interface ProductFilters {
  categoryId?: number;
  tagId?: number;
  colorId?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  language?: 'en' | 'fr';
}

export function createProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function calculateFinalPrice(basePrice: number, discountedPrice: number | null): number {
  return discountedPrice ?? basePrice;
}

export function calculateDiscountPercentage(basePrice: number, discountedPrice: number): number {
  if (basePrice <= 0) return 0;
  return Math.round(((basePrice - discountedPrice) / basePrice) * 100);
}
