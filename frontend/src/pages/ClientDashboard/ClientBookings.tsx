import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, CheckCircle2, XCircle, ArrowRight, BookOpen, Download, Printer, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ClientBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.patch(`/bookings/${id}/cancel`);
        toast.success('Booking cancelled');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const handleDownloadPDF = (booking: any) => {
    toast.success(`PDF for booking ${booking.booking_reference} is being generated.`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-10 pt-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">My Bookings</h1>
          <p className="text-text-light mt-1 font-medium">Track and manage your accommodation, vehicle, and house requests.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <BookOpen className="text-accent-orange" size={20} />
          <span className="text-sm font-black text-primary-dark uppercase tracking-widest">{bookings.length} Total</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Reference</th>
                <th className="px-8 py-6">Details</th>
                <th className="px-8 py-6">Booking Status</th>
                <th className="px-8 py-6">Payment Status</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {bookings.map((b, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={b.id} 
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-8 py-6 font-mono text-xs font-black text-primary-dark tracking-tighter bg-gray-50/30">
                    {b.booking_reference}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-primary-dark uppercase tracking-tight">
                        {b.booking_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      b.booking_status === 'completed' ? 'bg-green-100 text-green-600' :
                      b.booking_status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      b.booking_status === 'approved' ? 'bg-blue-100 text-blue-600' :
                      b.booking_status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      b.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {b.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-primary-dark">Rwf {b.total_amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                        {b.payment_proof_path && (
                            <a href={`http://localhost:5000${b.payment_proof_path}`} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Payment Proof">
                                <Eye size={18} />
                            </a>
                        )}
                      {b.booking_status === 'completed' && b.payment_status === 'paid' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleDownloadPDF(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download PDF"><Download size={18} /></button>
                          <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Print Receipt"><Printer size={18} /></button>
                        </div>
                      ) : b.booking_status === 'pending' ? (
                        <button onClick={() => handleCancel(b.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-red-200 transition-all">
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No actions</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                     <div className="flex flex-col items-center gap-4 opacity-70">
                      <BookOpen size={48} />
                      <p className="font-bold">You have no bookings yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientBookings;
