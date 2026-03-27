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
exports.cancelBooking = exports.getSellerBookings = exports.getMyBookings = exports.getAllBookings = exports.getPublicBookingDetails = exports.getInvoiceData = exports.confirmPayment = exports.createBooking = void 0;
const BookingModel = __importStar(require("../models/Booking.model"));
const PaymentModel = __importStar(require("../models/Payment.model"));
const AccommodationModel = __importStar(require("../models/Accommodation.model"));
const VehicleModel = __importStar(require("../models/Vehicle.model"));
const HouseModel = __importStar(require("../models/House.model"));
const CommissionModel = __importStar(require("../models/Commission.model"));
const NotificationModel = __importStar(require("../models/Notification.model"));
const User_model_1 = require("../models/User.model");
const email_service_1 = require("../services/email.service");
const qrcode_1 = __importDefault(require("qrcode"));
const connection_1 = require("../database/connection");
const uuid_1 = require("uuid");
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const getRelativePath = (fullPath) => {
    const uploadsDir = 'uploads';
    const uploadsIndex = fullPath.indexOf('uploads');
    if (uploadsIndex === -1)
        return fullPath;
    const relativePath = fullPath.substring(uploadsIndex);
    return '/' + relativePath.replace(/\\/g, '/');
};
/**
 * Helper to process commissions, status updates, and notify all parties
 */
