import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt.utils';
export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const authorize: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map