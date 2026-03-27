import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare const getHouses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getHouse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createHouse: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateHouse: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteHouse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=house.controller.d.ts.map