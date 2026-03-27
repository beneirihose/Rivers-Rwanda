"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectPayoutReceipt = exports.confirmPayoutReceipt = exports.getMyEarnings = exports.getSellerProducts = exports.verifyOtp = exports.registerSeller = void 0;
const SellerModel = __importStar(require("../models/Seller.model"));
const UserModel = __importStar(require("../models/User.model"));
const CommissionModel = __importStar(require("../models/Commission.model"));
const connection_1 = require("../database/connection");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_service_1 = require("../services/email.service");
const otpGenerator_1 = require("../utils/otpGenerator");
const registerSeller = async (req, res, next) => {
    const { email, password, firstName, lastName, phoneNumber, nationalId } = req.body;
    if (!email || !password || !firstName || !lastName || !phoneNumber || !nationalId) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    try {
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = {
            email,
            password_hash: hashedPassword,
            role: 'seller',
        };
        const userId = await UserModel.createUser(newUser);
        const newSeller = {
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            national_id: nationalId,
        };
        const sellerId = await SellerModel.createSeller(newSeller);
        const otpCode = (0, otpGenerator_1.generateOtp)();
        await UserModel.storeOtp(userId, otpCode, 'email_verification');
        await (0, email_service_1.sendOtpEmail)(email, otpCode);
        res.status(201).json({
            success: true,
            message: 'Seller registration successful. Please check your email for OTP to verify your account.',
            sellerId: sellerId
        });
    }
    catch (error) {
        next(error);
    }
};
exports.registerSeller = registerSeller;
const verifyOtp = async (req, res, next) => {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    try {
        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isValidOtp = await UserModel.verifyOtp(user.id, otpCode);
        if (!isValidOtp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        await UserModel.updateUser(user.id, { email_verified: true, status: 'active' });
        res.status(200).json({ success: true, message: 'Email verified successfully. Your account is now active.' });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
const getSellerProducts = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication error: User ID not found.' });
        }
        const sellerId = await UserModel.getSellerIdByUserId(userId);
        if (!sellerId) {
            return res.status(200).json({ success: true, data: [] });
        }
        const houses = await (0, connection_1.query)(`
            SELECT id, title as name, 'house' as type, 
            CASE WHEN monthly_rent_price IS NOT NULL AND purchase_price IS NOT NULL THEN 'both'
                 WHEN purchase_price IS NOT NULL THEN 'sale'
                 ELSE 'rent' END as purpose,
            status, created_at FROM houses WHERE seller_id = ?
        `, [sellerId]);
        const accommodations = await (0, connection_1.query)("SELECT id, name, type, purpose, status, created_at FROM accommodations WHERE seller_id = ?", [sellerId]);
        const vehicles = await (0, connection_1.query)("SELECT id, CONCAT(make, ' ', model) as name, 'vehicle' as type, purpose, status, created_at FROM vehicles WHERE seller_id = ?", [sellerId]);
        const allProducts = [...houses, ...accommodations, ...vehicles];
        allProducts.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
        });
        res.status(200).json({ success: true, data: allProducts });
    }
    catch (error) {
        console.error('[GET_SELLER_PRODUCTS_ERROR]:', error);
        next(error);
    }
};
exports.getSellerProducts = getSellerProducts;
const getMyEarnings = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const sellerId = await UserModel.getSellerIdByUserId(userId);
        if (!sellerId) {
            return res.status(404).json({ success: false, message: 'Seller profile not found.' });
        }
        const commissions = await CommissionModel.getCommissionsBySellerId(sellerId);
        res.status(200).json({ success: true, data: commissions });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyEarnings = getMyEarnings;
const confirmPayoutReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const sellerId = await UserModel.getSellerIdByUserId(userId);
        const [commission] = await (0, connection_1.query)('SELECT * FROM commissions WHERE id = ? AND seller_id = ?', [id, sellerId]);
        if (!commission) {
            return res.status(404).json({ success: false, message: 'Payout record not found or unauthorized.' });
        }
        if (commission.status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Payout has not been marked as paid by Admin yet.' });
        }
        await CommissionModel.updateCommissionStatus(id, 'completed');
        res.status(200).json({ success: true, message: 'Payout receipt confirmed. Funds received.' });
    }
    catch (error) {
        next(error);
    }
};
exports.confirmPayoutReceipt = confirmPayoutReceipt;
const rejectPayoutReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const sellerId = await UserModel.getSellerIdByUserId(userId);
        const [commission] = await (0, connection_1.query)('SELECT * FROM commissions WHERE id = ? AND seller_id = ?', [id, sellerId]);
        if (!commission) {
            return res.status(404).json({ success: false, message: 'Payout record not found or unauthorized.' });
        }
        if (commission.status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Only paid commissions can be rejected.' });
        }
        // Set status back to approved so admin can re-upload proof or correct payment
        await CommissionModel.updateCommissionStatus(id, 'approved');
        await (0, connection_1.query)('UPDATE commissions SET payout_proof_path = NULL WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Payout rejected. Admin has been notified to re-verify payment.' });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectPayoutReceipt = rejectPayoutReceipt;
//# sourceMappingURL=seller.controller.js.map