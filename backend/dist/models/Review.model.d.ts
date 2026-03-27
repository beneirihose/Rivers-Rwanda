import { RowDataPacket } from 'mysql2';
export interface Review extends RowDataPacket {
    id: string;
    client_id: string;
    accommodation_id?: string;
    vehicle_id?: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: Date;
}
export declare const createReview: (data: any) => Promise<void>;
export declare const getReviewsByTarget: (type: "accommodation" | "vehicle", targetId: string) => Promise<Review[]>;
export declare const updateReviewStatus: (id: string, status: string) => Promise<void>;
//# sourceMappingURL=Review.model.d.ts.map