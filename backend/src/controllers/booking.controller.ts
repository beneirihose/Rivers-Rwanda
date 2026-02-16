import { Request, Response, NextFunction } from 'express';
import * as BookingModel from '../models/Booking.model';
import * as PaymentModel from '../models/Payment.model';
import { getClientIdByUserId } from '../models/User.model';
import { getAgentId } from '../utils/agent.utils';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let finalClientId: string | null = null;
    let agentId: string | null = null;

    if (userRole === 'client') {
      finalClientId = await getClientIdByUserId(userId);
    } else if (userRole === 'agent') {
      const { clientIdForBooking } = req.body;
      if (!clientIdForBooking) {
        return res.status(400).json({ success: false, message: 'Client ID is required for agent bookings.' });
      }
      finalClientId = clientIdForBooking;
      agentId = await getAgentId(userId);
    }

    if (!finalClientId) {
      return res.status(404).json({ success: false, message: 'Could not determine a valid client for this booking.' });
    }

    const bookingData = { ...req.body, client_id: finalClientId, agent_id: agentId };

    const newBooking = await BookingModel.createBooking(bookingData);

    if (req.file) {
      await PaymentModel.createPayment({
        booking_id: newBooking.id,
        amount: newBooking.total_amount,
        payment_method: req.body.payment_method,
        payment_proof_path: req.file.path
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully!', 
      data: {
        bookingReference: newBooking.booking_reference
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const clientId = await getClientIdByUserId(userId);
    if (!clientId) {
        return res.status(404).json({ success: false, message: 'Client profile not found' });
    }

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
