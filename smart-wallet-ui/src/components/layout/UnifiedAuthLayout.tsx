import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import Logo from '../brand/Logo'
import VaultisMascot from '../brand/VaultisMascot'
import {
  FintechStatsCorner,
  FintechCashFlowCorner,
  FintechBankPattern,
} from '../brand/FintechBackgroundDecor'

interface UnifiedAuthLayoutProps {
  title: string
  subtitle?: string
  type: 'login' | 'register'
  mascotGreeting?: string
  children: ReactNode
}

export default function UnifiedAuthLayout({
  title,
  type,
  mascotGreeting,
  children,
}: UnifiedAuthLayoutProps) {
  const isLogin = type === 'login'

  return (
    <div className="relative min-h-screen w-full bg-[#edf1f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* ========================================================= */}
      {/* ARTISTIC BACKGROUND ACCENTS (Elite Vector Fintech Decor)  */}
      {/* ========================================================= */}
      {/* Bottom-left Cash & Currency Flow Graphic */}
      <FintechCashFlowCorner className="fixed bottom-0 left-0 w-[380px] sm:w-[480px] lg:w-[540px] z-0" />

      {/* Top-right Financial Statistics & Market Growth Graph */}
      <FintechStatsCorner className="fixed top-0 right-0 w-[380px] sm:w-[480px] lg:w-[540px] z-0" />

      {/* Ambient subtle light wash */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5)_0%,transparent_70%)] z-0"
        aria-hidden="true"
      />

      {/* ========================================================= */}
      {/* MAIN SPLIT-CARD CONTAINER (Clean, Rounded-3xl, Shadow-2xl) */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-4xl lg:max-w-[980px] min-h-[580px] lg:min-h-[620px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14),0_10px_25px_-5px_rgba(16,185,129,0.06)] overflow-hidden flex flex-col md:flex-row border border-slate-100">

        {/* ========================================================= */}
        {/* LEFT SECTION: Emerald Panel (Brand Gradient + Mascot + Action) */}
        {/* ========================================================= */}
        <section className="relative w-full md:w-[44%] lg:w-[42%] bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] p-7 sm:p-9 flex flex-col justify-between items-center text-center text-white overflow-hidden">
          {/* Luxury Bank Guilloché & Security Watermark Pattern */}
          <FintechBankPattern className="z-0" />

          {/* Top Brand Logo */}
          <div className="relative z-10 w-full flex items-center justify-between">
            <Logo theme="dark" />
            <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider text-emerald-100/70 uppercase px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-400/20">
              Banque Privée
            </span>
          </div>

          {/* Center Column: Greeting Headline + Subtext + Animated Mascot + Outline Pill Button */}
          <div className="relative z-10 my-auto py-5 sm:py-6 flex flex-col items-center max-w-xs">
            {isLogin ? (
              <>
                <h2 className="text-2xl sm:text-[30px] font-extrabold text-white tracking-tight leading-tight">
                  Bonjour !
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-emerald-50/90 leading-relaxed font-normal">
                  Entrez vos coordonnées et découvrez nos services financiers nouvelle génération.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-[30px] font-extrabold text-white tracking-tight leading-tight">
                  Welcome Back!
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-emerald-50/90 leading-relaxed font-normal">
                  Pour rester connecté avec nous, connectez-vous avec vos identifiants personnels.
                </p>
              </>
            )}

            {/* Elegant Animated Mascot In the Green Section */}
            <div className="my-4 sm:my-5 flex items-center justify-center">
              <VaultisMascot
                greeting={mascotGreeting || (isLogin ? 'Bienvenue !' : 'Ravi de vous revoir !')}
                className="w-full max-w-[210px] sm:max-w-[235px] h-auto"
              />
            </div>

            {/* White Outline Rounded Pill Button */}
            {isLogin ? (
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-10 py-3 rounded-full border-2 border-white text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-emerald-700 transition duration-200 shadow-sm active:scale-95"
              >
                S'INSCRIRE
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-10 py-3 rounded-full border-2 border-white text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-emerald-700 transition duration-200 shadow-sm active:scale-95"
              >
                SE CONNECTER
              </Link>
            )}
          </div>

          {/* Bottom Security Micro-Footnote */}
          <div className="relative z-10 text-[11px] text-emerald-100/75 flex items-center gap-1.5 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
            <span>Sécurité certifiée SOC2 & Chiffrement AES-256</span>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT SECTION: Pure White Panel (Title + Socials + Form) */}
        {/* ========================================================= */}
        <section className="relative w-full md:w-[56%] lg:w-[58%] bg-white p-7 sm:p-10 lg:p-12 flex flex-col justify-center items-center text-slate-900">
          <div className="w-full max-w-sm sm:max-w-[390px] flex flex-col items-center">

            {/* Title in Bold Emerald */}
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-emerald-600 tracking-tight text-center">
              {title}
            </h1>

            {/* Circular Social Buttons Row */}
            <div className="flex items-center justify-center gap-3 mt-4 mb-3">
              {/* Google Button */}
              <button
                type="button"
                title="Continuer avec Google"
                className="w-11 h-11 rounded-full border border-slate-200/90 bg-white hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-center cursor-pointer group active:scale-95"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </button>

              {/* Microsoft Button */}
              <button
                type="button"
                title="Continuer avec Microsoft"
                className="w-11 h-11 rounded-full border border-slate-200/90 bg-white hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-center cursor-pointer group active:scale-95"
              >
                <svg className="h-4 w-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                title="Continuer avec GitHub"
                className="w-11 h-11 rounded-full border border-slate-200/90 bg-white hover:border-emerald-500 hover:shadow-md text-slate-800 transition-all flex items-center justify-center cursor-pointer group active:scale-95"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Subtle Divider Text */}
            <p className="text-xs text-slate-400 font-medium text-center mb-4">
              {isLogin ? 'ou avec vos identifiants :' : 'ou utilisez votre e-mail pour l\'inscription :'}
            </p>

            {/* Form Slot */}
            <div className="w-full">{children}</div>

            {/* Mobile Switch Link (shown only on small screens) */}
            <div className="mt-4 text-center text-xs text-slate-500 md:hidden">
              {isLogin ? (
                <span>
                  Pas encore de compte ?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    Créer un compte
                  </Link>
                </span>
              ) : (
                <span>
                  Déjà membre Vaultis ?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    Se connecter
                  </Link>
                </span>
              )}
            </div>

            {/* Subtle Legal Footnote */}
            <p className="mt-4 text-center text-[10px] text-slate-400">
              En continuant, vous acceptez les{' '}
              <a href="#" className="underline hover:text-slate-600">
                Conditions
              </a>{' '}
              et la{' '}
              <a href="#" className="underline hover:text-slate-600">
                Confidentialité
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
