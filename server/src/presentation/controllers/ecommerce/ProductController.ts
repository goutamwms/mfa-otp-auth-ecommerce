import { Request, Response, NextFunction } from 'express';
import { container } from '../../../config/DependencyInjection';
import { ProductService } from '../../../application/services/ecommerce';
import { 
  CreateProductSchema, 
  UpdateProductSchema, 
  AddProductImagesSchema,
  SetProductCategoriesSchema,
  SetProductColorsSchema,
  SetProductTagsSchema,
  ProductFiltersSchema
} from '../../../application/dtos/request';
import { SupportedLanguage, ProductFilters } from '../../../domain/entities/ecommerce';

export class ProductController {
  private getService(): ProductService {
    return container.resolve<ProductService>('ProductService');
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as SupportedLanguage) || 'en';
      
      const filtersParsed = ProductFiltersSchema.safeParse(req.query);
      const filters: ProductFilters = filtersParsed.success ? filtersParsed.data : {};
      filters.language = lang;

      const result = await this.getService().getAll(filters, lang);

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
        res.status(400).json({ error: 'Invalid product ID' });
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
      const parsed = CreateProductSchema.safeParse(req.body);
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
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const parsed = UpdateProductSchema.safeParse(req.body);
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
        res.status(400).json({ error: 'Invalid product ID' });
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

  addImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const parsed = AddProductImagesSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().addImages(id, parsed.data.images, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  removeImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const imageId = parseInt(req.params.imageId, 10);
      
      if (isNaN(id) || isNaN(imageId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().removeImage(id, imageId, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  setPrimaryImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const imageId = parseInt(req.params.imageId, 10);
      
      if (isNaN(id) || isNaN(imageId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().setPrimaryImage(id, imageId, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  setCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const parsed = SetProductCategoriesSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().setCategories(id, parsed.data.categoryIds, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  setColors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const parsed = SetProductColorsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().setColors(id, parsed.data.colors, lang);

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  setTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const parsed = SetProductTagsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const lang = (req.query.lang as SupportedLanguage) || 'en';
      const result = await this.getService().setTags(id, parsed.data.tags, lang);

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

export const productController = new ProductController();
