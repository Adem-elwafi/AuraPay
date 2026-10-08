import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type ComponentType } from "react";
import { cn } from "../../lib/cn";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  trailing?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
  inputClassName?: string;
  containerClassName?: string;
}

/**
 * Labelled input with optional leading icon, trailing slot and error text.
 * <TextField label="E-mail" icon={Mail} error="…" trailing={<button/>} />
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon: Icon, trailing, error, hint, className, inputClassName, containerClassName, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-semibold text-slate-600 dark:text-[var(--muted)]">
          {label}
        </label>
      )}
      <div
        className={cn(
          "group flex h-11 items-center gap-2.5 rounded-xl border bg-[var(--surface-2)] px-3.5 transition shadow-xs",
          "focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-15)]",
          error ? "border-rose-400" : "border-[var(--line)]",
          containerClassName
        )}
      >
        {Icon && (
          <Icon
            className="h-[18px] w-[18px] shrink-0 text-[var(--muted)] transition group-focus-within:text-[var(--accent)]"
            aria-hidden
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "h-full w-full min-w-0 bg-transparent text-[15px] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none",
            inputClassName
          )}
          {...props}
        />
        {trailing}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-[12px] text-[var(--negative)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-[12px] text-[var(--subtle)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default TextField;
export { TextField };