async function processConfirmedBooking(bookingId) {
    const booking = await BookingModel.getBookingById(bookingId);
    if (!booking)
        return;
    // 1. Update Statuses
    await BookingModel.updateBookingStatus(bookingId, 'confirmed');
    await BookingModel.updateBookingPaymentStatus(bookingId, 'paid');
    let propertyName = "Property";
    let sellerId = booking.seller_id ?? undefined;
    // 2. Resolve Property Details and Update Status
    if (booking.house_id) {
        const house = await HouseModel.getHouseById(booking.house_id);
        propertyName = house?.title || "House";
        if (!sellerId)
            sellerId = house?.seller_id ?? undefined;
        await HouseModel.updateHouseStatus(booking.house_id, booking.booking_type.includes('purchase') ? 'purchased' : 'rented');
    }
    else if (booking.accommodation_id) {
        const acc = await AccommodationModel.getAccommodationById(booking.accommodation_id);
        propertyName = acc?.name || "Accommodation";
        if (!sellerId)
            sellerId = acc?.seller_id ?? undefined;
        await AccommodationModel.updateAccommodationStatus(booking.accommodation_id, 'unavailable');
    }
    else if (booking.vehicle_id) {
        const veh = await VehicleModel.getVehicleById(booking.vehicle_id);
        propertyName = `${veh?.make} ${veh?.model}` || "Vehicle";
        if (!sellerId)
            sellerId = veh?.seller_id ?? undefined;
        await VehicleModel.updateVehicleStatus(booking.vehicle_id, booking.booking_type.includes('purchase') ? 'sold' : 'rented');
    }
    // 3. Commissions
    const totalAmount = Number(booking.total_amount);
    // Agent Commission (3%)
    if (booking.agent_id) {
        const [agent] = await (0, connection_1.query)('SELECT status FROM agents WHERE id = ?', [booking.agent_id]);
        if (agent && agent.status === 'approved') {
            const agentFee = totalAmount * 0.03;
            await CommissionModel.createCommission({
                booking_id: bookingId,
                amount: agentFee,
                commission_type: 'agent',
                agent_id: booking.agent_id,
                status: 'approved'
            });
        }
    }
    // Seller Payout (Total - 10%)
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
    // System Fee (10% total commission. 7% system if agent gets 3%, else 10%)
    const systemFeeRate = booking.agent_id ? 0.07 : 0.10;
    const systemFee = totalAmount * systemFeeRate;
    await CommissionModel.createCommission({
        booking_id: bookingId,
        amount: systemFee,
        commission_type: 'system',
        status: 'approved'
    });
    // 4. Gather Emails for Notification
    const emails = [];
    let clientName = "Client";
    let sellerName = "Seller";
    let agentName = "";
    const [clientInfo] = await (0, connection_1.query)('SELECT u.id as user_id, u.email, CONCAT(c.first_name, " ", c.last_name) as name FROM users u JOIN clients c ON u.id = c.user_id WHERE c.id = ?', [booking.client_id]);
    if (clientInfo) {
        emails.push(clientInfo.email);
        clientName = clientInfo.name;
    }
    if (sellerId) {
        const [sellerInfo] = await (0, connection_1.query)('SELECT u.email, CONCAT(s.first_name, " ", s.last_name) as name FROM users u JOIN sellers s ON u.id = s.user_id WHERE s.id = ?', [sellerId]);
        if (sellerInfo) {
            emails.push(sellerInfo.email);
            sellerName = sellerInfo.name;
        }
    }
    if (booking.agent_id) {
        const [agentInfo] = await (0, connection_1.query)('SELECT u.email, CONCAT(a.first_name, " ", a.last_name) as name FROM users u JOIN agents a ON u.id = a.user_id WHERE a.id = ?', [booking.agent_id]);
        if (agentInfo) {
            emails.push(agentInfo.email);
            agentName = agentInfo.name;
        }
    }
    const [admins] = await (0, connection_1.query)('SELECT email, id FROM users WHERE role = "admin" AND status = "active"');
    if (Array.isArray(admins)) {
        admins.forEach(adm => emails.push(adm.email));
    }
    // 5. Send Professional Confirmation Email to All Parties
    await (0, email_service_1.sendBookingConfirmationEmail)(emails, {
        bookingReference: booking.booking_reference,
        propertyName,
        totalAmount,
        clientName,
        agentName,
        sellerName,
        bookingType: booking.booking_type,
        isSale: booking.booking_type.includes('purchase')
    });
    // 6. In-App Notifications
    if (clientInfo) {
        await NotificationModel.createNotification({
            user_id: clientInfo.user_id,
            title: 'Booking Confirmed!',
            message: `Your booking for ${propertyName} (${booking.booking_reference}) has been confirmed.`,
            type: 'booking'
        });
    }
}
const createBooking = async (req, res, next) => {
    const connection = await connection_1.pool.getConnection();
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId)
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        await connection.beginTransaction();
        let clientId = null;
        let agentId = null;
        if (userRole === 'client') {
            const [client] = await connection.execute('SELECT id FROM clients WHERE user_id = ?', [userId]);
            clientId = client[0]?.id || null;
        }
        else if (userRole === 'agent') {
            // 1. Verify Agent Status
            const [agent] = await connection.execute('SELECT id, status FROM agents WHERE user_id = ?', [userId]);
            if (!agent[0]) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Agent profile not found.' });
            }
            if (agent[0].status !== 'approved') {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    message: 'Your agent account is pending approval. You cannot make bookings until verified.'
                });
            }
            agentId = agent[0].id;
            // 2. Handle Client Discovery/Creation
            const clientEmail = req.body.email;
            const clientFullName = req.body.fullName || "Valued Client";
            const clientPhone = req.body.phone || "";
            if (clientEmail) {
                const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', [clientEmail]);
                const clientUser = users[0];
                if (clientUser) {
                    const [profiles] = await connection.execute('SELECT id FROM clients WHERE user_id = ?', [clientUser.id]);
                    clientId = profiles[0]?.id || null;
                    if (!clientId) {
                        const nameParts = clientFullName.trim().split(' ');
                        const fName = nameParts[0];
                        const lName = nameParts.slice(1).join(' ') || ' ';
                        await connection.execute('INSERT INTO clients (id, user_id, first_name, last_name, phone_number) VALUES (UUID(), ?, ?, ?, ?)', [clientUser.id, fName, lName, clientPhone]);
                        const [newProfile] = await connection.execute('SELECT id FROM clients WHERE user_id = ?', [clientUser.id]);
                        clientId = newProfile[0].id;
                    }
                }
                else {
                    const newUserId = (0, uuid_1.v4)();
                    const tempPassword = await (0, bcrypt_utils_1.hashPassword)('Rivers@' + Math.floor(1000 + Math.random() * 9000));
                    await connection.execute('INSERT INTO users (id, email, password_hash, role, status, email_verified) VALUES (?, ?, ?, "client", "active", 1)', [newUserId, clientEmail, tempPassword]);
                    const nameParts = clientFullName.trim().split(' ');
                    const fName = nameParts[0];
                    const lName = nameParts.slice(1).join(' ') || ' ';
                    await connection.execute('INSERT INTO clients (id, user_id, first_name, last_name, phone_number) VALUES (UUID(), ?, ?, ?, ?)', [newUserId, fName, lName, clientPhone]);
                    const [newProfile] = await connection.execute('SELECT id FROM clients WHERE user_id = ?', [newUserId]);
                    clientId = newProfile[0].id;
                }
            }
        }
        if (!clientId && userRole !== 'admin') {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Client profile not found. Please provide client email.' });
        }
        // 3. Create Booking Manually to avoid Connection Pool Lock
        const bookingId = (0, uuid_1.v4)();
        const reference = 'RR' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const totalAmount = parseFloat(req.body.total_amount);
        await connection.execute(`INSERT INTO bookings (id, booking_type, booking_reference, client_id, agent_id, seller_id, accommodation_id, vehicle_id, house_id, start_date, end_date, total_amount, booking_status, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`, [
            bookingId,
            req.body.booking_type,
            reference,
            clientId,
            agentId,
            req.body.seller_id || null,
            req.body.accommodation_id || null,
            req.body.vehicle_id || null,
            req.body.house_id || null,
            req.body.start_date || null,
            req.body.end_date || null,
            totalAmount
        ]);
        if (req.file) {
            await connection.execute('INSERT INTO payments (id, booking_id, amount, payment_method, payment_proof_path, status) VALUES (UUID(), ?, ?, ?, ?, "pending")', [bookingId, totalAmount, req.body.payment_method || 'bank_transfer', getRelativePath(req.file.path)]);
        }
        await connection.commit();
        await NotificationModel.notifyAdmins('New Booking Request', `A new booking request (${reference}) has been submitted.`, 'booking');
        res.status(201).json({
            success: true,
            message: 'Booking submitted successfully.',
            data: {
                bookingId: bookingId,
                bookingReference: reference,
                isAutomatic: false
            }
        });
    }
    catch (error) {
        await connection.rollback();
        next(error);
    }
    finally {
        connection.release();
    }
};
exports.createBooking = createBooking;
const confirmPayment = async (req, res, next) => {
    const { id } = req.params;
    try {
        await PaymentModel.updatePaymentStatusByBookingId(id, 'completed');
        await processConfirmedBooking(id);
        res.status(200).json({ success: true, message: 'Payment confirmed. All parties notified.' });
    }
    catch (error) {
        next(error);
    }
};
exports.confirmPayment = confirmPayment;
const getInvoiceData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const details = await BookingModel.getBookingDetailsForInvoice(id);
        if (!details)
            return res.status(404).json({ success: false, message: 'Booking not found' });
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/verify-transaction/${id}`;
        const qrCodeImage = await qrcode_1.default.toDataURL(verifyUrl);
        res.status(200).json({ success: true, data: { ...details, qrCodeImage } });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceData = getInvoiceData;
const getPublicBookingDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const details = await BookingModel.getBookingDetailsForInvoice(id);
        if (!details)
            return res.status(404).json({ success: false, message: 'Transaction not found.' });
        // Add additional info like Seller/Owner name
        const sql = `
            SELECT CONCAT(s.first_name, ' ', s.last_name) as seller_name
            FROM sellers s
            JOIN houses h ON s.id = h.seller_id OR s.id = (SELECT seller_id FROM accommodations WHERE id = ?)
            WHERE h.id = ? OR EXISTS(SELECT 1 FROM accommodations WHERE id = ?)
            LIMIT 1
        `;
        // Simplification for the public view
        const [seller] = await (0, connection_1.query)('SELECT CONCAT(s.first_name, " ", s.last_name) as seller_name FROM sellers s JOIN users u ON s.user_id = u.id WHERE s.id = (SELECT seller_id FROM houses WHERE id = ?) OR s.id = (SELECT seller_id FROM accommodations WHERE id = ?) OR s.id = (SELECT seller_id FROM vehicles WHERE id = ?) LIMIT 1', [details.house_id, details.accommodation_id, details.vehicle_id]);
        res.status(200).json({
            success: true,
            data: {
                ...details,
                seller_name: seller?.seller_name || 'Rivers Rwanda Owner'
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicBookingDetails = getPublicBookingDetails;
const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await BookingModel.getAllBookings();
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBookings = getAllBookings;
const getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        const clientId = await (0, User_model_1.getClientIdByUserId)(userId);
        if (!clientId)
            return res.status(404).json({ success: false, message: 'Client profile not found.' });
        const bookings = await BookingModel.getBookingsByClientId(clientId);
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyBookings = getMyBookings;
const getSellerBookings = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        const sellerId = await (0, User_model_1.getSellerIdByUserId)(userId);
        if (!sellerId)
            return res.status(404).json({ success: false, message: 'Seller profile not found.' });
        const bookings = await BookingModel.getBookingsBySellerId(sellerId);
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        next(error);
    }
};
exports.getSellerBookings = getSellerBookings;
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        await BookingModel.updateBookingStatus(id, 'cancelled');
        res.status(200).json({ success: true, message: 'Booking cancelled' });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelBooking = cancelBooking;
//# sourceMappingURL=booking.controller.js.map