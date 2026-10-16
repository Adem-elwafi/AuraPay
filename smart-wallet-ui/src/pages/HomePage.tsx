import { useState, useMemo, useRef, type CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Wallet,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  Plus,
  ShieldCheck,
  Zap,
  CalendarClock,
  Menu,
  X,
  Signal,
  Wifi,
  BatteryFull,
  Nfc,
  Home,
  BarChart3,
  CreditCard,
  User,
  Check,
  Send,
  Lock,
} from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

/* ------------------------------------------------------------------ */
/*  Emerald Luxury Theme Tokens                                       */
/* ------------------------------------------------------------------ */
const THEME_VARS: Record<string, string> = {
  '--accent': '#10B981',
  '--accent-light': '#6EE7B7',
  '--accent-ink': '#022C22',
  '--accent-soft': '#ECFDF5',
  '--accent-text': '#047857',
  '--accent-15': 'rgba(16,185,129,0.15)',
  '--accent-20': 'rgba(16,185,129,0.20)',
  '--accent-25': 'rgba(16,185,129,0.25)',
  '--accent-30': 'rgba(16,185,129,0.30)',
  '--accent-40': 'rgba(16,185,129,0.40)',
  '--aura-1': 'rgba(16,185,129,0.20)',
  '--aura-2': 'rgba(110,231,183,0.08)',
}

const FOG_STOPS = [
  '#062A22 0%',
  '#06302A 40%',
  '#073328 60%',
  '#0A3B30 66%',
  '#16473C 71%',
  '#386559 76%',
  '#7FA299 81%',
  '#C9DCD5 86%',
  'rgba(255,255,255,0.85) 89%',
  '#F6FAF8 92%',
  '#FFFFFF 95%',
]

/* ------------------------------------------------------------------ */
/*  Recent Transfers Data                                             */
/* ------------------------------------------------------------------ */
const TRANSFERS = [
  { name: 'Sophie Laurent', meta: 'Transfer · 2 min ago', amount: '-$1,250.00', in: false, status: 'Completed' },
  { name: 'Marcus Chen', meta: 'Received · 18 min ago', amount: '+$3,400.00', in: true, status: 'Instant' },
  { name: 'Atelier Noir', meta: 'Card · Today', amount: '-$486.20', in: false, status: 'Completed' },
]

/* ------------------------------------------------------------------ */
/*  Distribution Section Features Data                                */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: Zap,
    title: 'Instant transfers',
    body: 'Send to anyone, anywhere — funds settle in seconds, not business days.',
  },
  {
    icon: CalendarClock,
    title: 'Scheduled distributions',
    body: 'Automate payroll, allowances and recurring payouts with one set-and-forget rule.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-grade protection',
    body: 'Biometric approvals, end-to-end encryption and real-time fraud monitoring.',
  },
]

