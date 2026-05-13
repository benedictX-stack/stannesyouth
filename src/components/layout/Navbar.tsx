import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Events', href: '#events' },
  { label: 'Calendar', href: '#calendar' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Team', href: '#team' },
  { label: 'Feedback', href: '#feedback' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar when scrolled past most of the "hello" screen
      setIsVisible(window.scrollY > window.innerHeight * 0.5)
      setIsScrolled(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav
        className="fixed z-50"
        style={{
          top: isScrolled ? '16px' : '0px',
          left: isScrolled ? '16px' : '0px',
          right: isScrolled ? '16px' : '0px',
          transform: isVisible ? 'translateY(0)' : 'translateY(-150%)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: isScrolled ? '960px' : '1280px',
            padding: isScrolled ? '12px 24px' : '24px 48px',
            borderRadius: isScrolled ? '16px' : '0px',
            background: isScrolled
              ? 'linear-gradient(135deg, rgba(30,30,30,0.55), rgba(20,20,20,0.65), rgba(30,30,30,0.55))'
              : 'transparent',
            backdropFilter: isScrolled ? 'blur(40px) saturate(1.8)' : 'blur(0px) saturate(1)',
            WebkitBackdropFilter: isScrolled ? 'blur(40px) saturate(1.8)' : 'blur(0px) saturate(1)',
            border: isScrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            boxShadow: isScrolled
              ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.1)'
              : '0 0 0 rgba(0,0,0,0)',
            transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('#hero')}
              className="flex items-center gap-3 group relative"
            >
              <img
                src="/logo.png"
                alt="St. Anne's Youth Logo"
                className={`rounded-full object-cover transition-all duration-500 ${
                  isScrolled ? 'w-9 h-9' : 'w-12 h-12 drop-shadow-lg'
                }`}
              />
            </button>

            {/* Desktop Nav — centered glass pill */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="relative text-cream/70 hover:text-cream text-sm font-medium tracking-wider uppercase transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/[0.07] group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ))}
            </div>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-cream/80 hover:text-cream transition-colors p-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-primary/80 backdrop-blur-2xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, i) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-cream font-heading text-3xl font-semibold tracking-wide hover:text-gold transition-colors duration-300"
              style={{
                transitionDelay: isMobileMenuOpen ? `${i * 80}ms` : '0ms',
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: isMobileMenuOpen ? 1 : 0,
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
