import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  Users as UsersIcon, 
  LogOut, 
  ShieldCheck, 
  Banknote,
  Menu,
  X,
  Globe,
  Package,
  UserCheck,
  ChevronDown,
  Bell,
  Settings,
  MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../Footer/Footer';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'client' | 'agent' | 'admin' | 'seller';
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'rw', name: 'RWANDA', flag: 'https://flagcdn.com/w40/rw.png' },
    { code: 'en', name: 'ENGLISH', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'fr', name: 'FRANÇAIS', flag: 'https://flagcdn.com/w40/fr.png' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[1];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  const menuItems = {
    client: [
      { label: t('dashboard.sideNav.overview'), path: '/client/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: t('dashboard.sideNav.myBookings'), path: '/client/bookings', icon: <BookOpen size={20} /> },
      { label: t('dashboard.sideNav.profile'), path: '/client/profile', icon: <User size={20} /> },
    ],
    agent: [
      { label: t('dashboard.sideNav.overview'), path: '/agent/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: t('dashboard.sideNav.myClients'), path: '/agent/clients', icon: <UsersIcon size={20} /> },
      { label: t('dashboard.sideNav.earnings'), path: '/agent/earnings', icon: <Banknote size={20} /> },
      { label: t('dashboard.sideNav.profile'), path: '/agent/profile', icon: <User size={20} /> },
    ],
    seller: [
      { label: t('dashboard.sideNav.overview'), path: '/seller/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: t('dashboard.sideNav.myProducts'), path: '/seller/products', icon: <Package size={20} /> },
      { label: t('dashboard.sideNav.earnings'), path: '/seller/earnings', icon: <Banknote size={20} /> },
      { label: t('dashboard.sideNav.profile'), path: '/seller/profile', icon: <User size={20} /> },
    ],
    admin: [
      { label: t('dashboard.sideNav.overview'), path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: t('dashboard.sideNav.users'), path: '/admin/users', icon: <UsersIcon size={20} /> },
      { label: t('dashboard.sideNav.agents'), path: '/admin/agents', icon: <UserCheck size={20} /> },
      { label: t('dashboard.sideNav.sellers'), path: '/admin/sellers', icon: <ShieldCheck size={20} /> },
      { label: t('dashboard.sideNav.products'), path: '/admin/products', icon: <Package size={20} /> },
      { label: t('dashboard.sideNav.commissions'), path: '/admin/commissions', icon: <Banknote size={20} /> },
      { label: t('dashboard.sideNav.bookings'), path: '/admin/bookings', icon: <BookOpen size={20} /> },
      { label: t('dashboard.sideNav.inquiries'), path: '/admin/inquiries', icon: <MessageSquare size={20} /> },
      { label: t('dashboard.sideNav.profile'), path: '/admin/profile', icon: <User size={20} /> },
    ],
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10 h-24 flex items-center">
        <h3 className="text-xl font-black tracking-tighter text-accent-orange uppercase leading-tight">
          {t(`dashboard.sideNav.roles.${role}`)}<br/>{t('dashboard.sideNav.panel')}
        </h3>
      </div>
      <nav className="flex-grow p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems[role].map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold uppercase text-[10px] tracking-widest ${
                  location.pathname.startsWith(item.path) 
                    ? 'bg-accent-orange text-white shadow-xl shadow-accent-orange/20' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link 
          to="/"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 hover:text-white transition-all"
        >
          <Globe size={20} />
          <span>{t('dashboard.sideNav.backToMain')}</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span>{t('dashboard.sideNav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <div className="flex flex-1">
        {/* Static Sidebar for Desktop */}
        <aside className="w-72 bg-primary-dark text-white flex-col shadow-2xl shrink-0 hidden lg:flex fixed h-screen z-20">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar & Overlay */}
        <div className={`fixed inset-0 z-[60] lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex flex-col w-72 h-full bg-primary-dark text-white shadow-2xl">
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="absolute top-5 right-5 text-gray-300 hover:text-white z-[70]"
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </div>
        </div>

        <main className="flex-1 flex flex-col min-h-screen lg:ml-72 w-full">
          {/* Top Navbar */}
          <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 h-20 border-b border-gray-100">
            <div className="lg:hidden flex items-center gap-4">
               <button onClick={() => setSidebarOpen(true)} className="text-primary-dark p-2 rounded-xl bg-gray-100">
                <Menu size={24} />
              </button>
              <Link to="/" className="flex flex-col leading-none">
                <span className="text-sm font-black text-accent-orange uppercase">Rivers</span>
                <span className="text-[10px] font-bold text-primary-dark uppercase">Rwanda</span>
              </Link>
            </div>

            <div className="hidden lg:block">
               {/* Search or Breadcrumbs can go here */}
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-3 text-gray-400 hover:text-accent-orange hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Language Switcher */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-100 transition-all group"
                >
                  <img src={currentLang.flag} alt={currentLang.name} className="w-5 h-auto rounded-sm shadow-sm" />
                  <span className="text-[10px] font-black text-primary-dark uppercase tracking-widest hidden sm:inline-block">{currentLang.name}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-2"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${i18n.language === lang.code ? 'bg-accent-orange text-white' : 'text-primary-dark hover:bg-gray-50'}`}
                        >
                          <img src={lang.flag} alt={lang.name} className="w-6 h-auto shadow-sm" />
                          <span className="text-[11px] font-black uppercase tracking-widest">{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/settings" className="p-3 text-gray-400 hover:text-accent-orange hover:bg-gray-50 rounded-xl transition-all">
                <Settings size={20} />
              </Link>
            </div>
          </header>

          <div className="flex-1 p-6 md:p-10 no-print">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
