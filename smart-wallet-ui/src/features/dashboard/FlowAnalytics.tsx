import { useMemo, useState } from "react";
import { ArrowRight, PieChart, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { IconTile, ProgressBar, Segmented } from "../../components/ui/primitives";
import { formatEUR } from "../../lib/format";
import FlowChart, { type FlowPoint } from "./FlowChart";

export interface SpendingCategory {
  label: string;
  share: number;
}

export interface FlowInsight {
  title: string;
  spendingChange: number;
}

export interface FlowAnalyticsProps {
  dailyFlow: FlowPoint[];
  breakdown?: SpendingCategory[];
  insight?: FlowInsight;
  onViewReport?: () => void;
}

const RANGES = [
  { value: 7, label: "7 j" },
  { value: 30, label: "30 j" },
];

const DEFAULT_BREAKDOWN: SpendingCategory[] = [
  { label: "Alimentation & Restauration", share: 45 },
  { label: "Loisirs & Style de vie", share: 30 },
  { label: "Transport & Mobilité", share: 15 },
  { label: "Autres", share: 10 },
];

const DEFAULT_INSIGHT: FlowInsight = {
  title: "Insight Elite",
  spendingChange: -12,
};

export default function FlowAnalytics({
  dailyFlow,
  breakdown = DEFAULT_BREAKDOWN,
  insight = DEFAULT_INSIGHT,
  onViewReport,
}: FlowAnalyticsProps) {
  const [range, setRange] = useState<number>(30);

  const points = useMemo(() => {
    if (!dailyFlow || dailyFlow.length === 0) return [];
    return dailyFlow.slice(-range);
  }, [dailyFlow, range]);

  const net = useMemo(() => {
    return points.reduce((sum, p) => sum + p.net, 0);
  }, [points]);

  return (
    <Card>
      <CardHeader
        eyebrow="Performance"
        title="Analyses de flux"
        description={`Flux net cumulé des ${range} derniers jours`}
        action={
          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Segmented
              options={RANGES}
              value={range}
              onChange={(v) => setRange(Number(v))}
              label="Période"
              className="w-[120px]"
            />
            <div className="text-right">
              <p className="eyebrow !text-[10px]">Profit net</p>
              <p
                className={`tabular text-xl font-bold ${
                  net >= 0 ? "text-[var(--accent)]" : "text-[var(--negative)]"
                }`}
              >
                {formatEUR(net, { signed: true })}
              </p>
            </div>
          </div>
        }
      />

      <div className="mt-6">
        <FlowChart points={points} />
      </div>

      <div className="mt-8 grid gap-6 border-t border-[var(--line)] pt-7 md:grid-cols-2">
        {/* Spending breakdown */}
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
            <PieChart className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            Répartition des dépenses
          </h3>
          <ul className="mt-5 space-y-4">
            {breakdown.map((b) => (
              <li key={b.label}>
                <div className="mb-2 flex justify-between text-[13px]">
                  <span className="text-[var(--muted)] font-medium">{b.label}</span>
                  <span className="tabular font-semibold text-[var(--text)]">{b.share} %</span>
                </div>
                <ProgressBar value={b.share} label={b.label} />
              </li>
            ))}
          </ul>
        </div>

        {/* Insight */}
        <div className="flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface-2)] p-6 shadow-xs">
          <IconTile icon={TrendingUp} tone="accent" />
          <h3 className="mt-4 text-[17px] font-semibold text-[var(--text)]">{insight.title}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
            Félicitations ! Vos dépenses ont diminué de{" "}
            <b className="text-[var(--accent)] font-semibold">{Math.abs(insight.spendingChange)} %</b> par rapport au mois dernier.
            Vous êtes sur la voie d’une croissance patrimoniale exceptionnelle.
          </p>
          <button
            type="button"
            onClick={onViewReport}
            className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-semibold text-[var(--accent-text)] hover:text-[var(--accent)] hover:underline cursor-pointer"
          >
            Voir le rapport détaillé <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export { FlowAnalytics };
