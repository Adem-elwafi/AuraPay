import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, History, Plus, BarChart3, Settings } from "lucide-react";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../context/LanguageContext";

export interface BottomNavProps {
  onQuickAction?: () => void;
}

export default function BottomNav({ onQuickAction }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const isCurrent = (to: string, hash?: string) => {
    if (hash) {
      return location.pathname === "/dashboard" && location.hash === hash;
    }
    return location.pathname === to && (!location.hash || location.hash === "#");
  };

  // Go through the router (not history.replaceState) so useLocation updates:
  // the active tab follows, and the dashboard scrolls / opens the analytics accordion.
  const handleNavClick = (to: string, hash?: string) => {
    navigate(to + (hash || ""), { replace: location.pathname === to });
    if (!hash) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    {
      label: t('nav_dashboard'),
      to: "/dashboard",
      icon: LayoutDashboard,
      active: isCurrent("/dashboard"),
      onClick: () => handleNavClick("/dashboard"),
    },
    {
      label: t('nav_transactions'),
      to: "/dashboard#transactions",
      hash: "#transactions",
      icon: History,
      active: isCurrent("/dashboard", "#transactions"),
      onClick: () => handleNavClick("/dashboard", "#transactions"),
    },
    // Center button slot handled separately
    {
      label: t('nav_analytics'),
      to: "/dashboard#analytics",
      hash: "#analytics",
      icon: BarChart3,
      active: isCurrent("/dashboard", "#analytics"),
      onClick: () => handleNavClick("/dashboard", "#analytics"),
    },
    {
      label: t('nav_settings'),
      to: "/settings",
      icon: Settings,
      active: location.pathname === "/settings",
      onClick: () => handleNavClick("/settings"),
    },
  ];

  return (
    <nav
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-[var(--z-bottomnav)] bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--line-strong)] shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1 relative">
        {/* Tab 1: Accueil */}
        <button
          type="button"
          onClick={navItems[0].onClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer select-none",
            navItems[0].active
              ? "text-[var(--accent)] font-bold scale-105"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          )}
        >
          <LayoutDashboard className="h-5 w-5 mb-1" />
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">
            {navItems[0].label}
          </span>
        </button>

        {/* Tab 2: Opérations / Transactions */}
        <button
          type="button"
          onClick={navItems[1].onClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer select-none",
            navItems[1].active
              ? "text-[var(--accent)] font-bold scale-105"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          )}
        >
          <History className="h-5 w-5 mb-1" />
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">
            {navItems[1].label}
          </span>
        </button>

        {/* Tab 3: Raised Center Floating '+' Button */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-6">
          <button
            type="button"
            onClick={() => {
              if (onQuickAction) {
                onQuickAction();
              } else {
                // Dispatch event so any listening page or layout opens quick modal/bottom sheet
                window.dispatchEvent(new CustomEvent("open-quick-action", { detail: { mode: "expense" } }));
              }
            }}
            aria-label="Action Rapide Dépense / Entrée"
            className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-[0_0_24px_rgba(16,185,129,0.55)] ring-4 ring-[var(--surface-1)] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90 text-slate-950 font-bold" />
          </button>
          <span className="text-[10px] font-semibold text-[var(--text)] mt-1 tracking-tight">
            Nouveau
          </span>
        </div>

        {/* Tab 4: Stats */}
        <button
          type="button"
          onClick={navItems[2].onClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer select-none",
            navItems[2].active
              ? "text-[var(--accent)] font-bold scale-105"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          )}
        >
          <BarChart3 className="h-5 w-5 mb-1" />
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">
            {navItems[2].label}
          </span>
        </button>

        {/* Tab 5: Paramètres */}
        <button
          type="button"
          onClick={navItems[3].onClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer select-none",
            navItems[3].active
              ? "text-[var(--accent)] font-bold scale-105"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          )}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">
            {navItems[3].label}
          </span>
        </button>
      </div>
    </nav>
  );
}
