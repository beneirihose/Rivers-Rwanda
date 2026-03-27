import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare const getVehicles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getVehicle: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createVehicle: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateVehicle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteVehicle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=vehicle.controller.d.ts.map