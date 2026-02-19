import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!images || images.length === 0) {
    return <div className="aspect-[16/10] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Image</div>;
  }

  return (
    <div>
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group bg-gray-100" onClick={() => openModal(currentIndex)}>
        <AnimatePresence initial={false}>
            <motion.img
                key={currentIndex}
                src={`http://localhost:5000${images[currentIndex]}`}
                alt={`Image ${currentIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
            />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-bold text-lg">View Gallery</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-6 gap-2 mt-2">
        {images.slice(0, 6).map((image, index) => (
          <div 
            key={index} 
            onClick={() => setCurrentIndex(index)} 
            className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === index ? 'border-accent-orange' : 'border-transparent hover:border-gray-400'}`}>
            <img src={`http://localhost:5000${image}`} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div 
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} transition={{ duration: 0.3 }}
                className="relative w-full max-w-4xl h-[80vh] bg-black" onClick={(e) => e.stopPropagation()}
            >
                <img src={`http://localhost:5000${images[currentIndex]}`} className="w-full h-full object-contain"/>
                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/40 transition-all"><ChevronLeft size={32}/></button>
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/40 transition-all"><ChevronRight size={32}/></button>
                <button onClick={closeModal} className="absolute top-2 right-2 bg-white/20 text-white p-2 rounded-full hover:bg-white/40 transition-all"><X size={24}/></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGallery;
