import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, Clock, MapPin, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

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

function getEventDate(event: any) {
  const date = new Date(`${event.date}${event.time ? ` ${event.time}` : ''}`)
  return Number.isNaN(date.getTime()) ? EVENT_DATE : date
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass-card rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
        <span className="font-numbers text-3xl sm:text-4xl font-bold text-cream tracking-tighter">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-cream/40 text-[10px] font-body uppercase tracking-[0.15em]">{label}</span>
    </div>
  )
}

const upcomingEvents = [
  {
    title: 'Hawa Hawaii Karaoke Night',
    date: 'June 15, 2025',
    time: '6:00 PM',
    venue: 'Parish Hall',
    description: 'Get ready for an unforgettable tropical evening of music, laughter, and community!',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    featured: true,
  },
  {
    title: 'Youth Sunday Service',
    date: 'June 22, 2025',
    time: '9:30 AM',
    venue: 'Main Church',
    description: 'A special youth-led worship service with praise, prayer, and reflection.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    featured: false,
  },
]

const previousEvents = [
  {
    title: 'Easter Celebration',
    date: 'April 20, 2025',
    venue: 'Parish Hall',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
    description: 'A joyful Easter gathering with games, food, and fellowship.',
  },
  {
    title: 'Lenten Retreat',
    date: 'March 15, 2025',
    venue: 'Retreat Center',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
    description: 'A weekend of spiritual renewal, worship, and bonding.',
  },
  {
    title: 'Christmas Concert',
    date: 'December 23, 2024',
    venue: 'Main Church',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    description: 'An evening of carols, performances, and holiday cheer.',
  },
  {
    title: 'Youth Sports Day',
    date: 'November 10, 2024',
    venue: 'Community Ground',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    description: 'A day of friendly competition, teamwork, and outdoor fun.',
  },
  {
    title: 'Worship Night',
    date: 'October 5, 2024',
    venue: 'Parish Hall',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    description: 'An intimate evening of acoustic worship and heartfelt prayers.',
  },
  {
    title: 'Community Outreach',
    date: 'September 12, 2024',
    venue: 'Local Shelter',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    description: 'Serving those in need and spreading love across our community.',
  },
  {
    title: 'Summer Bonfire',
    date: 'August 28, 2024',
    venue: 'Beach Side',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    description: 'A relaxing evening under the stars with marshmallows and stories.',
  },
  {
    title: 'Bible Study Series',
    date: 'July 14, 2024',
    venue: 'Youth Room',
    image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800&q=80',
    description: 'Diving deep into scripture and growing together in faith.',
  },
  {
    title: 'Pentecost Rally',
    date: 'June 2, 2024',
    venue: 'Parish Grounds',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    description: 'A vibrant outdoor gathering celebrating the spirit of community.',
  },
  {
    title: 'Youth Choir Workshop',
    date: 'May 18, 2024',
    venue: 'Main Church',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80',
    description: 'Learning new harmonies and building confidence in singing.',
  },
  {
    title: 'Movie Night',
    date: 'April 26, 2024',
    venue: 'Parish Hall',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    description: 'Popcorn, friends, and an inspiring movie on the big screen.',
  },
  {
    title: 'Spring Clean Drive',
    date: 'March 10, 2024',
    venue: 'Neighborhood',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    description: 'Giving back to our surroundings by cleaning up the local parks.',
  },
]

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null)
  const [dbEvents, setDbEvents] = useState<any[]>([])

  useEffect(() => {
    const q = query(collection(db, 'mainEvents'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setDbEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => setDbEvents([]))
  }, [])

  const validDbEvents = dbEvents.filter(e => e.title && e.date && e.image)
  const finalUpcoming = validDbEvents.filter(e => e.type === 'upcoming').length > 0 ? validDbEvents.filter(e => e.type === 'upcoming') : upcomingEvents
  const finalPrevious = validDbEvents.filter(e => e.type === 'previous').length > 0 ? validDbEvents.filter(e => e.type === 'previous') : previousEvents
  const featuredEvent = finalUpcoming.find(e => e.featured) ?? finalUpcoming[0]
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(getEventDate(featuredEvent)))

  const [visibleCount, setVisibleCount] = useState(4)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(getEventDate(featuredEvent))), 1000)
    return () => clearInterval(timer)
  }, [featuredEvent])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const els = section.querySelectorAll('.event-reveal')
    els.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.9, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      })
    })

    // Mobile scroll animation for images
    let mm = gsap.matchMedia()
    mm.add("(max-width: 767px)", () => {
      const imgs = section.querySelectorAll('.event-parallax-img')
      imgs.forEach((img: any) => {
        gsap.to(img, {
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest('.group') || img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        })
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} id="events" className="relative py-24 lg:py-32 overflow-hidden bg-primary">
      <div className="ambient-glow-sunset absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 animate-glow-pulse" />
      <div className="ambient-glow-ocean absolute bottom-1/4 left-0 -translate-x-1/3 animate-glow-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 event-reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Events</span>
            <div className="w-8 h-[1px] bg-gold" />
          </div>
          <h2 className="font-heading text-display-sm text-cream">Life Happens <span className="italic text-gradient-sunset inline-block" style={{ paddingBottom: '0.15em', paddingRight: '0.15em' }}>Here</span></h2>
        </div>

        {/* ══════════════════════════════════════════
            UPCOMING EVENTS
            ══════════════════════════════════════════ */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-10 event-reveal">
            <div className="w-8 h-[1px] bg-gold" />
            <h3 className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Upcoming Events</h3>
          </div>

          {/* Featured upcoming event */}
          {finalUpcoming.filter(e => e.featured).map((event) => (
            <div key={event.id ?? `${event.title}-${event.date}`} className="relative rounded-3xl overflow-hidden glass border border-white/5 mb-8 event-reveal group cursor-pointer hover:border-white/15 transition-all duration-500">
              <div className="absolute inset-0 overflow-hidden bg-black">
                <div className="event-parallax-img absolute inset-0 bg-cover bg-bottom transition-transform duration-700 md:group-hover:scale-110" style={{ backgroundImage: `url('${event.image}')` }} />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-14">
                <div className="flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card w-fit mb-6">
                    <span className="text-gold text-xs font-semibold tracking-wider uppercase">Featured</span>
                  </div>
                  <h3 className="font-heading text-display-sm text-cream mb-4">
                    {event.title.split(' ').slice(0, 2).join(' ')}
                    <span className="block text-gradient-sunset italic" style={{ paddingBottom: '0.15em', paddingRight: '0.15em' }}>{event.title.split(' ').slice(2).join(' ')}</span>
                  </h3>
                  <p className="text-cream/50 text-base leading-relaxed mb-8 max-w-md">{event.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8">
                    <div className="flex items-center gap-2 text-cream/50"><Calendar size={16} className="text-gold" /><span className="text-sm">{event.date}</span></div>
                    <div className="flex items-center gap-2 text-cream/50"><Clock size={16} className="text-gold" /><span className="text-sm">{event.time}</span></div>
                    <div className="flex items-center gap-2 text-cream/50"><MapPin size={16} className="text-gold" /><span className="text-sm">{event.venue}</span></div>
                  </div>
                  <div><a href="#feedback" className="btn-premium btn-primary inline-flex">Register Now</a></div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-cream/40 text-xs font-body uppercase tracking-[0.25em] mb-6">Event starts in</p>
                  <div className="flex gap-3 sm:gap-4">
                    <CountdownUnit value={timeLeft.days} label="Days" />
                    <CountdownUnit value={timeLeft.hours} label="Hours" />
                    <CountdownUnit value={timeLeft.minutes} label="Min" />
                    <CountdownUnit value={timeLeft.seconds} label="Sec" />
                  </div>

                </div>
              </div>
            </div>
          ))}

          {/* Other upcoming events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {finalUpcoming.filter(e => !e.featured).map((event) => (
              <div key={event.id ?? `${event.title}-${event.date}`} className="event-reveal group">
                <div className="glass-card rounded-2xl overflow-hidden hover:border-white/15 transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-sunset/5">
                  <div className="relative h-48 overflow-hidden bg-black">
                    <img src={event.image} alt={event.title} className="event-parallax-img block w-full h-full object-cover transition-transform duration-700 scale-105 md:group-hover:scale-110" />
                    <div className="absolute bottom-3 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full glass-card">
                      <span className="text-cream text-[10px] font-semibold uppercase tracking-wider">Upcoming</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-heading text-lg text-cream mb-2">{event.title}</h4>
                    <p className="text-cream/40 text-sm mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-cream/40 text-xs">
                      <div className="flex items-center gap-1"><Calendar size={12} className="text-gold" />{event.date}</div>
                      <div className="flex items-center gap-1"><MapPin size={12} className="text-gold" />{event.venue}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            PREVIOUS EVENTS
            ══════════════════════════════════════════ */}
        <div id="previous-events">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-[1px] bg-gold" />
            <h3 className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Previous Events</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {finalPrevious.slice(0, visibleCount).map((event, i) => (
                <motion.div
                  key={event.id ?? `${event.title}-${event.date}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={{ 
                    duration: 0.4, 
                    delay: (i % 4) * 0.05,
                    layout: { duration: 0.4 }
                  }}
                  className="group"
                >
                  <div className="glass-card rounded-2xl overflow-hidden hover:border-white/12 transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1">
                    <div className="relative h-40 overflow-hidden bg-black">
                      <img src={event.image} alt={event.title} className="event-parallax-img block w-full h-full object-cover transition-transform duration-700 scale-105 md:group-hover:scale-110 md:grayscale md:group-hover:grayscale-0" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-heading text-sm text-cream mb-1.5">{event.title}</h4>
                      <p className="text-cream/30 text-xs mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-cream/25 text-[10px] font-body group-hover:text-gold transition-colors duration-300">{event.date}</span>
                        <ChevronRight size={14} className="text-cream/20 group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {(visibleCount < finalPrevious.length || visibleCount > 4) && (
            <div id="events-bottom-buttons" className="flex justify-end items-center gap-6 mt-8">
              {visibleCount > 4 && (
                <button onClick={() => {
                  document.getElementById('previous-events')?.scrollIntoView({ behavior: 'auto', block: 'start' });
                  setVisibleCount(c => Math.max(4, c - 4));
                }} className="text-cream/50 hover:text-sunset text-[10px] md:text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-colors group">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> View Less
                </button>
              )}
              {visibleCount < finalPrevious.length && (
                <button onClick={() => {
                  setVisibleCount(c => c + 4);
                  setTimeout(() => {
                    document.getElementById('events')?.scrollIntoView({ behavior: 'auto', block: 'end' });
                  }, 10);
                }} className="text-cream/50 hover:text-sunset text-[10px] md:text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-colors group">
                  View More <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
