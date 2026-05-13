import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [settings, setSettings] = useState({
    welcomeLabel: 'Welcome to',
    heroTitle: "St. Anne's",
    heroAccent: 'Youth',
    heroSubtitle: 'Faith  •  Community  •  Service'
  })

  useEffect(() => {
    return onSnapshot(doc(db, 'siteSettings', 'general'), snap => {
      if (snap.exists()) setSettings(p => ({ ...p, ...snap.data() }))
    }, () => {})
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content) return

    // Hero content fades and zooms out on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    })

    tl.to(content, {
      y: -100,
      opacity: 0,
      scale: 0.9,
      ease: 'power2.inOut',
    })


    // Overlay darkens on scroll
    const overlayTween = gsap.to(overlayRef.current, {
      opacity: 0.9,
      scrollTrigger: {
        trigger: section,
        start: 'center center',
        end: 'bottom top',
        scrub: 1,
      },
    })

    return () => {
      tl.kill()
      overlayTween.kill()
    }
  }, [])

  const scrollToNext = () => {
    const next = document.querySelector('#about')
    if (next) next.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Dark gradient overlay (Lightened to show interactive background) */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-primary/80 pointer-events-none"
      />

      {/* Ambient glows */}
      <div className="ambient-glow-ocean absolute top-1/4 right-0 translate-x-1/2 animate-glow-pulse" />
      <div className="ambient-glow-sunset absolute bottom-0 left-1/4 translate-y-1/2 animate-glow-pulse" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div ref={contentRef} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Small label */}
        <div className="inline-flex items-center gap-2 mb-6 opacity-0 animate-fade-in">
          <div className="w-8 h-[1px] bg-gold" />
          <span className="text-gold text-xs font-body font-medium tracking-[0.3em] uppercase">
            {settings.welcomeLabel}
          </span>
          <div className="w-8 h-[1px] bg-gold" />
        </div>

        {/* Main title */}
        <h1 className="font-heading text-display-xl text-cream mb-6 opacity-0 animate-fade-in animate-delay-200">
          {settings.heroTitle}
          <span className="block text-gradient-sunset italic">{settings.heroAccent}</span>
        </h1>

        {/* Subtitle */}
        <p className="font-body text-cream/60 text-lg md:text-xl tracking-[0.15em] mb-10 opacity-0 animate-fade-in animate-delay-400">
          {settings.heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in animate-delay-500">
          <a href="#events" className="btn-premium btn-primary">
            Explore Events
          </a>
          <a href="#gallery" className="btn-premium glass-btn rounded-full text-cream text-sm font-medium tracking-wider uppercase py-[14px] px-9">
            View Gallery
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/40 hover:text-cream/60 transition-colors duration-300 group"
      >
        <span className="text-xs font-body tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown size={20} className="animate-scroll-indicator" />
      </button>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary to-transparent z-[5]" />
    </section>
  )
}
