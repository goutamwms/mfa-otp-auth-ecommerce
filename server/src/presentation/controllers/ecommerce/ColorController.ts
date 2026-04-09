import { Request, Response, NextFunction } from 'express';
import { container } from '../../../config/DependencyInjection';
import { ColorService } from '../../../application/services/ecommerce/ColorService';
import { CreateColorSchema, UpdateColorSchema } from '../../../application/dtos/request';
import { SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';

export class ColorController {
  private getService(): ColorService {
    return container.resolve<ColorService>('ColorService');
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

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const lang = (req.query.lang as SupportedLanguage) || 'en';
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid color ID' });
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

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = CreateColorSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang) || 'en';
      const result = await this.getService().create(parsed.data, lang as SupportedLanguage);

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
        res.status(400).json({ error: 'Invalid color ID' });
        return;
      }

      const parsed = UpdateColorSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang) || 'en';
      const result = await this.getService().update(id, parsed.data, lang as SupportedLanguage);

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
        res.status(400).json({ error: 'Invalid color ID' });
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
}

export const colorController = new ColorController();
