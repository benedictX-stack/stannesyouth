import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,115,74,0.07),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.05),transparent_28%)] pointer-events-none" />

      <div className="glass-card max-w-md w-full p-8 rounded-[2rem] relative z-10 border border-white/10 shadow-2xl shadow-black/30">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="St. Anne's Youth logo" className="w-16 h-16 rounded-2xl object-contain bg-white/[0.07] border border-white/10 p-2" />
        </div>
        
        <p className="text-gold text-[10px] uppercase tracking-[0.35em] font-semibold text-center mb-2">St. Anne's Youth</p>
        <h2 className="font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-cream text-center mb-2">Admin Portal</h2>
        <p className="text-cream/45 text-sm text-center mb-8">Sign in to manage website content</p>

        <form onSubmit={handleLogin} noValidate className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-cream/70 text-xs font-semibold tracking-wider uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-sunset/50"
              placeholder="admin@stannes.org"
            />
          </div>

          <div>
            <label className="block text-cream/70 text-xs font-semibold tracking-wider uppercase mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full glass-input rounded-xl px-4 py-3 pr-12 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-sunset/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg bg-[#111]/80 backdrop-blur-sm text-cream/50 hover:text-gold transition-colors duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium btn-primary flex justify-center items-center py-3"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
