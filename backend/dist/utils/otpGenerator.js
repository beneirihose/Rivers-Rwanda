"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const generateOtp = (length = 6) => {
    const chars = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += chars[Math.floor(Math.random() * chars.length)];
    }
    return otp;
};
exports.generateOtp = generateOtp;
//# sourceMappingURL=otpGenerator.js.map