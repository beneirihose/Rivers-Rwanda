"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create transporter
// For Gmail, it's recommended to use 'service: gmail' which handles ports and SSL/TLS automatically
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendEmail = async (options) => {
    try {
        // Verify connection configuration
        await transporter.verify();
        await transporter.sendMail({
            from: `"Rivers Rwanda" <${process.env.EMAIL_FROM}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        console.log('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending email:', error);
        // Provide more descriptive error messages for debugging
        if (error.code === 'EDNS' || error.code === 'ETIMEOUT') {
            throw new Error('Network/DNS error: Could not reach the email server. Please check your internet connection.');
        }
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please check your EMAIL_USER and EMAIL_PASS (App Password).');
        }
        throw new Error('Could not send email.');
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.util.js.map