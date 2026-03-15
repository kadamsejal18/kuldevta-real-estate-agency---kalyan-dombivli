import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';

export default function FeaturedSlider({ properties }) {
    const featured = properties.filter((p) => p.featured || p.propertyLabel === 'Featured');
    const scrollRef = useRef(null);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' });
        }
    };

    if (featured.length === 0) return null;

    return (
        <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-amber-400/60 text-sm tracking-widest uppercase mb-3"
                        >
                            Handpicked for you
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-display text-3xl sm:text-4xl font-bold"
                        >
                            Featured <span className="gradient-text">Properties</span>
                        </motion.h2>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        <button
                            onClick={() => scroll(-1)}
                            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll(1)}
                            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Enhanced Slider Container */}
                <div className="relative group">
                    <div
                        ref={scrollRef}
                        className={`flex gap-8 overflow-x-auto hide-scrollbar pb-8 pt-4 px-2 snap-x snap-mandatory ${featured.length < 3 ? 'justify-center' : ''}`}
                        style={{
                            scrollBehavior: 'smooth',
                        }}
                    >
                        {featured.map((property, i) => (
                            <div
                                key={property.id || property._id}
                                className="min-w-[380px] md:min-w-[450px] snap-center shrink-0"
                            >
                                {/* Wrap PropertyCard to ensure styles don't conflict, but allow the card itself to use hover effects */}
                                <div className="h-full">
                                    <PropertyCard property={property} index={i} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
