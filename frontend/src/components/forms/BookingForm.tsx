import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Banknote, Smartphone } from 'lucide-react';
import SuccessModal from '../common/SuccessModal';

// --- Schema for the form ---
const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  duration: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : 1),
    z.number().min(1, 'Duration must be at least 1').optional()
  ),
  payment_method: z.enum(['bank_transfer', 'mobile_money']),
  payment_proof: z.any().refine(files => files?.length > 0, 'Payment proof is required.'),
});

// --- Statically defined payment details ---
const paymentDetails = {
  bank: { name: 'Bank of Kigali', accountNumber: '0012-3456-7890-1112', accountName: 'Rivers Rwanda Ltd.' },
  momo: { number: '574623', name: 'Esron', dialCode: '*182*8*1*574623#' }
};

// --- Universal Booking Form Component ---
const BookingForm = ({ item, itemType }: { item: any, itemType: 'house' | 'vehicle' | 'accommodation' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'bank_transfer', duration: 1 }
  });

  const paymentMethod = watch('payment_method');
  const duration = watch('duration');

  // --- UNIVERSAL PRICE & DURATION LOGIC ---
  let price_per_unit = 0;
  let unit_label = '';
  let duration_label = 'Number of Nights';
  let show_duration = true;

  if (itemType === 'accommodation') {
    price_per_unit = item.price_per_night || item.price_per_event || 0;
    unit_label = item.price_per_night ? '/ night' : (item.price_per_event ? ' for the event' : '');
    duration_label = item.price_per_night ? 'Number of Nights' : 'Number of Events';
  } else if (itemType === 'house') {
    if (item.purchase_price) {
        price_per_unit = item.purchase_price;
        show_duration = false; // No duration for purchases
    } else {
        price_per_unit = item.monthly_rent_price || 0;
        unit_label = '/ month';
        duration_label = 'Rental Duration (Months)';
    }
  } else if (itemType === 'vehicle') {
    if (item.sale_price) {
        price_per_unit = item.sale_price;
        show_duration = false; // No duration for purchases
    } else {
        price_per_unit = item.daily_rate || 0;
        unit_label = '/ day';
        duration_label = 'Number of Days';
    }
  }
  
  const totalAmount = show_duration ? price_per_unit * (duration || 1) : price_per_unit;

  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'payment_proof') {
        if (data.payment_proof[0]) formData.append('payment_proof', data.payment_proof[0]);
      } else {
        formData.append(key, data[key]);
      }
    });
    
    // --- UNIVERSAL PAYLOAD LOGIC ---
    let bookingType, itemIdKey;
    if (itemType === 'house') {
      bookingType = item.monthly_rent_price ? 'house_rent' : 'house_purchase';
      itemIdKey = 'house_id';
    } else if (itemType === 'vehicle') {
      bookingType = item.purpose === 'rent' ? 'vehicle_rent' : 'vehicle_purchase';
      itemIdKey = 'vehicle_id';
    } else { // Accommodation
      bookingType = 'accommodation';
      itemIdKey = 'accommodation_id';
    }

    formData.append('booking_type', bookingType);
    formData.append(itemIdKey, item.id);
    formData.append('total_amount', totalAmount);

    try {
      const response = await api.post('/bookings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBookingRef(response.data.data.bookingReference);
      setModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking failed');
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
      <SuccessModal isOpen={modalOpen} onClose={handleModalClose} title="Success!" message="Booking request received!" reference={bookingRef} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="my-6 p-4 bg-black/20 rounded-xl text-center">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">
            {show_duration ? 'Total Amount' : 'Purchase Price'}
          </p>
          <p className="text-3xl font-black text-white tracking-tighter">
            Rwf {totalAmount?.toLocaleString()}
            {show_duration && <span className="text-base font-bold normal-case text-gray-300/80 ml-1"> for {duration} {unit_label.replace('/','').trim()}(s)</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input {...register('fullName')} placeholder="Your Full Name" className={inputStyles} />
            {errors.fullName && <p className={errorStyles}>{errors.fullName.message as string}</p>}
          </div>
          <div>
            <input {...register('email')} placeholder="Your Email Address" className={inputStyles} />
            {errors.email && <p className={errorStyles}>{errors.email.message as string}</p>}
          </div>
        </div>
        <div>
          <input {...register('phone')} placeholder="Your Phone Number" className={inputStyles} />
          {errors.phone && <p className={errorStyles}>{errors.phone.message as string}</p>}
        </div>

        {show_duration && (
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase ml-2">{duration_label}</label>
            <input {...register('duration')} type="number" placeholder={duration_label} className={`${inputStyles} mt-1`} />
            {errors.duration && <p className={errorStyles}>{errors.duration.message as string}</p>}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-gray-300 uppercase ml-2">Select Payment Method</label>
          <select {...register('payment_method')} className={`${inputStyles} mt-1`}>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money (MoMo)</option>
          </select>
        </div>

        <div className="p-4 border-2 border-dashed border-accent-orange/30 rounded-xl bg-accent-orange/5 text-white animate-in fade-in">
          <h4 className="font-bold flex items-center gap-2 mb-2 text-accent-orange">
            {paymentMethod === 'bank_transfer' ? <Banknote size={20} /> : <Smartphone size={20} />}
            Payment Instructions
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
              <p><strong>Code:</strong> <span className="font-mono bg-black/30 p-1 rounded">{paymentDetails.momo.number}</span></p>
              <p className="text-xs mt-2 text-gray-400">Use this code in your payment app or dial-in service.</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-300 uppercase ml-2">Upload Payment Proof</label>
          <input {...register('payment_proof')} type="file" accept=".jpg,.jpeg,.png,.pdf" className={`${inputStyles} p-2 mt-1`} />
          {errors.payment_proof && <p className={errorStyles}>{errors.payment_proof.message as string}</p>}
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl relative z-10">
          {loading ? 'Submitting...' : 'Submit Booking & Proof'}
        </button>
      </form>
    </>
  );
};

export default BookingForm;
