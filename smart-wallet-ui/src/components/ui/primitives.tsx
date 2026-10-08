import type { ComponentType, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type Tone = "accent" | "negative" | "neutral";
export type Size = "sm" | "md" | "lg";

export interface IconTileProps {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone?: Tone;
  size?: Size;
  className?: string;
}

/** Rounded square holding an icon. tone: accent | negative | neutral */
export function IconTile({ icon: Icon, tone = "accent", size = "md", className }: IconTileProps) {
  const tones: Record<Tone, string> = {
    accent: "bg-[var(--accent-soft)] text-[var(--accent)] ring-[var(--accent-25)]",
    negative: "bg-rose-500/10 text-rose-400 ring-rose-500/25",
    neutral: "bg-[var(--surface-2)] text-[var(--muted)] ring-[var(--line)]",
  };
  const sizes: Record<Size, string> = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
  };
  return (
    <span className={cn("grid shrink-0 place-items-center ring-1", tones[tone], sizes[size], className)}>
      <Icon className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} aria-hidden />
    </span>
  );
}

export interface PillProps {
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
  className?: string;
}

/** Glass pill used for announcements and small labels. */
export function Pill({ icon: Icon, children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--accent-25)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--accent)] shadow-xs backdrop-blur-md",
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />}
      {children}
    </span>
  );
}

export interface DeltaProps {
  value: number;
  good?: boolean;
  className?: string;
}

/**
 * Up/down delta chip. The arrow shows direction, `good` picks the tone
 * (e.g. spending going down is good). Never relies on color alone.
 */
export function Delta({ value, good = value >= 0, className }: DeltaProps) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs",
        good
          ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-25)] shadow-[0_0_12px_var(--accent-15)]"
          : "bg-rose-500/10 text-rose-400 border border-rose-500/25",
        className
      )}
    >
      {up ? "↗" : "↘"} {up ? "+" : "−"}
      {Math.abs(value).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %
    </span>
  );
}

export interface ProgressBarProps {
  value: number;
  label?: string;
  className?: string;
}

/** Thin horizontal meter. */
export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)] ring-1 ring-[var(--line)]", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent)] transition-all duration-500 shadow-[0_0_10px_var(--accent-30)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

/** Initials avatar. */
export function Avatar({ name, size = 32, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] font-bold text-[var(--accent-ink)] ring-2 ring-[var(--line)] shadow-xs",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export interface SegmentOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

export interface SegmentedProps<T extends string | number = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

/** Segmented control. */
export function Segmented<T extends string | number = string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] p-1", className)}
    >
      {options.map(({ value: v, label: l, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={String(v)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition cursor-pointer",
              active
                ? "bg-[var(--surface)] text-[var(--accent)] shadow-xs ring-1 ring-[var(--line-strong)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />}
            {l}
          </button>
        );
      })}
    </div>
  );
}

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  subtext?: ReactNode;
  delta?: number;
  good?: boolean;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
}

/** Stat display metric with optional delta and icon. */
export function Stat({ label, value, subtext, delta, good, icon: Icon, className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-[var(--muted)]" aria-hidden />}
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="tabular text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
          {value}
        </span>
        {typeof delta === "number" && <Delta value={delta} good={good} />}
      </div>
      {subtext && <p className="text-xs text-[var(--muted)]">{subtext}</p>}
    </div>
  );
}

export type BadgeVariant = "default" | "accent" | "outline" | "positive" | "negative";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

/** Small badge tag. */
export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-25)] shadow-[0_0_10px_var(--accent-15)]",
    outline: "border border-[var(--line)] text-[var(--muted)] bg-transparent",
    positive: "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-25)]",
    negative: "bg-rose-500/10 text-rose-400 border border-rose-500/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export interface KbdProps {
  children: ReactNode;
  className?: string;
}

/** Keyboard shortcut badge. */
export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)] shadow-xs font-mono",
        className
      )}
    >
      {children}
    </kbd>
  );
}
