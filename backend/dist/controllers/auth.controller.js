"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.resendOtp = exports.login = exports.verifyEmail = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../database/connection");
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const otp_util_1 = require("../utils/otp.util");
const uuid_1 = require("uuid");
const connection_2 = require("../database/connection");
const register = async (req, res, next) => {
    const { fullName, email, phone, password, role, nationalId } = req.body;
    if (!fullName || !email || !phone || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    // Specialized validation for agents and sellers
    if ((role === 'agent' || role === 'seller') && !nationalId) {
        return res.status(400).json({ success: false, message: `National ID is required for ${role}s.` });
    }
    const connection = await connection_1.pool.getConnection();
    try {
        await connection.beginTransaction();
        // Check if user already exists
        const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }
        const hashedPassword = await (0, bcrypt_utils_1.hashPassword)(password);
        const userId = (0, uuid_1.v4)();
        // 1. Create User
        await connection.execute('INSERT INTO users (id, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
            userId, email, hashedPassword, role, 'pending'
        ]);
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || ' ';
        // 2. Create Profile based on Role
        if (role === 'client') {
            await connection.execute('INSERT INTO clients (id, user_id, first_name, last_name, phone_number) VALUES (UUID(), ?, ?, ?, ?)', [userId, firstName, lastName, phone]);
        }
        else if (role === 'agent') {
            // Corrected: national_id is the column name in DB
            await connection.execute('INSERT INTO agents (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "pending")', [userId, firstName, lastName, phone, nationalId]);
        }
        else if (role === 'seller') {
            await connection.execute('INSERT INTO sellers (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "pending")', [userId, firstName, lastName, phone, nationalId]);
        }
        // 3. Handle OTP
        const otp = await (0, otp_util_1.createOtp)(userId, 'email_verification', connection);
        await (0, otp_util_1.sendOtpEmail)(email, otp);
        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for the OTP.',
            data: { userId }
        });
    }
    catch (error) {
        await connection.rollback();
        console.error('[AUTH_REGISTER_ERROR]:', error);
        next(error);
    }
    finally {
        connection.release();
    }
};
exports.register = register;
const verifyEmail = async (req, res, next) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: 'User ID and OTP are required.' });
    }
    try {
        const [otpRecord] = await (0, connection_2.query)('SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND purpose = \'email_verification\' ORDER BY created_at DESC LIMIT 1', [userId, otp]);
        if (!otpRecord)
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        if (otpRecord.is_used)
            return res.status(400).json({ success: false, message: 'This OTP has already been used.' });
        if (new Date() > new Date(otpRecord.expires_at))
            return res.status(400).json({ success: false, message: 'This OTP has expired.' });
        await (0, connection_2.query)('UPDATE otps SET is_used = TRUE WHERE id = ?', [otpRecord.id]);
        await (0, connection_2.query)('UPDATE users SET status = \'active\', email_verified = TRUE WHERE id = ?', [userId]);
        res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    try {
        const [user] = await (0, connection_2.query)('SELECT * FROM users WHERE email = ?', [email]);
        if (!user)
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        if (user.status !== 'active' || !user.email_verified) {
            return res.status(401).json({ success: false, message: 'Account not active or email not verified.', needsVerification: true, userId: user.id });
        }
        const isMatch = await (0, bcrypt_utils_1.comparePassword)(password, user.password_hash);
        if (!isMatch)
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your_secret', { expiresIn: '24h' });
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: { token, user: { id: user.id, email: user.email, role: user.role } }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const resendOtp = async (req, res, next) => {
    const { userId } = req.body;
    try {
        const [user] = await (0, connection_2.query)('SELECT email FROM users WHERE id = ?', [userId]);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found.' });
        const otp = await (0, otp_util_1.createOtp)(userId, 'email_verification', connection_1.pool);
        await (0, otp_util_1.sendOtpEmail)(user.email, otp);
        res.status(200).json({ success: true, message: 'OTP has been resent.' });
    }
    catch (error) {
        next(error);
    }
};
exports.resendOtp = resendOtp;
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const [user] = await (0, connection_2.query)('SELECT id FROM users WHERE email = ?', [email]);
        if (user) {
            const otp = await (0, otp_util_1.createOtp)(user.id, 'password_reset', connection_1.pool);
            await (0, otp_util_1.sendOtpEmail)(email, otp);
        }
        res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    try {
        const [user] = await (0, connection_2.query)('SELECT id FROM users WHERE email = ?', [email]);
        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid email or OTP.' });
        const [otpRecord] = await (0, connection_2.query)('SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND purpose = \'password_reset\' ORDER BY created_at DESC LIMIT 1', [user.id, otp]);
        if (!otpRecord || otpRecord.is_used || new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        await (0, connection_2.query)('UPDATE otps SET is_used = TRUE WHERE id = ?', [otpRecord.id]);
        const hashedPassword = await (0, bcrypt_utils_1.hashPassword)(newPassword);
        await (0, connection_2.query)('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);
        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    try {
        const [user] = await (0, connection_2.query)('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const isMatch = await (0, bcrypt_utils_1.comparePassword)(currentPassword, user.password_hash);
        if (!isMatch)
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        const hashedPassword = await (0, bcrypt_utils_1.hashPassword)(newPassword);
        await (0, connection_2.query)('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map