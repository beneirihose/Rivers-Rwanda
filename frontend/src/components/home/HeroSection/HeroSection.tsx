import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Tag, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    type: 'All Types',
    maxPrice: ''
  });

  const [featuredImages, setFeaturedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const [accRes, houseRes, vehicleRes] = await Promise.all([
          api.get('/accommodations?featured=true&limit=3'),
          api.get('/houses?featured=true&limit=3'),
          api.get('/vehicles?featured=true&limit=3')
        ]);
        
        const images: string[] = [];
        const processImages = (items: any[]) => {
          items.forEach(item => {
            if (item.images) {
              const parsed = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
              if (Array.isArray(parsed) && parsed.length > 0) {
                images.push(`http://localhost:5000${parsed[0]}`);
              }
            }
          });
        };

        processImages(accRes.data.data || []);
        processImages(houseRes.data.data || []);
        processImages(vehicleRes.data.data || []);

        // Fallback if no featured images
        if (images.length === 0) {
          images.push("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2000");
          images.push("https://images.unsplash.com/photo-1600585154340-be6199f7a009?auto=format&fit=crop&q=80&w=2000");
          images.push("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000");
          images.push("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000");
        }

        setFeaturedImages(images);
      } catch (error) {
        console.error('Error fetching hero images', error);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (featuredImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredImages]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.location) params.append('city', searchData.location);
    if (searchData.maxPrice) params.append('maxPrice', searchData.maxPrice);

    // Dynamic routing based on selection
    if (searchData.type === 'Vehicle Rent') {
        navigate(`/cars?${params.toString()}`);
    } else if (searchData.type === 'Local House') {
        navigate(`/houses?${params.toString()}`);
    } else {
        if (searchData.type && searchData.type !== 'All Types') {
            params.append('type', searchData.type.toLowerCase());
        }
        navigate(`/accommodations?${params.toString()}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-20">
      {/* Dynamic Background Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={featuredImages[currentImageIndex]}
              alt="Rivers Rwanda Luxury"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary-dark/40 to-primary-dark/90"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Navigation Dots */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {featuredImages.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${currentImageIndex === i ? 'w-8 bg-accent-orange' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>

      <div className="container relative z-20 text-center px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full mb-10 shadow-2xl"
          >
            <span className="w-2 h-2 bg-accent-orange rounded-full animate-pulse"></span>
            Premier Properties & Luxury Rentals
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
            FIND YOUR <br />
            <span className="text-accent-orange text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-orange-300">
              PARADISE
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-sm md:text-xl text-gray-300 font-medium mb-16 leading-relaxed px-4 opacity-90">
            Exclusive access to Rwanda's most prestigious residences, 
            premium vehicle rentals, and signature event spaces.
          </p>
        </motion.div>

        {/* Dynamic Search Form - Modern Redesign */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl md:rounded-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-2 md:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 text-text-dark border border-white/40">
            <div className="flex-1 flex items-center px-8 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 group cursor-text" onClick={() => document.getElementById('hero-location')?.focus()}>
              <div className="p-3 bg-orange-50 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                <MapPin size={22} className="text-accent-orange shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Location</label>
                <input
                  id="hero-location"
                  type="text"
                  placeholder="Kigali, Rwanda"
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark placeholder:text-gray-300"
                  value={searchData.location}
                  onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="flex-1 flex items-center px-8 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer" onClick={() => document.getElementById('hero-type')?.focus()}>
              <div className="p-3 bg-blue-50 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                <Tag size={22} className="text-blue-500 shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Property Type</label>
                <select
                  id="hero-type"
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark appearance-none cursor-pointer"
                  value={searchData.type}
                  onChange={(e) => setSearchData({...searchData, type: e.target.value})}
                >
                  <option value="All Types">Everything</option>
                  <option value="Apartment (Whole)">Apartment (Whole)</option>
                  <option value="Apartment (Room)">Apartment Room</option>
                  <option value="Vehicle Rent">Car Rental</option>
                  <option value="Hotel Room">Hotel Rooms</option>
                  <option value="Event Hall">Event Hall</option>
                  <option value="Local House">Local House</option>
                </select>
              </div>
            </div>

            <div className="flex-1 flex items-center px-8 py-4 md:py-0 group cursor-text" onClick={() => document.getElementById('hero-budget')?.focus()}>
              <div className="p-3 bg-green-50 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                <Banknote size={22} className="text-green-500 shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Budget</label>
                <input
                  id="hero-budget"
                  type="number"
                  placeholder="Max Price"
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark placeholder:text-gray-300"
                  value={searchData.maxPrice}
                  onChange={(e) => setSearchData({...searchData, maxPrice: e.target.value})}
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="bg-primary-dark text-white font-black px-12 py-6 rounded-2xl md:rounded-full flex items-center justify-center gap-3 hover:bg-accent-orange transition-all duration-500 shadow-2xl group active:scale-95"
            >
              <Search size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-xs">Search</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Shadow */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-light-gray via-transparent to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;
