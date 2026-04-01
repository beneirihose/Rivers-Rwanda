import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Tag, Banknote, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    type: 'All Types',
    sub_type: '',
    purpose: '',
    maxPrice: ''
  });

  const [featuredImages, setFeaturedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentIndex] = useState(0);

  const rwandaDistricts = [
    "Gasabo", "Kicukiro", "Nyarugenge", // Kigali
    "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo", // North
    "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango", // South
    "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana", // East
    "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro" // West
  ].sort();

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
                images.push(`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://rivers-rwanda.onrender.com'}${parsed[0]}`);
              }
            }
          });
        };

        processImages(accRes.data.data || []);
        processImages(houseRes.data.data || []);
        processImages(vehicleRes.data.data || []);

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
    if (searchData.purpose) params.append('purpose', searchData.purpose);
    if (searchData.sub_type) params.append('sub_type', searchData.sub_type);

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

      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {featuredImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${currentImageIndex === i ? 'w-8 bg-accent-orange' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>

      <div className="container relative z-20 text-center px-4 max-w-7xl">
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
            {t('home.heroBadge')}
          </motion.div>

          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
            {t('home.heroTitlePart1')} <br />
            <span className="text-accent-orange text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-orange-300">
              {t('home.heroTitlePart2')}
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm md:text-xl text-gray-300 font-medium mb-16 leading-relaxed px-4 opacity-90">
            {t('home.heroSubtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl md:rounded-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-2 md:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 text-text-dark border border-white/40">
            
            {/* Location District Select */}
            <div className="flex-1 flex items-center px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer" onClick={() => document.getElementById('hero-location')?.focus()}>
              <div className="p-3 bg-orange-50 rounded-2xl mr-3 group-hover:scale-110 transition-transform">
                <MapPin size={22} className="text-accent-orange shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{t('home.searchLocation')}</label>
                <select
                  id="hero-location"
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark appearance-none cursor-pointer uppercase text-xs"
                  value={searchData.location}
                  onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                >
                  <option value="">{t('accommodations.whereTo')}</option>
                  {rwandaDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Type Select */}
            <div className="flex-1 flex items-center px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer" onClick={() => document.getElementById('hero-type')?.focus()}>
              <div className="p-3 bg-blue-50 rounded-2xl mr-3 group-hover:scale-110 transition-transform">
                <Building2 size={22} className="text-blue-500 shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{t('home.searchType')}</label>
                <select
                  id="hero-type"
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark appearance-none cursor-pointer uppercase text-xs"
                  value={searchData.type}
                  onChange={(e) => setSearchData({...searchData, type: e.target.value})}
                >
                  <option value="All Types">{t('home.everything')}</option>
                  <option value="apartment">{t('accommodations.apartment')}</option>
                  <option value="Vehicle Rent">{t('home.carRental')}</option>
                  <option value="hotel_room">{t('accommodations.hotelRoom')}</option>
                  <option value="event_hall">{t('accommodations.eventHall')}</option>
                  <option value="Local House">{t('nav.houses')}</option>
                </select>
              </div>
            </div>

            {/* Category Select (Sub-type) */}
            <div className="flex-1 flex items-center px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer" onClick={() => document.getElementById('hero-category')?.focus()}>
              <div className="p-3 bg-indigo-50 rounded-2xl mr-3 group-hover:scale-110 transition-transform">
                <Tag size={22} className="text-indigo-500 shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{t('accommodations.category')}</label>
                <select
                  id="hero-category"
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark appearance-none cursor-pointer uppercase text-xs"
                  value={searchData.sub_type}
                  onChange={(e) => setSearchData({...searchData, sub_type: e.target.value})}
                  disabled={searchData.type !== 'apartment' && searchData.type !== 'All Types'}
                >
                  <option value="">{t('accommodations.allCategories')}</option>
                  <option value="whole">{t('nav.wholeApartment')}</option>
                  <option value="room">{t('nav.apartmentRoom')}</option>
                </select>
              </div>
            </div>

            {/* Purpose Select */}
            <div className="flex-1 flex items-center px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer" onClick={() => document.getElementById('hero-purpose')?.focus()}>
              <div className="p-3 bg-purple-50 rounded-2xl mr-3 group-hover:scale-110 transition-transform">
                <Tag size={22} className="text-purple-500 shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{t('accommodations.purpose')}</label>
                <select
                  id="hero-purpose"
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark appearance-none cursor-pointer uppercase text-xs"
                  value={searchData.purpose}
                  onChange={(e) => setSearchData({...searchData, purpose: e.target.value})}
                >
                  <option value="">{t('accommodations.anyPurpose')}</option>
                  <option value="rent">{t('nav.forRent')}</option>
                  <option value="sale">{t('nav.forSale')}</option>
                </select>
              </div>
            </div>

            {/* Max Budget Input */}
            <div className="flex-1 flex items-center px-6 py-4 md:py-0 group cursor-text" onClick={() => document.getElementById('hero-budget')?.focus()}>
              <div className="p-3 bg-green-50 rounded-2xl mr-3 group-hover:scale-110 transition-transform">
                <Banknote size={22} className="text-green-500 shrink-0" />
              </div>
              <div className="text-left flex-1">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{t('home.searchBudget')}</label>
                <input
                  id="hero-budget"
                  type="number"
                  placeholder={t('home.maxPrice')}
                  className="w-full focus:outline-none bg-transparent font-bold text-primary-dark placeholder:text-gray-300 uppercase text-xs"
                  value={searchData.maxPrice}
                  onChange={(e) => setSearchData({...searchData, maxPrice: e.target.value})}
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="bg-primary-dark text-white font-black px-10 py-6 rounded-2xl md:rounded-full flex items-center justify-center gap-3 hover:bg-accent-orange transition-all duration-500 shadow-2xl group active:scale-95"
            >
              <Search size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-[10px]">{t('home.searchPlaceholder')}</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-light-gray via-transparent to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;
