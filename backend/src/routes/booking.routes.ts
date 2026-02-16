import { Router } from 'express';
import { createBooking, getMyBookings, cancelBooking } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadPaymentProof } from '../middleware/upload.middleware';

const router = Router();

// Allow both clients and agents to create bookings
router.post('/', authenticate, authorize('client', 'agent'), uploadPaymentProof, createBooking);

// These routes should likely remain client-specific
router.get('/my', authenticate, authorize('client'), getMyBookings);
router.patch('/:id/cancel', authenticate, authorize('client'), cancelBooking);

export default router;
