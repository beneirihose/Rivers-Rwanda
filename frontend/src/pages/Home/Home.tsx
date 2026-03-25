import HeroSection from '../../components/home/HeroSection/HeroSection';
import FeaturedListings from '../../components/home/FeaturedListings/FeaturedListings';
import StatsSection from '../../components/home/StatsSection/StatsSection';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Award, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FeaturedVehicles from '../../components/home/FeaturedVehicles/FeaturedVehicles';
import FeaturedHouses from '../../components/home/FeaturedHouses/FeaturedHouses';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-light-gray min-h-screen">
      <HeroSection />
      
      <div className="container mx-auto py-12 px-4">
        {/* Featured Listings Section */}
        <FeaturedListings />

        {/* Featured Houses Section */}
        <section className="py-20">
            <div className="text-center mb-16">
                <h2 className="text-accent-orange font-black uppercase tracking-[0.3em] text-xs mb-4">{t('home.ourProperties')}</h2>
                <h3 className="text-4xl font-black text-primary-dark tracking-tighter uppercase">{t('home.featuredHouses')}</h3>
            </div>
            <FeaturedHouses />
            <div className="text-center mt-16">
                <Link to="/houses" className="bg-primary-dark text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-orange transition-all duration-500 shadow-xl">
                    {t('home.viewAllHouses')}
                </Link>
            </div>
        </section>

        {/* Featured Vehicles Section */}
        <section className="py-20">
            <div className="text-center mb-16">
                <h2 className="text-accent-orange font-black uppercase tracking-[0.3em] text-xs mb-4">{t('home.ourFleet')}</h2>
                <h3 className="text-4xl font-black text-primary-dark tracking-tighter uppercase">{t('home.featuredVehicles')}</h3>
            </div>
            <FeaturedVehicles />
            <div className="text-center mt-16">
                <Link to="/cars" className="bg-primary-dark text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-orange transition-all duration-500 shadow-xl">
                    {t('home.viewAllVehicles')}
                </Link>
            </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-accent-orange font-black uppercase tracking-[0.3em] text-xs mb-4">{t('home.whyChooseUs')}</h2>
            <h3 className="text-4xl font-black text-primary-dark tracking-tighter uppercase">{t('home.expertiseTrust')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: <ShieldCheck size={40} />, 
                title: t('home.verifiedListings'), 
                desc: t('home.verifiedDesc') 
              },
              { 
                icon: <Clock size={40} />, 
                title: t('home.support247'), 
                desc: t('home.supportDesc') 
              },
              { 
                icon: <Award size={40} />, 
                title: t('home.premiumQuality'), 
                desc: t('home.premiumDesc') 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 text-center hover:border-accent-orange transition-all duration-500 group"
              >
                <div className="inline-flex p-5 bg-orange-50 text-accent-orange rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h4 className="text-xl font-black text-primary-dark uppercase mb-4 tracking-tighter">{item.title}</h4>
                <p className="text-text-light leading-relaxed font-medium text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Call to Action Section */}
        <section className="my-24 relative rounded-[3rem] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover"
              alt="CTA Background"
            />
            <div className="absolute inset-0 bg-primary-dark/90 backdrop-blur-sm"></div>
          </div>
          
          <div className="relative z-10 py-20 px-8 md:px-20 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left text-white">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6 leading-tight">
                {t('home.readyToFind')} <br />
                <span className="text-accent-orange font-mono underline decoration-wavy decoration-accent-orange/30">{t('home.nextExperience')}</span>
              </h2>
              <p className="text-lg text-gray-300 font-medium mb-8">
                {t('home.ctaDesc')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/register" className="bg-accent-orange text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-2xl">
                  {t('home.getStarted')}
                </Link>
                <Link to="/contact" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary-dark transition-all duration-500 flex items-center gap-2">
                  {t('home.contactUs')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="flex gap-6 items-center">
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 text-center">
                <Users size={48} className="text-accent-orange mx-auto mb-4" />
                <p className="text-3xl font-black text-white tracking-tighter">1,200+</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('home.happyClients')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
