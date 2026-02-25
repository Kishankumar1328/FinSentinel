'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, EyeOff, ArrowRight, Loader2, CheckCircle2,
  TrendingUp, Sparkles, Brain, Shield,
} from 'lucide-react';

const FEATURES = [
  { icon: Brain, text: 'AI-powered spending insights & anomaly detection' },
  { icon: Shield, text: 'Bank-grade encryption — your data stays private' },
  { icon: Sparkles, text: 'Smart budget alerts & financial health score' },
  { icon: TrendingUp, text: 'Investment & tax optimizer in one dashboard' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Software Engineer', text: 'FinSentinel helped me save $400/mo. I finally understand where my money goes.', avatar: 'S' },
  { name: 'Marcus T.', role: 'Freelancer', text: 'The tax optimizer alone paid for my subscription 20x over. Absolute game changer.', avatar: 'M' },
  { name: 'Priya R.', role: 'Product Manager', text: 'Love the voice entry. I log expenses in 2 seconds while commuting. Brilliant.', avatar: 'P' },
];

/* ── Animated grid overlay ─────────────── */
function GridOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" aria-hidden>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-200" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

/* ── Floating metric cards ─────────────── */
function FloatingCard({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      className="absolute glass rounded-2xl px-4 py-3 border border-foreground/10 shadow-2xl"
      style={style}
    >
      {children}
    </div>
  );
}

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create account');
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify({ id: result.data.userId, email: result.data.email, name: result.data.name }));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
  const pwLabels = ['', 'Weak', 'Good', 'Strong'];
  const pwGlows = ['', 'shadow-rose-500/30', 'shadow-amber-500/30', 'shadow-emerald-500/30'];

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* Aurora */}
      <div className="aurora-bg"><div className="aurora-orb aurora-orb-1" /><div className="aurora-orb aurora-orb-2" /></div>

      {/* ── Left Decorative Panel ─────────────────────── */}
      <div className="hidden lg:flex flex-col w-5/12 relative overflow-hidden border-r border-white/5">
        <GridOverlay />

        {/* Deep gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60" />

        {/* Orb accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, oklch(0.66 0.24 268) 0%, transparent 70%)' }} />

        {/* Floating metric cards */}
        <FloatingCard style={{ top: '18%', left: '8%', animation: 'float-orb 6s ease-in-out infinite' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-foreground/40 uppercase font-bold">Portfolio</p>
              <p className="text-sm font-extrabold text-emerald-500">+14.8% YTD</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard style={{ top: '25%', right: '6%', animation: 'float-orb 8s ease-in-out 2s infinite' }}>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-semibold text-foreground/70">AI insight ready</p>
          </div>
        </FloatingCard>

        <FloatingCard style={{ bottom: '32%', left: '6%', animation: 'float-orb 7s ease-in-out 4s infinite' }}>
          <div>
            <p className="text-[9px] uppercase text-foreground/30 font-bold mb-0.5">This month saved</p>
            <p className="text-xl font-black gradient-text-green">$1,240</p>
          </div>
        </FloatingCard>

        {/* Main content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-slate-950">FinSentinel</span>
          </Link>

          {/* Hero text */}
          <div className="space-y-6 my-auto">
            <h2 className="text-5xl font-black text-slate-950 leading-tight">
              Build wealth
              <br />
              <span className="gradient-text-primary">intelligently.</span>
            </h2>
            <p className="text-slate-800 font-semibold leading-relaxed max-w-xs">
              Join 12,000+ people who have transformed their finances with AI-powered guidance.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rotating Testimonial */}
          <div key={testimonialIdx} className="glass rounded-2xl p-5 border border-slate-200 shadow-xl shadow-slate-200/50 fade-up">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">{t.name}</p>
                <p className="text-xs text-slate-600 font-bold">{t.role}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: `oklch(0.65 0.22 ${50 + i * 10})` }} />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-bold italic">"{t.text}"</p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === testimonialIdx ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-200'}`} />
            ))}
          </div>

          <p className="relative z-10 text-xs text-slate-400 mt-6">© 2026 FinSentinel · All rights reserved</p>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-7 fade-up">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg text-foreground">FinSentinel</span>
          </Link>

          {/* Heading */}
          <div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tight leading-tight">Create account</h1>
            <p className="text-sm font-semibold text-slate-600 mt-2">Free forever · No credit card · Launch in 30 seconds</p>
          </div>

          {/* Demo banner */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl glass border border-indigo-500/20">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-600">Demo Mode Available</p>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-bold">
                Create any account to explore — your data is stored locally and never shared.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium">
              <span className="text-base flex-shrink-0">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Full Name</label>
              <input
                id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="John Doe" required disabled={loading}
                className="input-glow w-full h-12 px-4 rounded-xl text-sm font-semibold text-black placeholder-slate-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Email Address</label>
              <input
                id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required disabled={loading}
                className="input-glow w-full h-12 px-4 rounded-xl text-sm font-semibold text-black placeholder-slate-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters" required minLength={8} disabled={loading}
                  className="input-glow w-full h-12 px-4 pr-12 rounded-xl text-sm font-semibold text-black placeholder-slate-400 disabled:opacity-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(level => (
                      <div key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${pwStrength >= level ? `${pwColors[pwStrength]} shadow-sm ${pwGlows[pwStrength]}` : 'bg-foreground/10'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-bold ${pwStrength === 1 ? 'text-rose-400' : pwStrength === 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {pwLabels[pwStrength]} password
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-neon w-full h-12 rounded-xl font-bold text-sm text-primary-foreground flex items-center justify-center gap-2.5 disabled:opacity-60 group mt-2"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating your account…</>
                : <><span>Create Free Account</span><ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-500 uppercase">or sign in to existing account</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Link href="/auth/signin">
            <button className="btn-glass w-full h-11 rounded-xl font-semibold text-sm text-foreground/80 hover:text-foreground flex items-center justify-center gap-2">
              Sign In Instead
            </button>
          </Link>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-5 pt-2">
            {[
              { icon: Shield, label: 'SSL secured' },
              { icon: CheckCircle2, label: 'No subscription' },
              { icon: Sparkles, label: 'AI included' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
