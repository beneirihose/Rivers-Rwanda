import { query } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export interface Payment extends RowDataPacket {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: 'bank_transfer' | 'mobile_money' | 'cash' | 'other';
  transaction_id?: string;
  payment_proof_path?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
  verified_at?: Date;
}

export const createPayment = async (data: any): Promise<void> => {
  const paymentId = uuidv4();
  const sql = `
    INSERT INTO payments (id, booking_id, amount, payment_method, transaction_id, payment_proof_path, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;
  await query(sql, [
    paymentId,
    data.booking_id,
    data.amount,
    data.payment_method,
    data.transaction_id || null,
    data.payment_proof_path || null
  ]);
};
