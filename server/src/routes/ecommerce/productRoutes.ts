import { Router } from 'express';
import { productController } from '../../presentation/controllers/ecommerce/ProductController';

const router = Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/slug/:slug', productController.getBySlug);

export default router;
