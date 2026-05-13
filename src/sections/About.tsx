import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Users, Calendar, Heart } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const [settings, setSettings] = useState({
    aboutTitle: 'More Than a Youth Group',
    aboutText: "St. Anne's Youth is a vibrant community of young believers who come together to grow in faith, build lasting friendships, and celebrate life. We believe in creating spaces where everyone feels welcome, valued, and inspired to make a difference.",
    aboutImage: '/core-team/about.jpeg',
    activeMembers: '50+',
    eventsOrganized: '15+',
    yearsStrong: '3+'
  })

  useEffect(() => {
    return onSnapshot(doc(db, 'siteSettings', 'general'), snap => {
      if (snap.exists()) setSettings(p => ({ ...p, ...snap.data() }))
    }, () => {})
  }, [])

  const editableStats = [
    { icon: Users, value: settings.activeMembers, label: 'Active Members' },
    { icon: Calendar, value: settings.eventsOrganized, label: 'Events Organized' },
    { icon: Heart, value: settings.yearsStrong, label: 'Years Strong' },
  ]

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const els = section.querySelectorAll('.about-reveal')
    els.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1, delay: i * 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    })

    let mm = gsap.matchMedia()
    mm.add("(max-width: 767px)", () => {
      const img = section.querySelector('.about-img')
      if (img) {
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
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative py-24 lg:py-32 bg-primary overflow-hidden">
      <div className="ambient-glow-gold absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 animate-glow-pulse" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Centered heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 mb-3 about-reveal">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">About Us</span>
            <div className="w-8 h-[1px] bg-gold" />
          </div>
          <h2 className="font-heading text-display-sm text-cream about-reveal">
            {settings.aboutTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative about-reveal lg:col-span-8 group cursor-pointer">
            <div className="relative rounded-[1.5rem] overflow-hidden aspect-video shadow-2xl border border-white/5">
              <img
                src={settings.aboutImage}
                alt="Youth community gathering"
                className="about-img w-full h-full object-cover object-center transition-transform duration-700 md:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            <p className="text-cream/50 text-base leading-relaxed mb-10 about-reveal">
              {settings.aboutText}
            </p>


            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 about-reveal">
              {editableStats.map((stat) => (
                <div key={stat.label} className="text-center glass-card rounded-2xl py-5 px-3 hover:border-white/15 transition-all duration-500 hover:-translate-y-1">
                  <stat.icon size={20} className="text-gold mx-auto mb-2" />
                  <p className="font-numbers text-3xl lg:text-4xl text-cream font-bold tracking-tighter mb-1">{stat.value}</p>
                  <p className="font-body text-cream/40 text-[10px] lg:text-xs uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
