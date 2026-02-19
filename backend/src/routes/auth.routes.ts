import { Router } from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, resendOtp } from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
