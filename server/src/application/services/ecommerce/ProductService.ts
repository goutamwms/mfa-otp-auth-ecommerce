import { IProductRepository, CreateProductInput, UpdateProductInput, AddImageInput } from '../../../domain/interfaces/IProductRepository';
import { Product, ProductListItem, ProductFilters } from '../../../domain/entities/ecommerce';
import { getTranslation, SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';
import { calculateDiscountPercentage } from '../../../domain/entities/ecommerce/Product';
import { AppError, NotFoundError, ConflictError, ValidationError } from '../../../domain/errors';
import { Result, ok, err } from '../../../shared/utils';

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getAll(filters: ProductFilters, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const result = await this.productRepository.findAll(filters);
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      return ok({
        products: result.products.map(p => this.toListItemResponse(p, lang)),
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error) {
      console.error('Get all products error:', error);
      return err(new AppError('Failed to fetch products', 500, 'FETCH_ERROR'));
    }
  }

  async getById(id: number, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        return err(new NotFoundError('Product not found'));
      }
      return ok(this.toResponse(product, lang));
    } catch (error) {
      console.error('Get product by id error:', error);
      return err(new AppError('Failed to fetch product', 500, 'FETCH_ERROR'));
    }
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const product = await this.productRepository.findBySlug(slug);
      if (!product) {
        return err(new NotFoundError('Product not found'));
      }
      return ok(this.toResponse(product, lang));
    } catch (error) {
      console.error('Get product by slug error:', error);
      return err(new AppError('Failed to fetch product', 500, 'FETCH_ERROR'));
    }
  }

  async create(input: CreateProductInput, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findBySlug(input.slug);
      if (existing) {
        return err(new ConflictError('Product with this slug already exists'));
      }

      const existingSku = await this.productRepository.findBySku(input.sku);
      if (existingSku) {
        return err(new ConflictError('Product with this SKU already exists'));
      }

      if (input.discountedPrice && input.discountedPrice >= input.basePrice) {
        return err(new ValidationError('Discounted price must be less than base price'));
      }

      const product = await this.productRepository.create(input);
      return ok(this.toResponse(product, lang));
    } catch (error) {
      console.error('Create product error:', error);
      return err(new AppError('Failed to create product', 500, 'CREATE_ERROR'));
    }
  }

  async update(id: number, input: UpdateProductInput, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findById(id);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      if (input.slug && input.slug !== existing.slug) {
        const slugExists = await this.productRepository.findBySlug(input.slug);
        if (slugExists) {
          return err(new ConflictError('Product with this slug already exists'));
        }
      }

      if (input.sku && input.sku !== existing.sku) {
        const skuExists = await this.productRepository.findBySku(input.sku);
        if (skuExists) {
          return err(new ConflictError('Product with this SKU already exists'));
        }
      }

      if (input.discountedPrice !== undefined && input.discountedPrice !== null) {
        const basePrice = input.basePrice ?? existing.basePrice;
        if (input.discountedPrice >= basePrice) {
          return err(new ValidationError('Discounted price must be less than base price'));
        }
      }

      const product = await this.productRepository.update(id, input);
      return ok(this.toResponse(product, lang));
    } catch (error) {
      console.error('Update product error:', error);
      return err(new AppError('Failed to update product', 500, 'UPDATE_ERROR'));
    }
  }

  async delete(id: number): Promise<Result<{ message: string }>> {
    try {
      const existing = await this.productRepository.findById(id);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      await this.productRepository.delete(id);
      return ok({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      return err(new AppError('Failed to delete product', 500, 'DELETE_ERROR'));
    }
  }

  async addImages(productId: number, images: AddImageInput[], lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      await this.productRepository.addImages(productId, images);
      const product = await this.productRepository.findById(productId);
      return ok(this.toResponse(product!, lang));
    } catch (error) {
      console.error('Add product images error:', error);
      return err(new AppError('Failed to add images', 500, 'UPDATE_ERROR'));
    }
  }

  async removeImage(productId: number, imageId: number, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      await this.productRepository.removeImage(imageId);
      const product = await this.productRepository.findById(productId);
      return ok(this.toResponse(product!, lang));
    } catch (error) {
      console.error('Remove product image error:', error);
      return err(new AppError('Failed to remove image', 500, 'UPDATE_ERROR'));
    }
  }

  async setPrimaryImage(productId: number, imageId: number, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      await this.productRepository.setPrimaryImage(imageId, productId);
      const product = await this.productRepository.findById(productId);
      return ok(this.toResponse(product!, lang));
    } catch (error) {
      console.error('Set primary image error:', error);
      return err(new AppError('Failed to set primary image', 500, 'UPDATE_ERROR'));
    }
  }

  async setCategories(productId: number, categoryIds: number[], lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      await this.productRepository.setCategories(productId, categoryIds);
      const product = await this.productRepository.findById(productId);
      return ok(this.toResponse(product!, lang));
    } catch (error) {
      console.error('Set product categories error:', error);
      return err(new AppError('Failed to set categories', 500, 'UPDATE_ERROR'));
    }
  }

  async setColors(productId: number, colors: { colorId: number; priceModifier?: number }[], lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      await this.productRepository.setColors(productId, colors);
      const product = await this.productRepository.findById(productId);
      return ok(this.toResponse(product!, lang));
    } catch (error) {
      console.error('Set product colors error:', error);
      return err(new AppError('Failed to set colors', 500, 'UPDATE_ERROR'));
    }
  }

  async setTags(productId: number, tags: string[], lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) {
        return err(new NotFoundError('Product not found'));
      }

      await this.productRepository.setTags(productId, tags, true);
      const product = await this.productRepository.findById(productId);
      return ok(this.toResponse(product!, lang));
    } catch (error) {
      console.error('Set product tags error:', error);
      return err(new AppError('Failed to set tags', 500, 'UPDATE_ERROR'));
    }
  }

  private toResponse(product: Product, lang: SupportedLanguage) {
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
      categories: product.categoryIds.map(id => ({ id })),
      colors: product.colorOptions.map(c => ({
        id: c.id,
        colorId: c.colorId,
        name: c.color ? getTranslation(c.color.name, lang) : '',
        code: c.color?.code || '',
        priceModifier: c.priceModifier,
      })),
      images: product.images.map(i => ({
        id: i.id,
        url: i.url,
        altText: i.altText,
        colorId: i.colorId,
        isPrimary: i.isPrimary,
        sortOrder: i.sortOrder,
      })),
      tags: product.tags.map(t => ({
        id: t.id,
        slug: t.slug,
        name: getTranslation(t.name, lang),
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt?.toISOString() || null,
    };
  }

  private toListItemResponse(product: ProductListItem, lang: SupportedLanguage) {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      basePrice: product.basePrice,
      discountedPrice: product.discountedPrice,
      finalPrice: product.finalPrice,
      discountPercentage: product.discountPercentage,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      categoryNames: product.categoryNames,
      tagNames: product.tagNames,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    };
  }
}
