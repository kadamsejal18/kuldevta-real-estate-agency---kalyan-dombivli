import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronRight, ChevronLeft, Play, Phone, MessageCircle,
  Sparkles, ArrowRight, Building2, Home as HomeIcon, Key, MapPin,
  Bed, Bath, Maximize, Star, TrendingUp, Filter, Send
} from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import FeaturedSlider from '../components/FeaturedSlider'
import NewProjectCard from '../components/NewProjectCard'
import { propertyAPI, newProjectAPI } from '../services/api'
import { normalizeProperty } from '../utils/propertyMapper'

export default function Home() {
  const [properties, setProperties] = useState([])
  const [advertisements, setAdvertisements] = useState([])
  const [newProjects, setNewProjects] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [allRes, adRes, newProjRes] = await Promise.all([
          propertyAPI.getAll({ limit: 100 }),
          propertyAPI.getAdvertisements(),
          newProjectAPI.getAll({ limit: 6 })
        ])
        setProperties((allRes.properties || []).map(normalizeProperty))
        setAdvertisements((adRes.properties || []).map(normalizeProperty))
        setNewProjects(newProjRes.projects || [])
      } catch (error) {
        console.error('Home load error:', error)
      }
    }

    load()
  }, [])

  const categories = [
    { name: '1BHK', icon: HomeIcon },
    { name: '2BHK', icon: Building2 },
    { name: '3BHK', icon: Key },
  ]

  return (
    < div className="min-h-screen" >
      <HeroSection />
      <AdvertisementSection advertisements={advertisements} />
      <FeaturedSlider properties={properties} />

      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-amber-400/60 text-sm tracking-widest uppercase mb-3"
            >
              Invest in the future
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl sm:text-4xl font-bold"
            >
              New <span className="gradient-text">Projects</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newProjects.length > 0 ? newProjects.map((project, i) => (
              <NewProjectCard key={project._id} project={project} index={i} />
            )) : <p className="text-white/40 col-span-2 text-center py-10">No new projects listed yet.</p>}
          </div>
        </div>
      </section>

      <AIRecommendation properties={properties} />
      <AllProperties properties={properties} />
      <CategoriesSection categories={categories} />
      <SellPropertyForm />
    </div >
  )
}

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const heroImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600',
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[currentSlide]}
            alt="Luxury Property"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold">
              <Star size={14} className="text-amber-400" />
              <span className="text-sm text-amber-200/80">Mumbai&apos;s Premium Property Partner</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="gradient-text-white">Kuldevta</span>
              <br />
              <span className="gradient-text">Estate Agency</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/60 font-light">
              Trusted place to find a home
            </p>
            <p className="text-lg text-white/40">
              Luxury homes, new projects and rentals across Mumbai
            </p>

            {/* Search Bar */}
            <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search size={20} className="text-white/30" />
                <input
                  type="text"
                  placeholder="Search by location, project or type..."
                  className="w-full bg-transparent outline-none text-white placeholder-white/30 py-3"
                />
              </div>
              <div className="flex gap-2">
                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 outline-none appearance-none cursor-pointer">
                  <option value="">Buy / Rent</option>
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                </select>
                <button className="btn-luxury flex items-center gap-2 whitespace-nowrap">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {[
                { num: '500+', label: 'Properties' },
                { num: '200+', label: 'Happy Clients' },
                { num: '50+', label: 'New Projects' },
                { num: '10+', label: 'Years Experience' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold gradient-text">{stat.num}</p>
                  <p className="text-sm text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 gradient-gold' : 'w-4 bg-white/20'
              }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2 text-white/30">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-white/40" />
        <span className="text-xs tracking-widest uppercase rotate-0">Scroll</span>
      </div>
    </section>
  )
}