/* ------------------------------------------------------------------ */
/*  Logo Component                                                    */
/* ------------------------------------------------------------------ */
function BrandLogo({ dark = true }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] shadow-[0_0_20px_var(--aura-1)] transition-transform group-hover:scale-105">
        <Wallet className="h-4 w-4 text-[var(--accent-ink)]" strokeWidth={2.4} />
      </span>
      <span
        className={`text-[13px] font-semibold uppercase tracking-[0.22em] transition-colors ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        SmartWallet
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  1 · Floating Glass Navigation                                     */
/* ------------------------------------------------------------------ */
function Navbar({ hasToken }: { hasToken: boolean }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'Product', href: '#features' },
    { label: 'Solutions', href: '#features' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
  ]

  const handleNavClick = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/15 bg-[#05211b]/70 py-2.5 pl-5 pr-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <BrandLogo dark={true} />

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="rounded-full px-4 py-2 text-sm text-[#D4D4D8] transition duration-300 hover:bg-white/[0.06] hover:text-white hover:[text-shadow:0_0_14px_rgba(255,255,255,0.55)] cursor-pointer"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {hasToken ? (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)] shadow-[0_0_24px_var(--aura-1)] transition hover:brightness-110 cursor-pointer"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="hidden rounded-full px-4 py-2 text-sm text-[#D4D4D8] transition hover:text-white sm:inline-flex cursor-pointer"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="hidden rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)] shadow-[0_0_24px_var(--aura-1)] transition hover:brightness-110 sm:inline-flex cursor-pointer"
              >
                Get Started
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10 md:hidden cursor-pointer"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-white/[0.12] bg-black/85 p-4 backdrop-blur-2xl md:hidden shadow-2xl">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(link.href)
              }}
              className="block rounded-2xl px-4 py-3 text-[#D4D4D8] hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
            {hasToken ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/dashboard')
                }}
                className="block w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-center font-semibold text-[var(--accent-ink)]"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate('/login')
                  }}
                  className="block w-full rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/5"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate('/register')
                  }}
                  className="block w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-center font-semibold text-[var(--accent-ink)]"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  2 · Concentric Orbital Network                                    */
/* ------------------------------------------------------------------ */
function Orbits() {
  const rings = [
    { size: 460, dashed: false, dots: [35, 215], cls: 'sw-orbit' },
    { size: 700, dashed: true, dots: [120, 300], cls: 'sw-orbit-r' },
    { size: 960, dashed: false, dots: [70, 250], cls: 'sw-orbit' },
    { size: 1240, dashed: true, dots: [160], cls: 'sw-orbit-r' },
  ]

  return (
    <div
      aria-hidden="true"
      data-parallax="radar"
      className="orbit-network pointer-events-none absolute left-1/2 top-[40%] h-[1240px] w-[1240px] -translate-x-1/2 -translate-y-1/2 opacity-25 [mask-image:radial-gradient(circle,black_40%,transparent_70%)]"
    >
      {rings.map(({ size, dashed, dots, cls }) => (
        <div
          key={size}
          className={`orbit-ring absolute left-1/2 top-1/2 rounded-full border border-white ${
            dashed ? 'border-dashed' : ''
          } ${cls}`}
          style={{ width: size, height: size, transform: 'translate(-50%,-50%)' }}
        >
          {dots.map((deg) => (
            <span
              key={deg}
              className="orbit-node absolute left-1/2 top-1/2 h-0 w-0"
              style={{ transform: `rotate(${deg}deg) translateX(${size / 2}px)` }}
            >
              <span className="sw-glow absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[var(--accent-light)] shadow-[0_0_12px_4px_var(--accent)]" />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  3 · Phone Screen Inside Mockup                                    */
/* ------------------------------------------------------------------ */
function PhoneScreen() {
  const navigate = useNavigate()

  return (
    <div className="font-ui relative h-full w-full overflow-hidden rounded-[2.6rem] bg-[#0B0B0E] text-white">
      {/* Screen glow */}
      <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--aura-1)] blur-3xl pointer-events-none" />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-7 pt-4 text-[11px] font-semibold text-zinc-300">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <BatteryFull className="h-4 w-4" />
        </span>
      </div>

      {/* Dynamic island */}
      <div className="absolute left-1/2 top-2.5 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black shadow-inner" />

      <div className="relative px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] text-[11px] font-bold text-[var(--accent-ink)] ring-2 ring-white/10">
              AR
            </div>
            <div className="leading-tight">
              <p className="text-[10px] text-zinc-400">Good evening</p>
              <p className="text-[13px] font-semibold">Alex Rivera</p>
            </div>
          </div>
          <button
            type="button"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-zinc-300" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </button>
        </div>

        {/* Balance */}
        <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-zinc-400">Total Balance</p>
        <div className="mt-1 flex items-end gap-2">
          <p className="text-[30px] font-semibold tracking-tight text-white">$80,769.00</p>
          <span className="mb-1.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
            +2.4%
          </span>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] py-2.5 text-[12px] font-semibold text-[var(--accent-ink)] shadow-[0_4px_16px_var(--aura-1)] transition hover:brightness-110 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} /> Deposit
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-1.5 rounded-full bg-zinc-800/90 py-2.5 text-[12px] font-semibold ring-1 ring-white/10 transition hover:bg-zinc-800 cursor-pointer"
          >
            <ArrowUpRight className="h-3.5 w-3.5" /> Withdraw
          </button>
        </div>

        {/* Card */}
        <div className="relative mt-5 h-[148px] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#FDE68A_0%,#F59E0B_38%,#B45309_72%,#78350F_100%)] p-4 text-[#1C1203] shadow-[0_16px_40px_-12px_rgba(245,158,11,0.6)]">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/25 blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_14px,rgba(255,255,255,0.06)_14px_15px)] pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] opacity-70">SmartWallet</p>
              <p className="font-display text-[19px] italic leading-tight">Elite Gold</p>
            </div>
            <Nfc className="h-5 w-5 opacity-70" />
          </div>
          {/* Card Chip */}
          <div className="relative mt-3 h-7 w-9 rounded-md bg-[linear-gradient(135deg,#FEF3C7,#D4A017_60%,#A16207)] ring-1 ring-black/10">
            <div className="absolute inset-x-1.5 top-1/2 h-px bg-black/20" />
            <div className="absolute inset-y-1 left-1/2 w-px bg-black/20" />
          </div>
          <div className="relative mt-3 flex items-end justify-between">
            <p className="font-mono text-[12px] tracking-[0.18em]">•••• •••• •••• 4821</p>
            <div className="flex -space-x-2">
              <span className="h-5 w-5 rounded-full bg-black/60" />
              <span className="h-5 w-5 rounded-full bg-black/30" />
            </div>
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">Recent transfers</p>
          <p className="text-[11px] text-[var(--accent-light)] font-medium">See all</p>
        </div>
        <ul className="mt-2.5 space-y-2">
          {TRANSFERS.map((t) => (
            <li
              key={t.name}
              className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-2.5 ring-1 ring-white/[0.06]"
            >
              <div
                className={`grid h-8 w-8 place-items-center rounded-full ${
                  t.in ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.07] text-zinc-300'
                }`}
              >
                {t.in ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-white">{t.name}</p>
                <p className="text-[10px] text-zinc-500">{t.meta}</p>
              </div>
              <div className="text-right">
                <p className={`text-[12px] font-semibold ${t.in ? 'text-emerald-400' : 'text-zinc-200'}`}>
                  {t.amount}
                </p>
                <p className="flex items-center justify-end gap-1 text-[9px] text-zinc-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      t.status === 'Instant' ? 'bg-[var(--accent)]' : 'bg-emerald-400'
                    }`}
                  />
                  {t.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab bar */}
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-around rounded-full bg-white/[0.06] py-3 ring-1 ring-white/10 backdrop-blur">
        <Home className="h-4 w-4 text-[var(--accent-light)]" />
        <BarChart3 className="h-4 w-4 text-zinc-500" />
        <CreditCard className="h-4 w-4 text-zinc-500" />
        <User className="h-4 w-4 text-zinc-500" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  4 · Central iPhone 16 Pro 3D Mockup                               */
