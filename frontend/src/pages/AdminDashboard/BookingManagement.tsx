import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Check, CreditCard, Eye, Trash2, Download, Printer, X, Calendar, Home } from 'lucide-react';
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

  const handleApprove = async (id: string) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
        try {
            await api.patch(`/admin/bookings/${id}/approve`);
            toast.success('Booking approved!');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to approve booking');
        }
    }
  }

  const handleConfirmPayment = async (id: string) => {
    if (window.confirm('Are you sure you want to confirm this payment? This will update the inventory.')) {
        try {
            await api.patch(`/bookings/${id}/confirm-payment`);
            toast.success('Payment confirmed!');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to confirm payment');
        }
    }
  }

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderPropertyType = (b: any) => {
    if (b.booking_type === 'accommodation') {
      const typeStr = b.accommodation_type?.replace('_', ' ') || 'Accommodation';
      const subTypeStr = b.accommodation_sub_type ? ` (${b.accommodation_sub_type})` : '';
      return <span className="capitalize">{typeStr}{subTypeStr}</span>;
    }
    return <span className="capitalize">{b.booking_type?.replace('_', ' ')}</span>;
  };

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
                  <th className="px-6 py-4">Booking Info & Dates</th>
                  <th className="px-6 py-4">Client</th>
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
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-primary-dark capitalize truncate max-w-[200px]" title={booking.property_name}>
                          {booking.property_name || booking.booking_type.replace('_', ' ')}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                          <Home size={10} className="text-accent-orange" />
                          {renderPropertyType(booking)}
                        </p>
                        <p className="font-mono text-[9px] text-text-light">{booking.booking_reference}</p>
                      </div>

                      <div className="mt-3 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-tighter">
                        <div className="flex items-center gap-1.5 text-orange-600">
                          <Calendar size={12} /> From: {formatDate(booking.start_date)}
                        </div>
                        <div className="flex items-center gap-1.5 text-red-600">
                          <Calendar size={12} /> To: {formatDate(booking.end_date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary-dark">{booking.client_name}</p>
                      <p className="text-xs text-text-light mt-1">{booking.client_phone}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary-dark">Rwf {booking.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                        booking.booking_status === 'completed' || booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.booking_status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600' }`}>{booking.booking_status}</span>
                    </td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                        booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{booking.payment_status || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                          {booking.payment_proof_path && <a href={`http://localhost:5000${booking.payment_proof_path}`} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Payment Proof"><Eye size={18} /></a>}
                          {booking.booking_status === 'pending' && <button onClick={() => handleApprove(booking.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve Booking"><Check size={18} /></button>}
                          {booking.booking_status === 'approved' && booking.payment_status === 'pending' && <button onClick={() => handleConfirmPayment(booking.id)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Confirm Payment"><CreditCard size={18} /></button>}
                          {(booking.booking_status === 'confirmed' || booking.booking_status === 'completed') && booking.payment_status === 'paid' && <button onClick={() => setSelectedBookingId(booking.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View Invoice"><Download size={18} /></button>}
                          <button onClick={() => handleDelete(booking.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Booking"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (<tr><td colSpan={6} className="py-20 text-center text-gray-400"><p className="font-bold">No bookings found.</p></td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingManagement;
