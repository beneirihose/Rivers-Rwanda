"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyClients = exports.getMyReferralCode = exports.deleteMyCommission = exports.rejectPayoutReceipt = exports.confirmPayoutReceipt = exports.getMyStats = exports.getMyCommissions = void 0;
const CommissionModel = __importStar(require("../models/Commission.model"));
const connection_1 = require("../database/connection");
// Helper function to get agent ID from user ID
const getAgentId = async (userId) => {
    if (!userId)
        return null;
    try {
        const result = await (0, connection_1.query)('SELECT id FROM agents WHERE user_id = ?', [userId]);
        return result.length > 0 ? result[0].id : null;
    }
    catch (error) {
        console.error("Error fetching agent ID:", error);
        return null;
    }
};
const getMyCommissions = async (req, res, next) => {
    try {
        const agentId = await getAgentId(req.user?.userId);
        if (!agentId) {
            return res.status(404).json({ success: false, message: 'Agent profile not found.' });
        }
        const commissions = await CommissionModel.getCommissionsByAgentId(agentId);
        res.status(200).json({ success: true, data: commissions });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyCommissions = getMyCommissions;
const getMyStats = async (req, res, next) => {
    try {
        const agentId = await getAgentId(req.user?.userId);
        if (!agentId) {
            return res.status(404).json({ success: false, message: 'Agent profile not found.' });
        }
        const stats = await CommissionModel.getAgentStats(agentId);
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyStats = getMyStats;
const confirmPayoutReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agentId = await getAgentId(req.user?.userId);
        const [commission] = await (0, connection_1.query)('SELECT * FROM commissions WHERE id = ? AND agent_id = ?', [id, agentId]);
        if (!commission) {
            return res.status(404).json({ success: false, message: 'Commission record not found or unauthorized.' });
        }
        if (commission.status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Payout has not been marked as paid by Admin yet.' });
        }
        await CommissionModel.updateCommissionStatus(id, 'completed');
        res.status(200).json({ success: true, message: 'Payout receipt confirmed. Thank you!' });
    }
    catch (error) {
        next(error);
    }
};
exports.confirmPayoutReceipt = confirmPayoutReceipt;
const rejectPayoutReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agentId = await getAgentId(req.user?.userId);
        const [commission] = await (0, connection_1.query)('SELECT * FROM commissions WHERE id = ? AND agent_id = ?', [id, agentId]);
        if (!commission) {
            return res.status(404).json({ success: false, message: 'Commission record not found or unauthorized.' });
        }
        if (commission.status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Only paid commissions can be rejected.' });
        }
        // Set status back to approved so admin can re-upload proof or correct payment
        await CommissionModel.updateCommissionStatus(id, 'approved');
        // Clear the bad proof path? Or keep it for history? Let's clear it to allow fresh upload
        await (0, connection_1.query)('UPDATE commissions SET payout_proof_path = NULL WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Payout rejected. Admin has been notified to re-verify payment.' });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectPayoutReceipt = rejectPayoutReceipt;
const deleteMyCommission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agentId = await getAgentId(req.user?.userId);
        await (0, connection_1.query)('DELETE FROM commissions WHERE id = ? AND agent_id = ?', [id, agentId]);
        res.status(200).json({ success: true, message: 'Commission record removed from your view.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMyCommission = deleteMyCommission;
const getMyReferralCode = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated.' });
        }
        const result = await (0, connection_1.query)('SELECT referral_code FROM agents WHERE user_id = ?', [userId]);
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Agent profile not found.' });
        }
        res.status(200).json({ success: true, data: { referral_code: result[0].referral_code } });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyReferralCode = getMyReferralCode;
const getMyClients = async (req, res, next) => {
    try {
        const agentId = await getAgentId(req.user?.userId);
        if (!agentId) {
            return res.status(404).json({ success: false, message: 'Agent profile not found.' });
        }
        const sql = `
            SELECT DISTINCT c.first_name, c.last_name, u.email, b.created_at as referred_at
            FROM bookings b
            INNER JOIN clients c ON b.client_id = c.id
            INNER JOIN users u ON c.user_id = u.id
            WHERE b.agent_id = ?
            ORDER BY referred_at DESC
        `;
        const clients = await (0, connection_1.query)(sql, [agentId]);
        res.status(200).json({ success: true, data: clients });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyClients = getMyClients;
//# sourceMappingURL=agent.controller.js.map