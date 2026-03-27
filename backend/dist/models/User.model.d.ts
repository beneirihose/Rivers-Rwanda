import { RowDataPacket } from 'mysql2';
export interface User extends RowDataPacket {
    id: string;
    email: string;
    password_hash: string;
    role: 'client' | 'seller' | 'admin';
    status: 'active' | 'pending' | 'suspended' | 'deleted';
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare const findUserByEmail: (email: string) => Promise<User | null>;
export declare const findUserById: (id: string) => Promise<User | null>;
export declare const getAllUsers: () => Promise<User[]>;
export declare const getClientIdByUserId: (userId: string) => Promise<string | null>;
export declare const getSellerIdByUserId: (userId: string) => Promise<string | null>;
export declare const createUser: (userData: {
    email: string;
    password_hash: string;
    role: "client" | "seller" | "admin";
    status?: string;
}) => Promise<string>;
export declare const storeOtp: (userId: string, otpCode: string, purpose: string) => Promise<void>;
export declare const verifyOtp: (userId: string, otpCode: string) => Promise<boolean>;
export declare const updateUser: (id: string, data: Partial<User>) => Promise<void>;
export declare const deleteUser: (id: string) => Promise<void>;
export declare const createClientProfile: (userId: string, profile: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}) => Promise<void>;
export declare const createSellerProfile: (userId: string, profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    nationalId: string;
}) => Promise<void>;
//# sourceMappingURL=User.model.d.ts.map