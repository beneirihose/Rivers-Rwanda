import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Bed, 
  Bath, 
  MapPin, 
  ChevronLeft, 
  Info,
  ShieldCheck,
  XCircle,
  Layout,
  Utensils,
  Construction,
  Zap,
  Droplets,
  Wifi,
  Car,
  TreePine,
  Layers,
  Grid3X3,
  Ruler,
  Home
} from 'lucide-react';
import BookingForm from '../../components/forms/BookingForm';
import ImageGallery from '../../components/common/ImageGallery';

const HouseDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchHouseDetail = async () => {
      try {
        const response = await api.get(`/houses/${id}`);
        setHouse(response.data.data);
      } catch (error) {
        toast.error('Failed to load house details');
      } finally {
        setLoading(false);
      }
    };
    fetchHouseDetail();
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
  if (!house) return <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-primary-dark">{t('houses.noResults')}</h2><button onClick={() => navigate('/houses')} className="text-accent-orange font-bold hover:underline">{t('accommodations.backToSearch')}</button></div>;

  const images = parseImages(house.images);
  const price = house.monthly_rent_price || house.purchase_price;
  const isAvailable = house.status === 'available';

  const specs = [
    { icon: <Bed size={20}/>, label: t('houses.beds'), value: `${house.bedrooms} ${t('houses.beds')}` },
    { icon: <Bath size={20}/>, label: t('houses.baths'), value: `${house.bathrooms} ${t('houses.baths')}` },
    { icon: <Ruler size={20}/>, label: t('houses.sqm'), value: `${house.size_sqm || house.size} SQM` },
    { icon: <Layout size={20}/>, label: 'Balconies', value: `${house.balconies || 0} units` },
  ];

  const structuralSpecs = [
    { label: 'Construction', value: house.material_used?.replace('_', ' '), icon: <Construction size={18}/> },
    { label: 'Ceiling', value: house.ceiling_type, icon: <Layers size={18}/> },
    { label: 'Kitchen', value: house.kitchen_type + ' location', icon: <Utensils size={18}/> },
    { label: 'Toilet', value: house.toilet_type + ' location', icon: <Info size={18}/> },
  ];

  const amenities = [
    { id: 'has_tiles', label: 'Amakaro (Tiles)', icon: <Grid3X3 size={20}/>, active: house.has_tiles },
    { id: 'has_electricity', label: 'Electricity', icon: <Zap size={20}/>, active: house.has_electricity },
    { id: 'has_water', label: 'Water', icon: <Droplets size={20}/>, active: house.has_water },
    { id: 'has_parking', label: 'Parking', icon: <Car size={20}/>, active: house.has_parking },
    { id: 'has_garden', label: 'Garden', icon: <TreePine size={20}/>, active: house.has_garden },
    { id: 'has_wifi', label: 'WiFi', icon: <Wifi size={20}/>, active: house.has_wifi },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 pt-28">
      <div className="container mx-auto px-4 max-w-7xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-light hover:text-accent-orange transition-colors mb-10 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 group w-fit">
            <ChevronLeft size={18} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase text-[10px] tracking-[0.2em]">{t('accommodations.backToSearch')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8 space-y-10">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                <ImageGallery images={images} />
            </div>

            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-gray-50 space-y-12">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-accent-orange/10 text-accent-orange px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-orange/20">
                    {t('nav.houses')} {t('accommodations.purpose')} {house.purpose?.toUpperCase() || (house.monthly_rent_price ? t('nav.forRent').toUpperCase() : t('nav.forSale').toUpperCase())}
                  </span>
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${isAvailable ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {house.status.replace('_', ' ')}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-primary-dark uppercase tracking-tighter leading-none">{house.title}</h1>
                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-wide">
                  <MapPin size={18} className="text-accent-orange" />
                  {house.full_address || `${house.sector}, ${house.district}, ${house.province}`}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-y border-gray-100">
                {specs.map((spec, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-[2rem] text-center transition-all hover:bg-white hover:shadow-lg group">
                    <div className="text-accent-orange transition-transform group-hover:scale-110">{spec.icon}</div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{spec.label}</span>
                    <span className="text-sm font-black text-primary-dark uppercase">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-2">
                    <Construction size={20} className="text-accent-orange" />
                    <h3 className="text-xl font-black text-primary-dark uppercase tracking-widest">Building Specifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {structuralSpecs.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="text-accent-orange opacity-60">{s.icon}</div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{s.label}</span>
                            </div>
                            <span className="text-xs font-black text-primary-dark uppercase tracking-tight">{s.value}</span>
                        </div>
                    ))}
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xl font-black text-primary-dark uppercase tracking-widest">{t('accommodations.facilities')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map(item => (
                        <div key={item.id} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${item.active ? 'bg-white border-accent-orange/30 shadow-sm opacity-100' : 'bg-gray-50 border-transparent opacity-40 grayscale'}`}>
                            <div className={item.active ? 'text-accent-orange' : 'text-gray-400'}>{item.icon}</div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-primary-dark' : 'text-gray-400'}`}>{item.label}</span>
                        </div>
                    ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-primary-dark uppercase tracking-widest m-0">{t('accommodations.about')}</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-lg">
                    {house.description || "Experience the perfect blend of comfort and style in this stunning residence."}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-primary-dark text-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-orange opacity-10 rounded-full blur-3xl"></div>
                
                <div className="space-y-10 relative z-10">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t('accommodations.totalPrice')}</span>
                        <div className="text-4xl md:text-5xl font-black text-accent-orange tracking-tighter">
                            Rwf {price?.toLocaleString()}
                        </div>
                        <span className="text-[11px] font-bold uppercase text-gray-300 tracking-widest">
                            {house.monthly_rent_price ? t('houses.perMonth') : t('accommodations.fullPrice')}
                        </span>
                    </div>

                    {isAvailable ? (
                        !showBookingForm ? (
                            <button onClick={() => setShowBookingForm(true)} className="w-full bg-accent-orange text-white font-black py-6 rounded-3xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-2xl shadow-accent-orange/20 flex items-center justify-center gap-3">
                                {house.monthly_rent_price ? t('nav.forRent') : t('nav.forSale')}
                                <ChevronLeft size={18} className="rotate-180" />
                            </button>
                        ) : (
                            <div className="bg-white/5 p-2 rounded-3xl"><BookingForm item={house} itemType="house" /></div>
                        )
                    ) : (
                        <div className="text-center bg-red-500/10 border border-red-500/20 text-red-300 rounded-[2rem] p-8">
                            <XCircle className="mx-auto mb-4" size={40} />
                            <h4 className="font-black uppercase text-lg text-white mb-2">{t('accommodations.unavailable')}</h4>
                            <p className="text-red-300/80 text-xs font-bold uppercase tracking-tight tracking-wider leading-relaxed">{t('accommodations.status')} {house.status}.</p>
                        </div>
                    )}

                    <div className="space-y-4 pt-6">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <ShieldCheck size={16} className="text-accent-orange" /> {t('accommodations.verifiedListing')}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Home size={16} className="text-accent-orange" /> Exclusive Agency
                        </div>
                    </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 flex items-center gap-6 group hover:border-accent-orange transition-all cursor-pointer shadow-sm">
                <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-accent-orange group-hover:text-white transition-all text-accent-orange">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <p className="font-black text-primary-dark uppercase tracking-tight text-xs">Need Help?</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Chat with an agent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetailPage;
