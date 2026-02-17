import { Request, Response, NextFunction } from 'express';
import * as BookingModel from '../models/Booking.model';
import * as PaymentModel from '../models/Payment.model';
import { getClientIdByUserId } from '../models/User.model';
import { getAgentId } from '../utils/agent.utils';
import QRCode from 'qrcode';

const getRelativePath = (fullPath: string): string => {
    const uploadsDir = 'uploads';
    const uploadsIndex = fullPath.indexOf(uploadsDir);
    const relativePath = fullPath.substring(uploadsIndex);
    return '/' + relativePath.replace(/\\/g, '/');
}

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const clientId = await getClientIdByUserId(userId);
    if (!clientId) return res.status(404).json({ success: false, message: 'Client profile not found.' });

    const bookingData = { ...req.body, client_id: clientId };
    const newBooking = await BookingModel.createBooking(bookingData);

    if (req.file) {
      await PaymentModel.createPayment({
        booking_id: newBooking.id,
        amount: newBooking.total_amount,
        payment_method: req.body.payment_method,
        payment_proof_path: getRelativePath(req.file.path)
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully!', 
      data: { bookingReference: newBooking.booking_reference }
    });

  } catch (error) {
    next(error);
  }
};

export const getInvoiceData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const details = await BookingModel.getBookingDetailsForInvoice(id);
        if (!details) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const qrCodeData = JSON.stringify({
            client: `${details.client_first_name} ${details.client_last_name}`,
            phone: details.client_phone,
            email: details.client_email,
            paymentMethod: details.payment_method,
            bookingDate: details.created_at,
            bookingRef: details.booking_reference
        });

        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        res.status(200).json({ 
            success: true, 
            data: { ...details, qrCodeImage }
        });

    } catch (error) {
        next(error);
    }
};


export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const clientId = await getClientIdByUserId(userId);
    if (!clientId) return res.status(404).json({ success: false, message: 'Client profile not found' });

    const bookings = await BookingModel.getBookingsByClientId(clientId);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await BookingModel.updateBookingStatus(id, 'cancelled');
    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
