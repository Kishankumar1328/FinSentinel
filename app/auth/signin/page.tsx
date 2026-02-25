'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, Shield, Sparkles, TrendingUp, Zap } from 'lucide-react';

const STATS = [
  { value: '12K+', label: 'Users' },
  { value: '$2B+', label: 'Tracked' },
  { value: '4.9', label: 'Stars' },
  { value: 'AI', label: 'Powered' },
];

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Invalid credentials');
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify({ id: result.data.userId, email: result.data.email, name: result.data.name }));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex overflow-hidden bg-background">
      {/* Aurora */}
      <div className="aurora-bg"><div className="aurora-orb aurora-orb-1" /><div className="aurora-orb aurora-orb-2" /></div>

      {/* ── Left Decorative ─────────────────────────── */}
      <div className="hidden lg:flex flex-col w-5/12 relative overflow-hidden border-r border-white/5">
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" aria-hidden>
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-background to-indigo-950/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.20 310) 0%, transparent 70%)' }} />

        {/* Floating card */}
        <div className="absolute glass rounded-2xl px-5 py-4 border border-white/8 shadow-2xl top-[22%] right-[8%]"
          style={{ animation: 'float-orb 7s ease-in-out infinite' }}>
          <p className="text-[9px] text-white/30 uppercase font-bold mb-1">Monthly savings rate</p>
          <p className="text-2xl font-black gradient-text-green">28.4%</p>
          <p className="text-[10px] text-emerald-400 font-bold mt-0.5">↑ vs last month</p>
        </div>

        <div className="absolute glass rounded-xl px-4 py-3 border border-white/8 bottom-[38%] left-[6%]"
          style={{ animation: 'float-orb 9s ease-in-out 3s infinite' }}>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-white/40">Budget alert</p>
              <p className="text-xs font-bold text-amber-400">Dining 92% used</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white">FinSentinel</span>
          </Link>

          <div className="space-y-6 my-auto">
            <h2 className="text-5xl font-black text-white leading-tight">
              Welcome back,<br />
              <span className="gradient-text-primary">champion.</span>
            </h2>
            <p className="text-white/45 leading-relaxed max-w-xs">
              Your financial dashboard is ready. Let's see what your money has been up to.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              {STATS.map(({ value, label }) => (
                <div key={label} className="glass-sm rounded-xl p-4 border border-white/6">
                  <p className="text-2xl font-black gradient-text-primary">{value}</p>
                  <p className="text-xs text-white/35 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/20">© 2026 FinSentinel · All rights reserved</p>
        </div>
      </div>

      {/* ── Right Form ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-7 fade-up">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white">FinSentinel</span>
          </Link>

          {/* Heading */}
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Welcome back</h1>
            <p className="text-sm text-white/40 mt-2">Sign in to your financial command centre</p>
          </div>

          {/* Demo banner */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl glass border border-violet-500/20">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-violet-300">Demo Mode</p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                Enter any registered credentials — your data is stored locally.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium">
              <span className="flex-shrink-0">⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email Address</label>
              <input
                id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required disabled={loading}
                className="input-glow w-full h-12 px-4 rounded-xl text-sm text-white placeholder-white/20 disabled:opacity-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-xs font-bold text-white/50 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required disabled={loading}
                  className="input-glow w-full h-12 px-4 pr-12 rounded-xl text-sm text-white placeholder-white/20 disabled:opacity-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-neon w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 disabled:opacity-60 group mt-2"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                : <><span>Sign In</span><ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/25">don't have an account?</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <Link href="/auth/signup">
            <button className="btn-glass w-full h-11 rounded-xl font-semibold text-sm text-white/65 hover:text-white flex items-center justify-center gap-2">
              Create Free Account
            </button>
          </Link>

          <div className="flex items-center justify-center gap-5 pt-1">
            {[{ icon: Shield, label: 'SSL secured' }, { icon: Sparkles, label: 'AI powered' }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-white/25">
                <Icon className="h-3 w-3" /><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
