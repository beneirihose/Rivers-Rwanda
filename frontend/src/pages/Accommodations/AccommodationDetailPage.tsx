import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Share2, Heart, ArrowLeft } from 'lucide-react';
import BookingForm from '../../components/forms/BookingForm';
import ImageGallery from '../../components/common/ImageGallery';

const AccommodationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
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
  
  if (!item) return <div className="container mx-auto py-20 text-center text-primary-dark font-bold tracking-tighter uppercase">Accommodation not found</div>;

  const images = parseImages(item.images);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 pt-24 md:pt-32">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-light hover:text-accent-orange transition-colors font-bold uppercase text-[10px] tracking-[0.2em] bg-white px-6 py-2.5 rounded-xl shadow-sm border border-gray-100"
          >
            <ArrowLeft size={14} strokeWidth={3} /> Back
          </button>
          <div className="flex gap-3">
            <button onClick={handleShare} className="p-3 bg-white rounded-full text-text-light hover:text-accent-orange transition-all shadow-sm border border-gray-100"><Share2 size={18} /></button>
            <button onClick={() => setIsSaved(!isSaved)} className={`p-3 bg-white rounded-full transition-all shadow-sm border border-gray-100 ${isSaved ? 'text-red-500' : 'text-text-light hover:text-red-500'}`}><Heart size={18} fill={isSaved ? "currentColor" : "none"} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-8"
          >
            <ImageGallery images={images} />
          </motion.div>

          {/* Right Side: Booking Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-primary-dark text-white rounded-[3.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 relative z-10 text-center">Secure This <span className="text-accent-orange">Property</span></h3>
                {!showBookingForm ? (
                  <div className="text-center">
                    <button onClick={() => setShowBookingForm(true)} className="w-full bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl relative z-10">Request Booking</button>
                  </div>
                ) : (
                  <BookingForm item={item} itemType="accommodation" />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailPage;
