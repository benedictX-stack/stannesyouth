import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CallToAction() {
  const sectionRef = useRef<HTMLElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Subtle scroll-driven parallax on the gradient blobs
    if (blobRef.current) {
      gsap.to(blobRef.current, {
        y: -60,
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      })
    }

    const els = section.querySelectorAll('.cta-reveal')
    els.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, delay: i * 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    })
  }, [])

  return (
    <section ref={sectionRef} className="relative py-40 lg:py-56 overflow-hidden bg-primary-200">

      {/* ── Animated fluid gradient ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Self-animating blobs */}
        <div ref={blobRef} className="absolute inset-0">
          <div
            className="absolute rounded-full mix-blend-screen"
            style={{
              width: '70vw', height: '70vw',
              top: '5%', left: '-15%',
              background: 'radial-gradient(circle, rgba(201,169,78,0.22) 0%, rgba(201,169,78,0.04) 55%, transparent 75%)',
              filter: 'blur(80px)',
              animation: 'blob-drift-a 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full mix-blend-screen"
            style={{
              width: '55vw', height: '55vw',
              top: '20%', right: '-10%',
              background: 'radial-gradient(circle, rgba(232,115,74,0.18) 0%, rgba(196,90,48,0.05) 55%, transparent 75%)',
              filter: 'blur(100px)',
              animation: 'blob-drift-b 22s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full mix-blend-screen"
            style={{
              width: '40vw', height: '40vw',
              bottom: '0%', left: '30%',
              background: 'radial-gradient(circle, rgba(27,58,92,0.30) 0%, rgba(27,58,92,0.05) 55%, transparent 75%)',
              filter: 'blur(90px)',
              animation: 'blob-drift-c 26s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full mix-blend-screen"
            style={{
              width: '30vw', height: '30vw',
              top: '50%', left: '55%',
              background: 'radial-gradient(circle, rgba(180,130,60,0.14) 0%, transparent 70%)',
              filter: 'blur(70px)',
              animation: 'blob-drift-a 14s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Noise/grain overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Vignette edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#080810_100%)]" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 mb-8 cta-reveal">
          <div className="w-8 h-[1px] bg-gold/60" />
          <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">St. Anne's Youth</span>
          <div className="w-8 h-[1px] bg-gold/60" />
        </div>
        <h2 className="font-heading text-display text-cream mb-6 cta-reveal">
          Find Your Place <span className="italic text-gradient-sunset" style={{ paddingBottom: '0.1em', paddingRight: '0.1em', display: 'inline-block' }}>With Us</span>
        </h2>
        <p className="text-cream/50 text-lg mb-12 cta-reveal leading-relaxed">
          Every great journey begins with a single step. Take yours today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 cta-reveal">
          <a href="#feedback" className="btn-premium btn-primary">Share Feedback</a>
          <a href="#events" className="btn-premium glass-btn rounded-full text-cream text-sm font-medium tracking-wider uppercase py-[14px] px-9">View Events</a>
        </div>
      </div>

      <style>{`
        @keyframes blob-drift-a {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(40px, -30px) scale(1.05); }
          66%  { transform: translate(-20px, 20px) scale(0.97); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes blob-drift-b {
          0%   { transform: translate(0px, 0px) scale(1); }
          30%  { transform: translate(-50px, 25px) scale(1.08); }
          65%  { transform: translate(30px, -15px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes blob-drift-c {
          0%   { transform: translate(0px, 0px) scale(1); }
          40%  { transform: translate(25px, 40px) scale(1.04); }
          70%  { transform: translate(-35px, -20px) scale(0.98); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </section>
  )
}
