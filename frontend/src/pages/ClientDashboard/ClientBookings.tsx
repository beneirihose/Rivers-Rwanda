import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { BookOpen, Download, Printer, Eye, X, XCircle, Calendar, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Invoice from '../../components/common/Invoice';
import { useTranslation } from 'react-i18next';

const ClientBookings = () => {
  const { t } = useTranslation();
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
      toast.error(t('dashboard.bookings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (window.confirm(t('dashboard.bookings.cancelConfirm'))) {
      try {
        await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
        toast.success(t('dashboard.bookings.cancelSuccess'));
        fetchBookings();
      } catch (error) {
        toast.error(t('dashboard.bookings.cancelError'));
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
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
                           <h2 className="text-lg font-bold text-primary-dark">{t('dashboard.bookings.invoice.title')}</h2>
                           <div>
                             <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-2" title={t('dashboard.bookings.invoice.print')}><Printer size={18} /></button>
                             <button onClick={() => setSelectedBookingId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('dashboard.bookings.invoice.close')}><X size={18} /></button>
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
                <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">{t('dashboard.bookings.title')}</h1>
                <p className="text-text-light mt-1 font-medium">{t('dashboard.bookings.subtitle')}</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                <BookOpen className="text-accent-orange" size={20} />
                <span className="text-sm font-black text-primary-dark uppercase tracking-widest">{bookings.length} {t('dashboard.bookings.total')}</span>
              </div>
            </div>

            <div className="mt-10 bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">{t('dashboard.bookings.table.reference')}</th>
                      <th className="px-8 py-6">{t('dashboard.bookings.table.details')}</th>
                      <th className="px-8 py-6">{t('dashboard.bookings.table.status')}</th>
                      <th className="px-8 py-6">{t('dashboard.bookings.table.payment')}</th>
                      <th className="px-8 py-6">{t('dashboard.bookings.table.amount')}</th>
                      <th className="px-8 py-6 text-center">{t('dashboard.bookings.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-sm">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-primary-dark tracking-tighter bg-gray-50/30">
                          {b.booking_reference}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <p className="font-bold text-primary-dark uppercase tracking-tight flex items-center gap-2">
                              {b.property_name || b.booking_type.replace('_', ' ')}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                              <Home size={10} className="text-accent-orange" />
                              {renderPropertyType(b)}
                            </p>
                          </div>
                          
                          <div className="mt-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                              <Calendar size={12} className="text-accent-orange" />
                              <span>{t('dashboard.bookings.from')}: {formatDate(b.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                              <Calendar size={12} className="text-red-400" />
                              <span>{t('dashboard.bookings.to')}: {formatDate(b.end_date)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 w-fit ${
                            (b.booking_status === 'completed' || b.booking_status === 'confirmed') ? 'bg-green-100 text-green-700' :
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
                                  <a href={`http://localhost:5000${b.payment_proof_path}`} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t('dashboard.bookings.actions.viewProof')}><Eye size={18} /></a>
                              )}
                              {(b.booking_status === 'confirmed' || b.booking_status === 'completed') && b.payment_status === 'paid' && (
                                <button onClick={() => setSelectedBookingId(b.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title={t('dashboard.bookings.actions.viewInvoice')}><Download size={18} /></button>
                              )}
                              {b.booking_status === 'pending' && (
                                <button onClick={() => handleCancel(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('dashboard.bookings.actions.cancel')}><XCircle size={18} /></button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-gray-400"><div className="flex flex-col items-center gap-4 opacity-70"><BookOpen size={48} /><p className="font-bold">{t('dashboard.bookings.empty')}</p></div></td>
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
