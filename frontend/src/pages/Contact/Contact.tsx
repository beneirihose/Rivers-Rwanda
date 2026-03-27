import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, Facebook, Instagram, Twitter, Linkedin, ChevronDown, User, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      toast.success(t('contact.success'));
      setFormData({ fullName: '', email: '', phoneNumber: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  const externalMapLink = "https://www.google.com/maps/@-1.9666037,30.0970127,991m/data=!3m1!1e3?hl=en&entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D";
  
  // Refined Embed URL for coordinate mapping
  const embedMapUrl = "https://maps.google.com/maps?ll=-1.9666037,30.0970127&q=-1.9666037,30.0970127&hl=en&t=m&z=15&output=embed";

  const faqs = [
    {
      q: t('contact.faq1Q', { defaultValue: "How long does it take to get a response?" }),
      a: t('contact.faq1A', { defaultValue: "Our team typically responds to all inquiries within 24 business hours." })
    },
    {
      q: t('contact.faq2Q', { defaultValue: "Can I visit your office in person?" }),
      a: t('contact.faq2A', { defaultValue: "Yes! We welcome visitors at our office located at Kigali-Gasabo KG 601st." })
    },
    {
      q: t('contact.faq3Q', { defaultValue: "How do I list my property?" }),
      a: t('contact.faq3A', { defaultValue: "You can register as a Seller/Agent on our platform." })
    }
  ];

  const socialLinks = [
    { icon: Facebook, url: "https://www.facebook.com/profile.php?id=61585040398721" },
    { icon: Twitter, url: "https://x.com/RiversRwanda1" },
    { icon: Instagram, url: "https://www.instagram.com/reel/DVAxu4fE4Fv/?igsh=MTdxbDBsbXMzaG1lNw==" },
    { icon: Linkedin, url: "https://www.linkedin.com/in/rivers-rwanda-8763363b5" },
    { icon: Youtube, url: "https://www.youtube.com/@riversrwanda" }
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <section className="relative bg-primary-dark pt-32 pb-48 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-orange rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-accent-orange/10 text-accent-orange rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-accent-orange/20">
              {t('contact.badge')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
              {t('contact.heroTitle')} <span className="text-accent-orange">{t('contact.heroTitleAccent')}</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {t('contact.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 -mt-32 pb-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <h3 className="text-xl font-black text-primary-dark uppercase tracking-tight mb-8">{t('contact.infoTitle')}</h3>
              
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-accent-orange group-hover:bg-accent-orange group-hover:text-white transition-all duration-300">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('contact.office')}</p>
                    <p className="text-sm font-bold text-primary-dark leading-relaxed font-mono text-accent-orange uppercase tracking-tighter">Kigali-Gasabo KG 601st</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Phone size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('contact.directLine')}</p>
                    <p className="text-sm font-bold text-primary-dark">+250 792 659 094</p>
                     <p className="text-sm font-bold text-primary-dark">+250 785 288 933</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">{t('contact.support247')}</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <Mail size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('contact.emailUs')}</p>
                    <p className="text-sm font-bold text-primary-dark">info@rivers-rwanda.com</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">{t('contact.emailDesc')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">{t('contact.followJourney')}</p>
                <div className="flex justify-center gap-4">
                  {socialLinks.map((social, i) => (
                    <a 
                      key={i} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-accent-orange hover:text-white hover:-translate-y-1 transition-all duration-300"
                    >
                      <social.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-3 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden h-64 relative group"
            >
              <iframe
                title="Office Location"
                src={embedMapUrl}
                className="w-full h-full rounded-[1.5rem] grayscale hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                style={{ border: 0 }}
              ></iframe>
              <a 
                href={externalMapLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="bg-primary-dark text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-accent-orange transition-colors">
                  <Globe size={12} className="text-white animate-spin-slow" /> {t('contact.openMaps')}
                </div>
              </a>
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 h-full"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-1 bg-accent-orange rounded-full"></div>
                <h2 className="text-2xl font-black text-primary-dark uppercase tracking-tight">{t('contact.sendMessage')}</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('contact.fullName')}</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-accent-orange transition-colors">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        required 
                        placeholder="John Doe" 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-orange/20 focus:bg-white focus:border-accent-orange transition-all font-medium text-primary-dark" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('contact.emailAddress')}</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-accent-orange transition-colors">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="john@example.com" 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-orange/20 focus:bg-white focus:border-accent-orange transition-all font-medium text-primary-dark" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('contact.phoneNumber')}</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-accent-orange transition-colors">
                        <Phone size={18} />
                      </div>
                      <input 
                        type="text" 
                        name="phoneNumber" 
                        value={formData.phoneNumber} 
                        onChange={handleChange} 
                        placeholder="+250 78x xxx xxx" 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-orange/20 focus:bg-white focus:border-accent-orange transition-all font-medium text-primary-dark" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('contact.subject')}</label>
                    <div className="relative">
                      <select 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-orange/20 focus:bg-white focus:border-accent-orange appearance-none transition-all font-medium text-primary-dark"
                      >
                        <option value="">{t('contact.chooseTopic')}</option>
                        <option value="General Inquiry">{t('contact.generalInquiry')}</option>
                        <option value="Booking Support">{t('contact.bookingSupport')}</option>
                        <option value="Technical Support">{t('contact.techSupport')}</option>
                        <option value="Agent Partnership">{t('contact.agentPartnership')}</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('contact.messageContent')}</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                    rows={5} 
                    placeholder={t('contact.messagePlaceholder')} 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-orange/20 focus:bg-white focus:border-accent-orange transition-all font-medium text-primary-dark resize-none"
                  ></textarea>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-primary-dark text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] hover:bg-accent-orange transition-all duration-500 flex items-center justify-center gap-3 disabled:bg-gray-400 shadow-xl shadow-primary-dark/10"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>{t('contact.submit')}</span>
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-orange mb-4 block">{t('contact.faqBadge')}</span>
              <h2 className="text-3xl md:text-4xl font-black text-primary-dark uppercase tracking-tight mb-8">{t('contact.faqTitle')}</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full flex justify-between items-center text-left py-2"
                    >
                      <span className="font-bold text-primary-dark pr-8">{faq.q}</span>
                      <ChevronDown size={20} className={`text-accent-orange transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-500 text-sm leading-relaxed py-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-orange-50 p-8 rounded-[2rem] space-y-4">
                <MessageSquare className="text-accent-orange" size={32} />
                <h4 className="font-black text-primary-dark uppercase tracking-tight">{t('contact.liveChat')}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{t('contact.liveChatDesc')}</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[2rem] space-y-4 mt-8">
                <Clock className="text-blue-600" size={32} />
                <h4 className="font-black text-primary-dark uppercase tracking-tight">{t('contact.workingHours')}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{t('contact.hoursWeek')}<br/>{t('contact.hoursWeekend')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
