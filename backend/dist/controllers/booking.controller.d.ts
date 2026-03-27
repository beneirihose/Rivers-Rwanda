import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare const createBooking: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const confirmPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getInvoiceData: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPublicBookingDetails: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllBookings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyBookings: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSellerBookings: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelBooking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=booking.controller.d.ts.map