import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header/Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/client') || 
                      location.pathname.startsWith('/agent') || 
                      location.pathname.startsWith('/admin') ||
                      location.pathname.startsWith('/seller');

  return (
    <div>
      {!isDashboard && <Header />}
      {children}
    </div>
  );
};

export default Layout;
