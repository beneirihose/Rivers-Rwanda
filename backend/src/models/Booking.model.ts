import { query } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export interface Booking extends RowDataPacket {
  id: string;
  booking_type: 'accommodation' | 'vehicle_rent' | 'vehicle_purchase' | 'house_rent' | 'house_purchase';
  booking_reference: string;
  client_id: string;
  agent_id?: string;
  accommodation_id?: string;
  vehicle_id?: string;
  house_id?: string;
  total_amount: number;
  booking_status: 'pending' | 'approved' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  created_at: Date;
  payment_id?: string;
  payment_method?: string;
  payment_proof_path?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  verified_at?: Date;
}

const generateReference = () => {
  return 'RR' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const createBooking = async (data: any): Promise<Booking> => {
  const reference = generateReference();
  const bookingId = uuidv4();
  const sql = `
    INSERT INTO bookings (id, booking_type, booking_reference, client_id, agent_id, accommodation_id, vehicle_id, house_id, total_amount, booking_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;
  await query(sql, [
    bookingId,
    data.booking_type,
    reference,
    data.client_id,
    data.agent_id || null,
    data.accommodation_id || null,
    data.vehicle_id || null,
    data.house_id || null,
    data.total_amount
  ]);

  const [newBooking] = await query<Booking[]>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  return newBooking;
};

export const getBookingsByClientId = async (clientId: string): Promise<Booking[]> => {
  const sql = `
    SELECT 
      b.*,
      p.status as payment_status
    FROM bookings as b
    LEFT JOIN payments as p ON b.id = p.booking_id
    WHERE b.client_id = ? 
    ORDER BY b.created_at DESC
  `;
  return await query<Booking[]>(sql, [clientId]);
};

export const getAllBookings = async (): Promise<Booking[]> => {
  const sql = `
    SELECT 
      b.*,
      p.id as payment_id,
      p.payment_method,
      p.payment_proof_path,
      p.status as payment_status,
      p.verified_at
    FROM bookings as b
    LEFT JOIN payments as p ON b.id = p.booking_id
    ORDER BY b.created_at DESC
  `;
  return await query<Booking[]>(sql);
};

export const updateBookingStatus = async (id: string, status: string): Promise<void> => {
  const sql = 'UPDATE bookings SET booking_status = ? WHERE id = ?';
  await query(sql, [status, id]);
};
