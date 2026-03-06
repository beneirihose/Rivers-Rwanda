import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, Facebook, Instagram, Twitter, Linkedin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
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
      toast.success('Your message has been sent successfully!');
      setFormData({ fullName: '', email: '', phoneNumber: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Using a simpler embed URL that doesn't always require an API key for basic display
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.502834375!2d30.0631!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5254945%3A0x27438478f7e8979e!2sUniversity%20of%20Lay%20Adventists%20of%20Kigali%20(UNILAK)!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw";

  const faqs = [
    {
      q: "How long does it take to get a response?",
      a: "Our team typically responds to all inquiries within 24 business hours. For urgent booking issues, please use our emergency phone line."
    },
    {
      q: "Can I visit your office in person?",
      a: "Yes! We welcome visitors at our office located at UNILAK, Kigali, from Monday to Friday, 8:00 AM to 6:00 PM."
    },
    {
      q: "How do I list my property with Rivers Rwanda?",
      a: "You can register as a Seller/Agent on our platform. Once verified, you'll be able to list accommodations, cars, or houses directly from your dashboard."
    }
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary-dark pt-32 pb-48 overflow-hidden">
        {/* Decorative Background Elements */}
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
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
              Let's Start a <span className="text-accent-orange">Conversation</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Have a question about our services? Our dedicated team is ready to assist you with all your accommodation and travel needs in Rwanda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-6 -mt-32 pb-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Contact Info & Map */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <h3 className="text-xl font-black text-primary-dark uppercase tracking-tight mb-8">Contact Information</h3>
              
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-accent-orange group-hover:bg-accent-orange group-hover:text-white transition-all duration-300">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Office Location</p>
                    <p className="text-sm font-bold text-primary-dark leading-relaxed">University of Lay Adventists of Kigali, KK 508 St, Kigali, Rwanda</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Phone size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Direct Line</p>
                    <p className="text-sm font-bold text-primary-dark">+250 792 659 094</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">Available 24/7 for support</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <Mail size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email Us</p>
                    <p className="text-sm font-bold text-primary-dark">info@rivers-rwanda.com</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">We'll respond within 24h</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Follow Our Journey</p>
                <div className="flex justify-center gap-4">
                  {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-accent-orange hover:text-white hover:-translate-y-1 transition-all duration-300">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Interactive Map Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-3 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden h-64 relative group"
            >
              <iframe
                title="Office Location"
                src={mapSrc}
                className="w-full h-full rounded-[1.5rem] grayscale hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                style={{ border: 0 }}
              ></iframe>
              <div className="absolute bottom-6 right-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary-dark text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} className="text-accent-orange animate-spin-slow" /> Open Maps
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 h-full"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-1 bg-accent-orange rounded-full"></div>
                <h2 className="text-2xl font-black text-primary-dark uppercase tracking-tight">Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-accent-orange transition-colors">
                        <UserIcon size={18} />
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Inquiry Subject</label>
                    <div className="relative">
                      <select 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-orange/20 focus:bg-white focus:border-accent-orange appearance-none transition-all font-medium text-primary-dark"
                      >
                        <option value="">Choose a topic</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Booking Support">Booking Support</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Agent Partnership">Agent Partnership</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Message Content</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                    rows={5} 
                    placeholder="Tell us more about your needs..." 
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
                      <span>Send Message</span>
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ & Quick Info Section */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-orange mb-4 block">Common Questions</span>
              <h2 className="text-3xl md:text-4xl font-black text-primary-dark uppercase tracking-tight mb-8">Frequently Asked Questions</h2>
              
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
                <h4 className="font-black text-primary-dark uppercase tracking-tight">Live Chat</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Coming soon! Instant support right from your browser.</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[2rem] space-y-4 mt-8">
                <Clock className="text-blue-600" size={32} />
                <h4 className="font-black text-primary-dark uppercase tracking-tight">Working Hours</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Mon - Fri: 8AM - 6PM<br/>Weekend: 10AM - 2PM</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

// Simple User Icon component since Lucide User might not be imported or I want to be safe
const UserIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

export default Contact;
