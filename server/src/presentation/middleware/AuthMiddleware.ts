import { Request, Response, NextFunction } from 'express';
import { container } from '../../config/DependencyInjection';
import { ITokenService } from '../../domain/interfaces/IServices';

const COOKIE_NAME = 'auth_token';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const tokenService = container.resolve<ITokenService>('TokenService');
  
  let token: string | undefined;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    token = req.cookies?.[COOKIE_NAME];
  }

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const payload = tokenService.verify(token);
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};
