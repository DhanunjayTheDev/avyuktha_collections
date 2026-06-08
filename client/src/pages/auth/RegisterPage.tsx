import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

const BENEFITS = [
  'Early access to new collections',
  'Exclusive member-only discounts',
  'Track orders & easy returns',
  'Personalised style recommendations',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined });
      toast.success('Account created! Check your email for the verification OTP.');
      navigate('/auth/verify-email', { state: { email: form.email } });
    } catch {
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-brand-bg">
      {/* Left — Image + Benefits */}
      <div className="hidden lg:flex relative w-[42%] xl:w-[45%] flex-shrink-0 flex-col">
        <img
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80"
          alt="Fashion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-text/75 via-brand-text/40 to-transparent" />
        <div className="relative flex flex-col justify-between h-full p-10 xl:p-14">
          <Link to="/">
            <span className="font-heading text-xl font-bold tracking-wider text-white">AVYUKTHA</span>
            <span className="block font-body text-[8px] tracking-[0.4em] uppercase text-primary/90 mt-0.5">FASHIONS</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="font-heading text-3xl xl:text-4xl font-bold text-white leading-tight mb-6">
              Join India's Premium<br />Fashion Community
            </h2>
            <div className="space-y-3">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="font-body text-sm text-white/85">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 xl:px-14 max-w-lg mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Link to="/" className="inline-block mb-7 lg:hidden">
              <span className="font-heading text-xl font-bold tracking-wider text-brand-text">AVYUKTHA</span>
              <span className="block font-body text-[9px] tracking-[0.4em] uppercase text-primary -mt-0.5">FASHIONS</span>
            </Link>

            <div className="mb-6">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text mb-1.5">Create your account</h1>
              <p className="font-body text-sm text-brand-muted">
                Already have one?{' '}
                <Link to="/auth/login" className="text-primary hover:text-primary-dark font-medium transition-colors">Sign in</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="font-body text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-brand-text text-sm outline-none focus:border-primary focus:bg-white transition-all duration-200 placeholder:text-brand-muted/60"
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-brand-text text-sm outline-none focus:border-primary focus:bg-white transition-all duration-200 placeholder:text-brand-muted/60"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Phone <span className="text-brand-muted font-normal normal-case tracking-normal">(optional)</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-brand-text text-sm outline-none focus:border-primary focus:bg-white transition-all duration-200 placeholder:text-brand-muted/60"
                    placeholder="10-digit mobile"
                    pattern="[6-9][0-9]{9}"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-brand-text text-sm outline-none focus:border-primary focus:bg-white transition-all duration-200 placeholder:text-brand-muted/60 pr-10"
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-primary transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex gap-1 mt-1.5">
                      {[4, 6, 8, 10].map((len) => (
                        <div key={len} className={`flex-1 h-1 rounded-full transition-colors ${form.password.length >= len ? 'bg-primary' : 'bg-brand-border'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-3 bg-brand-surface border text-brand-text text-sm outline-none focus:bg-white transition-all duration-200 placeholder:text-brand-muted/60 pr-10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-brand-border focus:border-primary'}`}
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-primary transition-colors">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="font-body text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || (!!form.confirmPassword && form.password !== form.confirmPassword)}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-body font-medium py-3.5 text-sm tracking-wider uppercase mt-1 hover:bg-primary-dark transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
              </motion.button>

              <p className="font-body text-xs text-brand-muted text-center pt-1">
                By creating an account, you agree to our{' '}
                <Link to="/cms/terms" className="text-primary hover:underline">Terms</Link>{' '}and{' '}
                <Link to="/cms/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
