import { Router } from 'express';
import { colorController } from '../../presentation/controllers/ecommerce/ColorController';
import { authenticate, requireAdmin } from '../../presentation/middleware/AuthMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', colorController.getAll);
router.post('/', colorController.create);
router.put('/:id', colorController.update);
router.delete('/:id', colorController.delete);

export default router;
