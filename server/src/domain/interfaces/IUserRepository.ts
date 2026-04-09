import { User, OtpInfo } from '../entities';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(email: string, hashedPassword: string, role: 'user' | 'admin'): Promise<User>;
  updateOtp(userId: number, otp: OtpInfo): Promise<void>;
  incrementOtpAttempts(userId: number): Promise<number>;
  resetOtp(userId: number): Promise<void>;
  getAll(): Promise<User[]>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}
