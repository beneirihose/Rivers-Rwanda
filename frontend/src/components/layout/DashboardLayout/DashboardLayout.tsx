import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  Users as UsersIcon, 
  Home, 
  Car, 
  MessageSquare, 
  LogOut, 
  ShieldCheck, 
  Banknote,
  Menu,
  X,
  Globe,
  Package,
  UserCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Footer from '../Footer/Footer'; // Import the main footer

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'client' | 'agent' | 'admin' | 'seller';
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
      <div className="p-6 border-b border-white/10 h-20 flex items-center">
        <h3 className="text-xl font-bold tracking-wider text-accent-orange uppercase">
          {t(`dashboard.sideNav.roles.${role}`)} {t('dashboard.sideNav.panel')}
        </h3>
      </div>
      <nav className="flex-grow p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems[role].map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname.startsWith(item.path) 
                    ? 'bg-accent-orange text-white shadow-lg' 
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link 
          to="/"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <Globe size={20} />
          <span className="font-medium">{t('dashboard.sideNav.backToMain')}</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">{t('dashboard.sideNav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <div className="flex flex-1">
        {/* Static Sidebar for Desktop */}
        <aside className="w-72 bg-primary-dark text-white flex-col shadow-2xl shrink-0 hidden lg:flex">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar & Overlay */}
        <div className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}></div>
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-72 h-full bg-primary-dark text-white shadow-2xl">
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="absolute top-5 right-5 text-gray-300 hover:text-white z-50"
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </div>
        </div>

        <main className="flex-1 flex flex-col max-h-screen w-full">
          <header className="lg:hidden bg-primary-dark shadow-md sticky top-0 z-10 flex items-center justify-between p-4 h-20">
            <Link to="/" className="flex items-center gap-1 group">
              <span className="text-xl font-black text-accent-orange tracking-tighter uppercase">Rivers</span>
              <span className="text-xl font-black text-white tracking-tighter uppercase">Rwanda</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="text-white p-2 rounded-md hover:bg-white/10"
            >
              <Menu size={28} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
