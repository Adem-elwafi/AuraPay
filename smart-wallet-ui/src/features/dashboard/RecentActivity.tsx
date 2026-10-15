import { ArrowDownLeft, ArrowUpRight, CloudOff, History, Receipt } from "lucide-react";
import { Card, CardAction, CardHeader } from "../../components/ui/Card";
import { IconTile } from "../../components/ui/primitives";
import { formatDateTime, formatMoney } from "../../lib/format";
import { useLanguage } from "../../context/LanguageContext";
import type { DisplayTransaction } from "../../api/types";

export interface RecentActivityProps {
  items: DisplayTransaction[];
  currentAccountNumber?: string;
  onViewAll?: () => void;
  maxItems?: number;
}

export default function RecentActivity({
  items,
  currentAccountNumber,
  onViewAll,
  maxItems = 5,
}: RecentActivityProps) {
  const { t } = useLanguage();
  const displayed = items.slice(0, maxItems);

  return (
    <Card className="!p-5 sm:!p-6">
      <CardHeader
        title={t('recent_activity')}
        icon={History}
        action={onViewAll && <CardAction onClick={onViewAll}>{t('view_all')}</CardAction>}
      />

      {displayed.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-8 text-center text-[var(--subtle)]">
          <Receipt className="mb-3 h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">{t('no_transactions_yet')}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{t('no_transactions_recent')}</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {displayed.map((tItem) => {
            const incoming = currentAccountNumber
              ? tItem.recipientAccountNumber === currentAccountNumber
              : tItem.type === "CREDIT";

            const signedAmount = incoming ? Math.abs(tItem.amount) : -Math.abs(tItem.amount);
            const counterpart = incoming
              ? tItem.senderAccountNumber || (t('mode_p2p') + " entrant")
              : tItem.recipientAccountNumber || tItem.category || t('mode_expense');

            const label =
              tItem.description && tItem.description.trim() !== ""
                ? tItem.description
                : incoming
                ? "Virement reçu"
                : "Achat / Dépense";

            return (
              <li key={tItem.pendingSync ? `pending-${tItem.id}` : tItem.id} className="flex items-center gap-3.5 py-2.5 rounded-xl px-2 transition-colors hover:bg-[var(--surface-2)]">
                <IconTile
                  icon={incoming ? ArrowDownLeft : ArrowUpRight}
                  tone={incoming ? "accent" : "negative"}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[var(--text)]">
                    {label}
                    {tItem.pendingSync && (
                    <span
                      title="Enregistrée hors-ligne, en attente de synchronisation"
                      className="ml-1.5 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px align-middle text-[10px] font-semibold text-amber-400"
                    >
                      <CloudOff className="h-2.5 w-2.5" aria-hidden /> En attente
                    </span>
                  )}
                  </p>
                  <p className="truncate text-[12px] text-[var(--muted)]">
                    {incoming ? "Reçu de" : "Envoyé à"} : {counterpart}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`tabular text-[14px] font-bold ${
                      incoming ? "text-[var(--accent-text)]" : "text-[var(--text)]"
                    }`}
                  >
                    {formatMoney(signedAmount, "TND", undefined, { signed: true })}
                  </p>
                  <p className="text-[11px] text-[var(--subtle)]">
                    {tItem.timestamp ? formatDateTime(tItem.timestamp) : "Récemment"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export { RecentActivity };
