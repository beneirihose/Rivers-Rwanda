import mysql from 'mysql2/promise';
/**
 * Creates and stores a new OTP for a user.
 * @param userId - The ID of the user.
 * @param purpose - The purpose of the OTP (e.g., 'email_verification').
 * @param dbConnection - The database connection or pool to use for the query.
 * @returns The generated OTP code.
 */
export declare const createOtp: (userId: string, purpose: "email_verification" | "password_reset", dbConnection: mysql.Pool | mysql.PoolConnection) => Promise<string>;
/**
 * Sends a formatted OTP email to the user.
 * @param email - The recipient's email address.
 * @param otp - The OTP code to send.
 */
export declare const sendOtpEmail: (email: string, otp: string) => Promise<void>;
//# sourceMappingURL=otp.util.d.ts.map