import { type LucideIcon, TrendingUp } from "lucide-react";
import { Card } from "./ui/Card";
import { Delta, IconTile } from "./ui/primitives";
import Sparkline from "../features/dashboard/Sparkline";

export interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  data?: number[];
  delay?: string;
  icon?: LucideIcon;
  goodWhenDown?: boolean;
}

export function StatCard({
  title,
  value,
  trend,
  data = [30, 20, 25, 15, 30, 20, 10],
  icon: Icon = TrendingUp,
  goodWhenDown = false,
}: StatCardProps) {
  const good = goodWhenDown ? trend <= 0 : trend >= 0;

  return (
    <Card as="article" className="!p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <IconTile icon={Icon} size="sm" tone={trend < 0 && !goodWhenDown ? "negative" : "accent"} />
        <Delta value={trend} good={good} />
      </div>

      <p className="eyebrow mt-5">{title}</p>
      <p className="tabular mt-1.5 text-2xl font-semibold tracking-tight text-[var(--text)]">
        {value}
      </p>

      <Sparkline data={data} className="mt-4 w-full" />
    </Card>
  );
}

export default StatCard;
