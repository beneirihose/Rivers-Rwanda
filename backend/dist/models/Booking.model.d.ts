import { RowDataPacket } from 'mysql2';
export declare const getBookingsByClientId: (clientId: string) => Promise<Booking[]>;
export declare const getBookingsBySellerId: (sellerId: string) => Promise<Booking[]>;
export declare const getBookingById: (id: string) => Promise<Booking | null>;
export declare const updateBookingPaymentStatus: (id: string, status: string) => Promise<void>;
export declare const getBookingDetailsForInvoice: (bookingId: string) => Promise<any>;
export interface Booking extends RowDataPacket {
    id: string;
    booking_type: 'accommodation' | 'vehicle_rent' | 'vehicle_purchase' | 'house_rent' | 'house_purchase';
    booking_reference: string;
    client_id: string;
    seller_id?: string;
    agent_id?: string;
    accommodation_id?: string;
    vehicle_id?: string;
    house_id?: string;
    start_date?: Date;
    end_date?: Date;
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
    property_name?: string;
    accommodation_type?: string;
    accommodation_sub_type?: string;
}
export declare const createBooking: (data: any) => Promise<Booking>;
export declare const getAllBookings: () => Promise<Booking[]>;
export declare const updateBookingStatus: (id: string, status: string) => Promise<void>;
export declare const deleteBookingById: (id: string) => Promise<void>;
//# sourceMappingURL=Booking.model.d.ts.map