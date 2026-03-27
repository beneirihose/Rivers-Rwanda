"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// All admin routes are protected and require admin role
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'));
router.get('/stats', admin_controller_1.getStats);
// User Management
router.get('/users', admin_controller_1.getAllUsers);
router.post('/users', admin_controller_1.createAdminUser);
router.patch('/users/:id', admin_controller_1.updateUserRole);
router.delete('/users/:id', admin_controller_1.deleteUser);
// Agent Management
router.get('/agents', admin_controller_1.getAllAgents);
router.get('/agents/pending', admin_controller_1.getPendingAgents);
router.patch('/agents/:id/approve', admin_controller_1.approveAgent);
router.patch('/agents/:id/reject', admin_controller_1.rejectAgent);
// Seller Management
router.get('/sellers', admin_controller_1.getAllSellers);
router.patch('/sellers/:id/approve', admin_controller_1.approveSeller);
router.patch('/sellers/:id/reject', admin_controller_1.rejectSeller);
router.patch('/sellers/:id', admin_controller_1.updateSellerProfile);
router.delete('/sellers/:id', admin_controller_1.deleteSeller);
// Product Management
router.get('/products/pending', admin_controller_1.getPendingProducts);
router.patch('/products/:type/:id/approve', admin_controller_1.approveProduct);
router.patch('/products/:type/:id/reject', admin_controller_1.rejectProduct);
router.delete('/products/:type/:id', admin_controller_1.deleteProduct);
// Booking & Payment Management
router.get('/bookings', admin_controller_1.getAllBookings);
router.patch('/bookings/:id/approve', admin_controller_1.approveBooking);
router.patch('/bookings/:id/status', admin_controller_1.updateBookingStatus);
router.delete('/bookings/:id', admin_controller_1.deleteBooking);
router.patch('/bookings/:bookingId/verify-payment', admin_controller_1.verifyBookingPayment);
// Commission & Payout Management
router.get('/commissions', admin_controller_1.getAllCommissions);
router.patch('/commissions/:id/pay', upload_middleware_1.uploadPayoutProof, admin_controller_1.payCommission);
router.delete('/commissions/:id', admin_controller_1.deleteCommission);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map