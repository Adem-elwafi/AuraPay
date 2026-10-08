import type { ElementType, HTMLAttributes, ReactNode, ComponentType } from "react";
import { cn } from "../../lib/cn";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

/** Glass panel used across the smart wallet design system. */
export function Card({ as: Tag = "section", className, children, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        "relative rounded-[28px] border border-[var(--line)] p-6 sm:p-7",
        "bg-[var(--surface)] text-[var(--text)] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.15)]",
        className
      )}
      style={{ backgroundColor: "var(--surface)" }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface CardHeaderProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  action?: ReactNode;
  className?: string;
  titleAs?: ElementType;
  children?: ReactNode;
}

/** Eyebrow + title (+ optional icon, description and right-side action). */
export function CardHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  className,
  titleAs: H = "h2",
  children,
}: CardHeaderProps) {
  if (children && !title && !eyebrow) {
    return <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>{children}</div>;
  }

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        {title && (
          <H className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[var(--text)] sm:text-xl">
            {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />}
            {title}
          </H>
        )}
        {description && <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("mt-4", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardActionProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
}

/** Small uppercase text link ("GÉRER", "TOUT VOIR"). */
export function CardAction({ children, className, ...props }: CardActionProps) {
  return (
    <button
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-light)] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Card;
