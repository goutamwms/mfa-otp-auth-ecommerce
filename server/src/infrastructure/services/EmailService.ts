import nodemailer from 'nodemailer';
import { IEmailService } from '../../domain/interfaces/IServices';

let transporter: nodemailer.Transporter | null = null;

export class EmailService implements IEmailService {
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (transporter) return transporter;

    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Email service initialized');
    return transporter;
  }

  async sendOtp(email: string, otp: string): Promise<{ previewUrl: string }> {
    const transport = await this.getTransporter();

    const info = await transport.sendMail({
      from: '"Auth MFA System" <noreply@authmfa.com>',
      to: email,
      subject: 'Your OTP Code - Auth MFA System',
      html: this.getOtpEmailTemplate(otp),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || 'no-preview';
    console.log(`OTP sent to ${email}: ${otp}, Preview: ${previewUrl}`);

    return { previewUrl };
  }

  async sendWelcome(user: { email: string; role: string }): Promise<void> {
    const transport = await this.getTransporter();
    await transport.sendMail({
      from: '"Auth MFA System" <noreply@authmfa.com>',
      to: user.email,
      subject: 'Welcome to Auth MFA System',
      html: this.getWelcomeEmailTemplate(user.role),
    });
    console.log(`Welcome email sent to ${user.email}`);
  }

  private getOtpEmailTemplate(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Verification Code</h2>
        <p style="color: #666; font-size: 16px;">Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
      </div>
    `;
  }

  private getWelcomeEmailTemplate(role: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome!</h2>
        <p style="color: #666; font-size: 16px;">Your account has been verified successfully.</p>
        <p style="color: #666; font-size: 14px;">You now have ${role === 'admin' ? 'admin' : 'user'} access.</p>
      </div>
    `;
  }
}

export const emailService = new EmailService();
