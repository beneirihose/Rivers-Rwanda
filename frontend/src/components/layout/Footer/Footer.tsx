import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold tracking-tighter">
              <span className="text-accent-orange uppercase">Rivers</span>
              <span className="uppercase"> Rwanda</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop platform for premium property rentals, hotel bookings, and vehicle services in Rwanda. We connect you with the best experiences Kigali has to offer.
            </p>
            <div className="flex gap-4 text-accent-orange">
              <Facebook size={18} className="cursor-pointer hover:text-white transition-colors" />
              <Twitter size={18} className="cursor-pointer hover:text-white transition-colors" />
              <a href="https://www.instagram.com/reel/DVAxu4fE4Fv/?igsh=MTdxbDBsbXMzaG1lNw==" target="_blank" rel="noopener noreferrer">
                <Instagram size={18} className="cursor-pointer hover:text-white transition-colors" />
              </a>
              <a href="https://www.linkedin.com/in/rivers-rwanda-8763363b5" target="_blank" rel="noopener noreferrer">
                <Linkedin size={18} className="cursor-pointer hover:text-white transition-colors" />
              </a>
              <a href="https://www.youtube.com/@riversrwanda" target="_blank" rel="noopener noreferrer">
                <Youtube size={18} className="cursor-pointer hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b-2 border-accent-orange inline-block pb-1">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-accent-orange transition-colors text-sm uppercase font-medium">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-accent-orange transition-colors text-sm uppercase font-medium">About Us</Link></li>
              <li><Link to="/accommodations" className="text-gray-400 hover:text-accent-orange transition-colors text-sm uppercase font-medium">Accommodations</Link></li>
              <li><Link to="/cars" className="text-gray-400 hover:text-accent-orange transition-colors text-sm uppercase font-medium">Cars & Vehicles</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-accent-orange transition-colors text-sm uppercase font-medium">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b-2 border-accent-orange inline-block pb-1">Our Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-400 text-sm">Apartment Rentals</li>
              <li className="text-gray-400 text-sm">Hotel Reservations</li>
              <li className="text-gray-400 text-sm">Event Hall Booking</li>
              <li className="text-gray-400 text-sm">Car Rentals</li>
              <li className="text-gray-400 text-sm">Vehicle Sales</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b-2 border-accent-orange inline-block pb-1">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-accent-orange shrink-0 mt-1" />
                <p className="text-gray-400 text-sm">Kigali Heights, 4th Floor, KG 7 Ave, Kigali, Rwanda</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-accent-orange shrink-0" />
                <p className="text-gray-400 text-sm">+250 792659094</p>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-accent-orange shrink-0" />
                <a href="https://wa.me/250792659094" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-orange transition-colors text-sm">
                  WhatsApp: 0792659094
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-accent-orange shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm font-medium">info@riversrwanda.com</p>
                  <p className="text-gray-400 text-sm font-medium">booking@riversrwanda.com</p>
                  <p className="text-gray-400 text-xs text-gray-500">technicalsupport@riversrwanda.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} <span className="text-accent-orange font-bold uppercase">Rivers Rwanda</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500 uppercase font-bold">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
