import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useSyncEngine } from "../services/syncEngine";
import { cn } from "../lib/cn";

export interface SyncStatusBadgeProps {
  className?: string;
  compact?: boolean;
}

export default function SyncStatusBadge({ className, compact = false }: SyncStatusBadgeProps) {
  const { isOnline, isSyncing, pendingCount, hasCloudConnection, triggerSync } = useSyncEngine();

  // If syncing
  if (isSyncing) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 transition shadow-xs",
          className
        )}
        title="Synchronisation en cours avec le Cloud Supabase..."
      >
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400 shrink-0" />
        {!compact && <span>Synchronisation en cours...</span>}
      </button>
    );
  }

  // If offline or pending changes
  if (!isOnline || pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={() => void triggerSync()}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer shadow-xs",
          className
        )}
        title={
          !isOnline
            ? `Mode Hors-ligne (${pendingCount} opération${pendingCount > 1 ? "s" : ""} en attente)`
            : `${pendingCount} opération${pendingCount > 1 ? "s" : ""} locale${pendingCount > 1 ? "s" : ""} prête${pendingCount > 1 ? "s" : ""} à être synchronisée${pendingCount > 1 ? "s" : ""}`
        }
      >
        <CloudOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        {!compact && (
          <span>
            {!isOnline ? "Hors-ligne" : "En attente"} ({pendingCount})
          </span>
        )}
      </button>
    );
  }

  // Cloud connected & fully synced
  return (
    <button
      type="button"
      onClick={() => void triggerSync()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer shadow-xs",
        className
      )}
      title={hasCloudConnection ? "Synchronisé avec le Cloud Supabase (0s cold-start)" : "Mode Local Autonome (IndexedDB actif)"}
    >
      <Cloud className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      {!compact && <span>{hasCloudConnection ? "Synchronisé Cloud" : "Mode Local"}</span>}
    </button>
  );
}
