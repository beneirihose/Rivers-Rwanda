"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = exports.createOtp = void 0;
const email_util_1 = require("./email.util");
// Generates a random 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
/**
 * Creates and stores a new OTP for a user.
 * @param userId - The ID of the user.
 * @param purpose - The purpose of the OTP (e.g., 'email_verification').
 * @param dbConnection - The database connection or pool to use for the query.
 * @returns The generated OTP code.
 */
const createOtp = async (userId, purpose, dbConnection) => {
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await dbConnection.execute('INSERT INTO otps (user_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)', [userId, otpCode, purpose, expiresAt]);
    return otpCode;
};
exports.createOtp = createOtp;
/**
 * Sends a formatted OTP email to the user.
 * @param email - The recipient's email address.
 * @param otp - The OTP code to send.
 */
const sendOtpEmail = async (email, otp) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="text-align: center; color: #333;">Your One-Time Password</h2>
      <p>Hello,</p>
      <p>Thank you for signing up with Rivers Rwanda. Please use the following OTP to verify your email address:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; background-color: #f0f0f0; border-radius: 5px;">
          ${otp}
        </span>
      </div>
      <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <p>Best regards,<br/>The Rivers Rwanda Team</p>
    </div>
  `;
    await (0, email_util_1.sendEmail)({
        to: email,
        subject: 'Your Rivers Rwanda OTP Code',
        html: htmlContent,
    });
};
exports.sendOtpEmail = sendOtpEmail;
//# sourceMappingURL=otp.util.js.map