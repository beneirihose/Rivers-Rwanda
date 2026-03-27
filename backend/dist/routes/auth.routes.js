"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/verify-email', auth_controller_1.verifyEmail);
router.post('/resend-otp', auth_controller_1.resendOtp);
// Password Reset Routes
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
// Protected routes
router.post('/change-password', auth_middleware_1.authenticate, auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map