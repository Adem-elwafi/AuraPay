import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import AuraBackground from './backgrounds/AuraBackground'
import Logo from './brand/Logo'
import EliteCard from './brand/EliteCard'
import { Pill } from './ui/primitives'

export interface FloatingChipTop {
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  label: string
  value: string
}

export interface FloatingChipBottom {
  avatars?: { label: string; bg: string }[]
  title: string
  subtitle: string
}

export interface ShowcaseCardData {
  balance?: number
  walletId?: string
  holder?: string
  expiry?: string
}

export interface AuthLayoutProps {
  badge?: string
  badgeIcon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title?: ReactNode
  description?: ReactNode
  highlights?: string[]
  cardShowcase?: ShowcaseCardData
  chipTop?: FloatingChipTop
  chipBottom?: FloatingChipBottom
  footerNote?: ReactNode
  children: ReactNode
}

const DEFAULT_CARD: ShowcaseCardData = {
  balance: 80769,
  walletId: 'SW-4 8210 7731 5',
  holder: 'Membre Elite',
  expiry: '12/29',
}

const DEFAULT_AVATARS = [
  { label: 'JL', bg: '#10B981' },
  { label: 'MK', bg: '#065F46' },
  { label: 'SA', bg: '#64748B' },
  { label: 'RT', bg: '#34D399' },
]

export default function AuthLayout({
  badge = 'Espace client sécurisé',
  badgeIcon: BadgeIcon = Sparkles,
  title,
  description = 'Comptes, cartes et virements instantanés réunis dans un seul espace — protégé par une sécurité de niveau bancaire.',
  highlights,
  cardShowcase = DEFAULT_CARD,
  chipTop = {
    icon: Zap,
    label: 'Transferts',
    value: '99,8 % instantanés',
  },
  chipBottom = {
    avatars: DEFAULT_AVATARS,
    title: '2,5 M+ utilisateurs actifs',
    subtitle: 'Transactions sécurisées',
  },
  footerNote = 'Connexion chiffrée de bout en bout',
  children,
}: AuthLayoutProps) {
  const TopChipIcon = chipTop?.icon ?? Zap

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--text)]">
      <AuraBackground variant="auth" />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-8">
        <Logo />
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-[13px] font-medium text-slate-700 shadow-xs backdrop-blur-xl transition hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50/50"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au site
        </Link>
      </header>

      {/* 2-Column Showcase + Glass Card */}
      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-8 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:pt-0">
        {/* Left Column: Brand Story & Showcase */}
        <section className="hidden lg:block" aria-hidden="true">
          <Pill icon={BadgeIcon}>{badge}</Pill>

          <h1 className="font-display mt-6 text-6xl leading-[1.04] tracking-[-0.01em] text-slate-900 xl:text-7xl">
            {title ?? (
              <>
                Votre patrimoine,
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text italic text-transparent">
                  à portée de main.
                </span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-slate-600">
            {description}
          </p>

          {highlights && highlights.length > 0 && (
            <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 text-[13px] leading-snug text-slate-700 shadow-xs backdrop-blur-md"
                >
                  {highlight}
                </div>
              ))}
            </div>
          )}

          {/* 3D Tilted Card + Floating Badges */}
          <div className="relative mt-12 max-w-[460px]">
            <div className="sw-float [perspective:1600px]">
              <EliteCard
                balance={cardShowcase.balance ?? DEFAULT_CARD.balance ?? 80769}
                walletId={cardShowcase.walletId ?? DEFAULT_CARD.walletId ?? 'SW-4 8210 7731 5'}
                holder={cardShowcase.holder ?? DEFAULT_CARD.holder ?? 'Membre Elite'}
                expiry={cardShowcase.expiry ?? DEFAULT_CARD.expiry ?? '12/29'}
                className="[transform:rotateX(10deg)_rotateY(-14deg)_rotateZ(-3deg)] shadow-[0_35px_70px_-20px_rgba(6,78,59,0.35)]"
              />
            </div>

            {/* Floating Chip Top-Right */}
            {chipTop && (
              <div className="sw-float-2 absolute -right-10 -top-14 flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <TopChipIcon className="h-4 w-4 text-emerald-600" />
                <div className="leading-tight">
                  <p className="text-[11px] text-slate-500">{chipTop.label}</p>
                  <p className="text-sm font-bold text-slate-900">{chipTop.value}</p>
                </div>
              </div>
            )}

            {/* Floating Chip Bottom-Left */}
            {chipBottom && (
              <div className="sw-float absolute -bottom-10 -left-6 flex items-center gap-3 rounded-full border border-slate-200/90 bg-white/95 py-2 pl-2 pr-5 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex -space-x-2.5">
                  {(chipBottom.avatars ?? DEFAULT_AVATARS).map((av, i) => (
                    <span
                      key={`${av.label}-${i}`}
                      className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white"
                      style={{ background: av.bg }}
                    >
                      {av.label}
                    </span>
                  ))}
                </div>
                <div className="leading-tight">
                  <p className="text-[12px] font-semibold text-slate-900">{chipBottom.title}</p>
                  <p className="text-[11px] text-slate-500">{chipBottom.subtitle}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Glass Form Container */}
        <section className="sw-rise mx-auto w-full max-w-[460px]">
          {children}

          {footerNote && (
            <p className="mt-6 flex items-center justify-center gap-2 text-[12px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> {footerNote}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}