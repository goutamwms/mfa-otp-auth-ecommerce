import { Router } from 'express';
import { colorController } from '../../presentation/controllers/ecommerce/ColorController';

const router = Router();

router.get('/', colorController.getAll);
router.get('/:id', colorController.getById);

export default router;
