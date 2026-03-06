import { Request, Response, NextFunction } from 'express';
import * as BookingModel from '../models/Booking.model';
import * as PaymentModel from '../models/Payment.model';
import * as AccommodationModel from '../models/Accommodation.model';
import * as VehicleModel from '../models/Vehicle.model';
import * as HouseModel from '../models/House.model';
import * as CommissionModel from '../models/Commission.model';
import * as NotificationModel from '../models/Notification.model';
import { getClientIdByUserId, findUserByEmail } from '../models/User.model';
import { getAgentId } from '../utils/agent.utils';
import { sendBookingConfirmationEmail } from '../services/email.service';
import QRCode from 'qrcode';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { query } from '../database/connection';

const getRelativePath = (fullPath: string): string => {
    const uploadsDir = 'uploads';
    const uploadsIndex = fullPath.indexOf('uploads');
    if (uploadsIndex === -1) return fullPath; 
    const relativePath = fullPath.substring(uploadsIndex);
    return '/' + relativePath.replace(/\\/g, '/');
}

/**
 * Helper to process commissions, status updates, and notify all parties
 */
async function processConfirmedBooking(bookingId: string) {
    const booking = await BookingModel.getBookingById(bookingId);
    if (!booking) return;

    // 1. Update Statuses
    await BookingModel.updateBookingStatus(bookingId, 'confirmed');
    await BookingModel.updateBookingPaymentStatus(bookingId, 'paid');

    let propertyName = "Property";
    let sellerId = booking.seller_id;

    // 2. Resolve Property Details and Update Status
    if (booking.house_id) {
        const house = await HouseModel.getHouseById(booking.house_id);
        propertyName = house?.title || "House";
        if (!sellerId) sellerId = house?.seller_id;
        await HouseModel.updateHouseStatus(booking.house_id, booking.booking_type.includes('purchase') ? 'purchased' : 'rented');
    } else if (booking.accommodation_id) {
        const acc = await AccommodationModel.getAccommodationById(booking.accommodation_id);
        propertyName = acc?.name || "Accommodation";
        if (!sellerId) sellerId = acc?.seller_id;
        await AccommodationModel.updateAccommodationStatus(booking.accommodation_id, 'unavailable');
    } else if (booking.vehicle_id) {
        const veh = await VehicleModel.getVehicleById(booking.vehicle_id);
        propertyName = `${veh?.make} ${veh?.model}` || "Vehicle";
        if (!sellerId) sellerId = veh?.seller_id;
        await VehicleModel.updateVehicleStatus(booking.vehicle_id, booking.booking_type.includes('purchase') ? 'sold' : 'rented');
    }

    // 3. Commissions
    const totalAmount = Number(booking.total_amount);
    const systemFee = totalAmount * 0.10;
    let agentFee = 0;

    if (booking.agent_id) {
        agentFee = totalAmount * 0.05;
        await CommissionModel.createCommission({
            booking_id: bookingId,
            amount: agentFee,
            commission_type: 'agent',
            agent_id: booking.agent_id,
            status: 'pending'
        });
    }

    await CommissionModel.createCommission({
        booking_id: bookingId,
        amount: systemFee,
        commission_type: 'system',
        seller_id: sellerId,
        status: 'approved'
    });

    // 4. Gather Emails for Notification
    const emails: string[] = [];
    let clientName = "Client";
    let sellerName = "Seller";
    let agentName = "";

    const [clientInfo] = await query<any[]>('SELECT u.email, CONCAT(c.first_name, " ", c.last_name) as name FROM users u JOIN clients c ON u.id = c.user_id WHERE c.id = ?', [booking.client_id]);
    if (clientInfo) { emails.push(clientInfo.email); clientName = clientInfo.name; }

    if (sellerId) {
        const [sellerInfo] = await query<any[]>('SELECT u.email, CONCAT(s.first_name, " ", s.last_name) as name FROM users u JOIN sellers s ON u.id = s.user_id WHERE s.id = ?', [sellerId]);
        if (sellerInfo) { emails.push(sellerInfo.email); sellerName = sellerInfo.name; }
    }

    if (booking.agent_id) {
        const [agentInfo] = await query<any[]>('SELECT u.email, CONCAT(a.first_name, " ", a.last_name) as name FROM users u JOIN agents a ON u.id = a.user_id WHERE a.id = ?', [booking.agent_id]);
        if (agentInfo) { emails.push(agentInfo.email); agentName = agentInfo.name; }
    }

    const [admins] = await query<any[]>('SELECT email, id FROM users WHERE role = "admin" AND status = "active"');
    if (Array.isArray(admins)) { 
        admins.forEach(adm => emails.push(adm.email)); 
    }

    // 5. Send Professional Confirmation Email to All Parties
    await sendBookingConfirmationEmail(emails, {
        bookingReference: booking.booking_reference,
        propertyName,
        totalAmount,
        clientName,
        agentName,
        sellerName,
        bookingType: booking.booking_type,
        isSale: booking.booking_type.includes('purchase')
    });

    // 6. In-App Notifications for Confirmation
    await NotificationModel.createNotification({
        user_id: clientInfo.user_id || booking.client_id, // Need to ensure we have user_id
        title: 'Booking Confirmed!',
        message: `Your booking for ${propertyName} (${booking.booking_reference}) has been confirmed.`,
        type: 'booking'
    });
}

