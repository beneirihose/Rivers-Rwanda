import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Building2, Car, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const StatsSection = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    apartments: 0,
    cars: 0,
    agents: 0,
    bookings: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/public/stats');
        const data = response.data.data;
        setStats({
          apartments: data.accommodations || 0,
          cars: data.vehicles || 0,
          agents: data.agents || 0, 
          bookings: data.bookings || 0
        });
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { label: t('home.stats.apartments'), value: stats.apartments, icon: <Building2 size={32} />, color: 'bg-orange-50 text-accent-orange' },
    { label: t('home.stats.cars'), value: stats.cars, icon: <Car size={32} />, color: 'bg-blue-50 text-blue-600' },
    { label: t('home.stats.agents'), value: stats.agents, icon: <Users size={32} />, color: 'bg-green-50 text-green-600' },
    { label: t('home.stats.bookings'), value: stats.bookings, icon: <CheckCircle2 size={32} />, color: 'bg-purple-50 text-purple-600' }
  ];

  return (
    <section className="py-24 bg-white rounded-[3rem] my-20 shadow-2xl shadow-gray-200/50 border border-gray-100">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {statItems.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 group"
            >
              <div className={`p-5 rounded-2xl ${item.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-primary-dark tracking-tighter">
                  {item.value}<span className="text-accent-orange">+</span>
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
