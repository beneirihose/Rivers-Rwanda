import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ClientDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, completed: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/bookings/my');
        const bookings = response.data.data;
        setRecentBookings(bookings.slice(0, 5));
        
        const statsObj = bookings.reduce((acc: any, curr: any) => {
          acc.totalBookings++;
          if (curr.booking_status === 'pending') acc.pending++;
          if (curr.booking_status === 'completed') acc.completed++;
          return acc;
        }, { totalBookings: 0, pending: 0, completed: 0 });
        
        setStats(statsObj);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-16 p-39.6">
      <div>
        <h1 className="text-3xl pt-10 font-bold text-primary-dark">{t('dashboard.welcome')}</h1>
        <p className="text-text-light mb-5 mt-2">{t('dashboard.overview')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-light">{t('dashboard.totalBookings')}</p>
            <p className="text-2xl font-bold text-primary-dark">{stats.totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-accent-orange rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-light">{t('dashboard.pendingRequests')}</p>
            <p className="text-2xl font-bold text-primary-dark">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-light">{t('dashboard.completed')}</p>
            <p className="text-2xl font-bold text-primary-dark">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary-dark">{t('dashboard.recentBookings')}</h2>
          <button className="text-accent-orange font-bold text-sm hover:underline">{t('dashboard.viewAll')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-text-light uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">{t('dashboard.type')}</th>
                <th className="px-6 py-4">{t('dashboard.reference')}</th>
                <th className="px-6 py-4">{t('dashboard.status')}</th>
                <th className="px-6 py-4">{t('dashboard.amount')}</th>
                <th className="px-6 py-4">{t('dashboard.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 capitalize font-medium text-primary-dark">{b.booking_type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm text-text-light font-mono">{b.booking_reference}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.booking_status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      b.booking_status === 'completed' ? 'bg-green-100 text-green-600' :
                      b.booking_status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary-dark">Rwf {b.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-text-light">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-text-light italic">{t('dashboard.noBookings')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
