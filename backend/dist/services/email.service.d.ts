export declare const sendOtpEmail: (to: string, otp: string) => Promise<void>;
export declare const sendBookingConfirmationEmail: (emails: string[], data: any) => Promise<void>;
export declare const sendSaleConfirmationEmail: (to: string, data: {
    propertyName: string;
    amount: number;
    systemFee: number;
    agentFee: number;
    netAmount: number;
}) => Promise<void>;
//# sourceMappingURL=email.service.d.ts.map