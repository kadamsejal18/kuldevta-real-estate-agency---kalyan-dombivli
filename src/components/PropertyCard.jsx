import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Maximize, Eye, Heart, MessageCircle, Phone, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import PropertyGalleryModal from './PropertyGalleryModal'

export default function PropertyCard({ property, index = 0 }) {
  const [liked, setLiked] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  if (!property) return null;

  const propertyId = property.id || property._id || Math.random().toString(36).substring(7)
  const images = Array.isArray(property.images) ? property.images : [property.images].filter(Boolean)
  const defaultImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  const displayImage = images[0] || defaultImage

  const openGallery = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 0) setIsGalleryOpen(true);
  }

  const getWhatsAppLink = () => {
    const message = `Hello Kuldevta Estate Agency! I am interested in this property: ${property.title || 'Untitled'} located in ${property.location || 'Unknown'}. Please provide more details. Link: ${window.location.origin}/property/${propertyId}`;
    return `https://wa.me/919930388219?text=${encodeURIComponent(message)}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative bg-[#141414] rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col h-full w-full max-w-[450px]"
    >
      {/* Featured Ribbon / Top Border */}
      {property.featured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8A97E] to-transparent z-20" />
      )}

      {/* Image Container - Larger 3:2 aspect ratio for high business impact */}
      <div 
        className="relative aspect-[3/2] overflow-hidden cursor-pointer"
        onClick={openGallery}
      >
        <motion.img
          src={displayImage}
          alt={property.title || 'Property'}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/10 opacity-90" />

        {/* Premium Price Badge Overlay */}
        <div className="absolute top-5 left-5 z-10">
          <div className="glass-gold px-5 py-2.5 rounded-xl border border-[#C8A97E]/40 shadow-2xl backdrop-blur-md">
            <p className="text-[#C8A97E] font-black text-xl tracking-tight leading-none">
              {property.price || 'Contact'}
            </p>
          </div>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-5 right-5 z-10">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked) }}
            className="w-12 h-12 rounded-full glass backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all shadow-xl border border-white/10"
          >
            <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-white'} />
          </button>
        </div>

        {/* Status Badges */}
        <div className="absolute bottom-5 left-5 flex gap-2 z-10">
          {property.propertyLabel && (
            <span className="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] bg-[#C8A97E] text-black shadow-2xl">
              {property.propertyLabel}
            </span>
          )}
          <span className="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] glass-dark text-white border border-white/10 backdrop-blur-xl">
            {property.type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1 space-y-5">
        <div>
          <Link to={`/property/${propertyId}`}>
            <h3 className="font-display text-xl font-bold text-white group-hover:text-[#C8A97E] transition-colors line-clamp-1 leading-tight mb-2">
              {property.title || 'Untitled Property'}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-white/50 text-xs mt-3">
            <MapPin size={14} className="text-[#C8A97E]" />
            <span className="tracking-wide">{property.location || 'Location shared on inquiry'}</span>
          </div>
        </div>

        {/* Premium Specs Grid - More Spaced for readability */}
        <div className="grid grid-cols-3 gap-4 py-5 border-y border-white/5">
          <div className="flex flex-col items-center gap-2 border-r border-white/5">
            <Bed size={16} className="text-[#C8A97E]/80" />
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{property.category || 'BHK'}</span>
          </div>
          <div className="flex flex-col items-center gap-2 border-r border-white/5">
            <Maximize size={16} className="text-[#C8A97E]/80" />
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{property.displayArea || property.area || 'Area'}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkles size={16} className="text-[#C8A97E]/80" />
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Premium</span>
          </div>
        </div>

        {/* Conversion-Focused CTA Buttons - LARGER AND BOLDER */}
        <div className="flex gap-3 pt-3">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[1.2] flex items-center justify-center gap-3 py-4 rounded-xl bg-green-500 text-white text-xs font-black hover:bg-green-600 transition-all uppercase tracking-[0.15em] shadow-lg shadow-green-500/20"
          >
            <MessageCircle size={16} />
            WHATSAPP
          </a>
          <a
            href="tel:9930388219"
            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-[#C8A97E] text-black text-xs font-black hover:bg-[#e6c88a] transition-all uppercase tracking-[0.15em] shadow-lg shadow-[#C8A97E]/20"
          >
            <Phone size={16} />
            CALL
          </a>
        </div>
        
        <Link
          to={`/property/${propertyId}`}
          className="w-full flex items-center justify-center py-4 rounded-xl border border-white/10 text-white/60 text-[10px] font-bold tracking-[0.3em] hover:bg-white/5 hover:text-white transition-all uppercase mt-2 mb-1"
        >
          View Full Details
        </Link>
      </div>

      <PropertyGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={images}
        initialIndex={0}
      />
    </motion.div>
  )
}
