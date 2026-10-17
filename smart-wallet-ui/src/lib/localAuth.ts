import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ChartDataPoint, DashboardStatsResponse, Profile, Wallet } from '../api/types';
import { db } from './db';

/**
 * Mode local autonome (Offline-First).
 * Utilisé quand ni Supabase ni le backend Spring Boot ne sont joignables (ex. SPA statique sur Vercel) :
 * le compte est stocké dans le navigateur, le portefeuille dans IndexedDB (Dexie), et l'utilisateur n'est jamais bloqué.
 */

export const LOCAL_TOKEN_PREFIX = 'sw-local-';
export const LOCAL_MODE_MESSAGE =
  'Connecté en Mode Local / Hors-ligne. Configurez Supabase pour la synchronisation Cloud.';

const ACCOUNTS_KEY = 'vaultis_local_accounts';

export interface LocalAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  passwordHash: string;
  accountNumber: string;
  createdAt: string;
}

export const isLocalToken = (token: string | null | undefined): token is string =>
  Boolean(token && token.startsWith(LOCAL_TOKEN_PREFIX));

export const isLocalSession = () => isLocalToken(localStorage.getItem('token'));

export const toLocalToken = (account: LocalAccount) => `${LOCAL_TOKEN_PREFIX}${account.id}`;

/**
 * Vrai si l'erreur signifie « aucun backend derrière /api » : réseau coupé, ou hébergement statique
 * qui répond 404/405/5xx (Vercel renvoie 405 sur un POST vers une route sans fonction serveur).
 */
export const isBackendUnavailable = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  if (!status) return true;
  if ([404, 405, 501, 502, 503, 504].includes(status)) return true;
  // Rewrite SPA : la route renvoie index.html au lieu de JSON
  const contentType = String(error.response?.headers?.['content-type'] ?? '');
  return contentType.includes('text/html');
};

const readAccounts = (): LocalAccount[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as LocalAccount[]) : [];
  } catch {
    return [];
  }
};

const writeAccounts = (accounts: LocalAccount[]) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const hashPassword = async (password: string): Promise<string> => {
  // crypto.subtle n'existe qu'en contexte sécurisé (https / localhost)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`vaultis:${password}`));
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `plain:${password}`;
};

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const generateAccountNumber = () => {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  return `SW-${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`;
};

export const findLocalAccountByToken = (token: string | null | undefined): LocalAccount | null => {
  if (!isLocalToken(token)) return null;
  const id = token.slice(LOCAL_TOKEN_PREFIX.length);
  return readAccounts().find((a) => a.id === id) ?? null;
};

export const getLocalProfile = (account: LocalAccount): Profile => ({
  username: account.username,
  fullName: account.fullName,
  email: account.email,
  avatarUrl: '',
});

/** Solde local (IndexedDB) ; 0.000 DT tant qu'aucune opération n'a été enregistrée. */
export const getLocalWallet = async (account: LocalAccount): Promise<Wallet> => {
  const stored = await db.wallet.get(account.accountNumber).catch(() => undefined);
  return {
    accountNumber: account.accountNumber,
    balance: stored?.balance ?? 0,
    currency: stored?.currency ?? 'TND',
  };
};

export const registerLocalAccount = async (input: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}): Promise<LocalAccount> => {
  const accounts = readAccounts();
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();

  if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Ce nom d'utilisateur existe déjà sur cet appareil.");
  }
  if (accounts.some((a) => a.email === email)) {
    throw new Error('Cette adresse e-mail est déjà utilisée sur cet appareil.');
  }

  const account: LocalAccount = {
    id: randomId(),
    username,
    fullName: input.fullName?.trim() || username,
    email,
    passwordHash: await hashPassword(input.password),
    accountNumber: generateAccountNumber(),
    createdAt: new Date().toISOString(),
  };

  writeAccounts([...accounts, account]);
  await db.wallet
    .put({ id: account.accountNumber, balance: 0, currency: 'TND', updatedAt: account.createdAt })
    .catch((e) => console.warn('Initialisation du portefeuille local impossible :', e));

  return account;
};

/** Retourne le compte local correspondant (nom d'utilisateur ou e-mail), ou null. */
export const authenticateLocalAccount = async (identifier: string, password: string): Promise<LocalAccount | null> => {
  const id = identifier.trim().toLowerCase();
  const account = readAccounts().find((a) => a.username.toLowerCase() === id || a.email === id);
  if (!account) return null;
  return account.passwordHash === (await hashPassword(password)) ? account : null;
};

const updateLocalAccount = (id: string, patch: Partial<Pick<LocalAccount, 'email' | 'fullName'>>) => {
  const accounts = readAccounts().map((a) => (a.id === id ? { ...a, ...patch } : a));
  writeAccounts(accounts);
  return accounts.find((a) => a.id === id) ?? null;
};

const EMPTY_STATS: DashboardStatsResponse = {
  totalRevenues: 0,
  totalExpenses: 0,
  totalSavings: 0,
  revenuesTrend: 0,
  expensesTrend: 0,
  savingsTrend: 0,
};

const ok = <T>(config: InternalAxiosRequestConfig, data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
  request: {},
});

/**
 * Adaptateur axios des sessions locales : sert les lectures depuis le navigateur au lieu d'interroger
 * un /api inexistant. Les écritures non gérées échouent comme une coupure réseau, ce qui déclenche
 * la file hors-ligne existante (syncEngine).
 */
export const localAdapter: AxiosAdapter = async (config) => {
  const account = findLocalAccountByToken(localStorage.getItem('token'));
  const url = config.url ?? '';
  const method = (config.method ?? 'get').toLowerCase();

  if (account) {
    if (method === 'get' && url.endsWith('/v1/profile/me')) return ok(config, getLocalProfile(account));
    if (method === 'get' && url.endsWith('/v1/wallet/me')) return ok(config, await getLocalWallet(account));
    if (method === 'get' && url.endsWith('/v1/transactions/history')) return ok(config, []);
    if (method === 'get' && url.endsWith('/v1/analytics/stats')) return ok(config, EMPTY_STATS);
    if (method === 'get' && url.endsWith('/v1/analytics/chart')) return ok(config, [] as ChartDataPoint[]);
    if (method === 'put' && url.endsWith('/v1/profile/me')) {
      const body = (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) as Partial<Profile>;
      const updated = updateLocalAccount(account.id, {
        email: body.email?.trim().toLowerCase() || account.email,
        fullName: body.fullName?.trim() || account.fullName,
      });
      return ok(config, getLocalProfile(updated ?? account));
    }
  }

  throw new AxiosError('Mode local : aucun serveur disponible.', AxiosError.ERR_NETWORK, config);
};
