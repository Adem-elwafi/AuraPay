import { ShieldCheck, Zap, Lock, ArrowUpRight } from 'lucide-react'
import EliteCard from './EliteCard'

export default function CosmicShowcase() {
  return (
    <div className="relative hidden h-full w-full select-none overflow-hidden bg-[#031713] text-white lg:flex lg:flex-col lg:justify-between p-10 xl:p-14">
      {/* Background Ambient Radiance & Concentric Orbits (Vaultis Emerald Luxe) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft luxury emerald glows */}
        <div className="absolute -left-20 -top-20 h-[480px] w-[480px] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute -bottom-24 -right-20 h-[520px] w-[520px] rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-emerald-700/10 blur-[140px]" />

        {/* Subtle geometric grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #34d399 1px, transparent 1px), linear-gradient(to bottom, #34d399 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient concentric orbital rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full border border-emerald-500/10" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full border border-dashed border-emerald-500/15" />
      </div>

      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/60 px-3.5 py-1 text-[12px] font-medium text-emerald-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Infrastructure Haute Disponibilité
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Certifié SOC2 Type II</span>
        </div>
      </div>

      {/* Main Center Content: Editorial Headline + 3D EliteCard */}
      <div className="my-auto max-w-lg mx-auto w-full space-y-6">
        <div>
          <h2 className="font-display text-4xl xl:text-5xl font-normal leading-[1.08] tracking-tight text-white">
            Votre patrimoine,
            <br />
            <span className="italic bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              à portée de main.
            </span>
          </h2>
          <p className="mt-3 text-sm text-slate-300/90 leading-relaxed">
            Comptes multidevises, cartes virtuelles et transferts instantanés protégés par un chiffrement de niveau bancaire.
          </p>
        </div>

        {/* Card Showcase with Floating Telemetry Chips */}
        <div className="relative pt-2">
          {/* 3D Tilted Elite Card */}
          <div className="relative transition-transform duration-500 hover:scale-[1.02]">
            <EliteCard
              balance={84250}
              walletId="SW-4 8210 7731 5"
              holder="Membre Elite"
              expiry="12/29"
              tier="Vaultis Black Edition"
              className="shadow-[0_25px_50px_-12px_rgba(4,47,38,0.7),0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/20"
            />
          </div>

          {/* Floating Chip: Instant Transfer */}
          <div className="absolute -top-3 -right-3 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-slate-950/80 px-3.5 py-2 shadow-xl backdrop-blur-xl">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400">Virements SEPA</p>
              <p className="text-xs font-bold text-white">99,8 % instantanés</p>
            </div>
          </div>

          {/* Floating Chip: Live Transaction */}
          <div className="absolute -bottom-3 -left-3 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-slate-950/80 px-3.5 py-2 shadow-xl backdrop-blur-xl">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-teal-500/20 text-teal-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400">Dernier virement reçu</p>
              <p className="text-xs font-bold text-emerald-400">+4 850,00 €</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Highlights (No scroll, compact) */}
      <div className="grid grid-cols-3 gap-3 border-t border-emerald-500/15 pt-4 text-center">
        <div className="rounded-xl bg-emerald-950/30 p-2 border border-emerald-500/10">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Frais de compte</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">0,00 €</p>
        </div>
        <div className="rounded-xl bg-emerald-950/30 p-2 border border-emerald-500/10">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Membres Actifs</p>
          <p className="text-sm font-bold text-white mt-0.5">2,5 M+</p>
        </div>
        <div className="rounded-xl bg-emerald-950/30 p-2 border border-emerald-500/10">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sécurité</p>
          <p className="text-sm font-bold text-teal-300 mt-0.5 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> AES-256
          </p>
        </div>
      </div>
    </div>
  )
}
