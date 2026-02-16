import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Banknote, Smartphone } from 'lucide-react';

// Schema is simplified: we only need client info and payment proof.
const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  rental_duration: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : undefined),
    z.number().min(3, 'Minimum rental is 3 months').optional()
  ),
  payment_method: z.enum(['bank_transfer', 'mobile_money']),
  payment_proof: z.any().refine(files => files?.length > 0, 'Payment proof is required.'),
});

// --- PAYMENT DETAILS (These would be fetched from a system settings API) ---
const paymentDetails = {
  bank: {
    name: 'Bank of Kigali',
    accountNumber: '0012-3456-7890-1112',
    accountName: 'Rivers Rwanda Ltd.',
  },
  momo: {
    number: '574623',
    name: 'Esron',
    dialCode: '*182*8*1*574623#'
  }
};

const BookingForm = ({ item, itemType }: { item: any, itemType: 'house' | 'vehicle' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'bank_transfer' }
  });

  const paymentMethod = watch('payment_method');
  const rentalDuration = watch('rental_duration');

  const price = item.monthly_rent_price || item.purchase_price || item.daily_rate || item.sale_price;
  const totalAmount = item.monthly_rent_price && rentalDuration ? price * rentalDuration : price;

  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();

    // Append user info and proof
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('payment_method', data.payment_method);
    if (data.payment_proof[0]) {
      formData.append('payment_proof', data.payment_proof[0]);
    }
    if (data.rental_duration) {
      formData.append('rental_duration', data.rental_duration);
    }

    // Append booking details
    let bookingType, itemId;
    if (itemType === 'house') {
      bookingType = item.monthly_rent_price ? 'house_rent' : 'house_purchase';
      itemId = 'house_id';
    } else {
      bookingType = item.purpose === 'rent' ? 'vehicle_rent' : 'vehicle_purchase';
      itemId = 'vehicle_id';
    }
    formData.append('booking_type', bookingType);
    formData.append(itemId, item.id);
    formData.append('total_amount', totalAmount);

    try {
      await api.post('/bookings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Booking request sent! We will review your payment proof shortly.');
      navigate('/client/bookings');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full p-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-accent-orange focus:bg-white/10 outline-none transition-all";
  const errorStyles = "text-red-400 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* Price Display */}
      <div className="my-6 p-4 bg-black/20 rounded-xl text-center">
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">
          {item.monthly_rent_price ? (rentalDuration ? 'Total Amount Due' : 'Monthly Rent') : 'Purchase Price'}
        </p>
        <p className="text-3xl font-black text-white tracking-tighter">
          Rwf {totalAmount?.toLocaleString()}
          {item.monthly_rent_price && rentalDuration > 0 && <span className="text-base font-bold normal-case text-gray-300/80 ml-1"> for {rentalDuration} months</span>}
        </p>
      </div>

      {/* Personal Info */}
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

      {itemType === 'house' && item.monthly_rent_price && (
        <div>
            <input {...register('rental_duration')} type="number" placeholder="Rental Duration (months, 3 min)" className={inputStyles} />
            {errors.rental_duration && <p className={errorStyles}>{errors.rental_duration.message as string}</p>}
        </div>
      )}

      {/* Payment Method Selection */}
      <div>
        <label className="text-xs font-bold text-gray-300 uppercase ml-2">Select Payment Method</label>
        <select {...register('payment_method')} className={`${inputStyles} mt-1`}>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="mobile_money">Mobile Money (MoMo)</option>
        </select>
      </div>

      {/* Conditional Payment INSTRUCTIONS */}
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
            <p><strong>Dial:</strong> <span className="font-mono bg-black/30 p-1 rounded">{paymentDetails.momo.dialCode.replace('574623', `<strong class=\"text-accent-orange\">${paymentDetails.momo.number}</strong>`)}</span></p>
            <p className="text-xs mt-2 text-gray-400">Replace the amount in the dial code and follow the prompts.</p>
          </div>
        )}
      </div>
      
      {/* Payment Proof Upload */}
      <div>
        <label className="text-xs font-bold text-gray-300 uppercase ml-2">Upload Payment Proof (Screenshot/Slip)</label>
        <input {...register('payment_proof')} type="file" accept=".jpg,.jpeg,.png,.pdf" className={`${inputStyles} p-2 mt-1`} />
        {errors.payment_proof && <p className={errorStyles}>{errors.payment_proof.message as string}</p>}
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl relative z-10">
        {loading ? 'Submitting...' : 'Submit Booking & Proof'}
      </button>
    </form>
  );
};

export default BookingForm;
