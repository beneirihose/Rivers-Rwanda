import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Home, Car, BookOpen, Plus, UserCheck, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: 0,
    accommodations: 0,
    vehicles: 0,
    houses: 0,
    bookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh] pt-60">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  const statCards = [
    { label: t('dashboard.admin.stats.users'), value: stats.users, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600' },
    { label: t('dashboard.admin.stats.accommodations'), value: stats.accommodations, icon: <Building2 size={24} />, color: 'bg-green-50 text-green-600' },
    { label: t('dashboard.admin.stats.vehicles'), value: stats.vehicles, icon: <Car size={24} />, color: 'bg-purple-50 text-purple-600' },
    { label: t('dashboard.admin.stats.houses'), value: stats.houses || 0, icon: <Home size={24} />, color: 'bg-indigo-50 text-indigo-600' },
    { label: t('dashboard.admin.stats.bookings'), value: stats.bookings, icon: <BookOpen size={24} />, color: 'bg-orange-50 text-accent-orange' },
  ];

  return (
    <div className="space-y-10 pt-40 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-primary-dark tracking-tighter uppercase">{t('dashboard.admin.title')}</h1>
        <p className="text-text-light mt-2 font-medium">{t('dashboard.admin.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-50 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
            <div className={`p-4 ${stat.color} rounded-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-primary-dark tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-black text-primary-dark uppercase tracking-tighter mb-8 flex items-center gap-2">
           <div className="w-8 h-1 bg-accent-orange rounded-full"></div>
           {t('dashboard.admin.actions.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link 
            to="/admin/accommodations" 
            className="flex items-center justify-between p-8 bg-white border border-gray-100 rounded-3xl hover:border-accent-orange hover:shadow-2xl hover:shadow-accent-orange/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-accent-orange group-hover:text-white transition-all rounded-xl">
                <Plus size={20} />
              </div>
              <span className="font-bold text-primary-dark uppercase text-[10px] tracking-widest">{t('dashboard.admin.actions.addAccommodation')}</span>
            </div>
            <Building2 size={20} className="text-gray-200 group-hover:text-accent-orange transition-colors" />
          </Link>

          <Link 
            to="/admin/houses" 
            className="flex items-center justify-between p-8 bg-white border border-gray-100 rounded-3xl hover:border-accent-orange hover:shadow-2xl hover:shadow-accent-orange/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-accent-orange group-hover:text-white transition-all rounded-xl">
                <Plus size={20} />
              </div>
              <span className="font-bold text-primary-dark uppercase text-[10px] tracking-widest">{t('dashboard.admin.actions.addNewHouse')}</span>
            </div>
            <Home size={20} className="text-gray-200 group-hover:text-accent-orange transition-colors" />
          </Link>

          <Link 
            to="/admin/vehicles" 
            className="flex items-center justify-between p-8 bg-white border border-gray-100 rounded-3xl hover:border-accent-orange hover:shadow-2xl hover:shadow-accent-orange/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-accent-orange group-hover:text-white transition-all rounded-xl">
                <Plus size={20} />
              </div>
              <span className="font-bold text-primary-dark uppercase text-[10px] tracking-widest">{t('dashboard.admin.actions.addNewVehicle')}</span>
            </div>
            <Car size={20} className="text-gray-200 group-hover:text-accent-orange transition-colors" />
          </Link>

          <Link 
            to="/admin/agents" 
            className="flex items-center justify-between p-8 bg-white border border-gray-100 rounded-3xl hover:border-accent-orange hover:shadow-2xl hover:shadow-accent-orange/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-accent-orange group-hover:text-white transition-all rounded-xl">
                <UserCheck size={20} />
              </div>
              <span className="font-bold text-primary-dark uppercase text-[10px] tracking-widest">{t('dashboard.admin.actions.reviewAgents')}</span>
            </div>
            <Users size={20} className="text-gray-200 group-hover:text-accent-orange transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
