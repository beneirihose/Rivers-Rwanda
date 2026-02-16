import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import accommodationRoutes from './accommodation.routes';
import vehicleRoutes from './vehicle.routes';
import houseRoutes from './house.routes'; // Import house routes
import bookingRoutes from './booking.routes';
import adminRoutes from './admin.routes';
import agentRoutes from './agent.routes';
import contactRoutes from './contact.routes';
import reviewRoutes from './review.routes';
import publicRoutes from './public.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/accommodations', accommodationRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/houses', houseRoutes); // Register house routes
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/agents', agentRoutes);
router.use('/contact', contactRoutes);
router.use('/reviews', reviewRoutes);
router.use('/public', publicRoutes);

export default router;
