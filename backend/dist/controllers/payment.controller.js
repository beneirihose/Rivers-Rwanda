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
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPayment = exports.initiatePayment = void 0;
const connection_1 = require("../database/connection");
const BookingModel = __importStar(require("../models/Booking.model"));
const CommissionModel = __importStar(require("../models/Commission.model"));
const HouseModel = __importStar(require("../models/House.model"));
const AccommodationModel = __importStar(require("../models/Accommodation.model"));
const VehicleModel = __importStar(require("../models/Vehicle.model"));
const User_model_1 = require("../models/User.model");
const email_service_1 = require("../services/email.service");
// Placeholder for a real payment gateway integration
const callPaymentGateway = async (amount, currency, description) => {
    console.log(`Initiating payment of ${amount} ${currency} for ${description}`);
    return `txn_${Date.now()}`;
};
const initiatePayment = async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        const clientId = await (0, User_model_1.getClientIdByUserId)(userId);
        const booking = await BookingModel.getBookingById(bookingId);
        if (!booking || booking.client_id !== clientId) {
            return res.status(404).json({ success: false, message: 'Booking not found or access denied.' });
        }
        if (booking.payment_status === 'paid') {
            return res.status(400).json({ success: false, message: 'This booking has already been paid.' });
        }
        const transactionRef = await callPaymentGateway(booking.total_amount, 'RWF', `Booking for ${booking.booking_type}`);
        await (0, connection_1.query)('INSERT INTO payments (id, booking_id, amount, payment_method, transaction_id, status) VALUES (UUID(), ?, ?, ?, ?, ?)', [bookingId, booking.total_amount, 'mobile_money', transactionRef, 'pending']);
        const paymentRows = await (0, connection_1.query)('SELECT id FROM payments WHERE transaction_id = ?', [transactionRef]);
        res.status(200).json({
            success: true,
            message: 'Payment initiated.',
            data: {
                transactionReference: transactionRef,
                paymentId: paymentRows[0].id
            }
        });
    }
    catch (error) {
        console.error("INITIATE_PAYMENT_ERROR:", error);
        next(error);
    }
};
exports.initiatePayment = initiatePayment;
const confirmPayment = async (req, res, next) => {
    try {
        const { paymentId, transactionReference } = req.body;
        // 1. Mark Payment as completed
        await (0, connection_1.query)("UPDATE payments SET status = 'completed', verified_at = CURRENT_TIMESTAMP WHERE id = ?", [paymentId]);
        const paymentRows = await (0, connection_1.query)('SELECT booking_id FROM payments WHERE id = ?', [paymentId]);
        if (paymentRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Payment record not found.' });
        }
        const bookingId = paymentRows[0].booking_id;
        // 2. Fetch booking details
        const booking = await BookingModel.getBookingById(bookingId);
        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        // 3. Update Statuses
        await BookingModel.updateBookingStatus(bookingId, 'confirmed');
        await BookingModel.updateBookingPaymentStatus(bookingId, 'paid');
        let propertyName = "Property";
        let sellerId = booking.seller_id;
        // 4. Resolve Property Specifics
        if (booking.house_id) {
            const house = await HouseModel.getHouseById(booking.house_id);
            propertyName = house?.title || "House";
            if (!sellerId)
                sellerId = house?.seller_id;
            await HouseModel.updateHouseStatus(booking.house_id, booking.booking_type.includes('purchase') ? 'purchased' : 'rented');
        }
        else if (booking.accommodation_id) {
            const acc = await AccommodationModel.getAccommodationById(booking.accommodation_id);
            propertyName = acc?.name || "Accommodation";
            if (!sellerId)
                sellerId = acc?.seller_id;
            await AccommodationModel.updateAccommodationStatus(booking.accommodation_id, 'unavailable');
        }
        else if (booking.vehicle_id) {
            const veh = await VehicleModel.getVehicleById(booking.vehicle_id);
            propertyName = `${veh?.make} ${veh?.model}` || "Vehicle";
            if (!sellerId)
                sellerId = veh?.seller_id;
            await VehicleModel.updateVehicleStatus(booking.vehicle_id, booking.booking_type.includes('purchase') ? 'sold' : 'rented');
        }
        // 5. Calculate & Record Commissions
        const totalAmount = Number(booking.total_amount);
        let agentFee = 0;
        if (booking.agent_id) {
            agentFee = totalAmount * 0.03;
            await CommissionModel.createCommission({
                booking_id: bookingId,
                amount: agentFee,
                commission_type: 'agent',
                agent_id: booking.agent_id,
                status: 'approved'
            });
        }
        if (sellerId) {
            const sellerPayout = totalAmount * 0.90;
            await CommissionModel.createCommission({
                booking_id: bookingId,
                amount: sellerPayout,
                commission_type: 'seller_payout',
                seller_id: sellerId,
                status: 'approved'
            });
        }
        const systemFeeRate = booking.agent_id ? 0.07 : 0.10;
        const systemFee = totalAmount * systemFeeRate;
        await CommissionModel.createCommission({
            booking_id: bookingId,
            amount: systemFee,
            commission_type: 'system',
            status: 'approved'
        });
        const netAmount = totalAmount - (totalAmount * 0.10);
        // 6. Notify Seller
        if (sellerId) {
            const sellerUsers = await (0, connection_1.query)('SELECT email FROM users WHERE id = (SELECT user_id FROM sellers WHERE id = ?)', [sellerId]);
            if (sellerUsers.length > 0) {
                await (0, email_service_1.sendSaleConfirmationEmail)(sellerUsers[0].email, {
                    propertyName,
                    amount: totalAmount,
                    systemFee: systemFee,
                    agentFee: agentFee,
                    netAmount: netAmount
                });
            }
        }
        res.status(200).json({ success: true, message: 'Payment confirmed and seller notified!' });
    }
    catch (error) {
        console.error("PAYMENT_CONFIRM_ERROR:", error);
        next(error);
    }
};
exports.confirmPayment = confirmPayment;
//# sourceMappingURL=payment.controller.js.map