function AdvertisementSection({ advertisements }) {
  const [current, setCurrent] = useState(0)
  if (!advertisements.length) return null

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % advertisements.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden h-[300px] sm:h-[400px]"
          >
            <img
              src={advertisements[current].images[0]}
              alt={advertisements[current].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 sm:px-16 space-y-4 max-w-lg">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-3xl sm:text-4xl font-bold"
                >
                  {advertisements[current].title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 text-lg"
                >
                  {advertisements[current].description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 pt-2"
                >
                  <a
                    href="https://wa.me/919930388219"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-medium hover:bg-green-500/30 transition-all"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                  <a
                    href="tel:9930388219"
                    className="btn-luxury flex items-center gap-2"
                  >
                    <Phone size={18} />
                    Call Now
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {advertisements.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-8 gradient-gold' : 'w-2 bg-white/20'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}



function AIRecommendation({ properties }) {
  const [budget, setBudget] = useState(50)
  const [bhk, setBhk] = useState('2BHK')
  const [location, setLocation] = useState('')
  const [showResults, setShowResults] = useState(false)

  const getRecommendations = () => {
    setShowResults(true)
  }

  const recommended = properties.filter(p => {
    if (bhk && p.category !== bhk) return false
    return true
  }).slice(0, 3)

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-gold rounded-3xl p-8 sm:p-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center">
              <Sparkles size={22} className="text-black" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">AI Property Finder</h2>
              <p className="text-white/40 text-sm">Tell us your preferences, we'll find your dream home</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm text-white/50">Budget (Lakhs)</label>
              <input
                type="range"
                min="10"
                max="500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full accent-amber-500"
              />
              <p className="text-amber-400 font-semibold">₹{budget} Lakhs</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50">Configuration</label>
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
              >
                {['1RK', '1BHK', '2BHK', '3BHK', 'Villa', 'Bungalow', 'Plot'].map(c => (
                  <option key={c} value={c} className="bg-gray-900">{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50">Preferred Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bandra, Worli"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={getRecommendations}
                className="w-full btn-luxury flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Find Properties
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/10 pt-6"
              >
                <p className="text-sm text-white/40 mb-4">
                  <Sparkles size={14} className="inline text-amber-400" /> AI found {recommended.length} properties matching your criteria
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommended.map((p, i) => (
                    <Link key={p.id} to={`/property/${p.id}`} className="glass rounded-xl p-4 hover:bg-white/10 transition-all group">
                      <div className="flex gap-3">
                        <img src={p.images[0]} alt={p.title} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate group-hover:text-amber-400 transition-colors">{p.title}</h4>
                          <p className="text-xs text-white/40 truncate">{p.location}</p>
                          <p className="text-amber-400 font-semibold text-sm mt-1">{p.price}</p>
                          <p className="text-xs text-white/30">{p.category} | {p.area}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function AllProperties({ properties }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? properties : properties.filter(p => p.type === filter)

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-amber-400/60 text-sm tracking-widest uppercase mb-3">Browse all</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Our <span className="gradient-text">Properties</span>
            </h2>
          </div>
          <div className="flex gap-2">
            {['all', 'buy', 'rent'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f
                  ? 'gradient-gold text-black'
                  : 'glass text-white/60 hover:text-white'
                  }`}
              >
                {f === 'all' ? 'All' : f === 'buy' ? 'Buy' : 'Rent'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 justify-center justify-items-center">
          {filtered.slice(0, 6).map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/properties" className="btn-glass inline-flex items-center gap-2 text-sm">
            View All Properties <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection({ categories }) {
  const buyCategories = [
    { name: '1RK', icon: '🏠', count: 15 },
    { name: '1BHK', icon: '🏡', count: 42 },
    { name: '2BHK', icon: '🏘️', count: 78 },
    { name: '3BHK', icon: '🏰', count: 35 },
    { name: 'Villas', icon: '🏛️', count: 12 },
    { name: 'Bungalows', icon: '🏯', count: 8 },
    { name: 'Plots', icon: '📐', count: 22 },
  ]

  const rentCategories = [
    { name: 'Furnished', icon: '🛋️', count: 56 },
    { name: 'Semi-Furnished', icon: '🪑', count: 89 },
    { name: 'Unfurnished', icon: '📦', count: 45 },
  ]

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-amber-400/60 text-sm tracking-widest uppercase mb-3">Find your niche</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Browse by <span className="gradient-text">Category</span>
          </h2>
        </div>

        {/* Buy Categories */}
        <div className="mb-12">
          <h3 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <Building2 size={20} className="text-amber-400" /> Buy
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {buyCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/properties?category=${cat.name}&type=buy`}
                  className="glass rounded-2xl p-5 text-center card-hover block group"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <p className="font-semibold text-sm group-hover:text-amber-400 transition-colors">{cat.name}</p>
                  <p className="text-xs text-white/30 mt-1">{cat.count} Properties</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rent Categories */}
        <div>
          <h3 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <Key size={20} className="text-amber-400" /> Rent
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rentCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/properties?furnishing=${cat.name}&type=rent`}
                  className="glass rounded-2xl p-6 card-hover flex items-center gap-4 group"
                >
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <p className="font-semibold group-hover:text-amber-400 transition-colors">{cat.name}</p>
                    <p className="text-sm text-white/30">{cat.count} Properties</p>
                  </div>
                  <ArrowRight size={18} className="text-white/20 ml-auto group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SellPropertyForm() {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', propertyType: '', location: '', price: '', description: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-gold rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left - Image */}
            <div className="relative h-64 lg:h-auto">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"
                alt="Sell your property"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0a0a0a]" />
              <div className="absolute inset-0 flex items-center p-8 lg:hidden">
                <div>
                  <h2 className="font-display text-3xl font-bold">Sell Your Property</h2>
                  <p className="text-white/60 mt-2">Get the best value for your property</p>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="p-8 sm:p-12">
              <div className="hidden lg:block mb-8">
                <h2 className="font-display text-3xl font-bold">Sell Your <span className="gradient-text">Property</span></h2>
                <p className="text-white/40 mt-2">Fill in the details and we'll get back to you</p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full gradient-gold mx-auto flex items-center justify-center mb-4">
                    <Send size={24} className="text-black" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Thank You!</h3>
                  <p className="text-white/40">We'll contact you within 24 hours</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/30 transition-colors"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/30 transition-colors"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/30 transition-colors"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 outline-none focus:border-amber-500/30 transition-colors"
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    >
                      <option value="" className="bg-gray-900">Property Type</option>
                      {['1RK', '1BHK', '2BHK', '3BHK', 'Villa', 'Bungalow', 'Plot'].map(t => (
                        <option key={t} value={t} className="bg-gray-900">{t}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Location"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/30 transition-colors"
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Expected Price"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/30 transition-colors"
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <textarea
                    placeholder="Brief description of your property"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/30 transition-colors resize-none"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <button type="submit" className="w-full btn-luxury flex items-center justify-center gap-2">
                    <Send size={16} />
                    Submit Property
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
