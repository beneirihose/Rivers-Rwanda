import { Router } from 'express';
import { createBooking, getMyBookings, cancelBooking, getInvoiceData } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadPaymentProof } from '../middleware/upload.middleware';

const router = Router();

// All routes here are authenticated
router.use(authenticate);

// Create a new booking (for clients and agents)
router.post('/', authorize('client', 'agent'), uploadPaymentProof, createBooking);

// Get bookings for the currently logged-in client
router.get('/my', authorize('client'), getMyBookings);

// Get invoice data for a specific booking
router.get('/:id/invoice', getInvoiceData);

// Cancel a booking
router.patch('/:id/cancel', authorize('client'), cancelBooking);

export default router;