/* ------------------------------------------------------------------ */
function PhoneMockup() {
  return (
    <div
      className="hero-phone-wrap relative mx-auto w-[300px] sm:w-[330px] [perspective:2200px]"
      data-parallax="phone-wrap"
    >
      <div className="sw-float">
        <div
          className="hero-phone relative h-[640px] sm:h-[690px] [transform:rotateX(8deg)_rotateY(-10deg)_rotateZ(1deg)] [transform-style:preserve-3d] [mask-image:linear-gradient(to_bottom,black_64%,transparent_96%)] [-webkit-mask-image:linear-gradient(to_bottom,black_64%,transparent_96%)]"
          data-parallax="phone"
        >
          {/* Titanium Frame */}
          <div className="absolute inset-0 rounded-[3.1rem] bg-[linear-gradient(145deg,#5B5B63_0%,#2A2A30_30%,#1A1A1F_60%,#4A4A52_100%)] p-[10px] shadow-[0_50px_120px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.25)]">
            <div className="h-full w-full rounded-[2.65rem] bg-black p-[3px]">
              <PhoneScreen />
            </div>
          </div>
          {/* Side Buttons */}
          <span className="absolute -left-[3px] top-32 h-16 w-[3px] rounded-l bg-zinc-600" />
          <span className="absolute -left-[3px] top-52 h-16 w-[3px] rounded-l bg-zinc-600" />
          <span className="absolute -right-[3px] top-40 h-24 w-[3px] rounded-r bg-zinc-600" />
          {/* Glass Reflection */}
          <div className="pointer-events-none absolute inset-0 rounded-[3.1rem] bg-[linear-gradient(115deg,rgba(255,255,255,0.14)_0%,transparent_28%,transparent_70%,rgba(255,255,255,0.05)_100%)]" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  5 · Floating Micro-Cards                                          */
/* ------------------------------------------------------------------ */
function FloatingCards() {
  return (
    <>
      {/* Top-left — Frosted dark glass */}
      <div
        data-parallax="card-1"
        className="floating-card-1 absolute left-[4%] top-[8%] hidden w-[230px] lg:block xl:left-[10%]"
      >
        <div className="sw-float-2 rounded-2xl border border-white/[0.12] bg-white/[0.06] p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-15)] ring-1 ring-[var(--accent-30)]">
            <Sparkles className="h-4 w-4 text-[var(--accent-light)]" />
          </span>
          <p className="font-display mt-3 text-[22px] leading-[1.1] text-white">The Future of Payments, Today</p>
          <p className="mt-1.5 text-[11px] text-zinc-400">Instant · Borderless · Secure</p>
        </div>
      </div>

      {/* Right — Metric card */}
      <div
        data-parallax="card-2"
        className="floating-card-2 absolute right-[4%] top-[24%] hidden w-[240px] lg:block xl:right-[10%]"
      >
        <div className="sw-float-3 rounded-2xl border border-white/[0.12] bg-black/40 p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] text-zinc-300">
              <Zap className="h-3.5 w-3.5 text-[var(--accent-light)]" /> Transfer Speed
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              Live
            </span>
          </div>
          <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">
            99.8% <span className="text-[14px] font-medium text-zinc-400">Instant</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[99.8%] rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)]" />
          </div>
        </div>
      </div>

      {/* Bottom-left — Sits in the fog, transitions to light frosted glass */}
      <div
        data-parallax="card-3"
        className="floating-card-3 absolute bottom-[30%] left-[6%] hidden lg:flex xl:left-[13%]"
      >
        <div className="sw-float flex items-center gap-3 rounded-full border border-white/70 bg-white/75 py-2 pl-2 pr-5 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl">
          <div className="flex -space-x-2.5">
            {['#10B981', '#062A22', '#0A3B30', '#34D399'].map((color, i) => (
              <span
                key={color}
                className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white"
                style={{ background: color }}
              >
                {['JL', 'MK', 'SA', 'RT'][i]}
              </span>
            ))}
          </div>
          <div className="leading-tight">
            <p className="flex items-center gap-1 text-[12px] font-semibold text-slate-900">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-text)]" /> Secured Transactions
            </p>
            <p className="text-[11px] text-zinc-500">2.5M+ active users</p>
          </div>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  6 · Hero Section with Multi-Stop Fog Transition                   */
