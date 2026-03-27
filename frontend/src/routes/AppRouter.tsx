import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';

// Public Pages
import Home from '../pages/Home/Home';
import About from '../pages/About/About';
import AccommodationsList from '../pages/Accommodations/AccommodationsList';
import AccommodationDetailPage from '../pages/Accommodations/AccommodationDetailPage';
import CarsList from '../pages/Cars/CarsList';
import CarDetailPage from '../pages/Cars/CarDetailPage';
import HousesList from '../pages/Houses/HousesList';
import HouseDetailPage from '../pages/Houses/HouseDetailPage';
import Contact from '../pages/Contact/Contact';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import VerifyEmail from '../pages/Auth/VerifyEmail';
import VerifyOtp from '../pages/Auth/VerifyOtp';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import BookingDetails from '../pages/BookingDetails';
import PaymentConfirmation from '../pages/Payment/PaymentConfirmation';

// Dashboard Pages
import ClientDashboard from '../pages/ClientDashboard/ClientDashboard';
import AgentDashboard from '../pages/AgentDashboard/AgentDashboard';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import SellerDashboard from '../pages/Seller/SellerDashboard';

// Admin Management
import UserManagement from '../pages/AdminDashboard/UserManagement';
import AccommodationManagement from '../pages/AdminDashboard/AccommodationManagement';
import VehicleManagement from '../pages/AdminDashboard/VehicleManagement';
import HouseManagement from '../pages/AdminDashboard/HouseManagement';
import BookingManagement from '../pages/AdminDashboard/BookingManagement';
import AgentManagement from '../pages/AdminDashboard/AgentManagement';
import InquiryManagement from '../pages/AdminDashboard/InquiryManagement';
import SellerManagement from '../pages/AdminDashboard/SellerManagement';
import AdminProductManagement from '../pages/AdminDashboard/ProductManagement';
import CommissionManagement from '../pages/AdminDashboard/CommissionManagement';


// Agent Pages
import AgentClients from '../pages/AgentDashboard/AgentClients';
import AgentEarnings from '../pages/AgentDashboard/AgentEarnings';

// Client Pages
import ClientBookings from '../pages/ClientDashboard/ClientBookings';

// Seller Pages
import ProductManagement from '../pages/Seller/ProductManagement';
import AddProduct from '../pages/Seller/AddProduct';
import AddHouseForm from '../pages/Seller/AddHouseForm';
import AddAccommodationForm from '../pages/Seller/AddAccommodationForm';
import AddVehicleForm from '../pages/Seller/AddVehicleForm';
import SellerEarnings from '../pages/Seller/SellerEarnings';
import SellerBookings from '../pages/Seller/SellerBookings';

// Common Dashboard Pages
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';

import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/client') || 
                      location.pathname.startsWith('/agent') || 
                      location.pathname.startsWith('/admin') ||
                      location.pathname.startsWith('/seller');
                      
  return (
    <div className={`app-container ${isDashboard ? 'dashboard-view' : ''}`}>
      {!isDashboard && <Header />}
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/accommodations" element={<AccommodationsList />} />
          <Route path="/accommodations/:id" element={<AccommodationDetailPage />} />
          <Route path="/cars" element={<CarsList />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          <Route path="/houses" element={<HousesList />} />
          <Route path="/houses/:id" element={<HouseDetailPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/booking-details" element={<BookingDetails />} />
          <Route path="/payment/confirm" element={<PaymentConfirmation />} />
          
          {/* Shared Protected Routes */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['client', 'agent', 'seller', 'admin']}>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Client Routes */}
          <Route path="/client/*" element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardLayout role="client">
                <Routes>
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="bookings" element={<ClientBookings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Agent Routes */}
          <Route path="/agent/*" element={
            <ProtectedRoute allowedRoles={['agent']}>
              <DashboardLayout role="agent">
                <Routes>
                  <Route path="dashboard" element={<AgentDashboard />} />
                  <Route path="clients" element={<AgentClients />} />
                  <Route path="earnings" element={<AgentEarnings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="sellers" element={<SellerManagement />} />
                  <Route path="products" element={<AdminProductManagement />} />
                  <Route path="commissions" element={<CommissionManagement />} />
                  <Route path="accommodations" element={<AccommodationManagement />} />
                  <Route path="vehicles" element={<VehicleManagement />} />
                  <Route path="houses" element={<HouseManagement />} />
                  <Route path="bookings" element={<BookingManagement />} />
                  <Route path="agents" element={<AgentManagement />} />
                  <Route path="inquiries" element={<InquiryManagement />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Seller Routes */}
          <Route path="/seller/*" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout role="seller">
                <Routes>
                  <Route path="dashboard" element={<SellerDashboard />} />
                  <Route path="bookings" element={<SellerBookings />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="products/new" element={<AddProduct />} />
                  <Route path="products/new/house" element={<AddHouseForm />} />
                  <Route path="products/new/accommodation" element={<AddAccommodationForm />} />
                  <Route path="products/new/vehicle" element={<AddVehicleForm />} />
                  <Route path="earnings" element={<SellerEarnings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}

const AppRouter = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default AppRouter;
