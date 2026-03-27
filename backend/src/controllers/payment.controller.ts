import { Request, Response, NextFunction } from 'express';
import { query } from '../database/connection';
import * as BookingModel from '../models/Booking.model';
import * as CommissionModel from '../models/Commission.model';
import * as HouseModel from '../models/House.model';
import * as AccommodationModel from '../models/Accommodation.model';
import * as VehicleModel from '../models/Vehicle.model';
import { getClientIdByUserId } from '../models/User.model';
import { sendSaleConfirmationEmail } from '../services/email.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Placeholder for a real payment gateway integration
const callPaymentGateway = async (amount: number, currency: string, description: string) => {
    console.log(`Initiating payment of ${amount} ${currency} for ${description}`);
    return `txn_${Date.now()}`;
};

export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

        const clientId = await getClientIdByUserId(userId);
        const booking = await BookingModel.getBookingById(bookingId);

        if (!booking || booking.client_id !== clientId) {
            return res.status(404).json({ success: false, message: 'Booking not found or access denied.' });
        }

        if (booking.payment_status === 'paid') {
            return res.status(400).json({ success: false, message: 'This booking has already been paid.' });
        }

        const transactionRef = await callPaymentGateway(booking.total_amount, 'RWF', `Booking for ${booking.booking_type}`);

        await query(
            'INSERT INTO payments (id, booking_id, amount, payment_method, transaction_id, status) VALUES (UUID(), ?, ?, ?, ?, ?)',
            [bookingId, booking.total_amount, 'mobile_money', transactionRef, 'pending']
        );

        const paymentRows = await query<any[]>('SELECT id FROM payments WHERE transaction_id = ?', [transactionRef]);

        res.status(200).json({ 
            success: true, 
            message: 'Payment initiated.', 
            data: {
                transactionReference: transactionRef,
                paymentId: paymentRows[0].id
            }
        });

    } catch (error) {
        console.error("INITIATE_PAYMENT_ERROR:", error);
        next(error);
    }
};

export const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { paymentId, transactionReference } = req.body;

        // 1. Mark Payment as completed
        await query("UPDATE payments SET status = 'completed', verified_at = CURRENT_TIMESTAMP WHERE id = ?", [paymentId]);
        const paymentRows = await query<any[]>('SELECT booking_id FROM payments WHERE id = ?', [paymentId]);
        
        if (paymentRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Payment record not found.' });
        }

        const bookingId = paymentRows[0].booking_id;
        
        // 2. Fetch booking details
        const booking = await BookingModel.getBookingById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

        // 3. Update Statuses
        await BookingModel.updateBookingStatus(bookingId, 'confirmed');
        await BookingModel.updateBookingPaymentStatus(bookingId, 'paid');

        let propertyName = "Property";
        let sellerId: string | null | undefined = booking.seller_id;

        // 4. Resolve Property Specifics
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

        // 5. Calculate & Record Commissions
        const totalAmount = Number(booking.total_amount);
        let agentFee = 0;

        if (booking.agent_id) {
            agentFee = totalAmount * 0.03;
            await CommissionModel.createCommission({
                booking_id: bookingId,
                amount: agentFee,
                commission_type: 'agent',
                agent_id: booking.agent_id,
                status: 'approved'
            });
        }

        if (sellerId) {
            const sellerPayout = totalAmount * 0.90;
            await CommissionModel.createCommission({
                booking_id: bookingId,
                amount: sellerPayout,
                commission_type: 'seller_payout',
                seller_id: sellerId,
                status: 'approved'
            });
        }

        const systemFeeRate = booking.agent_id ? 0.07 : 0.10;
        const systemFee = totalAmount * systemFeeRate;
        await CommissionModel.createCommission({
            booking_id: bookingId,
            amount: systemFee,
            commission_type: 'system',
            status: 'approved'
        });

        const netAmount = totalAmount - (totalAmount * 0.10);

        // 6. Notify Seller
        if (sellerId) {
            const sellerUsers = await query<any[]>('SELECT email FROM users WHERE id = (SELECT user_id FROM sellers WHERE id = ?)', [sellerId]);
            if (sellerUsers.length > 0) {
                await sendSaleConfirmationEmail(sellerUsers[0].email, {
                    propertyName,
                    amount: totalAmount,
                    systemFee: systemFee,
                    agentFee: agentFee,
                    netAmount: netAmount
                });
            }
        }

        res.status(200).json({ success: true, message: 'Payment confirmed and seller notified!' });

    } catch (error) {
        console.error("PAYMENT_CONFIRM_ERROR:", error);
        next(error);
    }
};
