import { Router } from 'express';
import { getMyNotifications, markRead, markAllRead } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.put('/:id/read', authenticate, markRead);
router.put('/mark-all-read', authenticate, markAllRead);

export default router;
