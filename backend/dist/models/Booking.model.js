"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookingById = exports.updateBookingStatus = exports.getAllBookings = exports.createBooking = exports.getBookingDetailsForInvoice = exports.updateBookingPaymentStatus = exports.getBookingById = exports.getBookingsBySellerId = exports.getBookingsByClientId = void 0;
const connection_1 = require("../database/connection");
const uuid_1 = require("uuid");
const getBookingsByClientId = async (clientId) => {
    const sql = `
    SELECT 
      b.*,
      p.payment_proof_path,
      COALESCE(h.title, acc.name, CONCAT(v.make, ' ', v.model)) as property_name,
      acc.type as accommodation_type,
      acc.sub_type as accommodation_sub_type
    FROM bookings as b
    LEFT JOIN payments as p ON b.id = p.booking_id
    LEFT JOIN houses as h ON b.house_id = h.id
    LEFT JOIN accommodations as acc ON b.accommodation_id = acc.id
    LEFT JOIN vehicles as v ON b.vehicle_id = v.id
    WHERE b.client_id = ? 
    ORDER BY b.created_at DESC
  `;
    return await (0, connection_1.query)(sql, [clientId]);
};
exports.getBookingsByClientId = getBookingsByClientId;
const getBookingsBySellerId = async (sellerId) => {
    const sql = `
    SELECT 
      b.*,
      p.payment_proof_path,
      CONCAT(c.first_name, ' ', c.last_name) as client_name,
      c.phone_number as client_phone,
      COALESCE(h.title, acc.name, CONCAT(v.make, ' ', v.model)) as property_name,
      acc.type as accommodation_type,
      acc.sub_type as accommodation_sub_type
    FROM bookings as b
    LEFT JOIN clients as c ON b.client_id = c.id
    LEFT JOIN payments as p ON b.id = p.booking_id
    LEFT JOIN houses as h ON b.house_id = h.id
    LEFT JOIN accommodations as acc ON b.accommodation_id = acc.id
    LEFT JOIN vehicles as v ON b.vehicle_id = v.id
    WHERE b.seller_id = ? 
    ORDER BY b.created_at DESC
  `;
    return await (0, connection_1.query)(sql, [sellerId]);
};
exports.getBookingsBySellerId = getBookingsBySellerId;
const getBookingById = async (id) => {
    const sql = ` SELECT * FROM bookings WHERE id = ? `;
    const results = await (0, connection_1.query)(sql, [id]);
    return results[0] || null;
};
exports.getBookingById = getBookingById;
const updateBookingPaymentStatus = async (id, status) => {
    const sql = 'UPDATE bookings SET payment_status = ? WHERE id = ?';
    await (0, connection_1.query)(sql, [status, id]);
};
exports.updateBookingPaymentStatus = updateBookingPaymentStatus;
const getBookingDetailsForInvoice = async (bookingId) => {
    const sql = `
        SELECT
            b.*,
            c.first_name as client_first_name,
            c.last_name as client_last_name,
            c.phone_number as client_phone,
            u.email as client_email,
            p.payment_method,
            p.status as payment_status_from_payment_table,
            h.title as house_title,
            h.full_address as house_address,
            v.make as vehicle_make,
            v.model as vehicle_model,
            acc.name as accommodation_name,
            acc.type as accommodation_type,
            acc.sub_type as accommodation_sub_type
        FROM bookings as b
        LEFT JOIN clients as c ON b.client_id = c.id
        LEFT JOIN users as u ON c.user_id = u.id
        LEFT JOIN payments as p ON b.id = p.booking_id
        LEFT JOIN houses as h ON b.house_id = h.id
        LEFT JOIN vehicles as v ON b.vehicle_id = v.id
        LEFT JOIN accommodations as acc ON b.accommodation_id = acc.id
        WHERE b.id = ?
    `;
    const [details] = await (0, connection_1.query)(sql, [bookingId]);
    return details;
};
exports.getBookingDetailsForInvoice = getBookingDetailsForInvoice;
const createBooking = async (data) => {
    const reference = 'RR' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const bookingId = (0, uuid_1.v4)();
    const sql = `
    INSERT INTO bookings (id, booking_type, booking_reference, client_id, seller_id, agent_id, accommodation_id, vehicle_id, house_id, start_date, end_date, total_amount, booking_status, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
  `;
    await (0, connection_1.query)(sql, [
        bookingId,
        data.booking_type,
        reference,
        data.client_id,
        data.seller_id || null,
        data.agent_id || null,
        data.accommodation_id || null,
        data.vehicle_id || null,
        data.house_id || null,
        data.start_date || null,
        data.end_date || null,
        data.total_amount
    ]);
    const [newBooking] = await (0, connection_1.query)('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return newBooking;
};
exports.createBooking = createBooking;
const getAllBookings = async () => {
    const sql = `
    SELECT 
      b.*,
      p.id as payment_id,
      p.payment_method,
      p.payment_proof_path,
      p.status as payment_status_from_payment_table,
      p.verified_at,
      CONCAT(c.first_name, ' ', c.last_name) as client_name,
      c.phone_number as client_phone,
      CONCAT(a.first_name, ' ', a.last_name) as agent_name,
      COALESCE(h.title, acc.name, CONCAT(v.make, ' ', v.model)) as property_name,
      acc.type as accommodation_type,
      acc.sub_type as accommodation_sub_type
    FROM bookings as b
    LEFT JOIN clients as c ON b.client_id = c.id
    LEFT JOIN agents as a ON b.agent_id = a.id
    LEFT JOIN payments as p ON b.id = p.booking_id
    LEFT JOIN houses as h ON b.house_id = h.id
    LEFT JOIN accommodations as acc ON b.accommodation_id = acc.id
    LEFT JOIN vehicles as v ON b.vehicle_id = v.id
    ORDER BY b.created_at DESC
  `;
    return await (0, connection_1.query)(sql);
};
exports.getAllBookings = getAllBookings;
const updateBookingStatus = async (id, status) => {
    const sql = 'UPDATE bookings SET booking_status = ? WHERE id = ?';
    await (0, connection_1.query)(sql, [status, id]);
};
exports.updateBookingStatus = updateBookingStatus;
const deleteBookingById = async (id) => {
    const sql = 'DELETE FROM bookings WHERE id = ?';
    await (0, connection_1.query)(sql, [id]);
};
exports.deleteBookingById = deleteBookingById;
//# sourceMappingURL=Booking.model.js.map