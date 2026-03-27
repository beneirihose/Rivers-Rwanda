import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt.utils';
interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}
export declare const getProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changePassword: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=user.controller.d.ts.map