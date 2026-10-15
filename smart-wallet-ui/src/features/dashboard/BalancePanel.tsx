import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Lock, Settings2, Snowflake, ShieldCheck } from "lucide-react";
import { Card, CardAction, CardHeader } from "../../components/ui/Card";
import EliteCard from "../../components/brand/EliteCard";
import { ProgressBar } from "../../components/ui/primitives";
import { formatMoney } from "../../lib/format";
import { useLanguage } from "../../context/LanguageContext";
import type { Wallet } from "../../api/types";

export interface BalancePanelProps {
  wallet: Wallet | null;
  holder: string;
  monthlyLimit?: number;
  monthlySpent?: number;
  onDepositClick?: () => void;
  onWithdrawClick?: () => void;
  onSettingsClick?: () => void;
}

/** Card + its controls side by side (stacks on mobile). */
export default function BalancePanel({
  wallet,
  holder,
  monthlyLimit = 5000,
  monthlySpent = 1286.4,
  onDepositClick,
  onWithdrawClick,
  onSettingsClick,
}: BalancePanelProps) {
  const { t } = useLanguage();
  const [isFrozen, setIsFrozen] = useState(false);
  const balance = wallet?.balance ?? 0;
  const walletId = wallet?.accountNumber
    ? wallet.accountNumber.replace(/(.{4})/g, "$1 ").trim()
    : "SW-3 6395 5390 7";

  const usedPct = Math.min(100, Math.max(0, (monthlySpent / monthlyLimit) * 100));

  const toggleFreeze = () => {
    setIsFrozen((prev) => !prev);
  };

  return (
    <Card>
      <CardHeader
        eyebrow={t('balance_main')}
        title={t('balance_title')}
        icon={CreditCard}
        action={<CardAction onClick={onSettingsClick}>{t('manage')}</CardAction>}
      />

      <div className="mt-6 grid items-center gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className={`relative transition-all duration-300 ${isFrozen ? "opacity-70 grayscale-[60%]" : ""}`}>
          <EliteCard
            balance={balance}
            walletId={walletId}
            holder={holder}
            expiry="05/28"
            interactive
          />
          {isFrozen && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[22px] bg-black/40 backdrop-blur-xs">
              <span className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/80 px-4 py-1.5 text-xs font-semibold text-sky-200 shadow-lg">
                <Snowflake className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "6s" }} />
                {t('card_frozen')}
              </span>
            </div>
          )}
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] text-[var(--muted)] font-medium">{t('monthly_limit')}</p>
              <p className="tabular text-[13px] font-semibold text-[var(--text)]">{Math.round(usedPct)} %</p>
            </div>
            <ProgressBar value={usedPct} label={t('monthly_limit_used')} className="mt-3" />
            <p className="tabular mt-2.5 text-[12px] text-[var(--subtle)]">
              {formatMoney(monthlySpent)} {t('limit_spent_of')} {formatMoney(monthlyLimit)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onDepositClick}
              className="flex items-center gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 text-[13px] font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer shadow-2xs"
            >
              <ArrowDownLeft className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              {t('deposit')}
            </button>

            <button
              type="button"
              onClick={onWithdrawClick}
              className="flex items-center gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 text-[13px] font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer shadow-2xs"
            >
              <ArrowUpRight className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              {t('withdraw')}
            </button>

            <button
              type="button"
              onClick={toggleFreeze}
              className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-[13px] font-medium transition cursor-pointer shadow-2xs ${
                isFrozen
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                  : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
              }`}
            >
              <Snowflake className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              {isFrozen ? t('unfreeze_card') : t('freeze_card')}
            </button>

            <button
              type="button"
              onClick={onSettingsClick}
              className="flex items-center gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 text-[13px] font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer shadow-2xs"
            >
              <Settings2 className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              {t('nav_settings')}
            </button>
          </div>

          <p className="mt-auto flex items-center gap-2 text-[12px] text-[var(--muted)]">
            {isFrozen ? (
              <>
                <Lock className="h-3.5 w-3.5 text-sky-400" aria-hidden /> {t('card_frozen')}
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden /> {t('card_active')}
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

export { BalancePanel };
