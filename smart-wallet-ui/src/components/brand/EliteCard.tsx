import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, Nfc } from "lucide-react";
import { formatMoney } from "../../lib/format";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../context/LanguageContext";

export interface EliteCardProps {
  balance: number;
  walletId: string;
  holder: string;
  expiry: string;
  tier?: string;
  interactive?: boolean;
  className?: string;
}

/**
 * The SmartWallet payment card — shared across visual showcases and dashboard.
 * Colors come from --card-grad / --card-ink, so it follows the active theme.
 */
export default function EliteCard({
  balance,
  walletId,
  holder,
  expiry,
  tier = "Platinum Elite",
  interactive = false,
  className,
}: EliteCardProps) {
  const { t, isRtl } = useLanguage();
  const [hidden, setHidden] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("sw_discreet_mode") === "true";
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setHidden(localStorage.getItem("sw_discreet_mode") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(walletId.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div
      className={cn(
        "relative isolate aspect-[1.586] w-full overflow-hidden rounded-[24px] p-5 sm:p-7 select-none",
        "shadow-[0_0_50px_-5px_rgba(16,185,129,0.45),0_0_25px_-2px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]",
        "border border-emerald-400/30",
        className
      )}
      style={{ background: "var(--card-grad)", color: "var(--card-ink)" }}
    >
      {/* sheen + guilloché texture */}
      <div aria-hidden className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-white/25 blur-3xl pointer-events-none" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent_0_14px,rgba(255,255,255,0.05)_14px_15px)] pointer-events-none"
      />

      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] opacity-75">{t('balance_label')}</p>
            <p className="tabular mt-1.5 text-[26px] font-bold tracking-tight sm:text-[40px] sm:leading-none">
              {hidden ? (isRtl ? "•••• د.ت" : "•••• DT") : formatMoney(balance)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl italic leading-none sm:text-2xl">Vaultis</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] opacity-70">{tier}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="tabular font-mono text-[15px] tracking-[0.2em] sm:text-lg">{walletId}</p>
          {interactive && (
            <>
              <button
                type="button"
                onClick={copy}
                aria-label="Copier l'identifiant"
                className="grid h-7 w-7 place-items-center rounded-lg bg-black/15 transition hover:bg-black/25 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setHidden((h) => !h)}
                aria-label={hidden ? "Afficher le solde" : "Masquer le solde"}
                className="grid h-7 w-7 place-items-center rounded-lg bg-black/15 transition hover:bg-black/25 cursor-pointer"
              >
                {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex gap-8">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] opacity-70">{t('card_holder')}</p>
              <p className="mt-0.5 text-[13px] font-semibold uppercase">{holder}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] opacity-70">{t('card_expires')}</p>
              <p className="tabular mt-0.5 text-[13px] font-semibold">{expiry}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Nfc className="h-5 w-5 opacity-70" aria-hidden />
            {/* chip */}
            <div className="relative h-9 w-12 rounded-lg bg-[linear-gradient(135deg,#f8fafc,#cbd5e1_45%,#94a3b8)] ring-1 ring-black/10">
              <div className="absolute inset-x-2 top-1/2 h-px bg-black/20" />
              <div className="absolute inset-y-1.5 left-1/2 w-px bg-black/20" />
              <div className="absolute inset-y-2.5 left-2 right-2 rounded-sm border border-black/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { EliteCard };