/* ------------------------------------------------------------------ */
function Hero({ hasToken }: { hasToken: boolean }) {
  const navigate = useNavigate()

  const heroBackground = [
    'radial-gradient(55% 38% at 50% 14%, var(--aura-1), transparent 70%)',
    'radial-gradient(30% 28% at 82% 38%, var(--aura-2), transparent 70%)',
    'radial-gradient(28% 26% at 16% 30%, var(--aura-2), transparent 70%)',
    `linear-gradient(180deg, ${FOG_STOPS.join(', ')})`,
  ].join(', ')

  return (
    <section
      id="hero"
      className="hero-section relative isolate overflow-hidden pt-36 sm:pt-40"
      style={{ background: heroBackground }}
    >
      {/* Subtle photographic grain for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Copy */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <a
          href="#features"
          onClick={(e) => {
            e.preventDefault()
            document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="hero-badge group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] py-1.5 pl-2 pr-3.5 text-[13px] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_30px_var(--aura-2)] backdrop-blur-md transition hover:border-[var(--accent-40)]"
          data-motion="badge"
        >
          <span className="whitespace-nowrap rounded-full bg-[var(--accent-15)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent-light)]">
            ✨ New
          </span>
          <span className="whitespace-nowrap">
            <span className="hidden sm:inline">The Next Standard in </span>Wealth Companion
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 text-[var(--accent-light)]" />
        </a>

        <h1
          className="hero-headline font-display mt-7 text-5xl leading-[1.05] tracking-[-0.01em] text-white [text-shadow:0_2px_40px_rgba(255,255,255,0.12)] sm:text-6xl md:text-7xl"
          data-motion="headline"
        >
          The Quick Way to Manage <br className="hidden sm:block" />
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-light)] via-[var(--accent)] to-[var(--accent-light)]">
            Modern Wealth
          </span>
        </h1>

        <p
          className="hero-subhead mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#A1A1AA] sm:text-lg"
          data-motion="subhead"
        >
          One elegant wallet for every account, card and transfer — with private-bank security and payments that settle
          the moment you tap send.
        </p>

        <div className="hero-cta mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" data-motion="cta">
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] transition hover:bg-zinc-100 sm:w-auto cursor-pointer"
          >
            Explore Features <ArrowRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => navigate(hasToken ? '/dashboard' : '/register')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-[var(--accent-ink)] shadow-[0_10px_40px_-8px_var(--accent)] transition hover:brightness-110 sm:w-auto cursor-pointer"
          >
            {hasToken ? 'Open Dashboard' : 'Get Started'} <ArrowDownLeft className="h-4 w-4 rotate-[-90deg]" />
          </button>
        </div>
      </div>

      {/* Centerpiece Visual */}
      <div className="relative mx-auto mt-16 max-w-7xl px-4 pb-0 sm:mt-20">
        <Orbits />
        <FloatingCards />
        <PhoneMockup />
      </div>

      {/* Fog Layers: Multi-stop diffuse mist that seamlessly dissolves the phone base into Section 2 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.9), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-10%] bottom-[-6%] h-[22%] rounded-[50%] bg-white blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white"
      />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  7 · Transfer Mockup Inside Section 2                              */
/* ------------------------------------------------------------------ */
function TransferMockup({ hasToken }: { hasToken: boolean }) {
  const navigate = useNavigate()

  return (
    <div className="transfer-mockup relative mx-auto w-full max-w-[520px]" data-motion="mockup">
      <div className="absolute inset-6 -z-10 rounded-[2.5rem] bg-[var(--accent-20)] blur-3xl pointer-events-none" />
      <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-white p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] sm:p-8">
        {/* Floating Platinum Card */}
        <div className="relative mx-auto h-[190px] w-[88%] -rotate-[4deg] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#27272A_0%,#09090B_60%,#18181B_100%)] p-5 text-white shadow-[0_24px_50px_-18px_rgba(9,9,11,0.7)] transition-transform duration-500 hover:rotate-0">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[var(--accent-30)] blur-3xl pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">SmartWallet</p>
              <p className="font-display text-2xl italic text-white">Platinum</p>
            </div>
            <Nfc className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="relative mt-4 h-8 w-11 rounded-md bg-[linear-gradient(135deg,#FEF3C7,#D4A017_60%,#A16207)]" />
          <p className="relative mt-4 font-mono text-sm tracking-[0.2em] text-zinc-300">•••• •••• •••• 9032</p>
        </div>

        {/* Send Money Widget */}
        <div className="relative -mt-10 rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.3)] backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Send money</p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              No fees
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {[
              ['SL', '#10B981'],
              ['MC', '#0F172A'],
              ['AN', '#64748B'],
            ].map(([initials, color], i) => (
              <span
                key={initials}
                className={`grid h-10 w-10 place-items-center rounded-full text-xs font-semibold text-white shadow-sm ${
                  i === 0 ? 'ring-2 ring-[var(--accent)] ring-offset-2' : ''
                }`}
                style={{ background: color }}
              >
                {initials}
              </span>
            ))}
            <span className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:border-zinc-400 transition-colors cursor-pointer">
              <Plus className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between rounded-xl bg-zinc-50 px-4 py-3">
            <div>
              <p className="text-[11px] text-zinc-500">To Sophie Laurent</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">$2,500.00</p>
            </div>
            <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" /> Arrives instantly
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(hasToken ? '/dashboard' : '/login')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer shadow-md"
          >
            <Send className="h-4 w-4" /> Send now
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  8 · Section 2 — Streamlined Wealth Distribution                   */
/* ------------------------------------------------------------------ */
function DistributionSection({ hasToken }: { hasToken: boolean }) {
  const navigate = useNavigate()

  return (
    <section id="features" className="distribution-section relative bg-white px-4 pb-28 pt-8 sm:pt-12">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-25)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--accent-text)]">
          <Send className="h-3.5 w-3.5" /> Payment Transfers
        </span>
        <h2
          className="distribution-heading font-display mt-6 text-4xl leading-[1.08] text-slate-900 sm:text-5xl md:text-6xl"
          data-motion="distribution-header"
        >
          Streamlined Wealth Distribution, <span className="italic">Hassle-Free</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base text-zinc-500 sm:text-lg">
          Send funds quickly, any way you like with zero friction.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl items-center gap-14 lg:mt-20 lg:grid-cols-2 lg:gap-20">
        <div>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="feature-item group flex gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-zinc-200 hover:bg-zinc-50/70"
                data-motion="feature-item"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)] ring-1 ring-[var(--accent-20)] transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-zinc-500">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3 pl-4">
            <button
              type="button"
              onClick={() => navigate(hasToken ? '/dashboard' : '/register')}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer shadow-md"
            >
              Start a transfer <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#security"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#security')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-semibold text-slate-900 hover:text-[var(--accent-text)] cursor-pointer"
            >
              See how it works <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <TransferMockup hasToken={hasToken} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  9 · Security & Value Proposition Section                          */
/* ------------------------------------------------------------------ */
function SecuritySection() {
  return (
    <section id="security" className="relative border-t border-zinc-100 bg-zinc-50/50 px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-3">
          <div data-motion="security-card" className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)] ring-1 ring-[var(--accent-25)]">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-6 text-2xl text-slate-900">Private Bank Security</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              JWT authenticated sessions, encrypted payload transfers, and instant tamper detection built from the ground up.
            </p>
          </div>

          <div data-motion="security-card" className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)] ring-1 ring-[var(--accent-25)]">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-6 text-2xl text-slate-900">Sub-second Settlement</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Internal SW transfers resolve immediately with zero intermediary hold times and verified ledger balancing.
            </p>
          </div>

          <div data-motion="security-card" className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)] ring-1 ring-[var(--accent-25)]">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-6 text-2xl text-slate-900">Precision Analytics</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Live account balance tracking, categorized expense flows, and predictive wealth trajectories at your fingertips.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  10 · Luxury Footer                                                */
