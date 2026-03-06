import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import { CheckCircle, ShieldCheck, Calendar, User, UserCheck, CreditCard, Hash, MapPin, Loader2, ArrowLeft } from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/verify/${id}`);
        setBooking(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Transaction could not be verified.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <Loader2 className="w-12 h-12 text-accent-orange animate-spin mb-4" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Verifying Transaction...</p>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full border border-red-50">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
          <Hash size={40} />
        </div>
        <h1 className="text-2xl font-black text-primary-dark uppercase mb-2">Invalid Transaction</h1>
        <p className="text-gray-500 mb-8">{error || 'This booking reference does not exist or has been removed.'}</p>
        <Link to="/" className="inline-block bg-primary-dark text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-accent-orange transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );

  const bookedItem = booking.house_title || booking.accommodation_name || `${booking.vehicle_make} ${booking.vehicle_model}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Verification Badge */}
        <div className="bg-green-500 text-white p-6 rounded-[2rem] shadow-lg shadow-green-500/20 flex items-center justify-between overflow-hidden relative group">
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight leading-none text-xl mb-1">Verified Transaction</h3>
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Official Rivers Rwanda Confirmation</p>
              </div>
           </div>
           <CheckCircle size={80} className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Main Details Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 md:p-10 text-center border-b border-gray-50 bg-gray-50/30">
            <img src={logo} alt="Logo" className="h-16 mx-auto mb-6" />
            <div className="inline-block px-4 py-1.5 bg-accent-orange/10 text-accent-orange rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-orange/20 mb-4">
              Official Digital Receipt
            </div>
            <h2 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">
              {bookedItem}
            </h2>
          </div>

          {/* Grid Information */}
          <div className="p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Hash size={12} className="text-accent-orange" /> Reference
                </p>
                <p className="font-bold text-primary-dark uppercase tracking-tight">#{booking.booking_reference}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Total Paid <CreditCard size={12} className="text-accent-orange" />
                </p>
                <p className="text-2xl font-black text-accent-orange">RWF {Number(booking.total_amount).toLocaleString()}</p>
              </div>
            </div>

            <div className="h-px bg-gray-50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Customer Name</p>
                    <p className="font-bold text-primary-dark">{booking.client_first_name} {booking.client_last_name}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Seller / Owner</p>
                    <p className="font-bold text-primary-dark">{booking.seller_name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-orange-50 rounded-xl flex items-center justify-center text-accent-orange">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Payment Date</p>
                    <p className="font-bold text-primary-dark">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Property Type</p>
                    <p className="font-bold text-primary-dark capitalize">{booking.booking_type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Footer */}
            <div className="mt-12 p-6 bg-gray-50 rounded-3xl flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-dark/60">Payment Authenticated via Secure Blockchain</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-accent-orange transition-colors">
            <ArrowLeft size={14} /> Back to Rivers Rwanda
          </Link>
        </div>

      </div>
    </div>
  );
};

export default BookingDetails;
