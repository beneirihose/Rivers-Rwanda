import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  Package, 
  BookOpen, 
  Clock, 
  Wallet, 
  Plus, 
  TrendingUp, 
  ChevronRight,
  Home,
  Car,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SellerDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [productsRes, bookingsRes, earningsRes] = await Promise.all([
          api.get('/sellers/products'),
          api.get('/sellers/bookings'),
          api.get('/sellers/earnings')
        ]);

        const products = productsRes.data.data || [];
        const bookings = bookingsRes.data.data || [];
        const earnings = earningsRes.data.data || [];

        const pending = bookings.filter((b: any) => b.booking_status === 'pending').length;
        const totalEarned = earnings.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

        setStats({
          totalProducts: products.length,
          totalBookings: bookings.length,
          pendingBookings: pending,
          totalEarnings: totalEarned
        });

        setRecentBookings(bookings.slice(0, 5));
      } catch (error) {
        console.error('Error fetching seller dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh] pt-40">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  const statCards = [
    { 
      label: t('dashboard.seller.stats.products', 'Total Products'), 
      value: stats.totalProducts, 
      icon: <Package size={24} />, 
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      label: t('dashboard.seller.stats.bookings', 'Total Bookings'), 
      value: stats.totalBookings, 
      icon: <BookOpen size={24} />, 
      color: 'bg-green-50 text-green-600' 
    },
    { 
      label: t('dashboard.seller.stats.pending', 'Pending Requests'), 
      value: stats.pendingBookings, 
      icon: <Clock size={24} />, 
      color: 'bg-orange-50 text-accent-orange' 
    },
    { 
      label: t('dashboard.seller.stats.earnings', 'Total Earnings'), 
      value: `Rwf ${stats.totalEarnings.toLocaleString()}`, 
      icon: <Wallet size={24} />, 
      color: 'bg-purple-50 text-purple-600' 
    },
  ];

  return (
    <div className="space-y-10 pt-40 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">
          {t('dashboard.seller.title', 'Seller Dashboard')}
        </h1>
        <p className="text-text-light mt-2 font-medium">
          {t('dashboard.seller.subtitle', 'Welcome to your dashboard. Here you can manage your products and view your sales.')}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-50 flex items-center gap-5 hover:shadow-xl transition-all duration-300"
          >
            <div className={`p-4 ${stat.color} rounded-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-primary-dark tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-black text-primary-dark uppercase tracking-tighter flex items-center gap-2">
            <div className="w-8 h-1 bg-accent-orange rounded-full"></div>
            {t('dashboard.seller.actions.title', 'Quick Actions')}
          </h2>
          
          <div className="flex flex-col gap-4">
            <Link 
              to="/seller/products/new" 
              className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-accent-orange hover:shadow-2xl hover:shadow-accent-orange/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-accent-orange group-hover:text-white transition-all rounded-xl">
                  <Plus size={20} />
                </div>
                <span className="font-bold text-primary-dark uppercase text-[10px] tracking-widest">
                  {t('dashboard.seller.actions.addProduct', 'Add New Product')}
                </span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-accent-orange transition-colors" />
            </Link>

            <Link 
              to="/seller/earnings" 
              className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-accent-orange hover:shadow-2xl hover:shadow-accent-orange/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-accent-orange group-hover:text-white transition-all rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <span className="font-bold text-primary-dark uppercase text-[10px] tracking-widest">
                  {t('dashboard.seller.actions.viewEarnings', 'View Earnings')}
                </span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-accent-orange transition-colors" />
            </Link>

            <div className="mt-4 p-6 bg-primary-dark rounded-[2rem] text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Need Help?</h3>
                <p className="text-xs text-gray-300 mb-4">Contact our support team for any issues with your listings or payments.</p>
                <Link to="/contact" className="inline-block px-6 py-2 bg-accent-orange text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-dark transition-all">
                  Get Support
                </Link>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Building2 size={120} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-primary-dark uppercase tracking-tighter flex items-center gap-2">
              <div className="w-8 h-1 bg-accent-orange rounded-full"></div>
              {t('dashboard.seller.recentBookings', 'Recent Bookings')}
            </h2>
            <Link to="/seller/bookings" className="text-[10px] font-black text-accent-orange uppercase tracking-widest hover:underline">
              {t('dashboard.viewAll', 'View All')}
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-text-light uppercase text-[9px] font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.length > 0 ? recentBookings.map((booking, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                            {booking.booking_type.includes('house') ? <Home size={16} /> : 
                             booking.booking_type.includes('vehicle') ? <Car size={16} /> : 
                             <Building2 size={16} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary-dark uppercase tracking-tight">{booking.property_name || 'Property'}</p>
                            <p className="text-[9px] text-gray-400 font-mono">{booking.booking_reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-text-light">{booking.client_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-primary-dark">Rwf {(booking.total_amount * 0.9).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          booking.booking_status === 'confirmed' || booking.booking_status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {booking.booking_status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-xs font-medium">
                        No recent bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
