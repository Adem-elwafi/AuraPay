export type ClassValue = string | number | boolean | undefined | null;

/** Tiny className joiner: cn("a", cond && "b", undefined) → "a b" */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}

export default cn;
