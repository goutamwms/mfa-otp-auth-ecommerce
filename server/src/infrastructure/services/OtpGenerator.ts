import { IOtpGenerator } from '../../domain/interfaces/IServices';

export class OtpGenerator implements IOtpGenerator {
  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const otpGenerator = new OtpGenerator();
