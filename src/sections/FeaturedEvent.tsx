import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const EVENT_DATE = new Date('2025-06-15T18:00:00')

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass-light rounded-2xl w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2">
        <span className="font-numbers text-4xl sm:text-5xl font-bold text-cream tracking-tighter">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-cream/40 text-[10px] font-body uppercase tracking-[0.15em]">{label}</span>
    </div>
  )
}

export default function FeaturedEvent() {
  const sectionRef = useRef<HTMLElement>(null)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(EVENT_DATE))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(EVENT_DATE)), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const els = section.querySelectorAll('.event-reveal')
    els.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 1, delay: i * 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    })
    const bgEl = section.querySelector('.event-bg')
    if (bgEl) {
      gsap.to(bgEl, { yPercent: -15, scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.5 } })
    }
  }, [])

  return (
    <section ref={sectionRef} id="events" className="relative py-24 lg:py-32 overflow-hidden bg-primary">
      <div className="ambient-glow-sunset absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 animate-glow-pulse" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center mb-16 event-reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles size={16} className="text-sunset" />
            <span className="text-sunset text-xs font-body font-semibold tracking-[0.3em] uppercase">Featured Event</span>
            <Sparkles size={16} className="text-sunset" />
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden glass border border-white/5 event-reveal">
          <div className="absolute inset-0 overflow-hidden">
            <div className="event-bg absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80')` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-16">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunset/10 border border-sunset/20 w-fit mb-6 event-reveal">
                <span className="text-sunset text-xs font-semibold tracking-wider uppercase">Upcoming</span>
              </div>
              <h2 className="font-heading text-display-sm text-cream mb-4 event-reveal">
                Hawa Hawaii<span className="block text-gradient-sunset italic">Karaoke Night</span>
              </h2>
              <p className="text-cream/50 text-base leading-relaxed mb-8 max-w-md event-reveal">
                Get ready for an unforgettable tropical evening of music, laughter, and community!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 event-reveal">
                <div className="flex items-center gap-2 text-cream/50"><Calendar size={16} className="text-gold" /><span className="text-sm">June 15, 2025</span></div>
                <div className="flex items-center gap-2 text-cream/50"><Clock size={16} className="text-gold" /><span className="text-sm">6:00 PM</span></div>
                <div className="flex items-center gap-2 text-cream/50"><MapPin size={16} className="text-gold" /><span className="text-sm">Parish Hall</span></div>
              </div>
              <div className="event-reveal"><a href="#feedback" className="btn-premium btn-primary inline-flex">Register Now</a></div>
            </div>
            <div className="flex flex-col items-center justify-center event-reveal">
              <p className="text-cream/40 text-xs font-body uppercase tracking-[0.25em] mb-6">Event starts in</p>
              <div className="flex gap-3 sm:gap-5">
                <CountdownUnit value={timeLeft.days} label="Days" />
                <CountdownUnit value={timeLeft.hours} label="Hours" />
                <CountdownUnit value={timeLeft.minutes} label="Min" />
                <CountdownUnit value={timeLeft.seconds} label="Sec" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
