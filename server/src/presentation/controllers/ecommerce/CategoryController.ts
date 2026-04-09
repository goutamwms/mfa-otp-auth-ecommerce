import { Request, Response, NextFunction } from 'express';
import { container } from '../../../config/DependencyInjection';
import { CategoryService } from '../../../application/services/ecommerce/CategoryService';
import { CreateCategorySchema, UpdateCategorySchema, ReorderCategorySchema } from '../../../application/dtos/request';
import { SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';

export class CategoryController {
  private getService(): CategoryService {
    return container.resolve<CategoryService>('CategoryService');
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const activeOnly = req.query.active === 'true';
      const result = await this.getService().getAll(activeOnly, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  getTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().getTree(lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const lang = (req.query.lang as SupportedLanguage) || 'en';
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const result = await this.getService().getById(id, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().getBySlug(req.params.slug, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = CreateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().create(parsed.data, lang);

      if (result.success) {
        res.status(201).json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const parsed = UpdateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().update(id, parsed.data, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const result = await this.getService().delete(id);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  reorder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const parsed = ReorderCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const result = await this.getService().reorder(id, parsed.data.order);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };
}

export const categoryController = new CategoryController();
