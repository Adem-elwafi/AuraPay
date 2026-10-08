import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "outline" | "subtle" | "ghost" | "danger" | "light" | "lime";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white font-bold shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:bg-[#34d399] hover:shadow-[0_0_32px_rgba(16,185,129,0.6)] active:scale-[0.98]",
  lime:
    "bg-[var(--accent)] text-white font-bold shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:bg-[#34d399] active:scale-[0.98]",
  light:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-xs hover:bg-[var(--surface-2)] active:scale-[0.98]",
  subtle:
    "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] active:scale-[0.98]",
  outline:
    "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] shadow-xs active:scale-[0.98]",
  ghost:
    "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
  danger:
    "border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-10 w-10 p-0",
};

export interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps = BaseButtonProps &
  (
    | ({ to: LinkProps["to"]; href?: never } & Omit<LinkProps, "to" | "className">)
    | ({ href: string; to?: never } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">)
    | ({ to?: never; href?: never } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">)
  );

/**
 * <Button variant="primary" size="md" to="/login">…</Button>
 * `to` renders a router Link, `href` an <a>, otherwise a <button>.
 */
export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  loading = false,
  block = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center whitespace-nowrap font-semibold transition duration-200 cursor-pointer",
    className?.includes("rounded-") ? "" : "rounded-full",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    block && "w-full",
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...(props as Omit<LinkProps, "to">)}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }
  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} disabled={loading || buttonProps.disabled} {...buttonProps}>
      {content}
    </button>
  );
}

export { Button };
