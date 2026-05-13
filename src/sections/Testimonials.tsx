import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { db } from '../lib/firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'

gsap.registerPlugin(ScrollTrigger)

const publicTestimonials = [
  { quote: "Being part of this community has completely transformed my faith journey. I found my second family here.", author: "Sarah D.", role: "Youth Member" },
  { quote: "The retreats and weekly worship sessions are incredibly uplifting. It's exactly what I was looking for.", author: "Michael R.", role: "Choir Team" },
  { quote: "Volunteering with the service team has been so rewarding. We're truly making a difference together.", author: "Emily T.", role: "Service Coordinator" },
  { quote: "I came for the events, but I stayed for the people. An amazingly welcoming and vibrant youth group!", author: "David K.", role: "Youth Member" },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([])

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setDbTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => setDbTestimonials([]))
  }, [])

  const validDbTestimonials = dbTestimonials.filter(t => t.quote && t.author)
  const testimonials = validDbTestimonials.length > 0 ? validDbTestimonials : publicTestimonials

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const els = section.querySelectorAll('.testimonial-card')
    els.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 95%', toggleActions: 'play none none none' },
      })
    })
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-primary-200 relative z-10 border-t border-white/5">
      <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Community Voices</span>
            <div className="w-8 h-[1px] bg-gold" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-cream">
            What They <span className="italic text-gradient-sunset">Say</span>
          </h2>
        </div>
        
        {/* Horizontal grid, 4 columns on large screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {testimonials.map((t, i) => (
            <div key={t.id ?? `${t.author}-${i}`} className="testimonial-card glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 relative border border-white/5 hover:border-white/15 transition-all duration-500 flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sunset/5 blur-[40px] rounded-full group-hover:bg-sunset/10 transition-colors duration-500" />
              
              <p className="text-cream/80 text-[11px] md:text-lg italic font-quote leading-relaxed mb-6 md:mb-8 mt-1 relative z-10">"{t.quote}"</p>
              <div className="relative z-10">
                <h4 className="text-cream font-heading text-sm md:text-lg font-semibold tracking-wide mb-1">{t.author}</h4>
                <span className="text-gold text-[8px] md:text-[10px] uppercase tracking-widest">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
