import { IColorRepository, CreateColorInput, UpdateColorInput } from '../../../domain/interfaces/IColorRepository';
import { Color } from '../../../domain/entities/ecommerce';
import { getTranslation, SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';
import { AppError, NotFoundError, ConflictError } from '../../../domain/errors';
import { Result, ok, err } from '../../../shared/utils';

export class ColorService {
  constructor(private readonly colorRepository: IColorRepository) {}

  async getAll(activeOnly = false, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const colors = await this.colorRepository.findAll(activeOnly);
      return ok({
        colors: colors.map(c => this.toResponse(c, lang)),
      });
    } catch (error) {
      console.error('Get all colors error:', error);
      return err(new AppError('Failed to fetch colors', 500, 'FETCH_ERROR'));
    }
  }

  async getById(id: number, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const color = await this.colorRepository.findById(id);
      if (!color) {
        return err(new NotFoundError('Color not found'));
      }
      return ok(this.toResponse(color, lang));
    } catch (error) {
      console.error('Get color by id error:', error);
      return err(new AppError('Failed to fetch color', 500, 'FETCH_ERROR'));
    }
  }

  async create(input: CreateColorInput, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.colorRepository.findByCode(input.code);
      if (existing) {
        return err(new ConflictError('Color with this code already exists'));
      }

      const color = await this.colorRepository.create(input);
      return ok(this.toResponse(color, lang));
    } catch (error) {
      console.error('Create color error:', error);
      return err(new AppError('Failed to create color', 500, 'CREATE_ERROR'));
    }
  }

  async update(id: number, input: UpdateColorInput, lang: SupportedLanguage = 'en'): Promise<Result<any>> {
    try {
      const existing = await this.colorRepository.findById(id);
      if (!existing) {
        return err(new NotFoundError('Color not found'));
      }

      if (input.code && input.code !== existing.code) {
        const codeExists = await this.colorRepository.findByCode(input.code);
        if (codeExists) {
          return err(new ConflictError('Color with this code already exists'));
        }
      }

      const color = await this.colorRepository.update(id, input);
      return ok(this.toResponse(color, lang));
    } catch (error) {
      console.error('Update color error:', error);
      return err(new AppError('Failed to update color', 500, 'UPDATE_ERROR'));
    }
  }

  async delete(id: number): Promise<Result<{ message: string }>> {
    try {
      const existing = await this.colorRepository.findById(id);
      if (!existing) {
        return err(new NotFoundError('Color not found'));
      }

      await this.colorRepository.delete(id);
      return ok({ message: 'Color deleted successfully' });
    } catch (error) {
      console.error('Delete color error:', error);
      return err(new AppError('Failed to delete color', 500, 'DELETE_ERROR'));
    }
  }

  private toResponse(color: Color, lang: SupportedLanguage) {
    return {
      id: color.id,
      name: getTranslation(color.name, lang),
      code: color.code,
      isActive: color.isActive,
      createdAt: color.createdAt.toISOString(),
    };
  }
}
