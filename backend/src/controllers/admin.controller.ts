import { Request, Response, NextFunction } from 'express';
import { query } from '../database/connection';
import * as BookingModel from '../models/Booking.model';
import * as UserModel from '../models/User.model';
import * as CommissionModel from '../models/Commission.model';
import { hashPassword } from '../utils/bcrypt.utils';

const getRelativePath = (fullPath: string): string => {
    const uploadsDir = 'uploads';
    const uploadsIndex = fullPath.indexOf('uploads');
    if (uploadsIndex === -1) return fullPath; 
    const relativePath = fullPath.substring(uploadsIndex);
    return '/' + relativePath.replace(/\\/g, '/');
}

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
    const { email, password, role, firstName, lastName, phoneNumber, nationalId } = req.body;
    const hashedPassword = await hashPassword(password);
    
    const userId = await UserModel.createUser({
      email,
      password_hash: hashedPassword,
      role: role || 'client',
      status: 'active'
    });

    if (role === 'seller') {
        const sql = 'INSERT INTO sellers (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "approved")';
        await query(sql, [userId, firstName, lastName, phoneNumber, nationalId]);
    } else if (role === 'agent') {
        const sql = 'INSERT INTO agents (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "approved")';
        await query(sql, [userId, firstName, lastName, phoneNumber, nationalId]);
    } else if (role === 'client') {
        await UserModel.createClientProfile(userId, { firstName, lastName, phoneNumber });
    }

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('[CREATE_USER_ERROR]:', error);
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

export const getAllAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = `
        SELECT a.*, u.email, u.status as user_status 
        FROM agents a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
    `;
    const agents = await query(sql);
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

export const getPendingAgents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sql = `
            SELECT a.*, u.email, u.status as user_status 
            FROM agents a
            JOIN users u ON a.user_id = u.id
            WHERE a.status = 'pending'
            ORDER BY a.created_at DESC
        `;
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
    
    const userSql = 'UPDATE users SET status = "active" WHERE id = (SELECT user_id FROM agents WHERE id = ?)';
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

export const getAllSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sql = `
            SELECT s.*, u.email, u.status as user_status 
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `;
        const sellers = await query(sql);
        res.status(200).json({ success: true, data: sellers });
    } catch (error) {
        next(error);
    }
};

export const approveSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sql = 'UPDATE sellers SET status = "approved" WHERE id = ?';
        await query(sql, [id]);

        const userSql = 'UPDATE users SET status = "active" WHERE id = (SELECT user_id FROM sellers WHERE id = ?)';
        await query(userSql, [id]);

        res.status(200).json({ success: true, message: 'Seller approved successfully' });
    } catch (error) {
        next(error);
    }
};

export const rejectSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sql = 'UPDATE sellers SET status = "rejected" WHERE id = ?';
        await query(sql, [id]);
        res.status(200).json({ success: true, message: 'Seller rejected' });
    } catch (error) {
        next(error);
    }
};

