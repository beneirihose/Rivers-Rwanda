import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import { Bed, Bath, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ImageGallery from '../../common/ImageGallery';

const FeaturedHouses = () => {
  const { t } = useTranslation();
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedHouses = async () => {
      try {
        const response = await api.get('/houses?featured=true&limit=3');
        setHouses(response.data.data || []);
      } catch (error) {
        console.error('Error fetching featured houses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedHouses();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-[3rem] h-[500px] animate-pulse">
            <div className="bg-gray-200 h-72 rounded-t-[3rem]"></div>
            <div className="p-8 space-y-4"><div className="h-6 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-full"></div><div className="h-12 bg-gray-200 rounded-2xl mt-8"></div></div>
          </div>
        ))}
      </div>
    );
  }
  
  const parseImages = (imagesData: any) => {
    if (!imagesData) return [];
    try {
        const parsed = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
    >
      {houses.map((house) => {
        const images = parseImages(house.images);
        const price = house.monthly_rent_price || house.purchase_price;

        return (
          <motion.div 
            key={house.id} 
            variants={itemVariants}
            className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/50 overflow-hidden flex flex-col group border border-gray-100 hover:shadow-2xl hover:shadow-accent-orange/10 transition-all duration-500 h-full min-h-[450px]"
          >
            <ImageGallery images={images} />

            <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-black text-primary-dark uppercase tracking-tighter group-hover:text-accent-orange transition-colors">{house.title}</h3>
                    <div className="bg-primary-dark/90 text-white text-[9px] font-bold uppercase px-3 py-1 rounded-full border border-white/10 tracking-wider">
                        {house.province}
                    </div>
                </div>
              
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 my-4 border-y border-gray-100 py-4">
                {[ 
                  { icon: <Bed size={14}/>, label: `${house.bedrooms || 0} ${t('home.beds')}` }, 
                  { icon: <Bath size={14}/>, label: `${house.bathrooms || 0} ${t('home.baths')}` }, 
                  { icon: <Home size={14}/>, label: `${house.size_sqm || 0} ${t('home.sqm')}` } 
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 min-w-[30%] justify-center bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                    <div className="text-accent-orange">{item.icon}</div>
                    <span className="text-[10px] sm:text-xs font-bold capitalize text-primary-dark tracking-tight">{item.label}</span>
                  </div>
                ))}
              </div>

               <div className="text-right mb-4">
                    <p className="text-accent-orange font-mono font-bold text-2xl">Rwf {price?.toLocaleString()}</p>
                    <p className="text-xs text-text-light -mt-1">{house.monthly_rent_price ? t('home.perMonth') : t('nav.forSale')}</p>
                </div>

              <div className="mt-auto">
                <Link 
                  to={`/houses/${house.id}`} 
                  className="w-full inline-block text-center py-4 bg-gray-50 text-primary-dark font-black rounded-xl hover:bg-primary-dark hover:text-white transition-all duration-300 uppercase text-xs tracking-widest border border-gray-100 shadow-sm"
                >
                  {t('home.viewDetails')}
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default FeaturedHouses;
