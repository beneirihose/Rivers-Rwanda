import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, 
  Eye, 
  User, 
  Search, 
  Filter, 
  Download,
  Building2,
  Car,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SellerBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sellers/bookings');
      const data = response.data.data || [];
      setBookings(data);
      setFilteredBookings(data);
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

  useEffect(() => {
    let result = bookings;

    if (searchTerm) {
      result = result.filter(b => 
        b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.property_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(b => b.booking_status === statusFilter);
    }

    setFilteredBookings(result);
  }, [searchTerm, statusFilter, bookings]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    if (filteredBookings.length === 0) {
        toast.error('No bookings to print');
        return;
    }
    window.print();
  };

  const getPropertyIcon = (type: string) => {
    if (type?.includes('house')) return <Home size={16} />;
    if (type?.includes('vehicle')) return <Car size={16} />;
    return <Building2 size={16} />;
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'completed').length,
    pending: bookings.filter(b => b.booking_status === 'pending').length,
    revenue: bookings.filter(b => b.payment_status === 'paid').reduce((acc, curr) => acc + (Number(curr.total_amount) * 0.9), 0)
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-header { display: block !important; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
          th { background-color: #f2f2f2; }
          .dashboard-view { background: white !important; padding: 0 !important; }
        }
        .print-header { display: none; }
      ` }} />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">Manage Bookings</h1>
          <p className="text-text-light mt-1 font-medium">Track reservations and client inquiries for your properties.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'Total', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending', value: stats.pending, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Revenue', value: `Rwf ${Math.round(stats.revenue/1000)}k`, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, idx) => (
            <div key={idx} className={`${s.bg} px-4 py-3 rounded-2xl border border-white shadow-sm`}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-lg font-black ${s.color} tracking-tighter`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-50 flex flex-col md:flex-row gap-4 items-center no-print">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search reference, client or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent-orange/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-accent-orange/20 appearance-none cursor-pointer w-full"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            onClick={handlePrint}
            className="p-3 bg-primary-dark text-white rounded-xl hover:bg-accent-orange transition-all shadow-lg shadow-primary-dark/10"
            title="Export to PDF (Print)"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-50 print-container">
        {/* Custom Header for Print Only */}
        <div className="print-header p-8 text-center border-b border-gray-100">
            <h1 className="text-2xl font-black text-primary-dark uppercase tracking-tighter">Rivers Rwanda - Seller Booking Report</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-2">Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <div className="flex justify-center gap-8 mt-4 text-[10px] font-black uppercase">
                <span>Total Bookings: {stats.total}</span>
                <span>Confirmed: {stats.confirmed}</span>
                <span>Total Revenue: Rwf {stats.revenue.toLocaleString()}</span>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Property & Ref</th>
                <th className="px-8 py-6">Schedule</th>
                <th className="px-8 py-6">Client Info</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Earnings</th>
                <th className="px-8 py-6 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-sm">
              <AnimatePresence>
                {filteredBookings.map((b, idx) => (
                  <motion.tr 
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400 group-hover:bg-white group-hover:text-accent-orange transition-all no-print">
                          {getPropertyIcon(b.booking_type)}
                        </div>
                        <div>
                          <p className="font-bold text-primary-dark uppercase tracking-tight leading-tight">
                            {b.property_name || b.booking_type.replace('_', ' ')}
                          </p>
                          <p className="font-mono text-[10px] text-gray-400 mt-1 uppercase">{b.booking_reference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-blue-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 no-print"></div>
                          In: {formatDate(b.start_date)}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-red-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600 no-print"></div>
                          Out: {formatDate(b.end_date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-dark/5 flex items-center justify-center text-primary-dark border border-primary-dark/10 no-print">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-primary-dark">{b.client_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.client_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                          (b.booking_status === 'completed' || b.booking_status === 'confirmed') ? 'bg-green-50 text-green-700 border-green-100' :
                          b.booking_status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full no-print ${(b.booking_status === 'completed' || b.booking_status === 'confirmed') ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          {b.booking_status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] w-fit ${
                          b.payment_status === 'paid' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 bg-gray-50'
                        }`}>
                          {b.payment_status === 'paid' ? 'Payment Verified' : 'Awaiting Payment'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="font-black text-primary-dark text-base tracking-tighter">Rwf {(b.total_amount * 0.9).toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">90% Payout</p>
                    </td>
                    <td className="px-8 py-6 no-print">
                      <div className="flex justify-center">
                        {b.payment_proof_path ? (
                          <a 
                            href={`https://rivers-rwanda.onrender.com${b.payment_proof_path}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-3 bg-gray-50 text-gray-400 hover:bg-accent-orange hover:text-white rounded-xl transition-all shadow-sm group-hover:shadow-md"
                          >
                            <Eye size={18} />
                          </a>
                        ) : (
                          <div className="p-3 bg-gray-50 text-gray-200 rounded-xl cursor-not-allowed">
                            <Eye size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30 grayscale">
                      <BookOpen size={64} strokeWidth={1} />
                      <div className="space-y-1">
                        <p className="text-xl font-black text-primary-dark uppercase tracking-tighter">No Bookings Found</p>
                        <p className="text-sm font-medium">Try adjusting your filters or search terms.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer for Print Only */}
        <div className="print-header p-8 text-center border-t border-gray-100 mt-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">© {new Date().getFullYear()} Rivers Rwanda. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SellerBookings;
