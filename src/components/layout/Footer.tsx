import { useEffect, useState } from 'react'
import { Instagram, Phone, Mail, MapPin, Heart } from 'lucide-react'
import { db } from '../../lib/firebase'
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    footerText: 'A vibrant community of young believers united by faith, friendship, and the joy of celebration.',
    phone1: '+91 9967890390 (Ira Rathore)',
    phone2: '+91 9137670192 (Benedict Xalxo)',
    instagramHandle: '@stannes_youth',
    instagramUrl: 'https://instagram.com/stannes_youth',
    email: 'st.annesyouth10@gmail.com',
    address: "St. Anne's Church,\nMazagaon"
  })

  useEffect(() => {
    return onSnapshot(doc(db, 'siteSettings', 'general'), snap => {
      if (snap.exists()) setSettings(p => ({ ...p, ...snap.data() }))
    })
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await addDoc(collection(db, 'newsletterSubscribers'), { email, createdAt: serverTimestamp() })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setEmail('')
      }, 3000)
    } catch (err) {
      setError('Subscription failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <footer className="relative bg-primary border-t border-white/5">
      {/* Ambient glow */}
      <div className="ambient-glow-ocean absolute -top-40 left-1/4 opacity-30" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="St. Anne's Youth Logo"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6">
              {settings.footerText}
            </p>
            <div className="flex gap-3">
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-cream/60 hover:text-sunset hover:border-sunset/30 transition-all duration-300" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-xs font-semibold text-cream/40 uppercase tracking-[0.2em] mb-5">
              Navigate
            </h4>
            <ul className="space-y-3">
              {['Home', 'About', 'Events', 'Gallery', 'Team'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-cream/60 hover:text-cream text-sm transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs font-semibold text-cream/40 uppercase tracking-[0.2em] mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-gold mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-cream/60 text-sm">{settings.phone1}</span>
                  <span className="text-cream/60 text-sm">{settings.phone2}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Instagram size={16} className="text-gold mt-0.5 shrink-0" />
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-cream/60 text-sm hover:text-sunset transition-colors">
                  {settings.instagramHandle}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="text-cream/60 text-sm">{settings.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="text-cream/60 text-sm">{settings.address.split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-body text-xs font-semibold text-cream/40 uppercase tracking-[0.2em] mb-5">
              Stay Updated
            </h4>
            <p className="text-cream/50 text-sm mb-4">
              Get updates on events, gatherings, and community news.
            </p>
            <form onSubmit={handleSubscribe} noValidate className="relative">
              <div className="flex gap-2 relative z-10">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="Your email"
                  className={`flex-1 glass-input rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none transition-shadow ${error ? 'border border-sunset/50 ring-1 ring-sunset/50' : 'focus:ring-1 focus:ring-sunset/50'}`}
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-sunset to-sunset-dark text-cream rounded-full px-5 py-2.5 text-sm font-medium hover:shadow-lg hover:shadow-sunset/20 transition-all duration-300"
                >
                  {saving ? '...' : 'Join'}
                </button>
              </div>
              {error && (
                <p className="absolute -bottom-6 left-2 text-sunset text-xs font-medium animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-sunset inline-block" /> {error}
                </p>
              )}
              {success && (
                <p className="absolute -bottom-6 left-2 text-gold text-xs font-medium animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-gold inline-block" /> Subscribed successfully!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream/30 text-xs">
            © {currentYear} St. Anne's Youth. All rights reserved.
          </p>
          <p className="text-cream/30 text-xs">
            made by <span className="italic">Benedict</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
