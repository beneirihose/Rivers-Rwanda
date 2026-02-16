import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Settings, 
  Users, 
  Gauge, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import BookingForm from '../../components/forms/BookingForm';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
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
  }, [id]);

  const parseImages = (imagesData: any) => {
    if (!imagesData) return [];
    try {
      return typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
    } catch (e) {
      return [];
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-orange"></div>
    </div>
  );

  if (!car) return (
    <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-primary-dark">Vehicle not found</h2>
      <button onClick={() => navigate('/cars')} className="text-accent-orange font-bold hover:underline">Return to browse</button>
    </div>
  );

  const images = parseImages(car.images);
  const displayImages = images.length > 0 ? images : ['/placeholder-car.jpg'];
  const price = car.purpose === 'rent' ? car.daily_rate : car.sale_price;

  return (
    <div className="bg-light-gray min-h-screen pb-20 pt-30">
      <div className="container mx-auto px-4">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-light hover:text-accent-orange transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase text-xs tracking-widest">Back to Listing</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Images & Info */}
          <div className="lg:col-span-8 space-y-10">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl bg-white group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    src={`http://localhost:5000${displayImages[activeImage]}`}
                    className="w-full h-full object-cover"
                    alt={car.model}
                    onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200';
                    }}
                  />
                </AnimatePresence>
                
                {displayImages.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setActiveImage(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                      className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-accent-orange hover:text-white transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={() => setActiveImage(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                      className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-accent-orange hover:text-white transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}

                <div className="absolute top-6 left-6 bg-accent-orange text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                  {car.year} Model
                </div>
              </div>

              {displayImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {displayImages.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative shrink-0 w-32 aspect-video rounded-xl overflow-hidden border-4 transition-all ${
                        activeImage === i ? 'border-accent-orange scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={`http://localhost:5000${img}`} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary-dark/5 text-primary-dark px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{car.make}</span>
                    <span className="bg-orange-50 text-accent-orange px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{car.purpose}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-primary-dark uppercase tracking-tighter">{car.make} <span className="text-accent-orange">{car.model}</span></h1>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{car.purpose === 'rent' ? 'Daily Rental' : 'Sale Price'}</p>
                  <p className="text-3xl md:text-4xl font-black text-primary-dark tracking-tighter">Rwf {price?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {[
                  { icon: <Fuel />, label: 'Fuel Type', value: car.fuel_type },
                  { icon: <Settings />, label: 'Transmission', value: car.transmission },
                  { icon: <Users />, label: 'Capacity', value: `${car.seating_capacity} Seats` },
                  { icon: <Gauge />, label: 'Type', value: car.vehicle_type },
                ].map((spec, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-accent-orange">{spec.icon}</div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{spec.label}</p>
                    <p className="font-bold text-primary-dark uppercase text-sm">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="flex items-center gap-2 text-primary-dark mb-4">
                  <Info size={20} className="text-accent-orange" />
                  <h3 className="text-xl font-black uppercase tracking-tight m-0">Description</h3>
                </div>
                <p className="text-text-light leading-relaxed font-medium">
                  {car.description || `Experience the ultimate in comfort and reliability with this premium ${car.make} ${car.model}. Perfect for business trips or exploring the scenic beauty of Rwanda.`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-primary-dark text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-orange opacity-10 rounded-full blur-3xl"></div>
                
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 relative z-10">
                  Secure This <span className="text-accent-orange">Vehicle</span>
                </h3>

                {!showBookingForm ? (
                  <button 
                    onClick={() => setShowBookingForm(true)}
                    className="w-full bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl relative z-10"
                  >
                    {car.purpose === 'rent' ? 'Book Rental Now' : 'Inquire Purchase'}
                  </button>
                ) : (
                  <BookingForm item={car} itemType="vehicle" />
                )}
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-center gap-6 group hover:border-accent-orange transition-all cursor-pointer">
                <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-accent-orange group-hover:text-white transition-all text-accent-orange">
                  <ShieldCheck size={28} />
                </div>
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

export default CarDetailPage;
