import { Product, ProductListItem, ProductFilters } from '../entities/ecommerce/Product';
import { ProductImage } from '../entities/ecommerce/ProductImage';
import { ProductColor } from '../entities/ecommerce/Color';

export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(filters?: ProductFilters): Promise<{ products: ProductListItem[]; total: number }>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: number, data: UpdateProductInput): Promise<Product>;
  delete(id: number): Promise<boolean>;
  
  // Image management
  addImages(productId: number, images: AddImageInput[]): Promise<ProductImage[]>;
  removeImage(imageId: number): Promise<boolean>;
  setPrimaryImage(imageId: number, productId: number): Promise<void>;
  
  // Category relations
  setCategories(productId: number, categoryIds: number[]): Promise<void>;
  
  // Color relations
  setColors(productId: number, colors: ProductColorInput[]): Promise<void>;
  
  // Tag relations
  setTags(productId: number, tagIds: number[] | string[], byName?: boolean): Promise<void>;
}

export interface CreateProductInput {
  slug: string;
  name: { en: string; fr?: string };
  description: { en: string; fr?: string };
  basePrice: number;
  discountedPrice?: number | null;
  sku: string;
  stock?: number;
  isActive?: boolean;
  categoryIds?: number[];
  colorOptions?: ProductColorInput[];
  tags?: string[];
  images?: AddImageInput[];
}

export interface UpdateProductInput {
  slug?: string;
  name?: { en?: string; fr?: string };
  description?: { en?: string; fr?: string };
  basePrice?: number;
  discountedPrice?: number | null;
  sku?: string;
  stock?: number;
  isActive?: boolean;
}

export interface AddImageInput {
  url: string;
  altText?: string;
  colorId?: number | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductColorInput {
  colorId: number;
  priceModifier?: number;
}
