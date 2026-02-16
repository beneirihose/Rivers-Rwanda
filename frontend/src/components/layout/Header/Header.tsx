import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram, Youtube, Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await api.get('/users/profile');
          setProfile(response.data.data);
        } catch (error) {
          console.error('Error fetching profile', error);
          if (error.response && (error.response.status === 401 || error.response.status === 404)) {
            handleLogout(true); // Force logout on auth errors
          }
        }
      }
    };
    fetchProfile();
  }, [token, location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = (silent = false) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfile(null);
    if (!silent) navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/accommodations?query=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Accommodations', path: '/accommodations' },
    { name: 'Cars', path: '/cars' },
    { name: 'Houses', path: '/houses' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDisplayName = () => {
    if (!profile) return 'User';
    if (profile.first_name) return `${profile.first_name}`.toUpperCase();
    return profile.email.split('@')[0].toUpperCase();
  };

  const getProfileImage = () => {
    if (profile?.profile_image) {
      return `http://localhost:5000${profile.profile_image}`;
    }
    return null;
  };

  const menuVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: '100%', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  };

  const navItemVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
  }

  return (
    <header className={`w-full fixed top-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-primary-dark' : 'bg-transparent'}`}>
      {/* Top Bar - hidden for simplicity in new design */}

      {/* Main Nav */}
      <div className={`transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="container mx-auto flex justify-between items-center px-4 h-20">
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-black text-accent-orange tracking-tighter uppercase">Rivers</span>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">Rwanda</span>
          </Link>

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`relative text-sm font-black uppercase tracking-widest transition-colors duration-300 ${location.pathname === link.path ? 'text-accent-orange' : 'text-white hover:text-accent-orange'}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop User/Login */}
            <div className="hidden lg:block">
              {token && profile ? (
                <Link to={`/${user.role}/dashboard`} className="flex items-center gap-3 pl-4 border-l border-white/10 ml-4">
                    <div className="text-right">
                        <p className="text-white font-bold text-xs uppercase tracking-wider">{getDisplayName()}</p>
                        <p className="text-accent-orange text-[10px] font-bold uppercase tracking-widest">Dashboard</p>
                    </div>
                    <img src={getProfileImage() || '/user-placeholder.png'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-accent-orange object-cover" />
                </Link>
              ) : (
                 <div className="flex items-center gap-2 pl-4 border-l border-white/10 ml-4">
                  <Link to="/login" className="text-white hover:text-accent-orange text-xs font-bold uppercase px-4 py-2">Login</Link>
                  <Link to="/register" className="bg-accent-orange text-white px-5 py-2.5 rounded-md font-black text-xs uppercase hover:bg-white hover:text-primary-dark transition-all shadow-lg">Register</Link>
                </div>
              )}
            </div>

            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-white">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
            <motion.div
              variants={menuVariants} initial="hidden" animate="visible" exit="exit"
              className="lg:hidden fixed inset-0 bg-primary-dark z-[100] flex flex-col"
            >
                <div className="flex justify-between items-center h-20 px-4 flex-shrink-0">
                    <Link to="/" className="flex items-center gap-1 group">
                        <span className="text-2xl font-black text-accent-orange tracking-tighter uppercase">Rivers</span>
                        <span className="text-2xl font-black text-white tracking-tighter uppercase">Rwanda</span>
                    </Link>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex flex-col justify-between flex-grow overflow-y-auto">
                    <motion.ul
                        variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }}
                        initial="hidden" animate="visible"
                        className="flex flex-col items-center justify-center gap-y-6 pt-12 px-4"
                    >
                        {navLinks.map((link) => (
                            <motion.li variants={navItemVariants} key={link.path}>
                                <Link to={link.path} className="text-3xl font-black uppercase tracking-tighter text-white/80 hover:text-accent-orange transition-colors duration-300">{link.name}</Link>
                            </motion.li>
                        ))}
                    </motion.ul>

                    <motion.div
                        initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.5}}
                        className="p-8 mt-8"
                    >
                        {token && profile ? (
                        <div className="flex flex-col items-center gap-4 text-white">
                            <Link to={`/${user.role}/dashboard`} className="flex flex-col items-center gap-3">
                                <img src={getProfileImage() || '/user-placeholder.png'} alt="Profile" className="w-20 h-20 rounded-full border-4 border-accent-orange object-cover shadow-lg" />
                                <span className="text-xl font-bold uppercase mt-2">{getDisplayName()}</span>
                            </Link>
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="bg-accent-orange text-white px-10 py-3 rounded-lg font-black text-sm uppercase hover:bg-white hover:text-primary-dark transition-all shadow-lg mt-4 w-full">
                                Logout
                            </button>
                        </div>
                        ) : (
                        <div className="flex flex-col items-center gap-4">
                            <Link to="/login" className="text-white bg-white/10 w-full text-center py-4 rounded-lg font-bold uppercase">Login</Link>
                            <Link to="/register" className="bg-accent-orange text-white w-full text-center py-4 rounded-lg font-black uppercase">Register</Link>
                        </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Overlay - (Removed for simplicity based on the new design) */}
    </header>
  );
};

export default Header;