/* ------------------------------------------------------------------ */
function Footer({ hasToken }: { hasToken: boolean }) {
  const navigate = useNavigate()

  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <BrandLogo dark={false} />
            <p className="mt-3 max-w-md text-sm text-zinc-500">
              The next standard in modern wealth management. Private-bank security, borderless transfers, and an
              unrivaled digital experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-600">
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#security"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#security')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Security
            </a>
            {hasToken ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="font-medium text-[var(--accent-text)] hover:underline cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-medium text-[var(--accent-text)] hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 text-xs text-zinc-400 sm:flex-row">
          <p>© {new Date().getFullYear()} SmartWallet Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-zinc-600 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const hasToken = useMemo(() => Boolean(localStorage.getItem('token')), [])
  const containerRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      // Respect user accessibility preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      // 1 · Concentric Radar Rings Parallax Scrub
      gsap.to('[data-parallax="radar"]', {
        scale: 1.15,
        opacity: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // 2 · Hero iPhone 3D Mockup Parallax Tilt & Translation Scrub
      gsap.set('[data-parallax="phone"]', {
        rotateX: 8,
        rotateY: -10,
        rotateZ: 1,
        transformPerspective: 2200,
      })

      gsap.to('[data-parallax="phone"]', {
        rotateX: 14,
        rotateY: -6,
        rotateZ: 0,
        scale: 0.98,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.to('[data-parallax="phone-wrap"]', {
        y: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // 3 · Floating Micro-Cards Differential Parallax Speed
      gsap.to('[data-parallax="card-1"]', {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      gsap.to('[data-parallax="card-2"]', {
        y: -90,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      gsap.to('[data-parallax="card-3"]', {
        y: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      // 4 · Section 2: Distribution Reveal Orchestration
      const sec2Tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#features',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })

      sec2Tl
        .from('[data-motion="distribution-header"]', {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
        })
        .from(
          '[data-motion="feature-item"]',
          {
            opacity: 0,
            y: 25,
            duration: 0.65,
            stagger: 0.14,
            ease: 'power2.out',
          },
          '-=0.4'
        )
        .from(
          '[data-motion="mockup"]',
          {
            opacity: 0,
            y: 35,
            scale: 0.96,
            duration: 0.75,
            ease: 'power2.out',
          },
          '-=0.5'
        )

      // 5 · Section 3: Security Cards Staggered Reveal
      gsap.from('[data-motion="security-card"]', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#security',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="font-ui min-h-screen bg-white antialiased selection:bg-[var(--accent)] selection:text-[var(--accent-ink)]"
      style={THEME_VARS as CSSProperties}
    >
      <Navbar hasToken={hasToken} />
      <main>
        <Hero hasToken={hasToken} />
        <DistributionSection hasToken={hasToken} />
        <SecuritySection />
      </main>
      <Footer hasToken={hasToken} />
    </div>
  )
}