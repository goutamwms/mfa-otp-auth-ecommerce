import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate } from '../middleware';
import { loginLimiter, signupLimiter, otpVerifyLimiter, otpResendLimiter } from '../middleware/RateLimiter';

const router = Router();

router.post('/signup', signupLimiter, authController.signup);
router.post('/login', loginLimiter, authController.login);
router.post('/verify-otp', otpVerifyLimiter, authController.verifyOtp);
router.post('/resend-otp', otpResendLimiter, authController.resendOtp);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
