import { Router } from 'express';
import { productController } from '../../presentation/controllers/ecommerce/ProductController';
import { authenticate, requireAdmin } from '../../presentation/middleware/AuthMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/slug/:slug', productController.getBySlug);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

router.post('/:id/images', productController.addImages);
router.delete('/:id/images/:imageId', productController.removeImage);
router.patch('/:id/images/:imageId/primary', productController.setPrimaryImage);
router.put('/:id/categories', productController.setCategories);
router.put('/:id/colors', productController.setColors);
router.put('/:id/tags', productController.setTags);

export default router;
