import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Banknote, Smartphone, Calendar as CalendarIcon } from 'lucide-react';
import SuccessModal from '../common/SuccessModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// --- Schema for the form ---
const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  numMonths: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : 2),
    z.number().min(2, 'Minimum rental period is 2 months').optional()
  ),
  payment_method: z.enum(['bank_transfer', 'mobile_money']),
  payment_proof: z.any().refine(files => files?.length > 0, 'Payment proof is required.'),
});

const paymentDetails = {
  bank: { name: 'I&M Bank', accountNumber: '20151404001', accountName: 'MVL Group Ltd' },
  momo: { number: '0792659094', name: 'Leandre Mukunzi' }
};

const BookingForm = ({ item, itemType }: { item: any, itemType: 'house' | 'vehicle' | 'accommodation' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: { 
        payment_method: 'bank_transfer', 
        numMonths: 2,
        startDate: new Date().toISOString().split('T')[0]
    }
  });

  const paymentMethod = watch('payment_method');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const numMonths = watch('numMonths');

  const isHouseRent = itemType === 'house' && item.monthly_rent_price;
  const isHousePurchase = itemType === 'house' && item.purchase_price;
  const isVehicleRent = itemType === 'vehicle' && item.purpose !== 'buy';
  const isVehiclePurchase = itemType === 'vehicle' && item.purpose === 'buy';
  const isAccommodation = itemType === 'accommodation';

  // Calculate Total Amount
  const [totalAmount, setTotalAmount] = useState(0);
  const [displayDuration, setDisplayDuration] = useState('');

  useEffect(() => {
    let amount = 0;
    let label = '';

    if (isHousePurchase) {
      amount = item.purchase_price;
      label = t('booking.fullPurchase');
    } else if (isHouseRent) {
      const monthlyRate = item.monthly_rent_price;
      const months = numMonths || 2;
      amount = monthlyRate * months;
      label = `${months} ${t('booking.months')}`;
    } else if (isAccommodation || isVehicleRent) {
      const dailyRate = isAccommodation ? (item.price_per_night || item.price_per_event || 0) : (item.daily_rate || 0);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const units = diffDays > 0 ? diffDays : 1;
        amount = dailyRate * units;
        label = `${units} ${t('booking.days')}`;
      } else {
        amount = dailyRate;
        label = `1 ${t('booking.day')}`;
      }
    } else if (isVehiclePurchase) {
      amount = item.sale_price;
      label = t('booking.fullPurchase');
    }

    setTotalAmount(Math.round(amount));
    setDisplayDuration(label);
  }, [startDate, endDate, numMonths, item, itemType, isHouseRent, isHousePurchase, isVehicleRent, isVehiclePurchase, isAccommodation, t]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'payment_proof') {
        if (data.payment_proof[0]) formData.append('payment_proof', data.payment_proof[0]);
      } else if (key !== 'numMonths') {
        formData.append(key, data[key]);
      }
    });
    
    let bookingType, itemIdKey;
    if (itemType === 'house') {
      bookingType = item.monthly_rent_price ? 'house_rent' : 'house_purchase';
      itemIdKey = 'house_id';
    } else if (itemType === 'vehicle') {
      bookingType = item.purpose === 'buy' ? 'vehicle_purchase' : 'vehicle_rent';
      itemIdKey = 'vehicle_id';
    } else {
      bookingType = 'accommodation';
      itemIdKey = 'accommodation_id';
    }

    formData.append('booking_type', bookingType);
    formData.append(itemIdKey, item.id);
    formData.append('total_amount', totalAmount.toString());
    formData.append('start_date', data.startDate);

    if (isHouseRent && data.startDate && data.numMonths) {
        const start = new Date(data.startDate);
        const end = new Date(start.setMonth(start.getMonth() + parseInt(data.numMonths)));
        formData.append('end_date', end.toISOString().split('T')[0]);
    } else if (data.endDate) {
        formData.append('end_date', data.endDate);
    }
    
    if (item.seller_id) {
        formData.append('seller_id', item.seller_id);
    }

    try {
      const response = await api.post('/bookings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBookingRef(response.data.data.bookingReference);
      
      if (response.data.data.isAutomatic) {
          toast.success(t('booking.successAuto'));
          setTimeout(() => navigate('/client/bookings'), 2000);
      } else {
          setModalOpen(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('booking.failed'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleModalClose = () => {
    setModalOpen(false);
    navigate('/client/bookings');
  }

  const inputStyles = "w-full p-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-accent-orange focus:bg-white/10 outline-none transition-all";
  const errorStyles = "text-red-400 text-xs mt-1";

  return (
    <>
      <SuccessModal isOpen={modalOpen} onClose={handleModalClose} title={t('booking.successTitle')} message={t('booking.successMessage')} reference={bookingRef} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="my-6 p-4 bg-black/20 rounded-xl text-center">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">
            {isHousePurchase || isVehiclePurchase ? t('booking.purchasePrice') : t('booking.totalAmount')}
          </p>
          <p className="text-3xl font-black text-white tracking-tighter">
            Rwf {totalAmount?.toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-accent-orange uppercase tracking-widest mt-1">
            {t('booking.basedOn')} {displayDuration}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input {...register('fullName')} placeholder={t('contact.fullName')} className={inputStyles} />
            {errors.fullName && <p className={errorStyles}>{errors.fullName.message as string}</p>}
          </div>
          <div>
            <input {...register('email')} placeholder={t('auth.emailLabel')} className={inputStyles} />
            {errors.email && <p className={errorStyles}>{errors.email.message as string}</p>}
          </div>
        </div>
        <div>
          <input {...register('phone')} placeholder={t('auth.phoneLabel')} className={inputStyles} />
          {errors.phone && <p className={errorStyles}>{errors.phone.message as string}</p>}
        </div>

        {/* --- DYNAMIC DATE/DURATION FIELDS --- */}
        <div className="space-y-4 pt-2 border-t border-white/5 mt-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon size={12} /> {t('booking.schedulingDetails')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">{t('booking.startDate')}</label>
                    <input {...register('startDate')} type="date" className={`${inputStyles} mt-1`} min={new Date().toISOString().split('T')[0]} />
                    {errors.startDate && <p className={errorStyles}>{errors.startDate.message as string}</p>}
                </div>

                {/* For House Rent: Number of Months Input */}
                {isHouseRent && (
                    <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-1">{t('booking.rentalDuration')}</label>
                        <input {...register('numMonths')} type="number" min="2" placeholder={t('booking.min2Months')} className={`${inputStyles} mt-1`} />
                        {errors.numMonths && <p className={errorStyles}>{errors.numMonths.message as string}</p>}
                    </div>
                )}

                {/* For Accommodation / Vehicle Rent: End Date */}
                {(isAccommodation || isVehicleRent) && (
                    <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-1">{t('booking.endDate')}</label>
                        <input {...register('endDate')} type="date" className={`${inputStyles} mt-1`} min={startDate} />
                        {errors.endDate && <p className={errorStyles}>{errors.endDate.message as string}</p>}
                    </div>
                )}
            </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-300 uppercase ml-2">{t('booking.paymentMethod')}</label>
          <select {...register('payment_method')} className={`${inputStyles} mt-1`}>
            <option value="bank_transfer">{t('booking.bankTransfer')}</option>
            <option value="mobile_money">{t('booking.mobileMoney')}</option>
          </select>
        </div>

        <div className="p-4 border-2 border-dashed border-accent-orange/30 rounded-xl bg-accent-orange/5 text-white animate-in fade-in">
          <h4 className="font-bold flex items-center gap-2 mb-2 text-accent-orange">
            {paymentMethod === 'bank_transfer' ? <Banknote size={20} /> : <Smartphone size={20} />}
            {t('booking.paymentInstructions')}
          </h4>
          {paymentMethod === 'bank_transfer' && (
            <div className="text-sm space-y-1 text-gray-200">
              <p><strong>Bank:</strong> {paymentDetails.bank.name}</p>
              <p><strong>Account:</strong> {paymentDetails.bank.accountNumber}</p>
              <p><strong>Name:</strong> {paymentDetails.bank.accountName}</p>
            </div>
          )}
          {paymentMethod === 'mobile_money' && (
            <div className="text-sm space-y-1 text-gray-200">
              <p><strong>Receiver:</strong> {paymentDetails.momo.name}</p>
              <p><strong>Number:</strong> <span className="font-mono bg-black/30 p-1 rounded">{paymentDetails.momo.number}</span></p>
              <p className="text-xs mt-2 text-gray-400">{t('booking.momoInstruction')}</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-300 uppercase ml-2">{t('booking.uploadProof')}</label>
          <input {...register('payment_proof')} type="file" accept=".jpg,.jpeg,.png,.pdf" className={`${inputStyles} p-2 mt-1`} />
          {errors.payment_proof && <p className={errorStyles}>{errors.payment_proof.message as string}</p>}
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl relative z-10">
          {loading ? t('booking.processing') : t('booking.submit')}
        </button>
      </form>
    </>
  );
};

export default BookingForm;
