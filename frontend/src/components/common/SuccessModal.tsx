import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  reference: string;
}

const SuccessModal = ({ isOpen, onClose, title, message, reference }: SuccessModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-white rounded-3xl p-8 md:p-12 text-center max-w-lg w-full shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>

            <div className="inline-flex p-3 bg-green-100 rounded-full mb-6">
                <CheckCircle2 size={48} className="text-green-500" />
            </div>

            <h2 className="text-3xl font-black text-primary-dark uppercase tracking-tighter mb-4">{title}</h2>
            <p className="text-text-light font-medium mb-6">{message}</p>
            
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 mb-8">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Reference</p>
                <p className="text-2xl font-mono font-black text-primary-dark tracking-tighter mt-1">{reference}</p>
            </div>

            <p className="text-sm text-gray-500 mb-8">We've sent a confirmation to your email. Please check your inbox and spam folder.</p>

            <button 
              onClick={onClose} 
              className="w-full bg-accent-orange text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
