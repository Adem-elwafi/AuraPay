import Dexie, { type Table } from 'dexie';

export type SyncStatus = 'synced' | 'pending' | 'failed';
export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncEntity = 'transaction' | 'wallet';

export interface LocalTransaction {
  id?: number | string; // Local primary key (number or UUID string)
  remoteId?: string | number | null; // Supabase or API remote ID
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category?: string | null;
  description?: string | null;
  timestamp: string;
  paymentMethod?: string | null;
  syncStatus: SyncStatus;
  localCreatedAt: string;
  senderAccountNumber?: string | null;
  recipientAccountNumber?: string | null;
  clientUuid?: string; // Idempotency UUID
}

export interface LocalWallet {
  id: string; // Account number or unique wallet ID
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id?: number;
  clientUuid: string; // Unique idempotency key
  action: SyncAction;
  entity: SyncEntity;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastError?: string | null;
}

export interface UserSetting {
  key: string;
  value: unknown;
}

export class SmartWalletDatabase extends Dexie {
  transactions!: Table<LocalTransaction, string | number>;
  wallet!: Table<LocalWallet, string>;
  sync_queue!: Table<SyncQueueItem, number>;
  user_settings!: Table<UserSetting, string>;

  constructor() {
    super('SmartWalletDB');

    // Schema definition
    // Note: primary key is first in the index list
    this.version(1).stores({
      transactions: '++id, remoteId, timestamp, type, category, syncStatus, clientUuid, localCreatedAt',
      wallet: 'id, updatedAt',
      sync_queue: '++id, clientUuid, action, entity, createdAt, attempts',
      user_settings: 'key',
    });
  }
}

export const db = new SmartWalletDatabase();
