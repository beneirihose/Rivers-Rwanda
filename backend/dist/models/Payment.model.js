"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusByBookingId = exports.createPayment = void 0;
const connection_1 = require("../database/connection");
const uuid_1 = require("uuid");
const createPayment = async (data) => {
    const paymentId = (0, uuid_1.v4)();
    const sql = `
    INSERT INTO payments (id, booking_id, amount, payment_method, transaction_id, payment_proof_path, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;
    await (0, connection_1.query)(sql, [
        paymentId,
        data.booking_id,
        data.amount,
        data.payment_method,
        data.transaction_id || null,
        data.payment_proof_path || null
    ]);
};
exports.createPayment = createPayment;
const updatePaymentStatusByBookingId = async (bookingId, status) => {
    const sql = 'UPDATE payments SET status = ?, verified_at = CURRENT_TIMESTAMP WHERE booking_id = ?';
    await (0, connection_1.query)(sql, [status, bookingId]);
};
exports.updatePaymentStatusByBookingId = updatePaymentStatusByBookingId;
//# sourceMappingURL=Payment.model.js.map