import { motion } from 'framer-motion';
import { MapPin, MessageCircle, Phone } from 'lucide-react';

export default function NewProjectCard({ project, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ y: -8 }}
            className="group relative rounded-2xl overflow-hidden bg-[#111] border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.2)]"
        >
            {/* Animated Gradient Border Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex flex-col sm:flex-row relative z-10">
                <div className="sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0 relative">
                    <img
                        src={project.images?.[0]?.url || (typeof project.images?.[0] === 'string' ? project.images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800')}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 sm:bg-gradient-to-r sm:from-transparent sm:to-[#111] to-transparent pointer-events-none" />
                </div>

                <div className="p-5 flex-1 space-y-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold shadow-lg backdrop-blur-md ${project.status === 'Ready to Move'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : project.status === 'Newly Launched'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                        >
                            {project.status || 'Under Construction'}
                        </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold group-hover:text-amber-400 transition-colors">
                        {project.title}
                    </h3>

                    <p className="text-white/40 text-sm">{project.category}</p>

                    <div className="flex items-center gap-1.5 text-white/40 text-sm">
                        <MapPin size={14} className="text-amber-500/70" /> {project.location}
                    </div>

                    <div className="flex items-end justify-between pt-2">
                        <div>
                            <p className="text-xs text-white/40 mb-1">Starting from</p>
                            <p className="text-xl font-bold gradient-text">{project.price}</p>
                        </div>
                        <p className="text-white/30 text-xs px-2 py-1 bg-white/5 rounded-md">
                            {project.type === 'rent' ? 'For Rent' : 'For Sale'}
                        </p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-white/5 mt-2">
                        <a
                            href="https://wa.me/919930388219"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all"
                        >
                            <MessageCircle size={14} /> WhatsApp
                        </a>
                        <a
                            href="tel:9930388219"
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl glass-gold text-amber-400 text-xs font-semibold hover:bg-amber-500/15 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
                        >
                            <Phone size={14} /> Call Now
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
