import pool from '../config/database';
import { User } from '../types';
import { QueryResultRow } from 'pg';

export class UserModel {
  static async findByEmail(email: string): Promise<User | undefined> {
    const result = await pool.query<QueryResultRow>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return undefined;
    }
    console.log('findByEmail result for', email, ':', result.rows[0]);
    return result.rows[0] as unknown as User;
  }

  static async findById(id: number): Promise<User | undefined> {
    const result = await pool.query<QueryResultRow>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return undefined;
    }
    return result.rows[0] as unknown as User;
  }

  static async create(
    email: string,
    hashedPassword: string,
    role: 'user' | 'admin' = 'user'
  ): Promise<User | undefined> {
    const result = await pool.query<QueryResultRow>(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, role]
    );
    if (result.rows.length === 0) {
      return undefined;
    }
    return result.rows[0] as unknown as User;
  }

  static async updateOtp(
    userId: number,
    otpCode: string,
    expiresAt: number
  ): Promise<void> {
    const result = await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2, otp_attempts = 0 WHERE id = $3 RETURNING id, otp_code, otp_expires_at',
      [otpCode, expiresAt, userId]
    );
    console.log('updateOtp result:', result.rows);
  }

  static async incrementOtpAttempts(userId: number): Promise<number> {
    await pool.query(
      'UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1',
      [userId]
    );
    const user = await this.findById(userId);
    return (user?.otp_attempts as number) || 0;
  }

  static async resetOtp(userId: number): Promise<void> {
    await pool.query(
      'UPDATE users SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0, is_verified = 1 WHERE id = $1',
      [userId]
    );
  }

  static async getAllUsers(): Promise<User[]> {
    const result = await pool.query<QueryResultRow>(
      'SELECT id, email, role, is_verified, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows as unknown as User[];
  }

  static async deleteUser(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
