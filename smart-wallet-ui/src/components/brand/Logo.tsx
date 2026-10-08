import { Link, type LinkProps } from "react-router-dom";
import { cn } from "../../lib/cn";

export interface LogoProps {
  to?: LinkProps["to"];
  compact?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

export default function Logo({ to = "/", compact = false, className, theme = "light" }: LogoProps) {
  const isDark = theme === "dark";

  return (
    <Link
      to={to}
      className={cn("flex items-center gap-3 group select-none transition-opacity hover:opacity-95", className)}
      aria-label="Vaultis SmartWallet — Accueil"
    >
      {/* Emblème V-Shield Minimaliste */}
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-950 p-2 shadow-lg shadow-sky-500/10 border border-white/10 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-sky-500/25 group-hover:border-sky-500/30">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_2px_8px_rgba(14,165,233,0.35)]"
        >
          <defs>
            <linearGradient id="vLogoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38BDF8" />
              <stop offset="50%" stop-color="#0EA5E9" />
              <stop offset="100%" stop-color="#0284C7" />
            </linearGradient>

            <linearGradient id="vLogoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#2DD4BF" />
              <stop offset="100%" stop-color="#2563EB" />
            </linearGradient>
          </defs>

          {/* Crête supérieure */}
          <path
            d="M50 14 L24 23 C23 23.4 22 24.5 22 26 L22 35 L50 24 L78 35 L78 26 C78 24.5 77 23.4 76 23 Z"
            fill="url(#vLogoGrad2)"
            opacity="0.95"
          />

          {/* Aile gauche */}
          <path
            d="M22 31 L22 52 C22 66 33 79 50 86 C50 86 36 74 34 54 L34 39 L47 48 L41 68 C41 68 31 56 31 46 L31 34 Z"
            fill="url(#vLogoGrad1)"
            opacity="0.85"
          />

          {/* Branche centrale 'V' */}
          <path
            d="M29 33 L44 71 C46.5 77 53.5 77 56 71 L71 33 L61 33 L50 62 L39 33 Z"
            fill="url(#vLogoGrad1)"
          />

          {/* Aile droite */}
          <path
            d="M78 31 L78 52 C78 66 67 79 50 86 C55 82 66 74 66 54 L66 39 L53 48 L59 68 C61 64 69 56 69 46 L69 34 Z"
            fill="url(#vLogoGrad2)"
            opacity="0.9"
          />

          {/* Pointe */}
          <path d="M50 86 L44 73 L56 73 Z" fill="url(#vLogoGrad2)" />
        </svg>
      </span>

      {/* Typographie de marque */}
      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                "text-[17px] font-extrabold tracking-tight font-display transition-colors",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              VAULTIS
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          </div>
          <span
            className={cn(
              "text-[9px] font-semibold uppercase tracking-[0.2em] mt-0.5",
              isDark ? "text-sky-400/80" : "text-sky-600"
            )}
          >
            Smart Wallet
          </span>
        </div>
      )}
    </Link>
  );
}

export { Logo };
