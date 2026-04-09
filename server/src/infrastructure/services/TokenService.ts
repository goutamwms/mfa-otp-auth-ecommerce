import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenService, ICookieService } from '../../domain/interfaces/IServices';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const COOKIE_NAME = 'auth_token';

export class TokenService implements ITokenService {
  generate(payload: { userId: number; email: string; role: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  verify(token: string): { userId: number; email: string; role: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
    } catch {
      return null;
    }
  }
}

export class CookieService implements ICookieService {
  setAuthCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  clearAuthCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}

export const tokenService = new TokenService();
export const cookieService = new CookieService();
