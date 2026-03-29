import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
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
    
    if (error.code === 'EDNS' || error.code === 'ETIMEOUT') {
      throw new Error('Network/DNS error: Could not reach the email server.');
    }
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your EMAIL_USER and EMAIL_PASS.');
    }
    
    throw new Error('Could not send email.');
  }
};