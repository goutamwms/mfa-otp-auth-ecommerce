export interface IEmailService {
  sendOtp(email: string, otp: string): Promise<{ previewUrl: string }>;
  sendWelcome(user: { email: string; role: string }): Promise<void>;
}

export interface IOtpGenerator {
  generate(): string;
}

export interface ITokenService {
  generate(payload: { userId: number; email: string; role: string }): string;
  verify(token: string): { userId: number; email: string; role: string } | null;
}

export interface ICookieService {
  setAuthCookie(res: any, token: string): void;
  clearAuthCookie(res: any): void;
}
