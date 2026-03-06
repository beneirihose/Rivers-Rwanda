import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
// For Gmail, it's recommended to use 'service: gmail' which handles ports and SSL/TLS automatically
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
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
  } catch (error: any) {
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
