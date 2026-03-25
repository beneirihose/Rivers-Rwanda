import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Fuel, 
  Settings, 
  Users, 
  Gauge, 
  ChevronLeft, 
  Info,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import BookingForm from '../../components/forms/BookingForm';
import ImageGallery from '../../components/common/ImageGallery';

const CarDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        const response = await api.get(`/vehicles/${id}`);
        setCar(response.data.data);
      } catch (error) {
        toast.error('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetail();
    window.scrollTo(0,0);
  }, [id]);

  const parseImages = (imagesData: any) => {
    if (!imagesData) return [];
    try {
      const parsed = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };

  if (loading) return <div className="min-h-screen bg-light-gray flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-orange"></div></div>;
  if (!car) return <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-primary-dark">{t('cars.noResults')}</h2><button onClick={() => navigate('/cars')} className="text-accent-orange font-bold hover:underline">{t('accommodations.backToSearch')}</button></div>;

  const images = parseImages(car.images);
  const price = car.purpose === 'rent' ? car.daily_rate : car.sale_price;
  const isAvailable = car.status === 'available';

  return (
    <div className="bg-light-gray min-h-screen pb-20 pt-28">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-light hover:text-accent-orange transition-colors mb-8 group"><ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /><span className="font-bold uppercase text-xs tracking-widest">{t('accommodations.backToSearch')}</span></button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 space-y-10">
            <ImageGallery images={images} />
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary-dark/5 text-primary-dark px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{car.make}</span>
                    <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{car.status}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-primary-dark uppercase tracking-tighter">{car.make} <span className="text-accent-orange">{car.model}</span></h1>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{car.purpose === 'rent' ? t('cars.forRent') : t('cars.forSale')}</p>
                  <p className="text-3xl md:text-4xl font-black text-primary-dark tracking-tighter">Rwf {price?.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">{[ { icon: <Fuel />, label: t('home.petrol'), value: car.fuel_type }, { icon: <Settings />, label: t('home.automatic'), value: car.transmission }, { icon: <Users />, label: t('accommodations.maxGuests'), value: `${car.seating_capacity} Seats` }, { icon: <Gauge />, label: t('accommodations.propertyType'), value: car.vehicle_type }, ].map((spec, i) => (<div key={i} className="space-y-2"><div className="text-accent-orange">{spec.icon}</div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{spec.label}</p><p className="font-bold text-primary-dark uppercase text-sm capitalize">{spec.value}</p></div>))}
              </div>
              <div className="prose prose-slate max-w-none"><div className="flex items-center gap-2 text-primary-dark mb-4"><Info size={20} className="text-accent-orange" /><h3 className="text-xl font-black uppercase tracking-tight m-0">{t('accommodations.about')}</h3></div><p className="text-text-light leading-relaxed font-medium">{car.description || `Experience the ultimate in comfort and reliability with this premium ${car.make} ${car.model}.`}</p></div>
            </div>
          </motion.div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-primary-dark text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-orange opacity-10 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 relative z-10">{t('accommodations.bookNow')} <span className="text-accent-orange">{t('nav.cars')}</span></h3>
                {isAvailable ? (
                  !showBookingForm ? (<button onClick={() => setShowBookingForm(true)} className="w-full bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl relative z-10">{car.purpose === 'rent' ? t('cars.forRent') : t('cars.forSale')}</button>) : (<BookingForm item={car} itemType="vehicle" />)
                ) : (
                  <div className="text-center bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-8">
                    <XCircle className="mx-auto mb-4" size={40} />
                    <h4 className="font-bold text-lg text-white mb-2">{t('accommodations.unavailable')}</h4>
                    <p className="text-red-300/80 text-sm">{t('accommodations.status')} {car.status}.</p>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-center gap-6 group hover:border-accent-orange transition-all cursor-pointer"><div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-accent-orange group-hover:text-white transition-all text-accent-orange"><ShieldCheck size={28} /></div><div><p className="font-black text-primary-dark uppercase tracking-tight text-sm">Need Assistance?</p><p className="text-xs text-text-light font-bold">Chat with an expert agent</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
