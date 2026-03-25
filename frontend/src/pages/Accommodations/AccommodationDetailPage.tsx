import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Share2, Heart, ArrowLeft, ShieldCheck, Users, 
  MapPin, Star, Wifi, Car, Info, CheckCircle2, XCircle,
  TreePine, Sparkles, Building2, Box, Dumbbell, Utensils, Bath, Tv, Waves, BedDouble, Layers
} from 'lucide-react';
import ImageGallery from '../../components/common/ImageGallery';
import BookingForm from '../../components/forms/BookingForm';

const AccommodationDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/accommodations/${id}`);
        setItem(response.data.data);
      } catch (error) {
        toast.error('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const parseImages = (imagesData: any) => {
    if (!imagesData) return [];
    try {
      const parsed = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full"
      />
    </div>
  );
  
  if (!item) return <div className="container mx-auto py-20 text-center text-primary-dark font-bold tracking-tighter uppercase">{t('accommodations.noResults')}</div>;

  const images = parseImages(item.images);
  const price = item.price_per_night || item.price_per_event || item.sale_price;
  const isAvailable = item.status === 'available';

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 pt-24 md:pt-32">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-light hover:text-accent-orange transition-colors font-bold uppercase text-[10px] tracking-[0.2em] bg-white px-6 py-2.5 rounded-xl shadow-sm border border-gray-100 group"
          >
            <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> {t('accommodations.backToSearch')}
          </button>
          <div className="flex gap-4">
            <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-primary-dark hover:text-accent-orange transition-all"><Share2 size={18}/></button>
            <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-primary-dark hover:text-red-500 transition-all"><Heart size={18}/></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-10"
          >
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              <ImageGallery images={images} />
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border border-gray-50 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-accent-orange/10 text-accent-orange px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-orange/20">
                    {t(`accommodations.${item.type}`)} {item.sub_type ? `(${t(`nav.${item.sub_type === 'whole' ? 'wholeApartment' : 'apartmentRoom'}`)})` : ''}
                  </span>
                  <div className="flex text-accent-orange gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary-dark uppercase tracking-tighter leading-none">
                  {item.name}
                </h1>
                {item.room_name_number && (
                  <p className="text-accent-orange font-black uppercase text-sm tracking-widest">
                    {t('accommodations.room')}: {item.room_name_number}
                  </p>
                )}
                <div className="flex items-center gap-2 text-text-light font-bold text-sm uppercase tracking-wide">
                  <MapPin size={18} className="text-accent-orange" />
                  {item.street_address}, {item.district}, {item.city}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-y border-gray-100">
                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-3xl">
                  <Users size={24} className="text-accent-orange" />
                  <span className="text-[10px] font-black uppercase text-gray-400">{t('accommodations.maxGuests')}</span>
                  <span className="text-lg font-black text-primary-dark">{item.max_guests || item.capacity || 0}</span>
                </div>
                {item.floor_number !== null && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-3xl">
                    <Layers size={24} className="text-accent-orange" />
                    <span className="text-[10px] font-black uppercase text-gray-400">{t('accommodations.floor')}</span>
                    <span className="text-lg font-black text-primary-dark">{item.floor_number}</span>
                  </div>
                )}
                {item.bed_type && (
                   <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-3xl">
                    <BedDouble size={24} className="text-accent-orange" />
                    <span className="text-[10px] font-black uppercase text-gray-400">{t('accommodations.bedType')}</span>
                    <span className="text-[10px] font-black text-primary-dark uppercase">{item.bed_type}</span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-3xl">
                  <ShieldCheck size={24} className="text-accent-orange" />
                  <span className="text-[10px] font-black uppercase text-gray-400">{t('accommodations.status')}</span>
                  <span className="text-[10px] font-black text-primary-dark uppercase">{item.status}</span>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-primary-dark uppercase tracking-widest">{t('accommodations.about')}</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-lg">
                  {item.description || "Experience unparalleled luxury and comfort at this premium property. Located in a prime area, it offers top-notch amenities and exceptional service."}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-primary-dark uppercase tracking-widest">{t('accommodations.facilities')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {item.wifi && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Wifi size={18} className="text-accent-orange"/> {t('accommodations.freeWifi')}</div>}
                    {item.parking && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Car size={18} className="text-accent-orange"/> {t('accommodations.freeParking')}</div>}
                    {item.garden && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><TreePine size={18} className="text-accent-orange"/> {t('accommodations.privateGarden')}</div>}
                    {item.gym && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Dumbbell size={18} className="text-accent-orange"/> {t('accommodations.gym')}</div>}
                    {item.kitchen && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Utensils size={18} className="text-accent-orange"/> {t('accommodations.kitchen')}</div>}
                    {item.toilet && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Bath size={18} className="text-accent-orange"/> {t('accommodations.toilet')}</div>}
                    {item.living_room && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Tv size={18} className="text-accent-orange"/> {t('accommodations.livingRoom')}</div>}
                    {item.swimming_pool && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Waves size={18} className="text-accent-orange"/> {t('accommodations.swimmingPool')}</div>}
                    {item.decoration && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Sparkles size={18} className="text-accent-orange"/> {t('accommodations.decoration')}</div>}
                    {item.has_elevator && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Building2 size={18} className="text-accent-orange"/> {t('accommodations.elevator')}</div>}
                    {item.is_furnished && <div className="flex items-center gap-3 text-sm font-bold uppercase text-gray-600"><Box size={18} className="text-accent-orange"/> {t('accommodations.furnished')}</div>}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-primary-dark text-white rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-white/5 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-orange opacity-10 rounded-full blur-3xl"></div>
              
              <div className="space-y-10 relative z-10">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t('accommodations.totalPrice')}</span>
                  <div className="text-5xl font-black text-accent-orange tracking-tighter">
                    Rwf {price?.toLocaleString()}
                  </div>
                  <span className="text-[11px] font-bold uppercase text-gray-300 tracking-widest">
                    {item.price_per_night ? t('home.perNight') : item.price_per_event ? t('accommodations.perEvent') : t('accommodations.fullPrice')}
                  </span>
                </div>

                {isAvailable ? (
                    !showBookingForm ? (
                        <button 
                            onClick={() => setShowBookingForm(true)}
                            className="w-full bg-accent-orange text-white font-black py-6 rounded-3xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-2xl shadow-accent-orange/20 flex items-center justify-center gap-3 group"
                        >
                            {item.price_per_night || item.price_per_event ? t('accommodations.bookNow') : t('accommodations.bookNow')}
                            <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="bg-white/5 p-2 rounded-3xl">
                            <BookingForm item={item} itemType="accommodation" />
                        </div>
                    )
                ) : (
                    <div className="text-center bg-red-500/10 border border-red-500/20 text-red-300 rounded-[2rem] p-8">
                        <XCircle className="mx-auto mb-4" size={40} />
                        <h4 className="font-black uppercase text-lg text-white mb-2">{t('accommodations.unavailable')}</h4>
                        <p className="text-red-300/80 text-xs font-bold uppercase tracking-tight tracking-wider leading-relaxed">{t('accommodations.status')} {item.status}.</p>
                    </div>
                )}

                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <ShieldCheck size={16} className="text-accent-orange" />
                    {t('accommodations.verifiedListing')}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 size={16} className="text-accent-orange" />
                    {t('accommodations.instantConfirmation')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailPage;
