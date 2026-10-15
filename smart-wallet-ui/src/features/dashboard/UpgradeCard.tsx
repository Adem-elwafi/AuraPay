import { useState } from "react";
import { Check, Crown } from "lucide-react";
import Button from "../../components/ui/Button";
import { IconTile } from "../../components/ui/primitives";

export interface UpgradeCardProps {
  onUpgrade?: () => void;
  className?: string;
}

export default function UpgradeCard({ onUpgrade, className }: UpgradeCardProps) {
  const [upgraded, setUpgraded] = useState(false);

  const handleClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setUpgraded(true);
      setTimeout(() => setUpgraded(false), 2500);
    }
  };

  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] ${
        className || ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--accent-15)] blur-3xl"
      />
      <div className="relative">
        <IconTile icon={Crown} tone="accent" />
        <h2 className="font-display mt-4 text-[26px] leading-[1.15] text-[var(--text)]">
          Passez au niveau <span className="italic text-[var(--accent)]">supérieur</span>
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
          Accédez à des taux d’intérêt exclusifs et à un conseiller dédié 24/7.
        </p>
        <Button size="lg" block className="mt-5" onClick={handleClick}>
          {upgraded ? (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Demande transmise
            </span>
          ) : (
            "Upgrade maintenant"
          )}
        </Button>
      </div>
    </section>
  );
}

export { UpgradeCard };
