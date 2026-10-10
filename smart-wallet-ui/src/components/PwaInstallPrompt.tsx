import { useEffect, useState } from "react";
import { Download, Share, X, PlusSquare } from "lucide-react";
import Button from "./ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user dismissed prompt recently
    const dismissedUntil = localStorage.getItem("sw_pwa_dismissed");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Delay showing prompt slightly on iOS
      const timer = setTimeout(() => setIsVisible(true), 3500);
      return () => clearTimeout(timer);
    }

    // Android / Desktop Chrome PWA beforeinstallprompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 7 days
    localStorage.setItem("sw_pwa_dismissed", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] inset-x-4 z-[var(--z-banner)] md:bottom-6 md:right-6 md:left-auto md:max-w-md animate-in slide-in-from-bottom duration-300">
      <div className="relative rounded-2xl border border-[var(--accent-20)] bg-[var(--surface-1)]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl text-[var(--text)]">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-slate-950 shadow-md">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text)]">Installer SmartWallet</h4>
            <p className="mt-0.5 text-xs text-[var(--muted)] leading-relaxed">
              Installez l'application sur votre écran d'accueil pour un accès instantané et 100% hors-ligne.
            </p>
          </div>
        </div>

        {isIos ? (
          <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2.5 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text)] mb-1">
              <span>Sur iPhone / iPad :</span>
            </div>
            <p className="flex items-center gap-1.5 leading-snug">
              1. Appuyez sur <Share className="h-3.5 w-3.5 text-sky-400 inline" /> (Partager)
            </p>
            <p className="flex items-center gap-1.5 leading-snug mt-1">
              2. Sélectionnez <PlusSquare className="h-3.5 w-3.5 text-emerald-400 inline" /> <strong>Sur l'écran d'accueil</strong>
            </p>
          </div>
        ) : (
          <div className="mt-3.5 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={handleDismiss} className="text-xs">
              Plus tard
            </Button>
            <Button size="sm" onClick={handleInstallClick} className="text-xs font-bold">
              <Download className="h-3.5 w-3.5 mr-1" /> Installer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
