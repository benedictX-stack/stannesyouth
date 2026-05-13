import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../lib/firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'

gsap.registerPlugin(ScrollTrigger)

const galleryItems = [
  { id: 1, src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80', category: 'Faith', caption: 'Youth Retreat 2024', type: 'image' as const },
  { id: 2, src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80', category: 'Faith', caption: 'Praise Night', type: 'image' as const },
  { id: 3, src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', category: 'Fun', caption: 'Beach Day Out', type: 'image' as const },
  { id: 4, src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', category: 'Community', caption: 'Annual Gala', type: 'image' as const },
  { id: 5, src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80', category: 'Community', caption: 'Community Bonfire', type: 'image' as const },
  { id: 6, src: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=800&q=80', category: 'Faith', caption: 'Sunday Worship', type: 'image' as const },
  { id: 7, src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', category: 'Service', caption: 'Charity Drive', type: 'image' as const },
  { id: 8, src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80', category: 'Fun', caption: 'Game Night', type: 'image' as const },
]

const categories = ['All', 'Faith', 'Community', 'Service', 'Fun']

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState('All')
  const [lightbox, setLightbox] = useState<number | string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [dbItems, setDbItems] = useState<any[]>([])

  useEffect(() => {
    const q = query(collection(db, 'galleryItems'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setDbItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => setDbItems([]))
  }, [])

  const validDbItems = dbItems.filter(item => item.src && item.caption)
  const items = validDbItems.length > 0 ? validDbItems : galleryItems
  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const distance = touchStart - touchEnd
    if (distance > 50) navigate(1) // swipe left
    if (distance < -50) navigate(-1) // swipe right
    setTouchStart(null)
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const cards = section.querySelectorAll('.gallery-card')
    cards.forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 50, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.8, delay: i * 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
      })
    })

    // Mobile scroll animation for images
    let mm = gsap.matchMedia()
    mm.add("(max-width: 767px)", () => {
      const imgs = section.querySelectorAll('.gallery-card img')
      imgs.forEach((img: any) => {
        gsap.to(img, {
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        })
      })
    })
    return () => mm.revert()
  }, [filter])

  const openLightbox = (id: number | string) => setLightbox(id)
  const closeLightbox = () => setLightbox(null)
  const navigate = (dir: number) => {
    if (lightbox === null) return
    const idx = filtered.findIndex((i) => i.id === lightbox)
    const next = (idx + dir + filtered.length) % filtered.length
    setLightbox(filtered[next].id)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightbox === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox])

  const currentItem = lightbox !== null ? filtered.find((i) => i.id === lightbox) : null

  return (
    <section ref={sectionRef} id="gallery" className="relative py-24 lg:py-32 bg-primary">
      <div className="ambient-glow-ocean absolute top-1/3 left-0 -translate-x-1/2 animate-glow-pulse" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Gallery</span>
            <div className="w-8 h-[1px] bg-gold" />
          </div>
          <h2 className="font-heading text-display-sm text-cream">Moments That <span className="italic text-gradient-sunset">Matter</span></h2>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === cat ? 'bg-sunset text-cream shadow-lg shadow-sunset/20' : 'glass-card text-cream/50 hover:text-cream hover:border-white/15'
                }`}>{cat}</button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.length === 0 && <p className="text-cream/35 text-sm italic text-center py-12">No photos in this category yet.</p>}
          {filtered.map((item) => (
            <div key={item.id} className="gallery-card break-inside-avoid group cursor-pointer" onClick={() => openLightbox(item.id)}>
              <div className="relative rounded-2xl overflow-hidden">
                <img src={item.src} alt={item.caption} className="w-full object-cover transition-transform duration-700 md:group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-[600ms] ease-in-out" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-0 md:translate-y-3 opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-[600ms] ease-in-out md:delay-75">
                  <div className="flex flex-col">
                    <p className="text-cream font-heading text-xl leading-tight">{item.caption}</p>
                    <span className="text-gold text-[10px] uppercase tracking-widest font-semibold mt-1">{item.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && currentItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 backdrop-blur-xl" 
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-cream/60 hover:text-cream transition-colors z-10"><X size={28} /></button>
          <button onClick={(e) => { e.stopPropagation(); navigate(-1) }} className="absolute left-2 md:left-6 text-cream/40 hover:text-cream transition-colors z-10"><ChevronLeft size={36} /></button>
          <button onClick={(e) => { e.stopPropagation(); navigate(1) }} className="absolute right-2 md:right-6 text-cream/40 hover:text-cream transition-colors z-10"><ChevronRight size={36} /></button>
          <div className="max-w-5xl max-h-[90vh] px-8 md:px-12 w-full flex flex-col items-center select-none pointer-events-none" onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center w-full"
              >
                <img src={currentItem.src} alt={currentItem.caption} className="max-w-full max-h-[75vh] object-contain rounded-2xl mx-auto shadow-2xl" />
                <p className="text-center text-cream/80 font-heading text-xl mt-6 tracking-wider">{currentItem.caption}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  )
}
