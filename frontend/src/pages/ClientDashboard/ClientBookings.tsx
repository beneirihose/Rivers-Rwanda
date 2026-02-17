import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { BookOpen, Download, Printer, Eye, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Invoice from '../../components/common/Invoice';

const ClientBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data.data || []);
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
        await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
        toast.success('Booking cancelled');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const handlePrint = () => {
      const invoiceElement = document.getElementById('invoice-content');
      if(invoiceElement) {
          const printWindow = window.open('', '', 'height=800,width=800');
          printWindow?.document.write(`<html><head><title>Print Invoice</title><link rel="stylesheet" href="/src/index.css"></head><body>${invoiceElement.innerHTML}</body></html>`);
          printWindow?.document.close();
          printWindow?.focus();
          printWindow?.print();
      }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div></div>
  );

  return (
    <>
      <AnimatePresence>
        {selectedBookingId && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedBookingId(null)}>
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl mx-auto my-12">
                    <div className="bg-gray-50 rounded-xl shadow-2xl">
                        <div className="p-4 flex justify-between items-center border-b bg-white rounded-t-xl">
                           <h2 className="text-lg font-bold text-primary-dark">Booking Invoice</h2>
                           <div>
                             <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-2" title="Print"><Printer size={18} /></button>
                             <button onClick={() => setSelectedBookingId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Close"><X size={18} /></button>
                           </div>
                        </div>
                        <Invoice bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
                    </div>
                 </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="space-y-10 pt-24 md:pt-32">
        <div className="container mx-auto px-4">
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

            <div className="mt-10 bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-50">
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
                  <tbody className="divide-y divide-gray-50 font-medium text-sm">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-primary-dark tracking-tighter bg-gray-50/30">
                          {b.booking_reference}
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-primary-dark uppercase tracking-tight">{b.booking_type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-400 font-semibold">{new Date(b.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 w-fit ${
                            b.booking_status === 'completed' ? 'bg-green-100 text-green-700' :
                            b.booking_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            b.booking_status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            b.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 w-fit ${
                            b.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                            b.payment_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {b.payment_status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-bold text-primary-dark">
                          Rwf {b.total_amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center gap-2">
                              {b.payment_proof_path && (
                                  <a href={`http://localhost:5000${b.payment_proof_path}`} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Payment Proof"><Eye size={18} /></a>
                              )}
                              {(b.booking_status === 'completed' && b.payment_status === 'paid') && (
                                <button onClick={() => setSelectedBookingId(b.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Invoice"><Download size={18} /></button>
                              )}
                              {b.booking_status === 'pending' && (
                                <button onClick={() => handleCancel(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Booking"><XCircle size={18} /></button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-gray-400"><div className="flex flex-col items-center gap-4 opacity-70"><BookOpen size={48} /><p className="font-bold">You have no bookings yet.</p></div></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default ClientBookings;
