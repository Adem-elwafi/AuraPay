import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = "90vh",
}: BottomSheetProps) {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Touch swipe-to-dismiss handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setStartY(null);
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-sheet)] flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        style={{
          transform: currentY > 0 ? `translateY(${currentY}px)` : undefined,
          maxHeight,
        }}
        className={cn(
          "relative z-10 w-full overflow-hidden border-t md:border border-[var(--line-strong)] bg-[var(--surface-1)] shadow-2xl text-[var(--text)] transition-transform duration-200 ease-out",
          // Mobile: sliding sheet from bottom with rounded top
          "rounded-t-[32px] md:rounded-[28px] md:max-w-xl md:w-full",
          // Safe bottom padding for navigation bar / gesture bar
          "pb-[max(env(safe-area-inset-bottom),1.5rem)]",
          "animate-in slide-in-from-bottom duration-300"
        )}
      >
        {/* Touch / Drag Handle for Mobile */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex w-full cursor-grab active:cursor-grabbing flex-col items-center pt-3 pb-2 select-none md:hidden"
        >
          <div className="h-1.5 w-12 rounded-full bg-[var(--line-strong)] hover:bg-[var(--muted)] transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-3.5">
          <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
            {title || "Opération"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-5rem)] px-5 py-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
