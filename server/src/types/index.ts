export interface User {
  id: number;
  email: string;
  password: string;
  role: 'user' | 'admin';
  is_verified: number;
  otp_code: string | null;
  otp_expires_at: number | null;
  otp_attempts: number;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

export interface EmailResponse {
  messageId: string;
  previewUrl: string;
  nodemailerMessageId: string;
}

export interface OtpVerificationResult {
  success: boolean;
  message: string;
  user?: User;
}
