'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, TrendingUp, TrendingDown, Zap, Target, BarChart3,
  Sparkles, Brain, Shield, Mic, Users, Receipt, ChevronRight,
  Star, Globe, Lock, LineChart
} from 'lucide-react';

/* ── Animated counter ───────────────────────────── */
function Counter({ to, duration = 2000, prefix = '', suffix = '' }: { to: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCount(Math.round(eased * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Floating Particles ─────────────────────────── */
function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    dur: 15 + Math.random() * 25,
    delay: Math.random() * 10,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-indigo-400"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            opacity: p.opacity,
            animation: `float-orb ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated Ticker ────────────────────────────── */
const TICKERS = [
  { symbol: 'BTC', price: '67,423', change: '+2.4%', up: true },
  { symbol: 'AAPL', price: '189.50', change: '+0.8%', up: true },
  { symbol: 'NET', price: '89.12', change: '-1.2%', up: false },
  { symbol: 'ETH', price: '3,812', change: '+3.1%', up: true },
  { symbol: 'SPY', price: '512.40', change: '+0.3%', up: true },
  { symbol: 'NVDA', price: '875.90', change: '+4.2%', up: true },
];

function Ticker() {
  return (
    <div className="overflow-hidden border-y border-white/5 bg-black/20 backdrop-blur-sm py-2">
      <div className="flex gap-10 ticker-scroll">
        {[...TICKERS, ...TICKERS].map((t, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
            <span className="text-xs font-bold text-white/70">{t.symbol}</span>
            <span className="text-xs font-semibold text-white">${t.price}</span>
            <span className={`text-[10px] font-bold ${t.up ? 'text-emerald-400' : 'text-red-400'}`}>{t.change}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .ticker-scroll {
          animation: ticker 30s linear infinite;
          width: max-content;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ── Feature Card ───────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, glow, delay }: any) {
  return (
    <div
      className={`bento-card p-6 fade-up glass-hover ${delay}`}
      style={{ boxShadow: `0 0 0 0 transparent` }}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}
        style={{ boxShadow: glow }}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-base text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────── */
function StatCard({ value, label, prefix, suffix }: any) {
  return (
    <div className="text-center">
      <div className="text-4xl font-black gradient-text-primary mb-1">
        <Counter to={value} prefix={prefix} suffix={suffix} />
      </div>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  );
}

/* ── Dashboard Preview Card ─────────────────────── */
function DashboardPreview() {
  return (
    <div className="glass rounded-2xl p-4 w-full max-w-lg mx-auto overflow-hidden">
      {/* Mini header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/30 flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-white/70">Portfolio Overview</span>
        </div>
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 beacon" />
          Live
        </span>
      </div>

      {/* Mini KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Net Worth', value: '$142,380', up: true },
          { label: 'This Month', value: '+$2,841', up: true },
          { label: 'Saved', value: '28.4%', up: true },
        ].map(({ label, value, up }) => (
          <div key={label} className="glass-sm rounded-xl p-3">
            <p className="text-[9px] text-white/40 uppercase font-bold mb-1">{label}</p>
            <p className="text-sm font-extrabold text-white">{value}</p>
            <p className={`text-[9px] font-bold mt-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>▲ 8.2%</p>
          </div>
        ))}
      </div>

      {/* Chart bars */}
      <div className="mb-4">
        <p className="text-[9px] text-white/30 uppercase font-bold mb-2">Spending vs Income</p>
        <div className="flex items-end gap-1 h-20">
          {[65, 80, 45, 70, 90, 55, 85, 60, 75, 95, 50, 88].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full rounded-t-sm" style={{ height: `${h * 0.8}%`, background: 'oklch(0.66 0.24 268 / 0.5)' }} />
              <div className="w-full rounded-t-sm" style={{ height: `${h * 0.5}%`, background: 'oklch(0.62 0.26 160 / 0.5)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Budget pills */}
      <div className="space-y-2">
        {[
          { label: 'Groceries', pct: 68, color: 'bg-indigo-500' },
          { label: 'Entertainment', pct: 42, color: 'bg-violet-500' },
          { label: 'Transport', pct: 91, color: 'bg-rose-500' },
        ].map(({ label, pct, color }) => (
          <div key={label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[10px] text-white/50">{label}</span>
              <span className="text-[10px] text-white/70 font-semibold">{pct}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────── */
export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">

      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
      </div>

      {/* Radial cursor follow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, oklch(0.66 0.24 268 / 0.04) 0%, transparent 70%)`,
        }}
      />

      <ParticleField />

      {/* ── Ticker ─────────────────────────────── */}
      <Ticker />

      {/* ── Navigation ─────────────────────────── */}
      <nav className="sticky top-0 z-50 glass-sm border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <TrendingUp className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">FinSentinel</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Blog', 'Docs'].map(item => (
              <a key={item} href="#" className="text-sm text-white/55 hover:text-white transition-colors animated-underline">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <button className="btn-glass px-4 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="btn-neon px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8 fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-sm border border-indigo-500/25 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              AI-Powered Finance Management
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 beacon" />
            </div>

            <h1 className="text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-white">
              Your money,
              <br />
              <span className="gradient-text-primary glow-text-primary">intelligently</span>
              <br />
              managed.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-lg">
              FinSentinel combines AI insights, voice entry, investment tracking, and family budgeting into one stunning, unified financial experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <button className="btn-neon w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2.5 group">
                  <span>Start for Free</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/auth/signin">
                <button className="btn-glass w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-semibold text-white/75 flex items-center justify-center gap-2">
                  <span>View Dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                  <div key={l} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `oklch(${0.55 + i * 0.04} 0.22 ${200 + i * 30})` }}>
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {Array(5).fill(0).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-white/40">Trusted by <strong className="text-white/60">12,000+</strong> users</p>
              </div>
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div className="relative fade-up fade-up-delay-1">
            <div className="absolute -inset-8 bg-indigo-500/10 rounded-3xl blur-3xl" />
            <DashboardPreview />

            {/* Floating badges */}
            <div className="absolute -left-6 top-16 glass rounded-xl px-3 py-2 flex items-center gap-2 border border-white/10 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/40">Portfolio</p>
                <p className="text-xs font-bold text-emerald-400">+14.2%</p>
              </div>
            </div>

            <div className="absolute -right-6 bottom-24 glass rounded-xl px-3 py-2 flex items-center gap-2 border border-white/10" style={{ animation: 'float-orb 5s ease-in-out infinite' }}>
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/40">AI Insight</p>
                <p className="text-xs font-bold text-violet-300">Reduce dining 15%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard to={12000} suffix="+" label="Active users" />
          <StatCard to={98} suffix="%" label="Uptime guaranteed" />
          <StatCard prefix="$" to={2} suffix="B+" label="Tracked annually" />
          <StatCard to={4} suffix=".9/5" label="Average rating" />
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-sm border border-white/10 text-xs font-semibold text-white/50 mb-5">
            <Zap className="h-3 w-3" /> Everything you need
          </div>
          <h2 className="text-5xl font-black text-white mb-4">
            Finance, at its most<br />
            <span className="gradient-text-primary">intelligent</span>
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Every feature is designed to give you complete financial clarity with zero effort.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={Brain} title="AI-Powered Insights"
            desc="Machine learning models analyze your spending patterns and deliver actionable, personalized recommendations."
            color="bg-indigo-500/15 text-indigo-400"
            glow="0 0 20px oklch(0.66 0.24 268 / 0.25)"
            delay="fade-up-delay-1"
          />
          <FeatureCard
            icon={Mic} title="Voice Entry"
            desc='Log transactions hands-free. Just say "Spent $25 on lunch" and let AI handle the rest.'
            color="bg-violet-500/15 text-violet-400"
            glow="0 0 20px oklch(0.72 0.20 310 / 0.25)"
            delay="fade-up-delay-2"
          />
          <FeatureCard
            icon={LineChart} title="Investment Tracker"
            desc="Monitor your stock, ETF, and crypto portfolio with real-time gain/loss calculations and allocation analytics."
            color="bg-emerald-500/15 text-emerald-400"
            glow="0 0 20px oklch(0.62 0.26 160 / 0.25)"
            delay="fade-up-delay-1"
          />
          <FeatureCard
            icon={Target} title="Smart Goals"
            desc="Set financial goals with AI-projected deadlines that adapt as your income and spending evolve."
            color="bg-pink-500/15 text-pink-400"
            glow="0 0 20px oklch(0.68 0.24 350 / 0.25)"
            delay="fade-up-delay-2"
          />
          <FeatureCard
            icon={Receipt} title="Tax Optimizer"
            desc="Automatically categorize deductible expenses and see your estimated tax savings in real time."
            color="bg-amber-500/15 text-amber-400"
            glow="0 0 20px oklch(0.78 0.22 60 / 0.25)"
            delay="fade-up-delay-1"
          />
          <FeatureCard
            icon={Users} title="Family Sharing"
            desc="Share budgets with family members, track household spending together, and manage shared goals."
            color="bg-cyan-500/15 text-cyan-400"
            glow="0 0 20px oklch(0.72 0.20 210 / 0.25)"
            delay="fade-up-delay-2"
          />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 p-12 text-center" style={{ background: 'linear-gradient(135deg, oklch(0.12 0.04 268) 0%, oklch(0.10 0.03 295) 50%, oklch(0.12 0.04 268) 100%)' }}>
          <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Shield className="h-3 w-3" /> No credit card required
            </div>
            <h2 className="text-5xl font-black text-white">
              Start your financial<br />
              <span className="gradient-text-primary">transformation</span> today.
            </h2>
            <p className="text-white/50 max-w-md mx-auto">
              Join thousands of users who have taken control of their finances with FinSentinel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/auth/signup">
                <button className="btn-neon px-10 py-3.5 rounded-2xl text-base font-bold text-white flex items-center gap-2.5 group">
                  Create Free Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4">
              {[{ icon: Shield, label: 'Bank-grade security' }, { icon: Globe, label: 'Works everywhere' }, { icon: Lock, label: 'Privacy first' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-white/30">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-white/5 glass-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-extrabold text-white/70">FinSentinel</span>
          </div>
          <p className="text-xs text-white/25">© 2026 FinSentinel. All rights reserved. Your intelligent financial guardian.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>

    </main>
  );
}
