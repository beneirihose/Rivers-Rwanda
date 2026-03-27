"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInquiryStatus = exports.getAllInquiries = exports.createInquiry = void 0;
const connection_1 = require("../database/connection");
const createInquiry = async (data) => {
    const sql = `
    INSERT INTO contact_inquiries (id, full_name, email, phone_number, subject, message, status)
    VALUES (UUID(), ?, ?, ?, ?, ?, 'new')
  `;
    await (0, connection_1.query)(sql, [
        data.fullName,
        data.email,
        data.phoneNumber,
        data.subject,
        data.message
    ]);
};
exports.createInquiry = createInquiry;
const getAllInquiries = async () => {
    const sql = 'SELECT * FROM contact_inquiries ORDER BY created_at DESC';
    return await (0, connection_1.query)(sql);
};
exports.getAllInquiries = getAllInquiries;
const updateInquiryStatus = async (id, status) => {
    const sql = 'UPDATE contact_inquiries SET status = ? WHERE id = ?';
    await (0, connection_1.query)(sql, [status, id]);
};
exports.updateInquiryStatus = updateInquiryStatus;
//# sourceMappingURL=Contact.model.js.map