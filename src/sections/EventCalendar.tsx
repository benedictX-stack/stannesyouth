import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { db } from '../lib/firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface CalEvent {
  id: string; title: string; date: string
  time?: string; venue?: string; description?: string; category?: string
}

const categoryColors: Record<string, string> = {
  Faith:     'text-amber-300 border-amber-300/30 bg-amber-300/10',
  Community: 'text-sky-300   border-sky-300/30   bg-sky-300/10',
  Service:   'text-yellow-300 border-yellow-300/30 bg-yellow-300/10',
  Fun:       'text-pink-300  border-pink-300/30  bg-pink-300/10',
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTH_NAMES[d.getMonth()].slice(0, 3).toUpperCase(),
  }
}

export default function EventCalendar() {
  const sectionRef = useRef<HTMLElement>(null)
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [viewYear, setViewYear]   = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-indexed

  useEffect(() => {
    const q = query(collection(db, 'calendarEvents'), orderBy('date', 'asc'))
    return onSnapshot(q, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as CalEvent)))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || loading) return
    const els = section.querySelectorAll('.cal-reveal')
    els.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
      })
    })
  }, [loading])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Events in this view month
  const monthEvents = events.filter(e => {
    const d = new Date(e.date + 'T00:00:00')
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })

  // All event dates as numbers for dot markers
  const eventDays = new Set(
    events
      .filter(e => { const d = new Date(e.date + 'T00:00:00'); return d.getFullYear() === viewYear && d.getMonth() === viewMonth })
      .map(e => new Date(e.date + 'T00:00:00').getDate())
  )

  const todayYear  = now.getFullYear()
  const todayMonth = now.getMonth()
  const todayDate  = now.getDate()

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  return (
    <section ref={sectionRef} id="calendar" className="relative py-24 lg:py-32 bg-primary-200 overflow-hidden">
      <div className="ambient-glow-gold absolute top-0 right-1/4 -translate-y-1/2 animate-glow-pulse" />
      <div className="ambient-glow-ocean absolute bottom-0 left-1/4 translate-y-1/4 animate-glow-pulse" style={{ animationDelay: '3s' }} />

      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Heading */}
        <div className="text-center mb-12 cal-reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Calendar</span>
            <div className="w-8 h-[1px] bg-gold" />
          </div>
          <h2 className="font-heading text-display-sm text-cream">
            What's <span className="italic text-gradient-sunset inline-block" style={{ paddingBottom: '0.15em', paddingRight: '0.1em' }}>Coming Up</span>
          </h2>
        </div>

          <div className="cal-reveal glass-card rounded-3xl border border-white/8 overflow-hidden shadow-2xl">
            {loading ? (
              <div className="p-10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : (
              <>
            {/* ── Calendar header with navigation ── */}
            <div className="px-6 md:px-8 py-5 border-b border-white/5 flex items-center justify-between gap-4">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-cream/40 hover:text-gold hover:bg-gold/10 transition-all duration-200"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center">
                <p className="font-numbers text-2xl md:text-3xl font-bold text-cream tracking-tight leading-none">
                  {MONTH_NAMES[viewMonth]}
                </p>
                <p className="text-gold text-xs font-body font-semibold tracking-[0.25em] mt-0.5">{viewYear}</p>
              </div>

              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-cream/40 hover:text-gold hover:bg-gold/10 transition-all duration-200"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* ── Day labels ── */}
            <div className="grid grid-cols-7 border-b border-white/5">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="py-2.5 text-center text-[10px] font-body font-semibold text-cream/25 uppercase tracking-widest">{d}</div>
              ))}
            </div>

            {/* ── Day grid ── */}
            <div className="grid grid-cols-7">
              {/* Leading blanks */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} className="border-b border-r border-white/[0.03] py-3" />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isToday = day === todayDate && viewMonth === todayMonth && viewYear === todayYear
                const hasEvent = eventDays.has(day)
                return (
                  <div key={day} className={`border-b border-r border-white/[0.03] py-2.5 px-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${isToday ? 'bg-gold/10' : hasEvent ? 'bg-white/[0.02]' : ''}`}>
                    <span className={`font-numbers text-sm font-medium rounded-full w-8 h-8 flex items-center justify-center transition-colors ${isToday ? 'bg-gold text-primary font-bold' : 'text-cream/40 hover:text-cream'}`}>
                      {day}
                    </span>
                    {hasEvent && <div className="w-1 h-1 rounded-full bg-sunset" />}
                  </div>
                )
              })}
            </div>

            {/* ── Events this month ── */}
            {monthEvents.length > 0 ? (
              <div className="border-t border-white/5 p-6 space-y-3">
                <p className="text-gold text-[10px] font-body font-semibold tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-sunset inline-block" />
                  Events this month
                </p>
                {monthEvents.map(ev => {
                  const d = formatDate(ev.date)
                  const tagClass = categoryColors[ev.category ?? ''] ?? 'text-cream/50 border-white/10 bg-white/5'
                  return (
                    <div key={ev.id} className="group flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-gold/20 transition-all duration-300">
                      <div className="flex-shrink-0 text-center w-10">
                        <span className="font-numbers text-xl font-bold text-gold leading-none block">{d.day}</span>
                        <span className="text-gold/60 text-[9px] tracking-widest uppercase">{d.month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading text-sm text-cream group-hover:text-gold transition-colors duration-200">{ev.title}</h4>
                          {ev.category && <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-widest ${tagClass}`}>{ev.category}</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          {ev.time  && <span className="flex items-center gap-1 text-cream/35 text-xs"><Clock size={10} className="text-gold" />{ev.time}</span>}
                          {ev.venue && <span className="flex items-center gap-1 text-cream/35 text-xs"><MapPin size={10} className="text-gold" />{ev.venue}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="border-t border-white/5 px-8 py-5 flex items-center gap-3">
                <Calendar size={16} className="text-gold/25 flex-shrink-0" />
                <p className="text-cream/30 text-sm italic">No events scheduled for {MONTH_NAMES[viewMonth]} {viewYear}.</p>
              </div>
            )}
              </>
            )}
          </div>
      </div>
    </section>
  )
}
