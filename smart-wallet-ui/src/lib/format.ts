export interface FormatMoneyOptions {
  signed?: boolean;
  currency?: string;
  locale?: string;
}

const getSavedLanguage = (): string => {
  if (typeof window !== "undefined") {
    const lang = localStorage.getItem("smartwallet_lang");
    if (lang === "ar") return "ar-TN";
    if (lang === "en") return "en-US";
  }
  return "fr-TN";
};

/**
 * Universal money formatting engine.
 * Specifically handles Tunisian Dinar (TND) with mandatory 3 decimals (e.g. 15.450 DT or 0.800 DT).
 * Uses "د.ت" in Arabic locale and "DT" in French/English.
 */
export function formatMoney(
  value: number,
  currency: string = "TND",
  locale?: string,
  options: { signed?: boolean } = {}
): string {
  const currentLocale = locale || getSavedLanguage();
  const abs = Math.abs(value);
  const isNegative = value < 0;

  if (currency.toUpperCase() === "TND") {
    const parts = abs.toFixed(3).split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    const decimalPart = parts[1];
    const isArabic = currentLocale.startsWith("ar");
    const decimalSep = isArabic ? "," : (currentLocale.startsWith("en") ? "." : ",");
    const symbol = isArabic ? "د.ت" : "DT";

    const formatted = `${integerPart}${decimalSep}${decimalPart} ${symbol}`;
    if (options.signed) {
      return `${value >= 0 ? "+" : "-"}${formatted}`;
    }
    return isNegative ? `-${formatted}` : formatted;
  }

  // Fallback for other currencies (EUR, USD)
  const formatter = new Intl.NumberFormat(currentLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const absFormatted = formatter.format(abs);
  if (options.signed) {
    return `${value >= 0 ? "+" : "-"}${absFormatted}`;
  }
  return isNegative ? `-${absFormatted}` : absFormatted;
}

/** Backward-compatible helper for components */
export function formatEUR(value: number, options: { signed?: boolean } = {}): string {
  return formatMoney(value, "TND", undefined, options);
}

export interface FormatPctOptions {
  signed?: boolean;
}

/** "+12 %" style percentage */
export function formatPct(value: number, { signed = true }: FormatPctOptions = {}): string {
  const n = Math.round(value * 10) / 10;
  const s = new Intl.NumberFormat(getSavedLanguage(), { maximumFractionDigits: 1 }).format(Math.abs(n));
  return `${signed ? (n >= 0 ? "+" : "-") : ""}${s} %`;
}

export const formatShortDate = (d: string | number | Date): string =>
  new Intl.DateTimeFormat(getSavedLanguage(), { day: "numeric", month: "short" }).format(new Date(d));

export const formatDateTime = (d: string | number | Date): string =>
  new Intl.DateTimeFormat(getSavedLanguage(), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

export const formatLongDate = (d: string | number | Date): string =>
  new Intl.DateTimeFormat(getSavedLanguage(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(d));
