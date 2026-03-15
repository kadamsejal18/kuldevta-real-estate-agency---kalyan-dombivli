import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PropertyGalleryModal({ isOpen, onClose, images, initialIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, images.length]);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B0B]/98 backdrop-blur-xl transition-all"
                    onClick={onClose}
                >
                    {/* Top Controls */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110]">
                        <div className="glass px-4 py-2 rounded-full border border-white/5">
                            <span className="text-white/70 text-sm font-bold tracking-widest uppercase">
                                {currentIndex + 1} <span className="text-white/30">/</span> {images.length}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-full glass hover:bg-white/10 transition-all flex items-center justify-center border border-white/10 group"
                        >
                            <X size={20} className="text-white/70 group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div
                        className="relative w-full h-full flex items-center justify-center px-4 md:px-20 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center z-50 border border-white/5 group"
                                >
                                    <ChevronLeft size={32} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center z-50 border border-white/5 group"
                                >
                                    <ChevronRight size={32} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </>
                        )}

                        {/* Image Wrapper */}
                        <div className="relative w-full max-w-6xl h-full flex items-center justify-center pointer-events-none">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentIndex}
                                    src={images[currentIndex]}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                    className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] pointer-events-auto"
                                    alt={`Property image ${currentIndex + 1}`}
                                />
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Thumbnail Navigation (Airbnb Style) */}
                    {images.length > 1 && (
                        <div
                            className="absolute bottom-10 left-0 right-0 flex justify-center px-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex gap-3 p-3 rounded-[2rem] glass border border-white/5 max-w-[90vw] overflow-x-auto hide-scrollbar scroll-smooth">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`relative w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${
                                            idx === currentIndex 
                                            ? 'ring-2 ring-[#C8A97E] scale-110 opacity-100 shadow-2xl' 
                                            : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'
                                        }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
