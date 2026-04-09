import { Pool } from 'pg';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User, UserRole, OtpInfo } from '../../domain/entities/User';
import { database } from '../database';

interface UserRow {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  is_verified: number;
  otp_code: string | null;
  otp_expires_at: number | null;
  otp_attempts: number;
  created_at: Date;
}

export class UserRepository implements IUserRepository {
  private mapRow(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      role: row.role,
      isVerified: row.is_verified === 1,
      createdAt: new Date(row.created_at),
      otp: row.otp_code && row.otp_expires_at ? {
        code: row.otp_code,
        expiresAt: Number(row.otp_expires_at),
        attempts: row.otp_attempts,
      } : null,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await database.queryOne<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return row ? this.mapRow(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const row = await database.queryOne<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return row ? this.mapRow(row) : null;
  }

  async create(email: string, hashedPassword: string, role: 'user' | 'admin'): Promise<User> {
    const row = await database.queryOne<UserRow>(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, role]
    );
    if (!row) throw new Error('Failed to create user');
    return this.mapRow(row);
  }

  async updateOtp(userId: number, otp: OtpInfo): Promise<void> {
    await database.execute(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2, otp_attempts = 0 WHERE id = $3',
      [otp.code, otp.expiresAt, userId]
    );
  }

  async incrementOtpAttempts(userId: number): Promise<number> {
    await database.execute(
      'UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1',
      [userId]
    );
    const user = await this.findById(userId);
    return user?.otp?.attempts || 0;
  }

  async resetOtp(userId: number): Promise<void> {
    await database.execute(
      'UPDATE users SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0, is_verified = 1 WHERE id = $1',
      [userId]
    );
  }

  async getAll(): Promise<User[]> {
    const rows = await database.query<UserRow>(
      'SELECT id, email, role, is_verified, created_at FROM users ORDER BY created_at DESC'
    );
    return rows.map((row: UserRow) => this.mapRow({
      ...row,
      password: '',
      otp_code: null,
      otp_expires_at: null,
      otp_attempts: 0,
    }));
  }

  async delete(id: number): Promise<boolean> {
    const count = await database.execute('DELETE FROM users WHERE id = $1', [id]);
    return count > 0;
  }

  async count(): Promise<number> {
    const result = await database.queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users');
    return parseInt(result?.count || '0', 10);
  }
}

export const userRepository = new UserRepository();
