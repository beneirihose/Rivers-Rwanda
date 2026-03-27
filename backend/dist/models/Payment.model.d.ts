import { RowDataPacket } from 'mysql2';
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
export declare const createPayment: (data: any) => Promise<void>;
export declare const updatePaymentStatusByBookingId: (bookingId: string, status: string) => Promise<void>;
//# sourceMappingURL=Payment.model.d.ts.map