import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Send, CheckCircle } from 'lucide-react'
import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

gsap.registerPlugin(ScrollTrigger)

export default function Feedback() {
  const sectionRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState({ name: '', feedback: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const el = section.querySelector('.feedback-reveal')
    if (el) {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.feedback.trim()) {
      setError('Please write some feedback before sending.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'feedbacks'), {
        name: formData.name || 'Anonymous',
        feedback: formData.feedback,
        createdAt: serverTimestamp()
      })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 5000)
      setFormData({ name: '', feedback: '' })
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section ref={sectionRef} id="feedback" className="relative py-24 lg:py-32 bg-primary overflow-hidden">
      <div className="ambient-glow-ocean absolute top-0 left-1/3 -translate-y-1/2 animate-glow-pulse" />
      <div className="ambient-glow-gold absolute bottom-0 right-1/4 translate-y-1/2 animate-glow-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10 feedback-reveal">
        <div className="glass-card rounded-[2rem] p-8 md:p-12 lg:p-16 border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sunset/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-ocean/10 blur-[80px] rounded-full" />

          {submitted ? (
            <div className="text-center py-20 relative z-10">
              <CheckCircle size={72} className="text-sunset mx-auto mb-6" />
              <h3 className="font-heading text-4xl font-bold text-cream mb-4 tracking-tight">Thank You!</h3>
              <p className="text-cream/60 text-lg leading-relaxed max-w-md mx-auto">Your feedback has been securely sent. We appreciate your voice in helping us grow!</p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="w-8 h-[1px] bg-gold" />
                  <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Feedback</span>
                  <div className="w-8 h-[1px] bg-gold" />
                </div>
                <h3 className="font-heading text-4xl md:text-5xl font-bold text-cream mb-4 tracking-tight">
                  Share Your <span className="italic text-gradient-sunset">Experience</span>
                </h3>
                <p className="text-cream/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                  Got any event ideas?  Have some suggestions?
                  Your thoughts help us improve. All feedback goes directly to our core team and remains completely confidential.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="text-cream/40 text-[10px] uppercase tracking-[0.2em] font-bold block mb-2 ml-1">Name (Optional)</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full glass-input rounded-2xl px-6 py-4 text-cream text-base placeholder:text-cream/20 focus:outline-none focus:ring-1 focus:ring-sunset/50 transition-shadow"
                    placeholder="Your Name" />
                </div>
                <div>
                  <label className="text-cream/40 text-[10px] uppercase tracking-[0.2em] font-bold block mb-2 ml-1">Your Feedback</label>
                  <textarea value={formData.feedback}
                    onChange={(e) => { setFormData((p) => ({ ...p, feedback: e.target.value })); setError(''); }}
                    className={`w-full glass-input rounded-2xl px-6 py-5 text-cream text-base placeholder:text-cream/20 focus:outline-none transition-shadow resize-none h-40 ${error ? 'border border-sunset/50 ring-1 ring-sunset/50' : 'focus:ring-1 focus:ring-sunset/50'}`}
                    placeholder="What's on your mind?" />
                  {error && (
                    <p className="text-sunset text-xs mt-2 ml-2 flex items-center gap-1.5 font-medium animate-fade-in">
                      <span className="w-1 h-1 rounded-full bg-sunset inline-block" /> {error}
                    </p>
                  )}
                </div>
                <button disabled={isSubmitting} type="submit" className="btn-premium btn-primary w-full group overflow-hidden mt-4 py-4 rounded-2xl text-base">
                  <div className="absolute inset-0 bg-gradient-to-r from-sunset to-gold opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-cream/30 border-t-cream rounded-full animate-spin mx-auto" />
                  ) : (
                    <><Send size={18} /> Send </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
