import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useSearchParams } from 'react-router-dom';
import { Tag, MapPin, Star, Gauge, Fuel, Settings, ChevronRight, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ImageGallery from '../../components/common/ImageGallery';

const CarsList = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    purpose: searchParams.get('purpose') || '',
    make: searchParams.get('make') || '',
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/vehicles`, { params: filters });
      setCars(response.data.data);
    } catch (error) {
      console.error('Error fetching cars', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [searchParams]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    if (!newFilters.purpose) delete (newFilters as any).purpose;
    if (!newFilters.make) delete (newFilters as any).make;
    setSearchParams(newFilters as any);
  };

  const parseImages = (imagesData: any) => {
    try {
      const parsed = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="bg-light-gray min-h-screen pt-2">
      <div className="relative bg-primary-dark/80 pt-60 pb-24 text-center text-white overflow-hidden">
         <div className="absolute inset-0 z-0"><img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" alt="Hero Cars" className="w-full h-full object-cover opacity-20"/><div className="absolute inset-0 bg-gradient-to-b from-primary-dark/50 via-primary-dark/80 to-primary-dark"></div></div>
        <div className="relative z-10 container mx-auto px-4"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}><h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4">{t('cars.heroTitle')}</h1><div className="flex items-center justify-center gap-2 text-accent-orange"><span className="w-12 h-1 bg-accent-orange rounded-full"></span><span className="text-sm font-black uppercase tracking-[0.3em]">{t('cars.heroSubtitle')}</span><span className="w-12 h-1 bg-accent-orange rounded-full"></span></div></motion.div></div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center border border-gray-100">
          <div className="flex-grow w-full"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">{t('cars.filterPurpose')}</label><select name="purpose" value={filters.purpose} onChange={handleFilterChange} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-primary-dark transition-all appearance-none"><option value="">{t('cars.allPurposes')}</option><option value="rent">{t('cars.forRent')}</option><option value="buy">{t('cars.forSale')}</option></select></div>
          <div className="flex-grow w-full"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">{t('cars.filterBrand')}</label><select name="make" value={filters.make} onChange={handleFilterChange} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-primary-dark transition-all appearance-none"><option value="">{t('cars.allMakes')}</option><option value="Toyota">Toyota</option><option value="Hyundai">Hyundai</option><option value="Mercedes-Benz">Mercedes-Benz</option><option value="BMW">BMW</option><option value="Range Rover">Range Rover</option></select></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_,i) => (<div key={i} className="bg-white rounded-[3rem] h-[500px] animate-pulse"><div className="bg-gray-200 h-72 rounded-t-[3rem]"></div><div className="p-8 space-y-4"><div className="h-6 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-full"></div><div className="h-12 bg-gray-200 rounded-2xl mt-8"></div></div></div>))}
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cars.length > 0 ? (
              cars.map((car) => {
                const images = parseImages(car.images);
                const price = car.purpose === 'rent' ? car.daily_rate : car.sale_price;
                return (
                  <motion.div key={car.id} variants={itemVariants} className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/50 overflow-hidden flex flex-col group border border-gray-100 hover:shadow-2xl hover:shadow-accent-orange/10 h-full">
                    <ImageGallery images={images} />
                    <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-3"><h3 className="text-xl font-black text-primary-dark uppercase tracking-tighter group-hover:text-accent-orange transition-colors">{car.make} <span className="text-accent-orange font-mono">{car.model}</span></h3><div className="bg-primary-dark/90 text-white text-[9px] font-bold uppercase px-3 py-1 rounded-full border border-white/10 tracking-wider">{car.year}</div></div>
                        <div className="grid grid-cols-3 gap-4 my-4 border-y border-gray-100 py-4">{[ { icon: <Fuel size={16}/>, label: car.fuel_type }, { icon: <Settings size={16}/>, label: car.transmission }, { icon: <Gauge size={16}/>, label: car.vehicle_type } ].map((item, i) => (<div key={i} className={`flex items-center gap-2 text-text-light ${i !== 0 ? 'border-l border-gray-100 pl-4' : ''}`}><div className="text-accent-orange">{item.icon}</div><span className="text-xs font-semibold capitalize">{item.label}</span></div>))}
                        </div>
                        <div className="text-right mb-4"><p className="text-accent-orange font-mono font-bold text-2xl">Rwf {price?.toLocaleString()}</p><p className="text-xs text-text-light -mt-1">{car.purpose === 'rent' ? t('cars.perDay') : t('cars.perPurchase')}</p></div>
                        <div className="mt-auto"><Link to={`/cars/${car.id}`} className="w-full block text-center py-4 bg-gray-50 text-primary-dark font-black rounded-xl hover:bg-primary-dark hover:text-white transition-all text-xs uppercase tracking-widest border shadow-sm">{t('cars.viewDetails')}</Link></div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] shadow-xl border border-gray-50"><div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Car size={40} className="text-gray-300" /></div><p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t('cars.noResults')}</p><button onClick={() => setSearchParams({})} className="mt-6 bg-accent-orange text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-primary-dark transition-all">{t('cars.clearFilters')}</button></div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CarsList;
