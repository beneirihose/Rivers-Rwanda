import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../database/connection';
import { hashPassword, comparePassword } from '../utils/bcrypt.utils';
import { createOtp, sendOtpEmail } from '../utils/otp.util';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/connection';

// --- USER REGISTRATION WITH OTP --- 
export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, phone, password, role, nationalId } = req.body;

  if (!fullName || !email || !phone || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (role === 'agent' && !nationalId) {
    return res.status(400).json({ success: false, message: 'National ID is required for agents.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [existingUser] = await connection.execute<any[]>('SELECT id FROM users WHERE email = ? OR id IN (SELECT user_id FROM clients WHERE phone_number = ?) OR id IN (SELECT user_id FROM agents WHERE phone_number = ?)', [email, phone, phone]);
    if (existingUser.length > 0) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'An account with this email or phone number already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    await connection.execute('INSERT INTO users (id, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      userId, email, hashedPassword, role, 'pending'
    ]);

    const [firstName, ...lastName] = fullName.split(' ');
    if (role === 'client') {
      await connection.execute('INSERT INTO clients (user_id, first_name, last_name, phone_number) VALUES (?, ?, ?, ?)', [userId, firstName, lastName.join(' ') || ' ', phone]);
    } else {
      await connection.execute('INSERT INTO agents (user_id, first_name, last_name, phone_number, national_id) VALUES (?, ?, ?, ?, ?)', [userId, firstName, lastName.join(' ') || ' ', phone, nationalId]);
    }

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

// --- EMAIL VERIFICATION WITH OTP ---
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

// --- LOGIN (UPDATED) ---
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const [user] = await query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    if (user.status !== 'active' || !user.email_verified) {
        return res.status(401).json({ success: false, message: 'Account not active or email not verified. Please verify your email first.', needsVerification: true, userId: user.id });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '24h' });

    res.status(200).json({ 
        success: true, 
        message: 'Login successful!', 
        data: { token, user: { id: user.id, email: user.email, role: user.role } }
    });

  } catch (error) {
    next(error);
  }
};

// --- RESEND OTP ---
export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  try {
    const [user] = await query<any[]>('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'active' && user.email_verified) {
      return res.status(400).json({ success: false, message: 'This account is already active and verified.' });
    }

    const otp = await createOtp(userId, 'email_verification', pool);
    await sendOtpEmail(user.email, otp);

    res.status(200).json({ success: true, message: 'A new OTP has been sent to your email address.' });

  } catch (error) {
    next(error);
  }
};


// --- PASSWORD RESET --- 
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.'});

    try {
        const [user] = await query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            // Still send a success response to prevent user enumeration attacks
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset OTP has been sent.' });
        }

        const otp = await createOtp(user.id, 'password_reset', pool);
        await sendOtpEmail(email, otp);

        res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset OTP has been sent.' });

    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    try {
        const [user] = await query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(400).json({ success: false, message: 'Invalid email or OTP.' });

        const [otpRecord] = await query<any[]>('SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND purpose = \'password_reset\' ORDER BY created_at DESC LIMIT 1', [user.id, otp]);

        if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        if (otpRecord.is_used) return res.status(400).json({ success: false, message: 'This OTP has already been used.' });
        if (new Date() > new Date(otpRecord.expires_at)) return res.status(400).json({ success: false, message: 'This OTP has expired.' });

        await query('UPDATE otps SET is_used = TRUE WHERE id = ?', [otpRecord.id]);
        
        const hashedPassword = await hashPassword(newPassword);
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

        res.status(200).json({ success: true, message: 'Password has been reset successfully. You can now log in with your new password.' });

    } catch (error) {
        next(error);
    }
}
