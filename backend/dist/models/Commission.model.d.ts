import { RowDataPacket } from 'mysql2';
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
export declare const createCommission: (data: {
    booking_id: string;
    amount: number;
    commission_type: "system" | "agent" | "seller_payout";
    agent_id?: string;
    seller_id?: string;
    status?: string;
}) => Promise<void>;
export declare const getCommissionsByAgentId: (agentId: string) => Promise<Commission[]>;
export declare const getCommissionsBySellerId: (sellerId: string) => Promise<Commission[]>;
export declare const getAgentStats: (agentId: string) => Promise<any>;
export declare const updateCommissionStatus: (id: string, status: string, payoutProof?: string) => Promise<void>;
//# sourceMappingURL=Commission.model.d.ts.map