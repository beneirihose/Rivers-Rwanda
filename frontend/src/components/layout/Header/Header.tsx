import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLLIElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await api.get('/users/profile');
          setProfile(response.data.data);
        } catch (error) {
          if ((error as any).response?.status === 401) handleLogout(true);
        }
      }
    };
    fetchProfile();
  }, [token, location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setActiveMobileSubmenu(null);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = (silent = false) => {
    localStorage.clear();
    setProfile(null);
    if (!silent) navigate('/login');
  };

  const handleDropdownToggle = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    {
      name: 'Accommodations',
      path: '/accommodations',
      dropdown: [
        { name: 'Apartments for Rent', path: '/accommodations?type=apartment&purpose=rent' },
        { name: 'Apartments for Sale', path: '/accommodations?type=apartment&purpose=sale' },
        { name: 'Hotel Rooms', path: '/accommodations?type=hotel_room' },
        { name: 'Event Halls', path: '/accommodations?type=event_hall' }
      ]
    },
    { name: 'Cars', path: '/cars', dropdown: [{ name: 'For Rent', path: '/cars?purpose=rent' }, { name: 'For Sale', path: '/cars?purpose=buy' }] },
    { name: 'Houses', path: '/houses', dropdown: [{ name: 'For Rent', path: '/houses?purpose=rent' }, { name: 'For Sale', path: '/houses?purpose=purchase' }] },
    { name: 'Contact', path: '/contact' },
  ];

  const getDisplayName = () => profile?.first_name ? `${profile.first_name}`.toUpperCase() : profile?.email.split('@')[0].toUpperCase() || 'USER';
  const getProfileImage = () => profile?.profile_image ? `http://localhost:5000${profile.profile_image}` : null;

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  };

  return (
    <header className={`w-full fixed top-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-primary-dark/90 backdrop-blur-md py-2 shadow-2xl' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto flex justify-between items-center px-6 h-16">

        {/* Modern Text Logo */}
        <Link to="/" className="flex flex-col group">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-accent-orange leading-none group-hover:scale-105 transition-transform duration-300">
            RIVERS RWANDA
          </span>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-accent-orange leading-none group-hover:scale-105 transition-transform duration-300">
            ACCOMMODATION
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name} className="relative" ref={activeDropdown === link.name ? dropdownRef : null}>
                <button
                  onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                  onClick={() => link.dropdown ? handleDropdownToggle(link.name) : navigate(link.path!)}
                  className={`relative py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${location.pathname === link.path ? 'text-accent-orange' : 'text-white hover:text-accent-orange'}`}
                >
                  {link.name}
                  {/* Active Indicator */}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-accent-orange transform origin-left transition-transform duration-300 ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </button>

                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      onMouseLeave={() => setActiveDropdown(null)}
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute top-full left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                    >
                      <div className="p-2">
                        {link.dropdown.map(dLink => (
                          <Link
                            key={dLink.name}
                            to={dLink.path}
                            className="flex items-center px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-dark hover:bg-accent-orange hover:text-white rounded-xl transition-all duration-200"
                          >
                            {dLink.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-6">
          {/* User Auth/Profile */}
          <div className="relative" ref={profileRef}>
            {token && profile ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1.5 pr-4 rounded-full transition-all border border-white/10"
                >
                  <img
                    src={getProfileImage() || '/user-placeholder.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-accent-orange object-cover shadow-lg"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-white font-black text-[10px] uppercase tracking-wider leading-none">{getDisplayName()}</p>
                    <p className="text-accent-orange text-[8px] font-black uppercase mt-1">Active Account</p>
                  </div>
                  <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute top-full right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-50 overflow-hidden"
                    >
                      <div className="p-6 bg-primary-dark text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Logged in as</p>
                        <p className="font-black text-sm uppercase truncate">{profile.email}</p>
                      </div>
                      <div className="p-3">
                        <Link to={`/${user.role}/dashboard`} className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-dark hover:bg-gray-50 rounded-xl transition-all">
                          <LayoutDashboard size={16} className="text-accent-orange" /> Dashboard
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-dark hover:bg-gray-50 rounded-xl transition-all">
                          <User size={16} className="text-accent-orange" /> My Profile
                        </Link>
                        <div className="h-px bg-gray-100 my-2 mx-4"></div>
                        <button
                          onClick={() => handleLogout()}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-accent-orange text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-primary-dark transition-all duration-500 shadow-xl shadow-accent-orange/20"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Modern Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden bg-primary-dark/95 backdrop-blur-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-6 h-20 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-accent-orange uppercase">RIVERS RWANDA</span>
                  <span className="text-[8px] font-bold text-accent-orange/60 tracking-[0.3em]">ACCOMMODATION</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 text-white bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-8">
                <ul className="space-y-6">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      {link.dropdown ? (
                        <div className="space-y-4">
                          <button
                            onClick={() => setActiveMobileSubmenu(activeMobileSubmenu === link.name ? null : link.name)}
                            className="w-full flex justify-between items-center text-2xl font-black text-white uppercase tracking-tighter"
                          >
                            {link.name}
                            <ChevronDown size={24} className={`transition-transform duration-300 ${activeMobileSubmenu === link.name ? 'rotate-180 text-accent-orange' : 'text-white/20'}`} />
                          </button>
                          <AnimatePresence>
                            {activeMobileSubmenu === link.name && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1}}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-3 pl-4 border-l border-accent-orange/30"
                              >
                                {link.dropdown.map(dLink => (
                                  <Link
                                    key={dLink.path}
                                    to={dLink.path}
                                    className="block text-sm font-bold text-gray-400 hover:text-white transition-colors py-1"
                                  >
                                    {dLink.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          to={link.path!}
                          className="block text-2xl font-black text-white uppercase tracking-tighter hover:text-accent-orange transition-colors"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="p-8 border-t border-white/5 bg-white/5">
                {!token && (
                  <Link
                    to="/login"
                    className="block w-full text-center bg-accent-orange text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-2xl shadow-accent-orange/20"
                  >
                    Get Started
                  </Link>
                )}
                {token && profile && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={getProfileImage() || '/user-placeholder.png'} className="w-12 h-12 rounded-full border-2 border-accent-orange" />
                      <div>
                        <p className="text-white font-black uppercase text-sm">{getDisplayName()}</p>
                        <p className="text-accent-orange font-bold text-[10px] uppercase">Member</p>
                      </div>
                    </div>
                    <button onClick={() => handleLogout()} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                      <LogOut size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
