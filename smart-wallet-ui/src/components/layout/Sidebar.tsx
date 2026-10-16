import { useEffect, useState, type ComponentType } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  History,
  BarChart3,
  Settings,
  User as UserIcon,
  LogOut,
  Plus,
  Sun,
  Moon,
  X,
} from "lucide-react";
import Logo from "../brand/Logo";
import Button from "../ui/Button";
import { Avatar, ProgressBar, Segmented } from "../ui/primitives";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../theme/ThemeProvider";
import { formatMoney } from "../../lib/format";
import type { Language } from "../../lib/i18n";
import { cn } from "../../lib/cn";
import SyncStatusBadge from "../SyncStatusBadge";

export interface SidebarProps {
  /** Icon-only rail (user preference on lg+, forced on md; toggled from the top bar). */
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavEntry {
  to: string;
  hash: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

// Same easing as .sw-rise so the rail, header and content move together.
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]";
const ICON_BTN = cn(
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)] cursor-pointer",
  FOCUS
);
const LANGUAGES: { value: Language; label: string }[] = [
  { value: "fr", label: "FR" },
  { value: "ar", label: "عربي" },
  { value: "en", label: "EN" },
];

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wallet, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Budget and currency preferences (written by the settings page)
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    const val = localStorage.getItem("sw_monthly_budget");
    return val ? parseFloat(val) : 2000;
  });
  const [currency] = useState<string>(() => localStorage.getItem("sw_currency") || "TND");
  const [discreetMode] = useState<boolean>(() => localStorage.getItem("sw_discreet_mode") === "true");

  useEffect(() => {
    const handleStorage = () => {
      const b = localStorage.getItem("sw_monthly_budget");
      if (b) setBudgetLimit(parseFloat(b));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Mobile drawer: close on Escape and lock background scroll (same behaviour as BottomSheet)
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, onCloseMobile]);

  const isLinkActive = (to: string, hash: string) => {
    if (hash) return location.pathname === "/dashboard" && location.hash === hash;
    if (to === "/dashboard") return location.pathname === "/dashboard" && !location.hash;
    return location.pathname === to;
  };

  // The dashboard's hash effect handles scrolling to anchors; plain routes go back to the top.
  const handleNavClick = (hash: string) => {
    onCloseMobile();
    if (!hash) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // The quick-action sheet lives on the dashboard: go there first if needed.
  const handleQuickAddExpense = () => {
    onCloseMobile();
    const open = () =>
      window.dispatchEvent(new CustomEvent("open-quick-action", { detail: { mode: "expense" } }));
    if (location.pathname === "/dashboard") {
      open();
    } else {
      navigate("/dashboard");
      window.setTimeout(open, 120);
    }
  };

  const cycleLanguage = () => {
    const i = LANGUAGES.findIndex((l) => l.value === language);
    setLanguage(LANGUAGES[(i + 1) % LANGUAGES.length].value);
  };

  const mainNavItems: NavEntry[] = [
    { to: "/dashboard", hash: "", label: t("nav_dashboard"), icon: LayoutDashboard },
    { to: "/dashboard#transactions", hash: "#transactions", label: t("nav_transactions"), icon: History },
    { to: "/dashboard#cards", hash: "#cards", label: t("nav_cards"), icon: CreditCard },
    { to: "/dashboard#analytics", hash: "#analytics", label: t("nav_analytics"), icon: BarChart3 },
  ];

  const secondaryNavItems: NavEntry[] = [
    { to: "/settings", hash: "", label: t("nav_settings"), icon: Settings },
    { to: "/profile", hash: "", label: t("nav_profile"), icon: UserIcon },
  ];

  const displayName = user?.fullName || user?.username || "Membre";

  // Mocked monthly spending until the analytics endpoint exposes it
  const estimatedSpent = 640.5;
  const budgetRatio = Math.min(100, Math.round((estimatedSpent / (budgetLimit || 2000)) * 100));

  const renderNavItem = ({ to, hash, label, icon: Icon }: NavEntry, rail: boolean) => {
    const active = isLinkActive(to, hash);
    return (
      <li key={to}>
        <Link
          to={to}
          replace={location.pathname === to.split("#")[0]}
          onClick={() => handleNavClick(hash)}
          aria-current={active ? "page" : undefined}
          aria-label={rail ? label : undefined}
          title={rail ? label : undefined}
          className={cn(
            "group relative flex h-10 items-center gap-3 rounded-xl text-[13px] font-medium transition-colors duration-200",
            FOCUS,
            rail ? "mx-auto w-10 justify-center" : "px-3",
            active
              ? "bg-[var(--accent-soft)] text-[var(--text)]"
              : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          )}
        >
          {active && (
            <span
              aria-hidden
              className="absolute start-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent-40)]"
            />
          )}
          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
              active ? "text-[var(--accent)]" : "text-[var(--subtle)] group-hover:text-[var(--text)]"
            )}
            aria-hidden
          />
          {!rail && <span className="truncate">{label}</span>}
        </Link>
      </li>
    );
  };

  const renderContent = (rail: boolean, inDrawer: boolean) => (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand row: drawer only — on md+ the brand lives in the top bar island */}
      {inDrawer && (
        <div className="flex h-[61px] shrink-0 items-center justify-between border-b border-[var(--line)] px-4">
          <Logo to="/dashboard" theme={theme === "dark" ? "dark" : "light"} />
          <button
            type="button"
            onClick={onCloseMobile}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] cursor-pointer",
              FOCUS
            )}
            aria-label={t("close")}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      <div className={cn("sidebar-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-4", rail ? "px-2" : "px-3")}>
        {/* Balance + monthly limit */}
        {!rail && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
            <div className="flex items-center justify-between">
              <span className="eyebrow !text-[10px] !tracking-[0.18em]">{t("balance_main")}</span>
              <span className="text-[10px] font-semibold text-[var(--muted)]">{currency}</span>
            </div>
            <p className="tabular mt-1.5 text-lg font-semibold tracking-tight text-[var(--text)]">
              {discreetMode ? "••••" : formatMoney(wallet?.balance ?? 79.98, currency)}
            </p>
            <ProgressBar value={budgetRatio} label={t("monthly_limit")} className="mt-3" />
            <p className="tabular mt-1.5 truncate text-[10px] text-[var(--muted)]">
              {formatMoney(estimatedSpent, currency)} {t("limit_spent_of")} {formatMoney(budgetLimit, currency)}
            </p>
          </div>
        )}

        {/* Quick action */}
        <Button
          variant="primary"
          size={rail ? "icon" : "md"}
          block={!rail}
          onClick={handleQuickAddExpense}
          aria-label={rail ? t("mode_expense") : undefined}
          title={rail ? t("mode_expense") : undefined}
          className={cn("rounded-xl", rail && "mx-auto")}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {!rail && <span>{t("mode_expense")}</span>}
        </Button>

        <nav aria-label={t("nav_section_main")} className="flex flex-col gap-5">
          <div>
            {!rail && <p className="eyebrow mb-2 px-3">{t("nav_section_main")}</p>}
            <ul className="space-y-1">{mainNavItems.map((item) => renderNavItem(item, rail))}</ul>
          </div>

          {rail && <span aria-hidden className="mx-auto h-px w-6 bg-[var(--line)]" />}

          <div>
            {!rail && <p className="eyebrow mb-2 px-3">{t("nav_section_manage")}</p>}
            <ul className="space-y-1">{secondaryNavItems.map((item) => renderNavItem(item, rail))}</ul>
          </div>
        </nav>
      </div>

      {/* Footer: sync, preferences, account */}
      <div
        className={cn(
          "shrink-0 space-y-3 border-t border-[var(--line)] py-3",
          rail ? "px-2" : "px-3",
          inDrawer && "pb-[max(env(safe-area-inset-bottom),0.75rem)]"
        )}
      >
        <div className={cn("flex", rail && "justify-center")}>
          <SyncStatusBadge compact={rail} />
        </div>

        <div className={cn("flex items-center gap-2", rail ? "flex-col" : "justify-between")}>
          {rail ? (
            <button
              type="button"
              onClick={cycleLanguage}
              className={cn(ICON_BTN, "text-[11px] font-semibold")}
              aria-label={`${t("nav_language")} : ${language.toUpperCase()}`}
              title={t("nav_language")}
            >
              {language.toUpperCase()}
            </button>
          ) : (
            <Segmented
              options={LANGUAGES}
              value={language}
              onChange={setLanguage}
              label={t("nav_language")}
              className="flex-1"
            />
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className={ICON_BTN}
            aria-label={t("nav_theme_toggle")}
            title={t("nav_theme_toggle")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
          </button>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-1.5",
            rail && "flex-col"
          )}
        >
          <Link
            to="/profile"
            onClick={() => handleNavClick("")}
            className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-0.5", FOCUS)}
            aria-label={rail ? t("nav_profile") : undefined}
            title={rail ? displayName : undefined}
          >
            <Avatar name={displayName} size={32} />
            {!rail && (
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-[var(--text)]">{displayName}</span>
                <span className="block truncate text-[10px] text-[var(--muted)]">{user?.email || t("nav_profile")}</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={logout}
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--negative-15)] hover:text-[var(--negative)] cursor-pointer",
              FOCUS
            )}
            aria-label={t("nav_logout")}
            title={t("nav_logout")}
          >
            <LogOut className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / tablet: detached island below the top bar (top bar: 1rem inset + 3.75rem pill, then a 0.75rem gap) */}
      <aside
        aria-label="Navigation"
        className={cn(
          "fixed bottom-4 start-4 top-[calc(env(safe-area-inset-top)+5.5rem)] z-[var(--z-header)] hidden overflow-hidden md:block",
          "rounded-3xl border border-[var(--line)] bg-[var(--surface)]/90 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl",
          "transition-[width] duration-300",
          EASE,
          collapsed ? "w-[4.5rem]" : "w-60"
        )}
      >
        {renderContent(collapsed, false)}
      </aside>

      {/* Mobile: off-canvas drawer, styled like BottomSheet (BottomNav stays the primary nav) */}
      <div
        className={cn("fixed inset-0 z-[var(--z-sheet)] md:hidden", !mobileOpen && "pointer-events-none")}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300",
            EASE,
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onCloseMobile}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("nav_section_main")}
          className={cn(
            "absolute inset-y-0 start-0 w-[18rem] max-w-[85vw] overflow-hidden rounded-e-[28px] border-e border-[var(--line-strong)] bg-[var(--surface-1)] pt-[env(safe-area-inset-top)] text-[var(--text)] shadow-2xl",
            "transition-transform duration-300",
            EASE,
            mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          )}
        >
          {renderContent(false, true)}
        </div>
      </div>
    </>
  );
}
