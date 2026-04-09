import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { ITokenService } from '../../domain/interfaces/IServices';
import { AppError, NotFoundError, ForbiddenError } from '../../domain/errors';
import { Result, ok, err } from '../../shared/utils';

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async getAllUsers(): Promise<Result<any[]>> {
    try {
      const users = await this.userRepository.getAll();
      return ok(users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
      })));
    } catch (error) {
      console.error('Get all users error:', error);
      return err(new AppError('Internal server error', 500, 'INTERNAL_ERROR'));
    }
  }

  async deleteUser(userIdToDelete: number, currentUserId: number): Promise<Result<{ message: string }>> {
    try {
      if (userIdToDelete === currentUserId) {
        return err(new ForbiddenError('Cannot delete your own account'));
      }

      const deleted = await this.userRepository.delete(userIdToDelete);
      if (!deleted) {
        return err(new NotFoundError('User not found'));
      }

      return ok({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return err(new AppError('Internal server error', 500, 'INTERNAL_ERROR'));
    }
  }
}
