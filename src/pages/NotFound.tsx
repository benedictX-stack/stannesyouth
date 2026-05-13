import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6 relative overflow-hidden text-cream">
      <div className="ambient-glow-sunset absolute top-1/4 left-1/4 opacity-20" />
      <div className="ambient-glow-ocean absolute bottom-1/4 right-1/4 opacity-20" />
      <div className="glass-card rounded-[2rem] p-8 md:p-12 max-w-lg w-full text-center relative z-10 border border-white/10">
        <img src="/logo.png" alt="St. Anne's Youth logo" className="w-16 h-16 object-contain mx-auto mb-6 rounded-2xl bg-white/10 p-2" />
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-semibold mb-3">404</p>
        <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold tracking-tight mb-4">Page Not Found</h1>
        <p className="text-cream/50 text-sm md:text-base leading-relaxed mb-8">The page you are looking for does not exist or may have moved.</p>
        <Link to="/" className="btn-premium btn-primary inline-flex">Back Home</Link>
      </div>
    </div>
  )
}
