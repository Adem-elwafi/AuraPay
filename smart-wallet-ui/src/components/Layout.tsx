import { useCallback, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./layout/Sidebar";
import BottomNav from "./layout/BottomNav";
import AuraBackground from "./backgrounds/AuraBackground";
import PwaInstallPrompt from "./PwaInstallPrompt";

export interface LayoutProps {
  children: ReactNode;
}

// lg+ honours the user's collapse preference; md (tablet) always gets the icon rail.
const WIDE_QUERY = "(min-width: 1024px)";
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia(WIDE_QUERY).matches;

export default function Layout({ children }: LayoutProps) {
  // Par défaut : TOUJOURS FERMÉ (mode rail compact / collapsed = true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem("sw_sidebar_collapsed");
    // Si l'utilisateur n'a pas expressément choisi d'ouvrir, ou par défaut : toujours fermé (true)
    return saved !== null ? saved === "true" : true;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isWide = useSyncExternalStore(subscribeWide, getWide, () => true);
  const railMode = sidebarCollapsed || !isWide;

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sw_sidebar_collapsed", String(next));
      return next;
    });
  };

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  // Sidebar width + its 1rem inset + 1.25rem gutter; read by <main> (md+).
  const offsetStyle = { "--sw-sidebar-offset": railMode ? "6.75rem" : "17.25rem" } as CSSProperties;

  return (
    <div
      className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-20)] selection:text-[var(--accent-light)]"
      style={offsetStyle}
    >
      {/* Background Aura */}
      <AuraBackground variant="app" />

      {/* Floating sidebar island below the top bar (md+) and mobile drawer */}
      <Sidebar
        collapsed={railMode}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* Full-width floating top bar (its own island, detached from the sidebar) */}
      <Navbar
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        sidebarCollapsed={railMode}
        onToggleSidebar={toggleSidebarCollapse}
      />

      {/* Main content: offset by the sidebar on md+ (ps/pe only, so no breakpoint overrides the offset) */}
      <main className="min-h-screen px-4 pb-24 pt-[calc(env(safe-area-inset-top)+4.75rem)] transition-[padding] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+5.25rem)] md:pb-16 md:pe-6 md:ps-[var(--sw-sidebar-offset)] md:pt-[calc(env(safe-area-inset-top)+6.25rem)] lg:pe-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile-First Native Bottom Navigation Bar */}
      <BottomNav />

      {/* Discrete PWA Install Banner */}
      <PwaInstallPrompt />
    </div>
  );
}
