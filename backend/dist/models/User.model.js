"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSellerProfile = exports.createClientProfile = exports.deleteUser = exports.updateUser = exports.verifyOtp = exports.storeOtp = exports.createUser = exports.getSellerIdByUserId = exports.getClientIdByUserId = exports.getAllUsers = exports.findUserById = exports.findUserByEmail = void 0;
const connection_1 = require("../database/connection");
const findUserByEmail = async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await (0, connection_1.query)(sql, [email]);
    return results[0] || null;
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await (0, connection_1.query)(sql, [id]);
    return results[0] || null;
};
exports.findUserById = findUserById;
const getAllUsers = async () => {
    const sql = 'SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC';
    return await (0, connection_1.query)(sql);
};
exports.getAllUsers = getAllUsers;
const getClientIdByUserId = async (userId) => {
    const sql = 'SELECT id FROM clients WHERE user_id = ?';
    const results = await (0, connection_1.query)(sql, [userId]);
    return results[0]?.id || null;
};
exports.getClientIdByUserId = getClientIdByUserId;
const getSellerIdByUserId = async (userId) => {
    const sql = 'SELECT id FROM sellers WHERE user_id = ?';
    const results = await (0, connection_1.query)(sql, [userId]);
    return results[0]?.id || null;
};
exports.getSellerIdByUserId = getSellerIdByUserId;
const createUser = async (userData) => {
    const sql = `
    INSERT INTO users (id, email, password_hash, role, status)
    VALUES (UUID(), ?, ?, ?, ?)
  `;
    const status = userData.status || (userData.role === 'seller' ? 'pending' : 'active');
    await (0, connection_1.query)(sql, [userData.email, userData.password_hash, userData.role, status]);
    const user = await (0, exports.findUserByEmail)(userData.email);
    return user.id;
};
exports.createUser = createUser;
const storeOtp = async (userId, otpCode, purpose) => {
    const sql = 'INSERT INTO otps (user_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))';
    await (0, connection_1.query)(sql, [userId, otpCode, purpose]);
};
exports.storeOtp = storeOtp;
const verifyOtp = async (userId, otpCode) => {
    const sql = 'SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND expires_at > NOW() AND is_used = false';
    const results = await (0, connection_1.query)(sql, [userId, otpCode]);
    if (results.length > 0) {
        const updateSql = 'UPDATE otps SET is_used = true WHERE id = ?';
        await (0, connection_1.query)(updateSql, [results[0].id]);
        return true;
    }
    return false;
};
exports.verifyOtp = verifyOtp;
const updateUser = async (id, data) => {
    const fields = Object.keys(data);
    if (fields.length === 0)
        return;
    let sql = 'UPDATE users SET ';
    const params = [];
    fields.forEach((field, index) => {
        sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
        params.push(data[field]);
    });
    sql += ' WHERE id = ?';
    params.push(id);
    await (0, connection_1.query)(sql, params);
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    await (0, connection_1.query)(sql, [id]);
};
exports.deleteUser = deleteUser;
const createClientProfile = async (userId, profile) => {
    const sql = 'INSERT INTO clients (id, user_id, first_name, last_name, phone_number) VALUES (UUID(), ?, ?, ?, ?)';
    await (0, connection_1.query)(sql, [userId, profile.firstName, profile.lastName, profile.phoneNumber]);
};
exports.createClientProfile = createClientProfile;
const createSellerProfile = async (userId, profile) => {
    const sql = 'INSERT INTO sellers (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "pending")';
    await (0, connection_1.query)(sql, [userId, profile.firstName, profile.lastName, profile.phoneNumber, profile.nationalId]);
};
exports.createSellerProfile = createSellerProfile;
//# sourceMappingURL=User.model.js.map