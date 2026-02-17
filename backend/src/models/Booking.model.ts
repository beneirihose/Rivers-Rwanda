import { query } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

// ... (getBookingDetailsForInvoice and other interfaces remain here) ...

export const getBookingsByClientId = async (clientId: string): Promise<Booking[]> => {
  const sql = `
    SELECT 
      b.*, -- Select all from bookings, including the correct b.payment_status
      p.payment_proof_path
    FROM bookings as b
    LEFT JOIN payments as p ON b.id = p.booking_id
    WHERE b.client_id = ? 
    ORDER BY b.created_at DESC
  `;
  return await query<Booking[]>(sql, [clientId]);
};

// --- The rest of the file remains unchanged ---

export const getBookingDetailsForInvoice = async (bookingId: string): Promise<any> => {
    const sql = `
        SELECT
            b.*,
            c.first_name as client_first_name,
            c.last_name as client_last_name,
            c.phone_number as client_phone,
            u.email as client_email,
            p.payment_method,
            p.status as payment_status_from_payment_table, -- alias to avoid conflict
            h.title as house_title,
            h.full_address as house_address,
            v.make as vehicle_make,
            v.model as vehicle_model,
            acc.name as accommodation_name
        FROM bookings as b
        LEFT JOIN clients as c ON b.client_id = c.id
        LEFT JOIN users as u ON c.user_id = u.id
        LEFT JOIN payments as p ON b.id = p.booking_id
        LEFT JOIN houses as h ON b.house_id = h.id
        LEFT JOIN vehicles as v ON b.vehicle_id = v.id
        LEFT JOIN accommodations as acc ON b.accommodation_id = acc.id
        WHERE b.id = ?
    `;
    const [details] = await query<any[]>(sql, [bookingId]);
    return details;
};

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
  payment_status?: 'pending' | 'paid' | 'refunded';
  created_at: Date;
  payment_id?: string;
  payment_method?: string;
  payment_proof_path?: string;
  verified_at?: Date;
  client_name?: string;
  client_phone?: string;
  agent_name?: string;
}

export const createBooking = async (data: any): Promise<Booking> => {
  const reference = 'RR' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const bookingId = uuidv4();
  const sql = `
    INSERT INTO bookings (id, booking_type, booking_reference, client_id, agent_id, accommodation_id, vehicle_id, house_id, total_amount, booking_status, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
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

export const getAllBookings = async (): Promise<Booking[]> => {
  const sql = `
    SELECT 
      b.*,
      p.id as payment_id,
      p.payment_method,
      p.payment_proof_path,
      p.status as payment_status_from_payment_table,
      p.verified_at,
      CONCAT(c.first_name, ' ', c.last_name) as client_name,
      c.phone_number as client_phone,
      CONCAT(a.first_name, ' ', a.last_name) as agent_name
    FROM bookings as b
    LEFT JOIN clients as c ON b.client_id = c.id
    LEFT JOIN agents as a ON b.agent_id = a.id
    LEFT JOIN payments as p ON b.id = p.booking_id
    ORDER BY b.created_at DESC
  `;
  return await query<Booking[]>(sql);
};

export const updateBookingStatus = async (id: string, status: string): Promise<void> => {
  const sql = 'UPDATE bookings SET booking_status = ? WHERE id = ?';
  await query(sql, [status, id]);
};

export const deleteBookingById = async (id: string): Promise<void> => {
  const sql = 'DELETE FROM bookings WHERE id = ?';
  await query(sql, [id]);
};
