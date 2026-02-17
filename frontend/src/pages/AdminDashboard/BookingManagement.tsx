import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Check, CreditCard, Eye, Trash2, Download, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Invoice from '../../components/common/Invoice';

const BookingManagement = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/bookings');
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success(`Booking has been ${status}.`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleVerifyPayment = async (bookingId: string) => {
    if (!bookingId) {
      toast.error('Invalid booking ID.');
      return;
    }
    try {
      await api.patch(`/admin/bookings/${bookingId}/verify-payment`);
      toast.success('Payment verified');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to verify payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this booking?')) {
        try {
            await api.delete(`/admin/bookings/${id}`);
            toast.success('Booking deleted.');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to delete booking.');
        }
    }
  }
  
    const handlePrint = () => {
      const invoiceElement = document.getElementById('invoice-content');
      if(invoiceElement) {
          const printWindow = window.open('', '', 'height=800,width=800');
          printWindow?.document.write('<html><head><title>Print Invoice</title>');
          printWindow?.document.write('<link rel="stylesheet" href="/src/index.css">');
          printWindow?.document.write('</head><body>');
          printWindow?.document.write(invoiceElement.innerHTML);
          printWindow?.document.write('</body></html>');
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

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Manage Bookings</h1>
          <p className="text-text-light mt-1">Review and update status of all client bookings.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-text-light uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Booking Info</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Booking Status</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary-dark capitalize">{booking.booking_type.replace('_', ' ')}</p>
                      <p className="font-mono text-xs text-text-light mt-1">{booking.booking_reference}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary-dark">{booking.client_name}</p>
                      <p className="text-xs text-text-light mt-1">{booking.client_phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary-dark">{booking.agent_name || <span className="text-xs text-gray-400 italic">N/A</span>}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary-dark">
                      Rwf {booking.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                        booking.booking_status === 'completed' ? 'bg-green-100 text-green-700' :
                        booking.booking_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        booking.booking_status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.booking_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                        booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        booking.payment_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.payment_status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                          {booking.payment_proof_path && (
                              <a href={`http://localhost:5000${booking.payment_proof_path}`} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Payment Proof"><Eye size={18} /></a>
                          )}
                          {booking.booking_status === 'pending' && (
                              <button onClick={() => handleStatusUpdate(booking.id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve Booking"><Check size={18} /></button>
                          )}
                          {booking.booking_status === 'approved' && booking.payment_status === 'pending' && (
                              <button onClick={() => handleVerifyPayment(booking.id)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Confirm Payment"><CreditCard size={18} /></button>
                          )}
                           {booking.booking_status === 'approved' && booking.payment_status === 'paid' && (
                              <button onClick={() => handleStatusUpdate(booking.id, 'completed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark as Completed"><CheckCircle size={18} /></button>
                          )}
                          {(booking.booking_status === 'completed' && booking.payment_status === 'paid') && (
                            <button onClick={() => setSelectedBookingId(booking.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Invoice"><Download size={18} /></button>
                          )}
                          <button onClick={() => handleDelete(booking.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Booking"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-400"><p className="font-bold">No bookings found.</p></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingManagement;
