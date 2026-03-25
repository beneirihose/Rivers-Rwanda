import { motion } from 'framer-motion';
import { Check, Star, Users, Phone, Building, Home, HeartHandshake, BookKey, ArrowRight, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  };

  return (
    <div className="bg-white overflow-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-44 pb-32 text-center bg-white">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-accent-orange px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.4em] mb-8 text-white shadow-xl">
              {t('about.badge')}
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.9] text-primary-dark">
              {t('about.heroTitle')} <br />
              <span className="text-accent-orange">{t('about.heroTitleAccent')}</span>
            </h1>
            <div className="max-w-4xl mx-auto space-y-6 text-gray-500 text-lg md:text-xl font-medium leading-relaxed text-justify">
              <p>{t('about.para1')}</p>
              <p>{t('about.para2')}</p>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-orange/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-primary-dark/5 rounded-full blur-[100px]"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div>
              <span className="text-accent-orange font-black text-[11px] uppercase tracking-[0.3em] mb-4 block">{t('about.missionBadge')}</span>
              <h2 className="text-4xl md:text-5xl font-black text-primary-dark tracking-tighter uppercase leading-none mb-8">{t('about.missionTitle')}</h2>
              <p className="text-2xl md:text-3xl font-bold text-primary-dark/90 leading-snug italic border-l-[12px] border-accent-orange pl-8 py-4 bg-gray-50/50 rounded-r-3xl text-justify">
                "{t('about.missionQuote')}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {[
                { label: t('about.verifiedProperties'), icon: <Check size={16} strokeWidth={4} /> },
                { label: t('about.easyBooking'), icon: <Check size={16} strokeWidth={4} /> },
                { label: t('about.weddingPlanning'), icon: <Check size={16} strokeWidth={4} /> },
                { label: t('about.support247'), icon: <Check size={16} strokeWidth={4} /> }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 10, backgroundColor: '#fff7ed' }}
                  className="flex items-center gap-4 font-black text-primary-dark text-[11px] uppercase tracking-[0.2em] p-4 border border-gray-100 rounded-2xl transition-all"
                >
                  <div className="bg-accent-orange text-white p-2 rounded-lg shadow-md shadow-accent-orange/20">
                    {item.icon}
                  </div>
                  {item.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-6 bg-gray-50 rounded-[4rem] -rotate-2 -z-10 group-hover:rotate-0 transition-transform duration-700"></div>
            <div className="relative h-[500px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-white z-10">
              <img 
                src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                alt="Architecture" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <span className="text-accent-orange font-black text-[11px] uppercase tracking-[0.4em] mb-4 block">{t('about.offerBadge')}</span>
            <h2 className="text-4xl md:text-6xl font-black text-primary-dark tracking-tighter uppercase">{t('about.offerTitle')}</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: <Building size={36}/>, title: t('about.hotels'), desc: t('about.hotelsDesc') },
              { icon: <Home size={36}/>, title: t('about.apartments'), desc: t('about.apartmentsDesc') },
              { icon: <HeartHandshake size={36}/>, title: t('about.weddingVenues'), desc: t('about.weddingVenuesDesc') },
              { icon: <BookKey size={36}/>, title: t('about.secureBooking'), desc: t('about.secureBookingDesc') }
            ].map((service, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -15, borderColor: '#f97316' }}
                className="bg-white p-12 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border-2 border-gray-50 group transition-all duration-500"
              >
                <div className="bg-primary-dark w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mb-8 mx-auto group-hover:bg-accent-orange transition-all duration-500 shadow-xl shadow-primary-dark/10">
                  {service.icon}
                </div>
                <h3 className="font-black text-primary-dark text-xl mb-4 uppercase tracking-tight">{service.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <span className="text-accent-orange font-black text-[11px] uppercase tracking-[0.4em] mb-4 block">{t('about.benefitsBadge')}</span>
            <h2 className="text-4xl md:text-6xl font-black text-primary-dark tracking-tighter uppercase">{t('about.benefitsTitle')}</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: <Star size={24}/>, title: t('about.curatedListings'), desc: t('about.curatedDesc') },
              { icon: <Users size={24}/>, title: t('about.verifiedHosts'), desc: t('about.verifiedHostsDesc') },
              { icon: <Phone size={24}/>, title: t('about.support247'), desc: t('about.supportDesc') },
              { icon: <Check size={24}/>, title: t('about.transparentPricing'), desc: t('about.transparentDesc') },
              { icon: <ArrowRight size={24}/>, title: t('about.instantBooking'), desc: t('about.instantDesc') },
              { icon: <MapPin size={24}/>, title: t('about.primeLocations'), desc: t('about.locationsDesc') }
            ].map((benefit, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: '#fafafa' }}
                className="p-10 rounded-[3rem] border-2 border-gray-50 text-left transition-all duration-300 group hover:shadow-2xl hover:shadow-gray-200/50"
              >
                <div className="flex flex-col gap-6">
                  <div className="bg-primary-dark w-14 h-14 rounded-2xl flex items-center justify-center text-accent-orange shadow-lg transition-colors group-hover:bg-accent-orange group-hover:text-white">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-primary-dark text-xl uppercase tracking-tight mb-3">{benefit.title}</h3>
                    <p className="text-gray-400 font-medium leading-relaxed text-sm">{benefit.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-20">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent w-full"></div>
      </div>
    </div>
  );
};

export default About;
