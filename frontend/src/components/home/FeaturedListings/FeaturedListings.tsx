import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import { MapPin, Star, Tag, ChevronRight, Camera, X, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageGallery from '../../common/ImageGallery';

const FeaturedListings = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/accommodations?featured=true&limit=4');
        setFeatured(response.data.data);
      } catch (error) {
        console.error('Error fetching featured listings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

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

  if (loading) return (
    <div className="py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse overflow-hidden shadow-sm">
                <div className="bg-gray-200 h-56 w-full"></div>
                <div className="p-5 space-y-3"><div className="h-3 bg-gray-200 rounded w-1/3"></div><div className="h-5 bg-gray-200 rounded w-full"></div><div className="h-3 bg-gray-200 rounded w-2/3"></div></div>
            </div>
        ))}
    </div>
  );

  return (
    <section className="py-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 px-4">
        <div>
          <div className="flex items-center gap-2 text-accent-orange font-black text-[10px] uppercase tracking-widest">
            <span className="w-6 h-0.5 bg-accent-orange rounded-full"></span>
            Our Recommendations
          </div>
          <h2 className="text-3xl font-black text-primary-dark tracking-tighter uppercase leading-none">
            Featured <span className="text-accent-orange font-mono">Accommodations</span>
          </h2>
        </div>
        <Link to="/accommodations" className="group flex items-center gap-2 text-primary-dark font-black uppercase text-[10px] tracking-widest hover:text-accent-orange transition-colors">
          Explore All
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 px-4"
      >
        {featured.map((item) => {
          const images = parseImages(item.images);
          const price = item.price_per_night || item.price_per_event;
          
          return (
            <motion.div 
              key={item.id}
              variants={itemVariants}
              className="bg-white rounded-3xl shadow-lg shadow-gray-200/40 overflow-hidden flex flex-col group border border-gray-100 hover:shadow-2xl hover:shadow-accent-orange/10 transition-all duration-500"
            >
              <ImageGallery images={images} />

              {/* Content */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-extrabold text-primary-dark leading-tight line-clamp-1 group-hover:text-accent-orange transition-colors">{item.name}</h3>
                        <div className="flex items-center gap-1.5 text-text-light mt-1">
                            <MapPin size={12} className="text-accent-orange shrink-0" />
                            <span className="text-xs font-bold opacity-70">{item.district}, {item.city}</span>
                        </div>
                    </div>
                    <div className="bg-primary-dark/90 backdrop-blur-md text-white text-[9px] font-black uppercase px-3 py-1 rounded-full border border-white/10 tracking-widest">
                        {item.type.replace('_',' ')}
                    </div>
                </div>
                
                <div className="my-4 border-t border-gray-100"></div>

                <div className="text-right mb-4">
                    <p className="text-accent-orange font-mono font-bold text-2xl">Rwf {price?.toLocaleString()}</p>
                    <p className="text-xs text-text-light -mt-1">/ per night</p>
                </div>

                <div className="mt-auto">
                  <Link 
                    to={`/accommodations/${item.id}`} 
                    className="w-full inline-block text-center py-3 bg-gray-50 text-primary-dark font-black rounded-xl hover:bg-primary-dark hover:text-white transition-all duration-300 uppercase text-xs tracking-widest border border-gray-100 shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default FeaturedListings;
