import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../database/connection';
import { hashPassword, comparePassword } from '../utils/bcrypt.utils';
import { createOtp, sendOtpEmail } from '../utils/otp.util';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, phone, password, role, nationalId } = req.body;

  if (!fullName || !email || !phone || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Specialized validation for agents and sellers
  if ((role === 'agent' || role === 'seller') && !nationalId) {
    return res.status(400).json({ success: false, message: `National ID is required for ${role}s.` });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if user already exists
    const [existingUser] = await connection.execute<any[]>(
        'SELECT id FROM users WHERE email = ?', [email]
    );
    
    if (existingUser.length > 0) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

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
    } else if (role === 'agent') {
      await connection.execute('INSERT INTO agents (id, user_id, first_name, last_name, phone_number, national_id) VALUES (UUID(), ?, ?, ?, ?, ?)', [userId, firstName, lastName, phone, nationalId]);
    } else if (role === 'seller') {
      await connection.execute('INSERT INTO sellers (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "pending")', [userId, firstName, lastName, phone, nationalId]);
    }

    // 3. Handle OTP
    const otp = await createOtp(userId, 'email_verification', connection);
    await sendOtpEmail(email, otp);
    
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP.',
      data: { userId }
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: 'User ID and OTP are required.' });
    }

    try {
        const [otpRecord] = await query<any[]>('SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND purpose = \'email_verification\' ORDER BY created_at DESC LIMIT 1', [userId, otp]);

        if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        if (otpRecord.is_used) return res.status(400).json({ success: false, message: 'This OTP has already been used.' });
        if (new Date() > new Date(otpRecord.expires_at)) return res.status(400).json({ success: false, message: 'This OTP has expired.' });

        await query('UPDATE otps SET is_used = TRUE WHERE id = ?', [otpRecord.id]);
        await query('UPDATE users SET status = \'active\', email_verified = TRUE WHERE id = ?', [userId]);

        res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });

    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const [user] = await query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    if (user.status !== 'active' || !user.email_verified) {
        return res.status(401).json({ success: false, message: 'Account not active or email not verified.', needsVerification: true, userId: user.id });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your_secret', { expiresIn: '24h' });

    res.status(200).json({ 
        success: true, 
        message: 'Login successful!', 
        data: { token, user: { id: user.id, email: user.email, role: user.role } }
    });

  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  try {
    const [user] = await query<any[]>('SELECT email FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const otp = await createOtp(userId, 'email_verification', pool);
    await sendOtpEmail(user.email, otp);
    res.status(200).json({ success: true, message: 'OTP has been resent.' });
  } catch (error) { next(error); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    try {
        const [user] = await query<any[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (user) {
            const otp = await createOtp(user.id, 'password_reset', pool);
            await sendOtpEmail(email, otp);
        }
        res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    } catch (error) { next(error); }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword } = req.body;
    try {
        const [user] = await query<any[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (!user) return res.status(400).json({ success: false, message: 'Invalid email or OTP.' });

        const [otpRecord] = await query<any[]>('SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND purpose = \'password_reset\' ORDER BY created_at DESC LIMIT 1', [user.id, otp]);
        if (!otpRecord || otpRecord.is_used || new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        await query('UPDATE otps SET is_used = TRUE WHERE id = ?', [otpRecord.id]);
        const hashedPassword = await hashPassword(newPassword);
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (error) { next(error); }
}

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    try {
        const [user] = await query<any[]>('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await comparePassword(currentPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

        const hashedPassword = await hashPassword(newPassword);
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};
