import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Logo from "./brand/Logo";
import { Avatar, Badge, Kbd } from "./ui/primitives";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../theme/ThemeProvider";
import { scrollToAnchor } from "../lib/scrollToAnchor";
import { cn } from "../lib/cn";

export interface NavbarProps {
  onOpenMobileSidebar?: () => void;
  /** Sidebar rail state, mirrored by the collapse toggle (lg+). */
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const iconBtn =
  "relative grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shadow-xs";

export function Navbar({ onOpenMobileSidebar, sidebarCollapsed = false, onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const {
    user,
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const navigate = useNavigate();
  const displayName = user?.fullName || user?.username || "Membre";

  const navItems = [
    { to: "/dashboard", hash: "", label: t("nav_dashboard") },
    { to: "/dashboard#cards", hash: "#cards", label: t("nav_cards") },
    { to: "/dashboard#transactions", hash: "#transactions", label: t("nav_transactions") },
    { to: "/dashboard#analytics", hash: "#analytics", label: t("nav_analytics") },
    { to: "/settings", hash: "", label: t("nav_settings") },
  ];

  const handleNavClick = (to: string, hash: string) => {
    const path = to.split("#")[0];
    navigate(to, { replace: location.pathname === path });
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setTimeout(() => scrollToAnchor(hash), 60);
    }
  };

  const isLinkActive = (to: string, hash: string) => {
    if (hash) return location.pathname === "/dashboard" && location.hash === hash;
    if (to === "/dashboard") return location.pathname === "/dashboard" && !location.hash;
    return location.pathname === to;
  };

  const getPageTitle = () => {
    if (location.pathname === "/settings") return t("nav_settings");
    if (location.pathname === "/profile") return t("nav_profile");
    if (location.hash === "#transactions") return t("nav_transactions");
    if (location.hash === "#cards") return t("nav_cards");
    if (location.hash === "#analytics") return t("nav_analytics");
    return t("nav_dashboard");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "danger":
        return <XCircle className="h-4 w-4 text-rose-400" />;
      default:
        return <Clock className="h-4 w-4 text-[var(--accent)]" />;
    }
  };

  return (
    <header
      className={cn(
        // Full-width island; the sidebar island floats below it (insets match Sidebar)
        "fixed inset-x-0 top-0 z-[var(--z-header)] pointer-events-none px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]",
        "md:px-4 md:pt-[calc(env(safe-area-inset-top)+1rem)]"
      )}
    >
      <div className="pointer-events-auto flex h-[3.75rem] w-full items-center justify-between gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)]/90 ps-3 pe-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:ps-4">
        {/* Left Section: brand, sidebar toggle, page title */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Compact mark on mobile (BottomNav is the primary nav; the avatar opens the drawer) */}
          <span className="md:hidden">
            <Logo to="/dashboard" compact />
          </span>
          <span className="hidden shrink-0 md:block">
            <Logo to="/dashboard" theme={theme === "dark" ? "dark" : "light"} />
          </span>

          {/* Bouton Toggle clair et intuitif pour déplier/replier la barre latérale */}
          {onToggleSidebar && (
            <span className="hidden md:block">
              <button
                type="button"
                onClick={onToggleSidebar}
                className={cn(
                  "group flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[var(--muted)] transition-all duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shadow-xs"
                )}
                aria-label={sidebarCollapsed ? t("nav_expand") : t("nav_collapse")}
                aria-expanded={!sidebarCollapsed}
                title={sidebarCollapsed ? t("nav_expand") : t("nav_collapse")}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4 text-[var(--accent)] rtl:-scale-x-100 transition-transform duration-200 group-hover:scale-110" aria-hidden />
                ) : (
                  <PanelLeftClose className="h-4 w-4 text-[var(--muted)] rtl:-scale-x-100 transition-transform duration-200 group-hover:text-[var(--text)]" aria-hidden />
                )}
                <span className="text-xs font-semibold select-none hidden lg:inline">
                  {sidebarCollapsed ? t("nav_expand") : t("nav_collapse")}
                </span>
              </button>
            </span>
          )}

          {/* Desktop page title */}
          <span aria-hidden className="hidden h-5 w-px bg-[var(--line)] md:block" />
          <h1 className="hidden truncate text-sm font-semibold tracking-tight text-[var(--text)] md:block">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center Section: Floating Nav Pills (Quixotic style) */}
        <nav className="hidden items-center gap-1 xl:flex bg-[var(--surface-2)]/80 border border-[var(--line)] rounded-full p-1 shadow-inner" aria-label="Navigation principale">
          {navItems.map(({ to, hash, label }) => {
            const active = isLinkActive(to, hash);
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleNavClick(to, hash)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-[var(--accent)] text-white dark:text-slate-950 font-bold shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Global Search, Notifications & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Global Search Bar (⌘K) */}
          <label className="hidden h-10 w-64 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[var(--muted)] transition focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-20)] sm:flex">
            <Search className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (⌘K)..."
              aria-label="Rechercher"
              className="w-full bg-transparent text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
            />
            <Kbd className="text-[10px]">⌘K</Kbd>
          </label>

          {/* Notifications Bell & Popover */}
          <div className="relative" ref={notifRef}>
            <button
              className={iconBtn}
              onClick={() => {
                setShowNotifications((prev) => !prev);
                if (!showNotifications && unreadCount > 0) {
                  markAllAsRead();
                }
              }}
              aria-label={`Notifications (${unreadCount} non lues)`}
              aria-expanded={showNotifications}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg)] animate-pulse" />
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+5rem)] rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-[var(--text)] sm:absolute sm:inset-x-auto sm:top-auto sm:end-0 sm:mt-3 sm:w-84">
                <div className="mb-3 flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                      Notifications
                    </span>
                    {unreadCount > 0 ? (
                      <Badge variant="accent" className="text-[10px] px-1.5 py-0.2">
                        {unreadCount} new
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0.2">
                        {notifications.length}
                      </Badge>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] font-medium text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Effacer tout
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[var(--muted)] font-light select-none">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex gap-3 rounded-2xl p-3 border transition-all duration-200",
                          notif.read
                            ? "border-[var(--line)] bg-[var(--surface-2)] opacity-80"
                            : "border-[var(--accent-25)] bg-[var(--accent-10)]"
                        )}
                      >
                        <span className="mt-0.5 shrink-0">
                          {getNotificationIcon(notif.type)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[var(--text)] truncate">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-[var(--muted)] leading-relaxed mt-0.5">
                            {notif.message}
                          </p>
                          <span className="mt-1 block text-[10px] text-[var(--muted)] opacity-75">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop User Profile Pill (Quixotic style) */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="hidden md:flex items-center gap-2 ps-1 pe-3 py-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            title={t("nav_profile")}
          >
            <Avatar name={displayName} size={28} />
            <span className="text-xs font-semibold text-[var(--text)] max-w-[100px] truncate">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--muted)]" />
          </button>

          {/* Quick Avatar pill on mobile: opens the sidebar drawer (account, preferences, logout) */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={t("nav_open_menu")}
            aria-haspopup="dialog"
          >
            <Avatar name={displayName} className="h-8 w-8 text-xs font-bold" />
          </button>
        </div>
      </div>
    </header>
  );
}

export { Navbar as AppHeader };
export default Navbar;
