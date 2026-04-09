import { Product, ProductListItem } from '../../../domain/entities/ecommerce';
import { getTranslation, SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';
import { calculateDiscountPercentage } from '../../../domain/entities/ecommerce/Product';

export interface ProductColorResponse {
  id: number;
  colorId: number;
  name: string;
  code: string;
  priceModifier: number;
}

export interface ProductImageResponse {
  id: number;
  url: string;
  altText: string;
  colorId: number | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductTagResponse {
  id: number;
  slug: string;
  name: string;
}

export interface ProductResponse {
  id: number;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  discountedPrice: number | null;
  finalPrice: number;
  discountPercentage: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  categories: { id: number; name: string }[];
  colors: ProductColorResponse[];
  images: ProductImageResponse[];
  tags: ProductTagResponse[];
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductListItemResponse {
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
  createdAt: string;
}

export interface ProductListResponse {
  products: ProductListItemResponse[];
  total: number;
}

export function toProductColorResponse(color: any, lang: SupportedLanguage = 'en'): ProductColorResponse {
  return {
    id: color.id,
    colorId: color.colorId,
    name: color.color ? getTranslation(color.color.name, lang) : '',
    code: color.color?.code || '',
    priceModifier: color.priceModifier,
  };
}

export function toProductImageResponse(image: any): ProductImageResponse {
  return {
    id: image.id,
    url: image.url,
    altText: image.altText,
    colorId: image.colorId,
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
  };
}

export function toProductTagResponse(tag: any, lang: SupportedLanguage = 'en'): ProductTagResponse {
  return {
    id: tag.id,
    slug: tag.slug,
    name: getTranslation(tag.name, lang),
  };
}

export function toProductResponse(product: Product, lang: SupportedLanguage = 'en'): ProductResponse {
  const finalPrice = product.discountedPrice ?? product.basePrice;
  const discountPercentage = product.discountedPrice 
    ? calculateDiscountPercentage(product.basePrice, product.discountedPrice)
    : null;

  return {
    id: product.id,
    slug: product.slug,
    name: getTranslation(product.name, lang),
    description: getTranslation(product.description, lang),
    basePrice: product.basePrice,
    discountedPrice: product.discountedPrice,
    finalPrice,
    discountPercentage,
    sku: product.sku,
    stock: product.stock,
    isActive: product.isActive,
    categories: [],
    colors: product.colorOptions.map(c => toProductColorResponse(c, lang)),
    images: product.images.map(toProductImageResponse),
    tags: product.tags.map(t => toProductTagResponse(t, lang)),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt?.toISOString() || null,
  };
}

export function toProductListItemResponse(product: ProductListItem, lang: SupportedLanguage = 'en'): ProductListItemResponse {
  const finalPrice = product.discountedPrice ?? product.basePrice;
  const discountPercentage = product.discountedPrice 
    ? calculateDiscountPercentage(product.basePrice, product.discountedPrice)
    : null;

  return {
    id: product.id,
    slug: product.slug,
    name: getTranslation(product.name, lang),
    basePrice: product.basePrice,
    discountedPrice: product.discountedPrice,
    finalPrice,
    discountPercentage,
    sku: product.sku,
    stock: product.stock,
    isActive: product.isActive,
    imageUrl: product.imageUrl,
    categoryNames: product.categoryNames,
    tagNames: product.tagNames,
    createdAt: product.createdAt.toISOString(),
  };
}

export function toProductListResponse(products: ProductListItem[], lang: SupportedLanguage = 'en'): ProductListResponse {
  return {
    products: products.map(p => toProductListItemResponse(p, lang)),
    total: products.length,
  };
}