export const createBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

    let clientId: string | null = null;
    let agentId: string | null = null;

    if (userRole === 'client') {
        clientId = await getClientIdByUserId(userId);
    } else if (userRole === 'agent') {
        agentId = await getAgentId(userId);
        const clientEmail = req.body.email;
        if (clientEmail) {
            const clientUser = await findUserByEmail(clientEmail);
            if (clientUser) clientId = await getClientIdByUserId(clientUser.id);
        }
    }

    if (!clientId && userRole !== 'admin') {
        return res.status(404).json({ success: false, message: 'Client profile not found.' });
    }

    const bookingData = { 
        ...req.body, 
        client_id: clientId,
        agent_id: agentId,
        total_amount: parseFloat(req.body.total_amount)
    };
    
    // Create the booking record (defaults to 'pending')
    const newBooking = await BookingModel.createBooking(bookingData);

    // MANUAL FLOW FOR ALL:
    // Every booking now requires a payment proof and manual admin confirmation.
    if (req.file) {
      await PaymentModel.createPayment({
        booking_id: newBooking.id,
        amount: newBooking.total_amount,
        payment_method: req.body.payment_method || 'bank_transfer',
        payment_proof_path: getRelativePath(req.file.path)
      });
    }

    // TRIGGER NOTIFICATION TO ADMINS
    await NotificationModel.notifyAdmins(
        'New Booking Request',
        `A new booking request (${newBooking.booking_reference}) has been submitted for review.`,
        'booking'
    );
    
    res.status(201).json({ 
        success: true, 
        message: 'Booking request submitted. Please wait for admin verification of your payment.', 
        data: { 
            bookingId: newBooking.id, 
            bookingReference: newBooking.booking_reference,
            isAutomatic: false
        } 
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await PaymentModel.updatePaymentStatusByBookingId(id, 'completed');
        await processConfirmedBooking(id);
        res.status(200).json({ success: true, message: 'Payment confirmed. All parties notified.' });
    } catch (error) {
        next(error);
    }
};

export const getInvoiceData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const details = await BookingModel.getBookingDetailsForInvoice(id);
        if (!details) return res.status(404).json({ success: false, message: 'Booking not found' });

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = new URL(`${baseUrl}/booking-details`);
        Object.entries(details).forEach(([key, value]) => url.searchParams.append(key, String(value)));

        const qrCodeImage = await QRCode.toDataURL(url.toString());
        res.status(200).json({ success: true, data: { ...details, qrCodeImage } });
    } catch (error) {
        next(error);
    }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookings = await BookingModel.getAllBookings();
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

export const getMyBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });
    const clientId = await getClientIdByUserId(userId);
    if (!clientId) return res.status(404).json({ success: false, message: 'Client profile not found.' });
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
    res.status(200).json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
};
