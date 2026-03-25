import { query } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export interface Commission extends RowDataPacket {
  id: string;
  agent_id?: string;
  seller_id?: string;
  booking_id: string;
  amount: number;
  commission_type: 'system' | 'agent' | 'seller_payout';
  status: 'pending' | 'approved' | 'paid' | 'completed' | 'cancelled';
  earned_at: Date;
  paid_at?: Date;
  payout_proof_path?: string;
}

export const createCommission = async (data: { 
  booking_id: string, 
  amount: number, 
  commission_type: 'system' | 'agent' | 'seller_payout',
  agent_id?: string,
  seller_id?: string,
  status?: string
}): Promise<void> => {
  const commissionId = uuidv4();
  const sql = `
    INSERT INTO commissions (id, booking_id, amount, commission_type, agent_id, seller_id, status, earned_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  await query(sql, [
    commissionId, 
    data.booking_id, 
    data.amount, 
    data.commission_type, 
    data.agent_id || null, 
    data.seller_id || null,
    data.status || 'pending'
  ]);
};

export const getCommissionsByAgentId = async (agentId: string): Promise<Commission[]> => {
  const sql = 'SELECT * FROM commissions WHERE agent_id = ? AND commission_type = "agent" ORDER BY earned_at DESC';
  return await query<Commission[]>(sql, [agentId]);
};

export const getCommissionsBySellerId = async (sellerId: string): Promise<Commission[]> => {
  const sql = 'SELECT * FROM commissions WHERE seller_id = ? AND commission_type = "seller_payout" ORDER BY earned_at DESC';
  return await query<Commission[]>(sql, [sellerId]);
};

export const getAgentStats = async (agentId: string): Promise<any> => {
  const sumSql = `
    SELECT 
      SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
    FROM commissions 
    WHERE agent_id = ? AND commission_type = 'agent'
  `;
  const clientsSql = 'SELECT COUNT(DISTINCT client_id) as totalClients FROM bookings WHERE agent_id = ?';
  
  const [sumResult] = await query<any[]>(sumSql, [agentId]);
  const [clientsResult] = await query<any[]>(clientsSql, [agentId]);

  return {
    paid: Number(sumResult.paid) || 0,
    approved: Number(sumResult.approved) || 0,
    pending: Number(sumResult.pending) || 0,
    totalClients: clientsResult.totalClients || 0,
  };
};

export const updateCommissionStatus = async (id: string, status: string, payoutProof?: string): Promise<void> => {
  let sql = 'UPDATE commissions SET status = ?';
  const params: any[] = [status];
  
  if (payoutProof) {
    sql += ', payout_proof_path = ?';
    params.push(payoutProof);
  }

  if (status === 'paid') {
    sql += ', paid_at = CURRENT_TIMESTAMP';
  }
  
  sql += ' WHERE id = ?';
  params.push(id);

  await query(sql, params);
};
