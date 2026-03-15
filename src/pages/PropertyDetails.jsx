import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Maximize, ArrowLeft, Eye } from 'lucide-react'
import { propertyAPI } from '../services/api'
import { normalizeProperty } from '../utils/propertyMapper'

export default function PropertyDetails() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const loadProperty = async () => {
      const response = await propertyAPI.getOne(id)
      setProperty(normalizeProperty(response.property))
      await propertyAPI.incrementViews(id)
    }

    loadProperty().catch((error) => {
      console.error('Failed to load property:', error)
      setProperty(null)
    })
  }, [id])

  if (!property) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Property Not Found</h2>
          <Link to="/properties" className="btn-luxury text-sm">Browse Properties</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/properties" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"><ArrowLeft size={16} /> Back to Properties</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-3 rounded-3xl overflow-hidden h-[400px] lg:h-[600px] ${property.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Main Large Image */}
          <div
            className={`relative cursor-pointer group overflow-hidden ${property.images.length === 1 ? 'col-span-1' : 'lg:col-span-3'}`}
            onClick={() => { setCurrentImage(0); setLightboxOpen(true); }}
          >
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <div className="w-14 h-14 rounded-full glass flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                <Maximize size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Thumbnails Mosaic */}
          {property.images.length > 1 && (
            <div className={`hidden lg:grid gap-3 ${property.images.length === 2 ? 'grid-rows-1' : 'grid-rows-2'}`}>
              {property.images.slice(1, 3).map((img, i) => (
                <div 
                  key={i} 
                  className="relative cursor-pointer group overflow-hidden"
                  onClick={() => { setCurrentImage(i + 1); setLightboxOpen(true); }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  
                  {/* Overlay for more photos */}
                  {i === 1 && property.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                      <span className="text-2xl font-black">+{property.images.length - 3}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold">More Photos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full glass hover:bg-white/20 transition-colors flex items-center justify-center z-50"
          >
            <span className="text-white text-xl font-bold">✕</span>
          </button>

          {property.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentImage((prev) => prev === 0 ? property.images.length - 1 : prev - 1) }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass hover:bg-white/20 transition-colors flex items-center justify-center z-50"
            >
              <span className="text-white text-3xl pb-1" style={{ transform: 'translateX(-2px)' }}>‹</span>
            </button>
          )}

          <div className="w-full max-w-6xl max-h-[85vh] px-20 relative outline-none" tabIndex={0} autoFocus onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setCurrentImage((prev) => (prev + 1) % property.images.length);
            if (e.key === 'ArrowLeft') setCurrentImage((prev) => prev === 0 ? property.images.length - 1 : prev - 1);
          }}>
            <img
              src={property.images[currentImage]}
              alt={`${property.title} - ${currentImage + 1}`}
              className="max-w-full max-h-[85vh] object-contain mx-auto drop-shadow-2xl"
            />
          </div>

          {property.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentImage((prev) => (prev + 1) % property.images.length) }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass hover:bg-white/20 transition-colors flex items-center justify-center z-50"
            >
              <span className="text-white text-3xl pb-1" style={{ transform: 'translateX(2px)' }}>›</span>
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 font-medium tracking-widest text-sm">
            {currentImage + 1} / {property.images.length}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">{property.title}</h1>
              <div className="flex items-center gap-2 text-white/40 mt-2"><MapPin size={16} /><span>{property.location}</span></div>
              <p className="text-3xl font-bold gradient-text mt-4">{property.price}</p>
            </div>
            <div className="glass rounded-2xl p-6"><h3 className="font-display text-xl font-semibold mb-4">Overview</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm"><div className="flex items-center gap-2"><Bed size={16} /> {property.bedrooms || 0} Beds</div><div className="flex items-center gap-2"><Bath size={16} /> {property.bathrooms || 0} Baths</div><div className="flex items-center gap-2"><Maximize size={16} /> {property.displayArea}</div><div className="flex items-center gap-2"><Eye size={16} /> {property.views || 0} Views</div></div></div>
            <div className="glass rounded-2xl p-6"><h3 className="font-display text-xl font-semibold mb-4">Description</h3><p className="text-white/70 leading-relaxed">{property.description}</p></div>
          </div>
          <div className="glass rounded-2xl p-6 h-fit"><h3 className="font-display text-xl font-semibold mb-4">Contact Agent</h3><p className="text-white/70 mb-1">{property.agent}</p><p className="text-white/40 text-sm">{property.contact?.phone || 'N/A'}</p></div>
        </div>
      </div>
    </div>
  )
}
