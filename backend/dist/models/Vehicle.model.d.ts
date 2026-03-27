import { RowDataPacket } from 'mysql2';
export interface Vehicle extends RowDataPacket {
    id: string;
    purpose: 'rent' | 'buy' | 'both';
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    transmission: string;
    fuel_type: string;
    seating_capacity: number;
    daily_rate?: number;
    sale_price?: number;
    status: 'available' | 'rented' | 'sold' | 'maintenance';
    images: any;
    created_at: Date;
}
export declare const getAllVehicles: (filters: any) => Promise<Vehicle[]>;
export declare const getVehicleById: (id: string) => Promise<Vehicle | null>;
export declare const createVehicle: (data: any) => Promise<string>;
export declare const updateVehicle: (id: string, data: any) => Promise<void>;
export declare const updateVehicleStatus: (id: string, status: string) => Promise<void>;
export declare const deleteVehicle: (id: string) => Promise<void>;
//# sourceMappingURL=Vehicle.model.d.ts.map