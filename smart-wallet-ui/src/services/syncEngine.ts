import { useSyncExternalStore } from 'react';
import { db, type LocalTransaction, type SyncQueueItem } from '../lib/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SyncEngineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  hasCloudConnection: boolean;
}

class SyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private pendingCount: number = 0;
  private lastSyncTime: string | null = null;
  private listeners = new Set<() => void>();
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private snapshot: SyncEngineState;

  constructor() {
    this.snapshot = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
      hasCloudConnection: isSupabaseConfigured,
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Periodically refresh pending count
      void this.refreshPendingCount();

      // Check on startup
      if (this.isOnline && isSupabaseConfigured) {
        setTimeout(() => {
          void this.triggerSync();
        }, 1500);
      }
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    this.scheduleSync(500);
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  private notify() {
    this.snapshot = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
      hasCloudConnection: isSupabaseConfigured,
    };
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): SyncEngineState => {
    return this.snapshot;
  };

  public async refreshPendingCount(): Promise<number> {
    try {
      const count = await db.sync_queue.count();
      if (this.pendingCount !== count) {
        this.pendingCount = count;
        this.notify();
      }
      return count;
    } catch {
      return this.pendingCount;
    }
  }

  public scheduleSync(delayMs = 1000) {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }
    this.syncDebounceTimer = setTimeout(() => {
      void this.triggerSync();
    }, delayMs);
  }

  /**
   * Enqueue a new transaction creation (works seamlessly offline)
   */
  public async enqueueTransaction(txData: {
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    category?: string | null;
    description?: string | null;
    timestamp?: string;
    senderAccountNumber?: string | null;
    recipientAccountNumber?: string | null;
    paymentMethod?: string | null;
  }): Promise<LocalTransaction> {
    const clientUuid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const nowIso = new Date().toISOString();

    const localTx: LocalTransaction = {
      amount: txData.amount,
      type: txData.type,
      category: txData.category || null,
      description: txData.description || null,
      timestamp: txData.timestamp || nowIso,
      localCreatedAt: nowIso,
      paymentMethod: txData.paymentMethod || 'Carte',
      senderAccountNumber: txData.senderAccountNumber || null,
      recipientAccountNumber: txData.recipientAccountNumber || null,
      syncStatus: isSupabaseConfigured && this.isOnline ? 'pending' : 'pending',
      clientUuid,
    };

    // Store in IndexedDB
    const insertedId = await db.transactions.add(localTx);
    localTx.id = insertedId;

    // Enqueue sync operation
    const queueItem: SyncQueueItem = {
      clientUuid,
      action: 'CREATE',
      entity: 'transaction',
      payload: {
        ...localTx,
        localId: insertedId,
      },
      createdAt: nowIso,
      attempts: 0,
    };
    await db.sync_queue.add(queueItem);

    await this.refreshPendingCount();

    // Trigger sync immediately if online
    if (this.isOnline && isSupabaseConfigured) {
      this.scheduleSync(300);
    }

    return localTx;
  }

  /**
   * Sequential atomic synchronization worker with Supabase
   */
  public async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    if (!this.isOnline) {
      await this.refreshPendingCount();
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      // Offline-First autonomous mode: no cloud backend configured
      await this.refreshPendingCount();
      return;
    }

    this.isSyncing = true;
    this.notify();

    try {
      // Retrieve queued items sequentially by creation date
      const queueItems = await db.sync_queue.orderBy('id').toArray();

      for (const item of queueItems) {
        if (!this.isOnline) break;

        try {
          if (item.entity === 'transaction' && item.action === 'CREATE') {
            await this.syncTransactionCreate(item);
          }
          // Remove successfully processed item from queue
          if (item.id) {
            await db.sync_queue.delete(item.id);
          }
        } catch (itemError: unknown) {
          console.warn('[SyncEngine] Failed sync item:', item.id, itemError);
          const errorMsg = itemError instanceof Error ? itemError.message : String(itemError);
          if (item.id) {
            await db.sync_queue.update(item.id, {
              attempts: item.attempts + 1,
              lastError: errorMsg,
            });
          }
        }
      }

      this.lastSyncTime = new Date().toISOString();
    } catch (err) {
      console.error('[SyncEngine] Global sync error:', err);
    } finally {
      this.isSyncing = false;
      await this.refreshPendingCount();
      this.notify();
    }
  }

  private async syncTransactionCreate(item: SyncQueueItem): Promise<void> {
    if (!supabase) return;

    const payload = item.payload as Partial<LocalTransaction> & { localId?: number | string };

    // Get current auth user if available
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id ?? null;

    // Supabase upsert/insert with idempotency clientUuid
    const { data, error } = await supabase
      .from('transactions')
      .upsert(
        {
          id: item.clientUuid, // Use client UUID as remote UUID or idempotency key
          user_id: userId,
          amount: payload.amount,
          type: payload.type,
          category: payload.category || 'AUTRE',
          description: payload.description || 'Transaction',
          payment_method: payload.paymentMethod || 'Carte',
          timestamp: payload.timestamp || new Date().toISOString(),
          created_at: payload.localCreatedAt || new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    // Mark local transaction as 'synced' in IndexedDB
    const localTx = await db.transactions
      .where('clientUuid')
      .equals(item.clientUuid)
      .first();

    if (localTx && localTx.id !== undefined) {
      await db.transactions.update(localTx.id, {
        syncStatus: 'synced',
        remoteId: data?.id || item.clientUuid,
      });
    }
  }
}

export const syncEngine = new SyncEngine();

/**
 * React Hook to access reactive syncEngine state
 */
export function useSyncEngine(): SyncEngineState & {
  triggerSync: () => Promise<void>;
  enqueueTransaction: typeof syncEngine.enqueueTransaction;
} {
  const state = useSyncExternalStore(syncEngine.subscribe, syncEngine.getSnapshot);

  return {
    ...state,
    triggerSync: () => syncEngine.triggerSync(),
    enqueueTransaction: (txData) => syncEngine.enqueueTransaction(txData),
  };
}
