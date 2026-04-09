import { Request, Response, NextFunction } from 'express';
import { container } from '../../config/DependencyInjection';
import { UserService } from '../../application/services';

export class UserController {
  private getService(): UserService {
    return container.resolve<UserService>('UserService');
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getService().getAllUsers();
      
      if (result.success) {
        res.json({ users: result.data });
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
      const currentUserId = (req as any).user?.userId;

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      if (!currentUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.getService().deleteUser(userId, currentUserId);
      
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

export const userController = new UserController();
