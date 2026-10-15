import { PiggyBank, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Delta, IconTile } from "../../components/ui/primitives";
import { formatMoney } from "../../lib/format";
import Sparkline from "./Sparkline";

export interface StatItem {
  key: string;
  label: string;
  value: number;
  delta: number;
  trend: number[];
  icon?: LucideIcon;
}

export interface StatCardsProps {
  stats: StatItem[];
  className?: string;
}

const DEFAULT_ICONS: Record<string, LucideIcon> = {
  income: TrendingUp,
  spending: TrendingDown,
  savings: PiggyBank,
};

/** For spending, a decrease is good news — flip the delta's sentiment. */
const GOOD_WHEN_DOWN = new Set(["spending", "expenses"]);

export default function StatCards({ stats, className }: StatCardsProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-3 ${className || ""}`}>
      {stats.map((s) => {
        const Icon = s.icon || DEFAULT_ICONS[s.key] || TrendingUp;
        const good = GOOD_WHEN_DOWN.has(s.key) ? s.delta <= 0 : s.delta >= 0;
        return (
          <Card key={s.key} as="article" className="!p-5 transition-transform duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <IconTile icon={Icon} size="sm" tone={s.key === "spending" ? "negative" : "accent"} />
              <Delta value={s.delta} good={good} />
            </div>
            <p className="eyebrow mt-5 text-[var(--muted)]">{s.label}</p>
            <p className="tabular mt-1.5 text-2xl font-bold tracking-tight text-[var(--text)]">
              {formatMoney(s.value)}
            </p>
            <Sparkline
              data={s.trend}
              className="mt-4 w-full"
              strokeColor={s.key === "spending" ? "var(--negative)" : "var(--accent)"}
            />
          </Card>
        );
      })}
    </div>
  );
}

export { StatCards };
