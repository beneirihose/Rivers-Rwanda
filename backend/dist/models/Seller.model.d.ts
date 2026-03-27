import { RowDataPacket } from 'mysql2';
export interface Seller extends RowDataPacket {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    national_id: string;
    status: 'pending' | 'approved' | 'rejected';
    profile_image: string;
    business_name: string;
    agreed_to_commission: boolean;
    bank_account_details: any;
    mobile_money_details: any;
    created_at: Date;
    updated_at: Date;
}
export declare const createSeller: (sellerData: any) => Promise<string>;
export declare const findSellerById: (id: string) => Promise<Seller | null>;
export declare const updateSeller: (id: string, data: any) => Promise<void>;
//# sourceMappingURL=Seller.model.d.ts.map