import { Router } from 'express';
import * as sellerController from '../controllers/seller.controller';
import { getSellerBookings } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', sellerController.registerSeller);
router.post('/verify-otp', sellerController.verifyOtp);

// Protected routes
router.use(authenticate, authorize('seller'));
router.get('/bookings', getSellerBookings);
router.get('/products', sellerController.getSellerProducts);
router.get('/earnings', sellerController.getMyEarnings);
router.patch('/commissions/:id/confirm-receipt', sellerController.confirmPayoutReceipt);
router.patch('/commissions/:id/reject-receipt', sellerController.rejectPayoutReceipt);

export default router;
