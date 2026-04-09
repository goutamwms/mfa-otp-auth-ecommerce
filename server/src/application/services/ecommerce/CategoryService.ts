import { ICategoryRepository, CreateCategoryInput, UpdateCategoryInput } from '../../../domain/interfaces/ICategoryRepository';
import { Category, CategoryWithChildren } from '../../../domain/entities/ecommerce';
import { getTranslation, SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';
import { AppError, NotFoundError, ConflictError } from '../../../domain/errors';
import { Result, ok, err } from '../../../shared/utils';

export class CategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async getAll(activeOnly = false, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const categories = await this.categoryRepository.findAll(activeOnly);
      return ok({
        categories: categories.map(c => this.toResponse(c, lang)),
      });
    } catch (error) {
      console.error('Get all categories error:', error);
      return err(new AppError('Failed to fetch categories', 500, 'FETCH_ERROR'));
    }
  }

  async getTree(lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const categories = await this.categoryRepository.findWithChildren();
      return ok({
        categories: categories.map(c => this.toTreeResponse(c, lang)),
      });
    } catch (error) {
      console.error('Get category tree error:', error);
      return err(new AppError('Failed to fetch category tree', 500, 'FETCH_ERROR'));
    }
  }

  async getById(id: number, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        return err(new NotFoundError('Category not found'));
      }
      return ok(this.toResponse(category, lang));
    } catch (error) {
      console.error('Get category by id error:', error);
      return err(new AppError('Failed to fetch category', 500, 'FETCH_ERROR'));
    }
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const category = await this.categoryRepository.findBySlug(slug);
      if (!category) {
        return err(new NotFoundError('Category not found'));
      }
      return ok(this.toResponse(category, lang));
    } catch (error) {
      console.error('Get category by slug error:', error);
      return err(new AppError('Failed to fetch category', 500, 'FETCH_ERROR'));
    }
  }

  async create(input: CreateCategoryInput, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.categoryRepository.findBySlug(input.slug);
      if (existing) {
        return err(new ConflictError('Category with this slug already exists'));
      }

      const category = await this.categoryRepository.create(input);
      return ok(this.toResponse(category, lang));
    } catch (error) {
      console.error('Create category error:', error);
      return err(new AppError('Failed to create category', 500, 'CREATE_ERROR'));
    }
  }

  async update(id: number, input: UpdateCategoryInput, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        return err(new NotFoundError('Category not found'));
      }

      if (input.slug && input.slug !== existing.slug) {
        const slugExists = await this.categoryRepository.findBySlug(input.slug);
        if (slugExists) {
          return err(new ConflictError('Category with this slug already exists'));
        }
      }

      const category = await this.categoryRepository.update(id, input);
      return ok(this.toResponse(category, lang));
    } catch (error) {
      console.error('Update category error:', error);
      return err(new AppError('Failed to update category', 500, 'UPDATE_ERROR'));
    }
  }

  async delete(id: number): Promise<Result<{ message: string }>> {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        return err(new NotFoundError('Category not found'));
      }

      await this.categoryRepository.delete(id);
      return ok({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      return err(new AppError('Failed to delete category', 500, 'DELETE_ERROR'));
    }
  }

  async reorder(id: number, order: number): Promise<Result<{ message: string }>> {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        return err(new NotFoundError('Category not found'));
      }

      await this.categoryRepository.reorder(id, order);
      return ok({ message: 'Category reordered successfully' });
    } catch (error) {
      console.error('Reorder category error:', error);
      return err(new AppError('Failed to reorder category', 500, 'UPDATE_ERROR'));
    }
  }

  private toResponse(category: Category, lang: SupportedLanguage) {
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

  private toTreeResponse(category: CategoryWithChildren, lang: SupportedLanguage): any {
    return {
      ...this.toResponse(category, lang),
      children: category.children.map((c: CategoryWithChildren) => this.toTreeResponse(c, lang)),
    };
  }
}
