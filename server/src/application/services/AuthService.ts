import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { ITokenService, IEmailService, IOtpGenerator, ICookieService } from '../../domain/interfaces/IServices';
import { AppError, ValidationError, ConflictError, UnauthorizedError, NotFoundError, TooManyRequestsError } from '../../domain/errors';
import { Result, ok, err } from '../../shared/utils';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly emailService: IEmailService,
    private readonly otpGenerator: IOtpGenerator,
    private readonly cookieService: ICookieService
  ) {}

  async signup(request: { email: string; password: string }, res: any): Promise<Result<any>> {
    try {
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        return err(new ConflictError('Email already registered'));
      }

      const hashedPassword = await bcrypt.hash(request.password, 10);
      const isFirstUser = await this.userRepository.count() === 0;
      const role = isFirstUser ? 'admin' : 'user';

      const user = await this.userRepository.create(request.email, hashedPassword, role);
      const otp = this.otpGenerator.generate();
      
      await this.userRepository.updateOtp(user.id, {
        code: otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        attempts: 0,
      });

      const { previewUrl } = await this.emailService.sendOtp(user.email, otp);

      return ok({
        message: 'User created. Please verify your email with the OTP sent.',
        emailPreviewUrl: previewUrl,
        userId: user.id,
      });
    } catch (error) {
      console.error('Signup error:', error);
      return err(new AppError('Internal server error', 500, 'INTERNAL_ERROR'));
    }
  }

  async login(request: { email: string; password: string }, res: any): Promise<Result<any>> {
    try {
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return err(new UnauthorizedError('Invalid email or password'));
      }

      const validPassword = await bcrypt.compare(request.password, user.password);
      if (!validPassword) {
        return err(new UnauthorizedError('Invalid email or password'));
      }

      if (!user.isVerified) {
        const otp = this.otpGenerator.generate();
        await this.userRepository.updateOtp(user.id, {
          code: otp,
          expiresAt: Date.now() + OTP_EXPIRY_MS,
          attempts: 0,
        });

        const { previewUrl } = await this.emailService.sendOtp(user.email, otp);

        return ok({
          message: 'Email not verified. A new OTP has been sent.',
          emailPreviewUrl: previewUrl,
          userId: user.id,
          requiresVerification: true,
        });
      }

      const token = this.tokenService.generate({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      this.cookieService.setAuthCookie(res, token);

      return ok({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return err(new AppError('Internal server error', 500, 'INTERNAL_ERROR'));
    }
  }

  async verifyOtp(request: { email: string; otp: string }, res: any): Promise<Result<any>> {
    try {
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return err(new NotFoundError('User not found'));
      }

      if (user.isVerified) {
        return err(new ValidationError('Email already verified'));
      }

      if (user.otp?.attempts && user.otp.attempts >= MAX_OTP_ATTEMPTS) {
        return err(new TooManyRequestsError('Too many attempts. Please request a new OTP.'));
      }

      if (!user.otp?.code || !user.otp?.expiresAt) {
        return err(new ValidationError('No OTP found. Please request a new one.'));
      }

      if (Date.now() > user.otp.expiresAt) {
        return err(new ValidationError('OTP has expired. Please request a new one.'));
      }

      if (user.otp.code !== request.otp) {
        await this.userRepository.incrementOtpAttempts(user.id);
        const attemptsRemaining = MAX_OTP_ATTEMPTS - (user.otp.attempts || 0) - 1;
        return err(new UnauthorizedError(`Invalid OTP. ${attemptsRemaining} attempts remaining.`));
      }

      await this.userRepository.resetOtp(user.id);

      const token = this.tokenService.generate({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      this.cookieService.setAuthCookie(res, token);

      return ok({
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      return err(new AppError('Internal server error', 500, 'INTERNAL_ERROR'));
    }
  }

  async resendOtp(request: { email: string }): Promise<Result<any>> {
    try {
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return err(new NotFoundError('User not found'));
      }

      if (user.isVerified) {
        return err(new ValidationError('Email already verified'));
      }

      const otp = this.otpGenerator.generate();
      await this.userRepository.updateOtp(user.id, {
        code: otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        attempts: 0,
      });

      const { previewUrl } = await this.emailService.sendOtp(user.email, otp);

      return ok({
        message: 'New OTP sent successfully',
        emailPreviewUrl: previewUrl,
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      return err(new AppError('Internal server error', 500, 'INTERNAL_ERROR'));
    }
  }

  async logout(res: any): Promise<Result<{ message: string }>> {
    this.cookieService.clearAuthCookie(res);
    return ok({ message: 'Logged out successfully' });
  }

  async getMe(userId: number): Promise<Result<any>> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return err(new NotFoundError('User not found'));
      }
      return ok({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Get me error:', error);
      return err(new AppError('Internal server error', 500, 'INTERNAL_ERROR'));
    }
  }
}
