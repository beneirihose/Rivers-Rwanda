"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Public route for QR verification
router.get('/verify/:id', booking_controller_1.getPublicBookingDetails);
// All other routes are authenticated
router.use(auth_middleware_1.authenticate);
// Create a new booking (for clients and agents)
router.post('/', (0, auth_middleware_1.authorize)('client', 'agent'), upload_middleware_1.uploadPaymentProof, booking_controller_1.createBooking);
// Get bookings for the currently logged-in client
router.get('/my', (0, auth_middleware_1.authorize)('client'), booking_controller_1.getMyBookings);
// Get invoice data for a specific booking
router.get('/:id/invoice', booking_controller_1.getInvoiceData);
// Cancel a booking
router.patch('/:id/cancel', (0, auth_middleware_1.authorize)('client'), booking_controller_1.cancelBooking);
// Confirm a payment (for admin)
router.patch('/:id/confirm-payment', (0, auth_middleware_1.authorize)('admin'), booking_controller_1.confirmPayment);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map