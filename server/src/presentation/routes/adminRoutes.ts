import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate, requireAdmin } from '../middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', userController.getAllUsers);
router.delete('/users/:id', userController.deleteUser);

export default router;
