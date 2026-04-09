import { Router } from 'express';
import { categoryController } from '../../presentation/controllers/ecommerce/CategoryController';
import { authenticate, requireAdmin } from '../../presentation/middleware/AuthMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', categoryController.getAll);
router.get('/tree', categoryController.getTree);
router.get('/:id', categoryController.getById);
router.get('/slug/:slug', categoryController.getBySlug);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.patch('/:id/reorder', categoryController.reorder);
router.delete('/:id', categoryController.delete);

export default router;
