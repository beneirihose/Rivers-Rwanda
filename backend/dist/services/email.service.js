"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSaleConfirmationEmail = exports.sendBookingConfirmationEmail = exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const qrcode_1 = __importDefault(require("qrcode"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: `"Rivers Rwanda" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your OTP for Email Verification',
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        html: `<b>Your OTP is: ${otp}</b>. It will expire in 10 minutes.`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent to', to);
    }
    catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Could not send OTP email');
    }
};
exports.sendOtpEmail = sendOtpEmail;
const sendBookingConfirmationEmail = async (emails, data) => {
    const { bookingReference, propertyName, totalAmount, clientName, agentName, sellerName, isSale = false } = data;
    // Generate QR Code as a Buffer for CID attachment
    const qrData = JSON.stringify({ reference: bookingReference, property: propertyName });
    const qrCodeBuffer = await qrcode_1.default.toBuffer(qrData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
            dark: '#1a202c',
            light: '#ffffff'
        }
    });
    const subject = isSale ? `Property Sale Confirmed: ${propertyName}` : `Booking Confirmed: ${propertyName}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const viewBookingUrl = `${frontendUrl}/client/bookings`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                .content-table { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; border-collapse: separate; overflow: hidden; }
                .inner-card { background-color: #f7fafc; border-radius: 20px; padding: 32px; border: 1px solid #edf2f7; margin: 0 32px 32px 32px; }
                .label { color: #718096; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em; }
                .value { color: #2d3748; font-weight: 700; font-size: 14px; }
                .price { color: #f59e0b; font-weight: 900; font-size: 20px; }
                .btn { background-color: #f59e0b; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 0.1em; }
            </style>
        </head>
        <body style="background-color: #f8fafc; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table class="content-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 40px 0; text-align: center;">
                        <h1 style="color: #f59e0b; text-transform: uppercase; font-size: 28px; letter-spacing: 0.15em; margin: 0; font-weight: 900;">RIVERS RWANDA</h1>
                        <p style="color: #718096; font-size: 14px; margin-top: 8px; font-weight: 600;">OFFICIAL DIGITAL RECEIPT</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="inner-card">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <img src="cid:qrcode" alt="Verification QR Code" style="width: 180px; height: 180px; border: 6px solid #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);" />
                                <p style="font-size: 11px; color: #a0aec0; margin-top: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Scan to verify transaction</p>
                            </div>

                            <table style="width: 100%; border-top: 1px dashed #cbd5e0; padding-top: 24px;">
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <div class="label">Reference</div>
                                        <div class="value" style="font-family: monospace; color: #f59e0b; font-size: 16px;">#${bookingReference}</div>
                                    </td>
                                    <td style="padding-bottom: 16px; text-align: right;">
                                        <div class="label">Total Amount</div>
                                        <div class="price">RWF ${totalAmount.toLocaleString()}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="label">Property</div>
                                        <div class="value">${propertyName}</div>
                                    </td>
                                    <td style="text-align: right;">
                                        <div class="label">Transaction</div>
                                        <div class="value" style="color: #4a5568;">${isSale ? 'PROPERTY SALE' : 'RENTAL BOOKING'}</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 40px 40px 40px;">
                        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #a0aec0; margin-bottom: 20px; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">Involved Parties</h3>
                        <table style="width: 100%;">
                            <tr>
                                <td style="width: 50%; vertical-align: top; padding-bottom: 20px;">
                                    <div class="label">Client</div>
                                    <div class="value">${clientName}</div>
                                </td>
                                <td style="width: 50%; vertical-align: top; padding-bottom: 20px;">
                                    <div class="label">Seller / Owner</div>
                                    <div class="value">${sellerName || 'Rivers Rwanda'}</div>
                                </td>
                            </tr>
                            ${agentName ? `
                            <tr>
                                <td colspan="2">
                                    <div class="label">Facilitating Agent</div>
                                    <div class="value">${agentName}</div>
                                </td>
                            </tr>` : ''}
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 40px 40px 40px; text-align: center;">
                        <a href="${viewBookingUrl}" class="btn">View Booking Details</a>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #1a202c; padding: 32px; text-align: center;">
                        <p style="font-size: 13px; color: #a0aec0; line-height: 1.6; margin: 0;">This transaction has been automatically verified and recorded by the Rivers Rwanda Digital System.</p>
                        <div style="margin-top: 24px; border-top: 1px solid #2d3748; padding-top: 24px;">
                            <p style="font-size: 11px; color: #718096; font-weight: 700; margin: 0; letter-spacing: 0.2em;">© 2024 RIVERS RWANDA LTD.</p>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
    for (const email of emails) {
        try {
            await transporter.sendMail({
                from: `"Rivers Rwanda" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: subject,
                html: html,
                attachments: [{
                        filename: 'qrcode.png',
                        content: qrCodeBuffer,
                        cid: 'qrcode'
                    }]
            });
        }
        catch (error) {
            console.error(`Error sending confirmation to ${email}:`, error);
        }
    }
};
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
const sendSaleConfirmationEmail = async (to, data) => {
    const mailOptions = {
        from: `"Rivers Rwanda" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Sale Confirmation - Rivers Rwanda',
        html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #f59e0b; text-transform: uppercase; letter-spacing: 2px;">Property Sold!</h2>
                </div>
                <p>Hello,</p>
                <p>Great news! A payment for your property <b>${data.propertyName}</b> has been confirmed by our administration.</p>
                
                <div style="background: #fdfaf6; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #fef3c7;">
                    <h3 style="margin-top: 0; color: #b45309; font-size: 14px; text-transform: uppercase;">Transaction Breakdown</h3>
                    
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span>Gross Amount:</span>
                        <span style="font-weight: bold;">Rwf ${data.amount.toLocaleString()}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin: 10px 0; color: #ef4444;">
                        <span>System Fee (10%):</span>
                        <span>- Rwf ${data.systemFee.toLocaleString()}</span>
                    </div>
                    
                    ${data.agentFee > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin: 10px 0; color: #ef4444;">
                        <span>Agent Commission (5%):</span>
                        <span>- Rwf ${data.agentFee.toLocaleString()}</span>
                    </div>
                    ` : ''}
                    
                    <hr style="border: 0; border-top: 1px solid #fde68a; margin: 15px 0;">
                    
                    <div style="display: flex; justify-content: space-between; margin: 10px 0; font-size: 18px; color: #059669; font-weight: bold;">
                        <span>Total Payout:</span>
                        <span>Rwf ${data.netAmount.toLocaleString()}</span>
                    </div>
                </div>
                
                <p style="font-size: 14px; color: #666;">The net payout will be transferred to your registered payment method within 2-3 business days.</p>
                
                <p style="margin-top: 30px;">Thank you for partnering with us.</p>
                <p>Best Regards,<br><b>Rivers Rwanda Management</b></p>
            </div>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Sale confirmation email sent to', to);
    }
    catch (error) {
        console.error('Error sending sale confirmation email:', error);
    }
};
exports.sendSaleConfirmationEmail = sendSaleConfirmationEmail;
//# sourceMappingURL=email.service.js.map