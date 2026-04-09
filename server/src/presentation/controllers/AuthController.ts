import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { container } from '../../config/DependencyInjection';
import { AuthService } from '../../application/services';
import { AppError } from '../../domain/errors';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const ResendOtpSchema = z.object({
  email: z.string().email(),
});

export class AuthController {
  private getService(): AuthService {
    return container.resolve<AuthService>('AuthService');
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = SignupSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const result = await this.getService().signup(parsed.data, res);
      
      if (result.success) {
        res.status(201).json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const result = await this.getService().login(parsed.data, res);
      
      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = VerifyOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const result = await this.getService().verifyOtp(parsed.data, res);
      
      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ResendOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const result = await this.getService().resendOtp(parsed.data);
      
      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getService().logout(res);
      
      if (result.success) {
        res.json(result.data);
      } else {
        res.status(result.error.statusCode).json({ error: result.error.message });
      }
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.getService().getMe(userId);
      
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

export const authController = new AuthController();
