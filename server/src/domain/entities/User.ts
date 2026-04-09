export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface User extends BaseEntity {
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  otp: OtpInfo | null;
}

export type UserRole = 'user' | 'admin';

export interface OtpInfo {
  code: string;
  expiresAt: number;
  attempts: number;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}
