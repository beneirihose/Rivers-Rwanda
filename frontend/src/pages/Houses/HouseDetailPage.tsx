import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Bed, 
  Bath, 
  Home as HomeIcon, 
  MapPin, 
  ChevronLeft, 
  Info,
  ShieldCheck
} from 'lucide-react';
import BookingForm from '../../components/forms/BookingForm';
import ImageGallery from '../../components/common/ImageGallery';

const HouseDetailPage = () => {
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

  if (loading) return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-orange"></div>
    </div>
  );

  if (!house) return (
    <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-primary-dark">House not found</h2>
      <button onClick={() => navigate('/houses')} className="text-accent-orange font-bold hover:underline">Return to browse</button>
    </div>
  );

  const images = parseImages(house.images);
  const price = house.monthly_rent_price || house.purchase_price;

  return (
    <div className="bg-light-gray min-h-screen pb-20 pt-28">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-light hover:text-accent-orange transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase text-xs tracking-widest">Back to Listings</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-10"
          >
            <ImageGallery images={images} />
            
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary-dark/5 text-primary-dark px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{house.province}</span>
                    <span className="bg-orange-50 text-accent-orange px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{house.status}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-primary-dark uppercase tracking-tighter">{house.title}</h1>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{house.monthly_rent_price ? 'Monthly Rent' : 'Sale Price'}</p>
                  <p className="text-3xl md:text-4xl font-black text-primary-dark tracking-tighter">Rwf {price?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {[ { icon: <Bed />, label: 'Bedrooms', value: `${house.bedrooms} beds` }, { icon: <Bath />, label: 'Bathrooms', value: `${house.bathrooms} baths` }, { icon: <HomeIcon />, label: 'Size', value: `${house.size} sqm` }, { icon: <MapPin />, label: 'Location', value: house.district }, ].map((spec, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-accent-orange">{spec.icon}</div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{spec.label}</p>
                    <p className="font-bold text-primary-dark uppercase text-sm">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="flex items-center gap-2 text-primary-dark mb-4">
                  <Info size={20} className="text-accent-orange" /><h3 className="text-xl font-black uppercase tracking-tight m-0">Description</h3>
                </div>
                <p className="text-text-light leading-relaxed font-medium">{house.description || `A beautiful house located in the heart of ${house.district}.`}</p>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-primary-dark text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-orange opacity-10 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 relative z-10">Secure This <span className="text-accent-orange">House</span></h3>
                {!showBookingForm ? (<button onClick={() => setShowBookingForm(true)} className="w-full bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl relative z-10">{house.monthly_rent_price ? 'Book Rental Now' : 'Inquire Purchase'}</button>) : (<BookingForm item={house} itemType="house" />)}
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-center gap-6 group hover:border-accent-orange transition-all cursor-pointer">
                <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-accent-orange group-hover:text-white transition-all text-accent-orange"><ShieldCheck size={28} /></div>
                <div>
                  <p className="font-black text-primary-dark uppercase tracking-tight text-sm">Need Assistance?</p>
                  <p className="text-xs text-text-light font-bold">Chat with an expert agent</p>
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
