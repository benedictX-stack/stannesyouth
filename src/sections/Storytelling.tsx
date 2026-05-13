import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const storyWords = [
  {
    word: 'Faith.',
    gradient: 'from-ocean-light to-ocean',
    bgColor: 'rgba(27, 58, 92, 0.08)',
    image: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1920&q=80',
  },
  {
    word: 'Friendship.',
    gradient: 'from-gold to-gold-light',
    bgColor: 'rgba(201, 169, 78, 0.08)',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80',
  },
  {
    word: 'Celebration.',
    gradient: 'from-sunset to-sunset-light',
    bgColor: 'rgba(232, 115, 74, 0.08)',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80',
  },
  {
    word: 'Music.',
    gradient: 'from-teal to-teal-light',
    bgColor: 'rgba(42, 123, 123, 0.08)',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80',
  },
  {
    word: 'Community.',
    gradient: 'from-sunset-light to-gold',
    bgColor: 'rgba(232, 115, 74, 0.06)',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1920&q=80',
  },
]

export default function Storytelling() {
  const sectionRef = useRef<HTMLElement>(null)
  const panelsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const panels = panelsRef.current.filter(Boolean)
    const totalPanels = panels.length

    // Pin the entire section while we scroll through panels
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${totalPanels * 100}%`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    })

    panels.forEach((panel, i) => {
      const word = panel.querySelector('.story-word')
      const bg = panel.querySelector('.story-bg')
      const line = panel.querySelector('.story-line')

      if (i === 0) {
        // First panel is already visible
        tl.fromTo(word!, { opacity: 0, scale: 0.8, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.5 })
          .fromTo(bg!, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '<')
          .fromTo(line!, { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, '-=0.2')

        if (totalPanels > 1) {
          tl.to(word!, { opacity: 0, scale: 1.1, y: -30, duration: 0.4 }, '+=0.3')
            .to(bg!, { opacity: 0, duration: 0.4 }, '<')
        }
      } else {
        tl.fromTo(word!, { opacity: 0, scale: 0.8, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.5 })
          .fromTo(bg!, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '<')
          .fromTo(line!, { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, '-=0.2')

        if (i < totalPanels - 1) {
          tl.to(word!, { opacity: 0, scale: 1.1, y: -30, duration: 0.4 }, '+=0.3')
            .to(bg!, { opacity: 0, duration: 0.4 }, '<')
        }
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="storytelling"
      className="relative h-screen w-full overflow-hidden bg-primary"
    >
      {/* All panels stacked on top of each other */}
      {storyWords.map((item, i) => (
        <div
          key={item.word}
          ref={(el) => { if (el) panelsRef.current[i] = el }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Background image */}
          <div
            className="story-bg absolute inset-0 bg-cover bg-center opacity-0"
            style={{ backgroundImage: `url('${item.image}')` }}
          >
            <div className="absolute inset-0 bg-primary/80" />
          </div>

          {/* Word */}
          <div className="relative z-10 text-center">
            <h2
              className="story-word font-heading text-display-xl text-cream opacity-0"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 10rem)' }}
            >
              <span className={`bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                {item.word}
              </span>
            </h2>
            <div className="story-line w-16 h-[2px] mx-auto mt-6 bg-gradient-to-r from-transparent via-gold to-transparent origin-center scale-x-0" />
          </div>
        </div>
      ))}

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none z-20" />
    </section>
  )
}
