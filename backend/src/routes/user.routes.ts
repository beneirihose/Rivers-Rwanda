import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadProfileImage } from '../middleware/upload.middleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, uploadProfileImage, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
