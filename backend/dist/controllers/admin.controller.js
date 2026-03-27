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
exports.deleteCommission = exports.markCommissionAsPaid = exports.payCommission = exports.getAllCommissions = exports.getStats = exports.verifyBookingPayment = exports.deleteBooking = exports.updateBookingStatus = exports.approveBooking = exports.getAllBookings = exports.deleteProduct = exports.rejectProduct = exports.approveProduct = exports.getPendingProducts = exports.deleteSeller = exports.updateSellerProfile = exports.rejectSeller = exports.approveSeller = exports.getAllSellers = exports.rejectAgent = exports.approveAgent = exports.getPendingAgents = exports.getAllAgents = exports.deleteUser = exports.updateUserRole = exports.createAdminUser = exports.getAllUsers = void 0;
const connection_1 = require("../database/connection");
const BookingModel = __importStar(require("../models/Booking.model"));
const UserModel = __importStar(require("../models/User.model"));
const CommissionModel = __importStar(require("../models/Commission.model"));
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const getRelativePath = (fullPath) => {
    const uploadsDir = 'uploads';
    const uploadsIndex = fullPath.indexOf('uploads');
    if (uploadsIndex === -1)
        return fullPath;
    const relativePath = fullPath.substring(uploadsIndex);
    return '/' + relativePath.replace(/\\/g, '/');
};
const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.getAllUsers();
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const createAdminUser = async (req, res, next) => {
    try {
        const { email, password, role, firstName, lastName, phoneNumber, nationalId } = req.body;
        const hashedPassword = await (0, bcrypt_utils_1.hashPassword)(password);
        const userId = await UserModel.createUser({
            email,
            password_hash: hashedPassword,
            role: role || 'client',
            status: 'active'
        });
        if (role === 'seller') {
            const sql = 'INSERT INTO sellers (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "approved")';
            await (0, connection_1.query)(sql, [userId, firstName, lastName, phoneNumber, nationalId]);
        }
        else if (role === 'agent') {
            const sql = 'INSERT INTO agents (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "approved")';
            await (0, connection_1.query)(sql, [userId, firstName, lastName, phoneNumber, nationalId]);
        }
        else if (role === 'client') {
            await UserModel.createClientProfile(userId, { firstName, lastName, phoneNumber });
        }
        res.status(201).json({ success: true, message: 'User created successfully' });
    }
    catch (error) {
        console.error('[CREATE_USER_ERROR]:', error);
        next(error);
    }
};
exports.createAdminUser = createAdminUser;
const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, status } = req.body;
        const updateData = {};
        if (role)
            updateData.role = role;
        if (status)
            updateData.status = status;
        await UserModel.updateUser(id, updateData);
        res.status(200).json({ success: true, message: 'User updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await UserModel.deleteUser(id);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
const getAllAgents = async (req, res, next) => {
    try {
        const sql = `
        SELECT a.*, u.email, u.status as user_status 
        FROM agents a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
    `;
        const agents = await (0, connection_1.query)(sql);
        res.status(200).json({ success: true, data: agents });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllAgents = getAllAgents;
const getPendingAgents = async (req, res, next) => {
    try {
        const sql = `
            SELECT a.*, u.email, u.status as user_status 
            FROM agents a
            JOIN users u ON a.user_id = u.id
            WHERE a.status = 'pending'
            ORDER BY a.created_at DESC
        `;
        const agents = await (0, connection_1.query)(sql);
        res.status(200).json({ success: true, data: agents });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingAgents = getPendingAgents;
const approveAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = 'UPDATE agents SET status = "approved" WHERE id = ?';
        await (0, connection_1.query)(sql, [id]);
        const userSql = 'UPDATE users SET status = "active" WHERE id = (SELECT user_id FROM agents WHERE id = ?)';
        await (0, connection_1.query)(userSql, [id]);
        res.status(200).json({ success: true, message: 'Agent approved successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.approveAgent = approveAgent;
const rejectAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = 'UPDATE agents SET status = "rejected" WHERE id = ?';
        await (0, connection_1.query)(sql, [id]);
        res.status(200).json({ success: true, message: 'Agent rejected' });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectAgent = rejectAgent;
const getAllSellers = async (req, res, next) => {
    try {
        const sql = `
            SELECT s.*, u.email, u.status as user_status 
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `;
        const sellers = await (0, connection_1.query)(sql);
        res.status(200).json({ success: true, data: sellers });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllSellers = getAllSellers;
const approveSeller = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = 'UPDATE sellers SET status = "approved" WHERE id = ?';
        await (0, connection_1.query)(sql, [id]);
        const userSql = 'UPDATE users SET status = "active" WHERE id = (SELECT user_id FROM sellers WHERE id = ?)';
        await (0, connection_1.query)(userSql, [id]);
        res.status(200).json({ success: true, message: 'Seller approved successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.approveSeller = approveSeller;
const rejectSeller = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = 'UPDATE sellers SET status = "rejected" WHERE id = ?';
        await (0, connection_1.query)(sql, [id]);
        res.status(200).json({ success: true, message: 'Seller rejected' });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectSeller = rejectSeller;
const updateSellerProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phoneNumber, nationalId, businessName } = req.body;
        const sql = `
            UPDATE sellers 
            SET first_name = ?, last_name = ?, phone_number = ?, national_id = ?, business_name = ?
            WHERE id = ?
        `;
        await (0, connection_1.query)(sql, [firstName, lastName, phoneNumber, nationalId, businessName, id]);
        res.status(200).json({ success: true, message: 'Seller profile updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSellerProfile = updateSellerProfile;
const deleteSeller = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM users WHERE id = (SELECT user_id FROM sellers WHERE id = ?)';
        await (0, connection_1.query)(sql, [id]);
        res.status(200).json({ success: true, message: 'Seller account deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSeller = deleteSeller;
const getPendingProducts = async (req, res, next) => {
    try {
        const houses = await (0, connection_1.query)(`
        SELECT h.id, h.title as name, 'house' as type, h.created_at, h.images, h.status,
               s.first_name, s.last_name, u.email, s.phone_number
        FROM houses h
        LEFT JOIN sellers s ON h.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE h.status IN ('pending_approval', 'available', 'rented', 'purchased')
    `);
        const accommodations = await (0, connection_1.query)(`
        SELECT a.id, a.name, a.type, a.created_at, a.images, a.status,
               s.first_name, s.last_name, u.email, s.phone_number
        FROM accommodations a
        LEFT JOIN sellers s ON a.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE a.status IN ('pending_approval', 'available', 'unavailable')
    `);
        const vehicles = await (0, connection_1.query)(`
        SELECT v.id, CONCAT(v.make, ' ', v.model) as name, 'vehicle' as type, v.created_at, v.images, v.status,
               s.first_name, s.last_name, u.email, s.phone_number
        FROM vehicles v
        LEFT JOIN sellers s ON v.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE v.status IN ('pending_approval', 'available', 'rented', 'sold')
    `);
        const products = [...houses, ...accommodations, ...vehicles];
        products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingProducts = getPendingProducts;
const getTableNameFromType = (type) => {
    const typeMap = {
        house: 'houses',
        accommodation: 'accommodations',
        vehicle: 'vehicles',
        apartment: 'accommodations',
        hotel_room: 'accommodations',
        event_hall: 'accommodations',
    };
    return typeMap[type] || null;
};
const approveProduct = async (req, res, next) => {
    try {
        const { type, id } = req.params;
        const tableName = getTableNameFromType(type);
        if (!tableName)
            return res.status(400).json({ success: false, message: 'Invalid product type' });
        await (0, connection_1.query)(`UPDATE ${tableName} SET status = 'available' WHERE id = ?`, [id]);
        res.status(200).json({ success: true, message: `Product approved successfully` });
    }
    catch (error) {
        next(error);
    }
};
exports.approveProduct = approveProduct;
const rejectProduct = async (req, res, next) => {
    try {
        const { type, id } = req.params;
        const tableName = getTableNameFromType(type);
        if (!tableName)
            return res.status(400).json({ success: false, message: 'Invalid product type' });
        await (0, connection_1.query)(`UPDATE ${tableName} SET status = 'rejected' WHERE id = ?`, [id]);
        res.status(200).json({ success: true, message: `Product rejected` });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectProduct = rejectProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { type, id } = req.params;
        const tableName = getTableNameFromType(type);
        if (!tableName)
            return res.status(400).json({ success: false, message: 'Invalid product type' });
        const [product] = await (0, connection_1.query)(`SELECT status FROM ${tableName} WHERE id = ?`, [id]);
        if (!product)
            return res.status(404).json({ success: false, message: 'Product not found' });
        const isFinished = ['rented', 'purchased', 'sold', 'unavailable'].includes(product.status);
        if (!isFinished) {
            const idKey = type === 'house' ? 'house_id' : type === 'vehicle' ? 'vehicle_id' : 'accommodation_id';
            const [booking] = await (0, connection_1.query)(`SELECT id FROM bookings WHERE ${idKey} = ? LIMIT 1`, [id]);
            if (booking)
                return res.status(403).json({ success: false, message: "Cannot delete this property because it is still in process or has active bookings." });
        }
        const idKey = type === 'house' ? 'house_id' : type === 'vehicle' ? 'vehicle_id' : 'accommodation_id';
        await (0, connection_1.query)(`UPDATE bookings SET ${idKey} = NULL WHERE ${idKey} = ?`, [id]);
        await (0, connection_1.query)(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
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
const approveBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        await BookingModel.updateBookingStatus(id, 'approved');
        res.status(200).json({ success: true, message: 'Booking approved successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.approveBooking = approveBooking;
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await BookingModel.updateBookingStatus(id, status);
        res.status(200).json({ success: true, message: `Booking ${status} successfully` });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBookingStatus = updateBookingStatus;
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        await BookingModel.deleteBookingById(id);
        res.status(200).json({ success: true, message: 'Booking deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBooking = deleteBooking;
const verifyBookingPayment = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        // 1. Verify Payment
        await (0, connection_1.query)(`UPDATE payments SET status = 'completed', verified_at = CURRENT_TIMESTAMP WHERE booking_id = ?`, [bookingId]);
        await (0, connection_1.query)(`UPDATE bookings SET payment_status = 'paid', booking_status = 'confirmed' WHERE id = ?`, [bookingId]);
        // 2. Fetch booking details
        const booking = await BookingModel.getBookingById(bookingId);
        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' });
        // 3. Update associated property status
        if (booking.house_id) {
            const status = booking.booking_type === 'house_rent' ? 'rented' : 'purchased';
            await (0, connection_1.query)(`UPDATE houses SET status = ? WHERE id = ?`, [status, booking.house_id]);
        }
        else if (booking.vehicle_id) {
            const status = booking.booking_type === 'vehicle_rent' ? 'rented' : 'sold';
            await (0, connection_1.query)(`UPDATE vehicles SET status = ? WHERE id = ?`, [status, booking.vehicle_id]);
        }
        else if (booking.accommodation_id) {
            await (0, connection_1.query)(`UPDATE accommodations SET status = 'unavailable' WHERE id = ?`, [booking.accommodation_id]);
        }
        // 4. Calculate Commissions
        const totalAmount = Number(booking.total_amount);
        // Seller Payout (90%) - Only if associated with a seller
        let sellerId = null;
        if (booking.house_id) {
            const [house] = await (0, connection_1.query)('SELECT seller_id FROM houses WHERE id = ?', [booking.house_id]);
            sellerId = house?.seller_id;
        }
        else if (booking.vehicle_id) {
            const [vehicle] = await (0, connection_1.query)('SELECT seller_id FROM vehicles WHERE id = ?', [booking.vehicle_id]);
            sellerId = vehicle?.seller_id;
        }
        else if (booking.accommodation_id) {
            const [accommodation] = await (0, connection_1.query)('SELECT seller_id FROM accommodations WHERE id = ?', [booking.accommodation_id]);
            sellerId = accommodation?.seller_id;
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
        // Agent Commission (3%)
        if (booking.agent_id) {
            const agentCommission = totalAmount * 0.03;
            await CommissionModel.createCommission({
                agent_id: booking.agent_id,
                booking_id: bookingId,
                amount: agentCommission,
                commission_type: 'agent',
                status: 'approved'
            });
        }
        // System Fee (10% - Agent 3% if exists)
        const systemFeeRate = booking.agent_id ? 0.07 : 0.10;
        const systemFee = totalAmount * systemFeeRate;
        await CommissionModel.createCommission({
            booking_id: bookingId,
            amount: systemFee,
            commission_type: 'system',
            status: 'approved'
        });
        res.status(200).json({ success: true, message: 'Payment verified, booking confirmed, and commissions generated.' });
    }
    catch (error) {
        console.error('[VERIFY_PAYMENT_ERROR]:', error);
        next(error);
    }
};
exports.verifyBookingPayment = verifyBookingPayment;
const getStats = async (req, res, next) => {
    try {
        const [userCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM users');
        const [accommodationCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM accommodations');
        const [vehicleCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM vehicles');
        const [houseCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM houses');
        const [bookingCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM bookings');
        res.status(200).json({
            success: true,
            data: {
                users: userCount.count,
                accommodations: accommodationCount.count,
                vehicles: vehicleCount.count,
                houses: houseCount.count,
                bookings: bookingCount.count
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStats = getStats;
const getAllCommissions = async (req, res, next) => {
    try {
        const sql = `
      SELECT 
        c.id, c.amount, c.status, c.earned_at, c.commission_type, c.payout_proof_path,
        CASE 
          WHEN c.commission_type = 'agent' THEN a.first_name 
          WHEN c.commission_type = 'seller_payout' THEN s.first_name 
          ELSE 'System' 
        END as first_name,
        CASE 
          WHEN c.commission_type = 'agent' THEN a.last_name 
          WHEN c.commission_type = 'seller_payout' THEN s.last_name 
          ELSE 'Owner' 
        END as last_name,
        CASE 
          WHEN c.commission_type = 'agent' THEN a.phone_number 
          WHEN c.commission_type = 'seller_payout' THEN s.phone_number 
          ELSE 'N/A' 
        END as phone_number
      FROM commissions c
      LEFT JOIN agents a ON c.agent_id = a.id
      LEFT JOIN sellers s ON c.seller_id = s.id
      ORDER BY c.earned_at DESC
    `;
        const commissions = await (0, connection_1.query)(sql);
        res.status(200).json({ success: true, data: commissions });
    }
    catch (error) {
        console.error('[GET_ALL_COMMISSIONS_ERROR]:', error);
        next(error);
    }
};
exports.getAllCommissions = getAllCommissions;
const payCommission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payoutProof = req.file ? getRelativePath(req.file.path) : undefined;
        if (!payoutProof) {
            return res.status(400).json({ success: false, message: 'Payout proof is required.' });
        }
        await CommissionModel.updateCommissionStatus(id, 'paid', payoutProof);
        res.status(200).json({ success: true, message: 'Commission marked as paid. Proof uploaded.' });
    }
    catch (error) {
        next(error);
    }
};
exports.payCommission = payCommission;
const markCommissionAsPaid = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = 'UPDATE commissions SET status = "paid", paid_at = CURRENT_TIMESTAMP WHERE id = ?';
        await (0, connection_1.query)(sql, [id]);
        res.status(200).json({ success: true, message: 'Commission marked as paid' });
    }
    catch (error) {
        next(error);
    }
};
exports.markCommissionAsPaid = markCommissionAsPaid;
const deleteCommission = async (req, res, next) => {
    try {
        const { id } = req.params;
        await (0, connection_1.query)('DELETE FROM commissions WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Commission record deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCommission = deleteCommission;
//# sourceMappingURL=admin.controller.js.map