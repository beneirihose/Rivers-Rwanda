export interface TokenPayload {
    userId: string;
    email: string;
    role: 'client' | 'agent' | 'seller' | 'admin';
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
//# sourceMappingURL=jwt.utils.d.ts.map