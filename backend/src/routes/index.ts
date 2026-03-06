import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import sellerRoutes from './seller.routes';
import accommodationRoutes from './accommodation.routes';
import vehicleRoutes from './vehicle.routes';
import houseRoutes from './house.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import agentRoutes from './agent.routes';
import contactRoutes from './contact.routes';
import reviewRoutes from './review.routes';
import publicRoutes from './public.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sellers', sellerRoutes);
router.use('/accommodations', accommodationRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/houses', houseRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/agents', agentRoutes);
router.use('/contact', contactRoutes);
router.use('/reviews', reviewRoutes);
router.use('/public', publicRoutes);
router.use('/notifications', notificationRoutes);

export default router;
