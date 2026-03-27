"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommissionStatus = exports.getAgentStats = exports.getCommissionsBySellerId = exports.getCommissionsByAgentId = exports.createCommission = void 0;
const connection_1 = require("../database/connection");
const uuid_1 = require("uuid");
const createCommission = async (data) => {
    const commissionId = (0, uuid_1.v4)();
    const sql = `
    INSERT INTO commissions (id, booking_id, amount, commission_type, agent_id, seller_id, status, earned_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
    await (0, connection_1.query)(sql, [
        commissionId,
        data.booking_id,
        data.amount,
        data.commission_type,
        data.agent_id || null,
        data.seller_id || null,
        data.status || 'pending'
    ]);
};
exports.createCommission = createCommission;
const getCommissionsByAgentId = async (agentId) => {
    const sql = 'SELECT * FROM commissions WHERE agent_id = ? AND commission_type = "agent" ORDER BY earned_at DESC';
    return await (0, connection_1.query)(sql, [agentId]);
};
exports.getCommissionsByAgentId = getCommissionsByAgentId;
const getCommissionsBySellerId = async (sellerId) => {
    const sql = 'SELECT * FROM commissions WHERE seller_id = ? AND commission_type = "seller_payout" ORDER BY earned_at DESC';
    return await (0, connection_1.query)(sql, [sellerId]);
};
exports.getCommissionsBySellerId = getCommissionsBySellerId;
const getAgentStats = async (agentId) => {
    const sumSql = `
    SELECT 
      SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
    FROM commissions 
    WHERE agent_id = ? AND commission_type = 'agent'
  `;
    const clientsSql = 'SELECT COUNT(DISTINCT client_id) as totalClients FROM bookings WHERE agent_id = ?';
    const [sumResult] = await (0, connection_1.query)(sumSql, [agentId]);
    const [clientsResult] = await (0, connection_1.query)(clientsSql, [agentId]);
    return {
        paid: Number(sumResult.paid) || 0,
        approved: Number(sumResult.approved) || 0,
        pending: Number(sumResult.pending) || 0,
        totalClients: clientsResult.totalClients || 0,
    };
};
exports.getAgentStats = getAgentStats;
const updateCommissionStatus = async (id, status, payoutProof) => {
    let sql = 'UPDATE commissions SET status = ?';
    const params = [status];
    if (payoutProof) {
        sql += ', payout_proof_path = ?';
        params.push(payoutProof);
    }
    if (status === 'paid') {
        sql += ', paid_at = CURRENT_TIMESTAMP';
    }
    sql += ' WHERE id = ?';
    params.push(id);
    await (0, connection_1.query)(sql, params);
};
exports.updateCommissionStatus = updateCommissionStatus;
//# sourceMappingURL=Commission.model.js.map