import { Request, Response, NextFunction } from 'express';
import { query } from '../database/connection';
import * as BookingModel from '../models/Booking.model';
import * as UserModel from '../models/User.model';
import * as CommissionModel from '../models/Commission.model';
import * as PaymentModel from '../models/Payment.model';
import { hashPassword } from '../utils/bcrypt.utils';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    await UserModel.createUser({
      email,
      password_hash: hashedPassword,
      role: role || 'client',
      status: 'active'
    });
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;
    
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    await UserModel.updateUser(id, updateData);
    res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await UserModel.deleteUser(id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPendingAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = 'SELECT * FROM agents WHERE status = "pending"';
    const agents = await query(sql);
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

export const approveAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sql = 'UPDATE agents SET status = "approved" WHERE id = ?';
    await query(sql, [id]);
    
    const userSql = 'UPDATE users SET status = "active", role = "agent" WHERE id = (SELECT user_id FROM agents WHERE id = ?)';
    await query(userSql, [id]);

    res.status(200).json({ success: true, message: 'Agent approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const rejectAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sql = 'UPDATE agents SET status = "rejected" WHERE id = ?';
    await query(sql, [id]);
    res.status(200).json({ success: true, message: 'Agent rejected' });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await BookingModel.getAllBookings();
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await BookingModel.updateBookingStatus(id, status);

    if (status === 'completed') {
      const [booking] = await query<BookingModel.Booking[]>('SELECT * FROM bookings WHERE id = ?', [id]);
      if (booking && booking.agent_id) {
        const [agent] = await query<any[]>('SELECT commission_rate FROM agents WHERE id = ?', [booking.agent_id]);
        if (agent) {
          const commissionAmount = booking.total_amount * (agent.commission_rate / 100);
          await CommissionModel.createCommission({
            agent_id: booking.agent_id,
            booking_id: id,
            amount: commissionAmount
          });
        }
      }
    }

    res.status(200).json({ success: true, message: `Booking ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query('UPDATE payments SET status = \'completed\', verified_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    await query('UPDATE bookings SET payment_status = \'paid\' WHERE id = (SELECT booking_id FROM payments WHERE id = ?)', [id]);
    res.status(200).json({ success: true, message: 'Payment verified' });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [userCount] = await query('SELECT COUNT(*) as count FROM users');
    const [accommodationCount] = await query('SELECT COUNT(*) as count FROM accommodations');
    const [vehicleCount] = await query('SELECT COUNT(*) as count FROM vehicles');
    const [houseCount] = await query('SELECT COUNT(*) as count FROM houses');
    const [bookingCount] = await query('SELECT COUNT(*) as count FROM bookings');

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
  } catch (error) {
    next(error);
  }
};