export const updateSellerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phoneNumber, nationalId, businessName } = req.body;
        
        const sql = `
            UPDATE sellers 
            SET first_name = ?, last_name = ?, phone_number = ?, national_id = ?, business_name = ?
            WHERE id = ?
        `;
        await query(sql, [firstName, lastName, phoneNumber, nationalId, businessName, id]);
        
        res.status(200).json({ success: true, message: 'Seller profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM users WHERE id = (SELECT user_id FROM sellers WHERE id = ?)';
        await query(sql, [id]);
        res.status(200).json({ success: true, message: 'Seller account deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getPendingProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const houses = await query(`
        SELECT h.id, h.title as name, 'house' as type, h.created_at, h.images, h.status,
               s.first_name, s.last_name, u.email, s.phone_number
        FROM houses h
        LEFT JOIN sellers s ON h.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE h.status IN ('pending_approval', 'available', 'rented', 'purchased')
    `);

    const accommodations = await query(`
        SELECT a.id, a.name, a.type, a.created_at, a.images, a.status,
               s.first_name, s.last_name, u.email, s.phone_number
        FROM accommodations a
        LEFT JOIN sellers s ON a.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE a.status IN ('pending_approval', 'available', 'unavailable')
    `);

    const vehicles = await query(`
        SELECT v.id, CONCAT(v.make, ' ', v.model) as name, 'vehicle' as type, v.created_at, v.images, v.status,
               s.first_name, s.last_name, u.email, s.phone_number
        FROM vehicles v
        LEFT JOIN sellers s ON v.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE v.status IN ('pending_approval', 'available', 'rented', 'sold')
    `);

    const products = [...(houses as any[]), ...(accommodations as any[]), ...(vehicles as any[])];
    products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getTableNameFromType = (type: string): string | null => {
    const typeMap: { [key: string]: string } = {
        house: 'houses',
        accommodation: 'accommodations',
        vehicle: 'vehicles',
        apartment: 'accommodations',
        hotel_room: 'accommodations',
        event_hall: 'accommodations',
    };
    return typeMap[type] || null;
};

export const approveProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;
    const tableName = getTableNameFromType(type);
    if (!tableName) return res.status(400).json({ success: false, message: 'Invalid product type' });
    await query(`UPDATE ${tableName} SET status = 'available' WHERE id = ?`, [id]);
    res.status(200).json({ success: true, message: `Product approved successfully` });
  } catch (error) {
    next(error);
  }
};

export const rejectProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;
    const tableName = getTableNameFromType(type);
    if (!tableName) return res.status(400).json({ success: false, message: 'Invalid product type' });
    await query(`UPDATE ${tableName} SET status = 'rejected' WHERE id = ?`, [id]);
    res.status(200).json({ success: true, message: `Product rejected` });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, id } = req.params;
        const tableName = getTableNameFromType(type);
        if (!tableName) return res.status(400).json({ success: false, message: 'Invalid product type' });

        const [product] = await query<any[]>(`SELECT status FROM ${tableName} WHERE id = ?`, [id]);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const isFinished = ['rented', 'purchased', 'sold', 'unavailable'].includes(product.status);

        if (!isFinished) {
            const idKey = type === 'house' ? 'house_id' : type === 'vehicle' ? 'vehicle_id' : 'accommodation_id';
            const [booking] = await query<any[]>(`SELECT id FROM bookings WHERE ${idKey} = ? LIMIT 1`, [id]);
            if (booking) return res.status(403).json({ success: false, message: "Cannot delete this property because it is still in process or has active bookings." });
        }

        const idKey = type === 'house' ? 'house_id' : type === 'vehicle' ? 'vehicle_id' : 'accommodation_id';
        await query(`UPDATE bookings SET ${idKey} = NULL WHERE ${idKey} = ?`, [id]);
        await query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
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

export const approveBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await BookingModel.updateBookingStatus(id, 'approved');
    res.status(200).json({ success: true, message: 'Booking approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await BookingModel.updateBookingStatus(id, status);
    res.status(200).json({ success: true, message: `Booking ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await BookingModel.deleteBookingById(id);
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const verifyBookingPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    
    // 1. Verify Payment
    await query(`UPDATE payments SET status = 'completed', verified_at = CURRENT_TIMESTAMP WHERE booking_id = ?`, [bookingId]);
    await query(`UPDATE bookings SET payment_status = 'paid', booking_status = 'confirmed' WHERE id = ?`, [bookingId]);

    // 2. Fetch booking details
    const booking = await BookingModel.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // 3. Update associated property status
    if (booking.house_id) {
        const status = booking.booking_type === 'house_rent' ? 'rented' : 'purchased';
        await query(`UPDATE houses SET status = ? WHERE id = ?`, [status, booking.house_id]);
    } else if (booking.vehicle_id) {
        const status = booking.booking_type === 'vehicle_rent' ? 'rented' : 'sold';
        await query(`UPDATE vehicles SET status = ? WHERE id = ?`, [status, booking.vehicle_id]);
    } else if (booking.accommodation_id) {
        await query(`UPDATE accommodations SET status = 'unavailable' WHERE id = ?`, [booking.accommodation_id]);
    }

    // 4. Calculate Commissions
    const totalAmount = Number(booking.total_amount);
    
    // Seller Payout (90%) - Only if associated with a seller
    let sellerId = null;
    if (booking.house_id) {
        const [house] = await query<any[]>('SELECT seller_id FROM houses WHERE id = ?', [booking.house_id]);
        sellerId = house?.seller_id;
    } else if (booking.vehicle_id) {
        const [vehicle] = await query<any[]>('SELECT seller_id FROM vehicles WHERE id = ?', [booking.vehicle_id]);
        sellerId = vehicle?.seller_id;
    } else if (booking.accommodation_id) {
        const [accommodation] = await query<any[]>('SELECT seller_id FROM accommodations WHERE id = ?', [booking.accommodation_id]);
        sellerId = accommodation?.seller_id;
    }

    if (sellerId) {
        const sellerPayout = totalAmount * 0.90;
        await CommissionModel.createCommission({
            booking_id: bookingId,
            amount: sellerPayout,
            commission_type: 'seller_payout',
            seller_id: sellerId,
            status: 'approved'
        });
    }
    
    // Agent Commission (3%)
    if (booking.agent_id) {
        const agentCommission = totalAmount * 0.03;
        await CommissionModel.createCommission({
            agent_id: booking.agent_id,
            booking_id: bookingId,
            amount: agentCommission,
            commission_type: 'agent',
            status: 'approved'
        });
    }

    // System Fee (10% - Agent 3% if exists)
    const systemFeeRate = booking.agent_id ? 0.07 : 0.10;
    const systemFee = totalAmount * systemFeeRate;
    await CommissionModel.createCommission({
        booking_id: bookingId,
        amount: systemFee,
        commission_type: 'system',
        status: 'approved'
    });

    res.status(200).json({ success: true, message: 'Payment verified, booking confirmed, and commissions generated.' });
  } catch (error) {
    console.error('[VERIFY_PAYMENT_ERROR]:', error);
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

export const getAllCommissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = `
      SELECT 
        c.id, c.amount, c.status, c.earned_at, c.commission_type, c.payout_proof_path,
        CASE 
          WHEN c.commission_type = 'agent' THEN a.first_name 
          WHEN c.commission_type = 'seller_payout' THEN s.first_name 
          ELSE 'System' 
        END as first_name,
        CASE 
          WHEN c.commission_type = 'agent' THEN a.last_name 
          WHEN c.commission_type = 'seller_payout' THEN s.last_name 
          ELSE 'Owner' 
        END as last_name,
        CASE 
          WHEN c.commission_type = 'agent' THEN a.phone_number 
          WHEN c.commission_type = 'seller_payout' THEN s.phone_number 
          ELSE 'N/A' 
        END as phone_number
      FROM commissions c
      LEFT JOIN agents a ON c.agent_id = a.id
      LEFT JOIN sellers s ON c.seller_id = s.id
      ORDER BY c.earned_at DESC
    `;
    const commissions = await query(sql);
    res.status(200).json({ success: true, data: commissions });
  } catch (error) {
    console.error('[GET_ALL_COMMISSIONS_ERROR]:', error);
    next(error);
  }
};

export const payCommission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payoutProof = req.file ? getRelativePath(req.file.path) : undefined;
    
    if (!payoutProof) {
        return res.status(400).json({ success: false, message: 'Payout proof is required.' });
    }

    await CommissionModel.updateCommissionStatus(id, 'paid', payoutProof);
    res.status(200).json({ success: true, message: 'Commission marked as paid. Proof uploaded.' });
  } catch (error) {
    next(error);
  }
};

export const markCommissionAsPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sql = 'UPDATE commissions SET status = "paid", paid_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [id]);
    res.status(200).json({ success: true, message: 'Commission marked as paid' });
  } catch (error) {
    next(error);
  }
};

export const deleteCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM commissions WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Commission record deleted successfully' });
    } catch (error) {
        next(error);
    }
};
