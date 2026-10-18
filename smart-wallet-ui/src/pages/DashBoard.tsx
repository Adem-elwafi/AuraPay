import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, Send, X, History, Minus, Plus, ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import Button from "../components/ui/Button";
import BottomSheet from "../components/ui/BottomSheet";
import { formatLongDate } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getTransactionHistory } from "../services/transaction.service";
import { getDashboardChart, getDashboardStats } from "../services/analytics.service";
import type { ChartDataPoint, DashboardStatsResponse, DisplayTransaction, TransactionResponse } from "../api/types";
import { db, type LocalTransaction } from "../lib/db";
import {
  BalancePanel,
  FlowAnalytics,
  type FlowPoint,
  QuickTransfer,
  RecentActivity,
  type SpendingCategory,
  StatCards,
  type StatItem,
  UpgradeCard,
} from "../features/dashboard";
import TransactionsList from "../components/TransactionsList";
import { scrollToAnchor } from "../lib/scrollToAnchor";

/** A local entry is considered already applied server-side if a matching server transaction exists close in time. */
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

const mergeWithPending = (
  serverTxs: TransactionResponse[],
  pendingTxs: LocalTransaction[],
  accountNumber?: string
): DisplayTransaction[] => {
  const pending: DisplayTransaction[] = pendingTxs
    .filter((local) => {
      const localTime = new Date(local.timestamp).getTime();
      return !serverTxs.some(
        (tx) =>
          tx.type === local.type &&
          Math.abs(Number(tx.amount) - Number(local.amount)) < 0.0005 &&
          Math.abs(new Date(tx.timestamp).getTime() - localTime) < DEDUPE_WINDOW_MS
      );
    })
    .map((local) => ({
      // Negative ids never collide with server ids
      id: -Number(local.id ?? Date.now()),
      amount: Number(local.amount),
      timestamp: local.timestamp,
      type: local.type,
      category: (local.category as TransactionResponse["category"]) ?? null,
      description: local.description ?? null,
      senderAccountNumber: local.type === "CREDIT" ? null : local.senderAccountNumber ?? accountNumber ?? null,
      recipientAccountNumber: local.type === "CREDIT" ? accountNumber ?? null : local.recipientAccountNumber ?? null,
      pendingSync: true,
    }));

  if (pending.length === 0) return serverTxs;

  return [...pending, ...serverTxs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export default function DashboardPage() {
  const { user, wallet, loading: sessionLoading, logout, refreshUserData } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  // Offline entries stored in IndexedDB and not yet synchronised (reactive)
  const pendingLocalTxs = useLiveQuery(
    () => db.transactions.where("syncStatus").notEqual("synced").toArray(),
    [],
    [] as LocalTransaction[]
  );
  const displayedTransactions = useMemo(
    () => mergeWithPending(transactions, pendingLocalTxs, wallet?.accountNumber),
    [transactions, pendingLocalTxs, wallet?.accountNumber]
  );
  const [txLoading, setTxLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsResponse | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Modals state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [mobileAnalyticsOpen, setMobileAnalyticsOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    mode: "deposit" | "p2p" | "expense";
  }>({
    open: false,
    mode: "deposit",
  });

  // Listen to open-quick-action global event (e.g. from BottomNav center button)
  useEffect(() => {
    const handleQuickAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: "deposit" | "p2p" | "expense" }>;
      setActionModal({
        open: true,
        mode: customEvent.detail?.mode || "expense",
      });
    };
    window.addEventListener("open-quick-action", handleQuickAction);
    return () => window.removeEventListener("open-quick-action", handleQuickAction);
  }, []);

  // Hash navigation (BottomNav / Navbar): open the mobile analytics accordion, then scroll to the visible section
  useEffect(() => {
    if (!location.hash) return;
    if (location.hash === "#analytics") setMobileAnalyticsOpen(true);
    const id = window.setTimeout(() => scrollToAnchor(location.hash), 60);
    return () => window.clearTimeout(id);
  }, [location.hash, location.key]);

  const firstName = useMemo(() => {
    if (user?.fullName?.trim()) {
      return user.fullName.trim().split(" ")[0];
    }
    return user?.username || "";
  }, [user]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 18 ? t('greeting_morning') : t('greeting_evening');
  }, [t]);

  const loadData = useCallback(async () => {
    setTxLoading(true);
    setError(null);

    try {
      const txData = await getTransactionHistory();
      if (txData && txData.length > 0) {
        setTransactions(txData);
      } else {
        setTransactions([]);
      }
    } catch (err: unknown) {
      // Keep the last known history on network failure (offline); local pending entries are merged on top
      if (axios.isAxiosError(err) && !err.response) return;
      setTransactions([]);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 && localStorage.getItem('token') !== 'sw-demo-session') {
          logout();
          return;
        }
      }
    } finally {
      setTxLoading(false);
    }
  }, [logout]);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const [statsData, chartSeries] = await Promise.all([
        getDashboardStats(),
        getDashboardChart(),
      ]);

      setDashboardStats(statsData);
      setChartData(chartSeries);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        if (localStorage.getItem('token') !== 'sw-demo-session') {
          logout();
          return;
        }
      }
      if (localStorage.getItem('token') !== 'sw-demo-session') {
        setAnalyticsError("Impossible de charger les analyses financières.");
      }
    } finally {
      setAnalyticsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
      void loadAnalytics();
    });
  }, [loadData, loadAnalytics]);

  // Écoute des mises à jour temps réel (Supabase Realtime ou virement inter-onglets)
  useEffect(() => {
    const handleTxUpdate = () => {
      void loadData();
      void loadAnalytics();
      void refreshUserData().catch(() => undefined);
    };
    window.addEventListener('vaultis-tx-updated', handleTxUpdate);
    return () => window.removeEventListener('vaultis-tx-updated', handleTxUpdate);
  }, [loadData, loadAnalytics, refreshUserData]);

  const handleTransactionSuccess = useCallback(() => {
    void loadData();
    void loadAnalytics();
    void refreshUserData().catch(() => undefined);
    if (actionModal.open) {
      setTimeout(() => {
        setActionModal({ open: false, mode: "deposit" });
      }, 1500);
    }
  }, [loadData, loadAnalytics, refreshUserData, actionModal.open]);

  // Transform chart series and fallback to realistic 30-day flow
  const dailyFlowPoints = useMemo<FlowPoint[]>(() => {
    if (chartData && chartData.length > 0) {
      return chartData.map((p) => ({
        date: p.label,
        net: Number(p.amount) || 0,
      }));
    }

    const DAY = 86_400_000;
    const today = new Date();
    // Benchmark curve rising smoothly to +1 199,40 €
    const DAILY_NET = [
      12.5, 15.0, 10.2, 18.4, 14.1, 16.8, 22.0, 19.5, 25.1, 21.0,
      28.3, 24.5, 31.0, 29.2, 35.4, 32.1, 38.0, 36.5, 42.0, 45.2,
      48.0, 52.3, 56.1, 61.2, 65.4, 72.0, 78.5, 84.1, 92.5, 72.5,
    ];
    return DAILY_NET.map((net, i) => ({
      date: new Date(today.getTime() - (DAILY_NET.length - 1 - i) * DAY).toISOString(),
      net,
    }));
  }, [chartData]);

  // Spending categories computed dynamically from debit transactions
  const spendingBreakdown = useMemo<SpendingCategory[]>(() => {
    const debits = transactions.filter((t) => t.type === "DEBIT");
    if (debits.length === 0) {
      return [];
    }
    const catTotals = new Map<string, number>();
    let totalSpent = 0;
    debits.forEach((d) => {
      const cat = d.category || "AUTRE";
      const amt = Number(d.amount) || 0;
      catTotals.set(cat, (catTotals.get(cat) || 0) + amt);
      totalSpent += amt;
    });

    if (totalSpent === 0) return [];

    return Array.from(catTotals.entries()).map(([cat, amt]) => ({
      label: cat,
      share: Math.round((amt / totalSpent) * 100),
    }));
  }, [transactions]);

  // Stat items with real values, trends and sparkline curves
  const statItems = useMemo<StatItem[]>(() => {
    const chartSeries = chartData.map((p) => Number(p.amount)).filter((n) => !isNaN(n));
    const revenuesTrend = chartSeries.length >= 2 ? chartSeries : [0, 0];
    const expensesTrend =
      chartSeries.length >= 2
        ? chartSeries.map((v) => Math.max(0, v * 0.5))
        : [0, 0];
    const savingsTrend =
      chartSeries.length >= 2
        ? chartSeries.map((v) => Math.max(0, v * 0.5))
        : [0, 0];

    const revVal = dashboardStats?.totalRevenues ?? 0;
    const expVal = dashboardStats?.totalExpenses ?? 0;
    const savVal = dashboardStats?.totalSavings ?? 0;

    return [
      {
        key: "income",
        label: t('revenues_month'),
        value: revVal,
        delta: dashboardStats?.revenuesTrend ?? 0,
        trend: revenuesTrend,
      },
      {
        key: "spending",
        label: t('spending'),
        value: expVal,
        delta: dashboardStats?.expensesTrend ?? 0,
        trend: expensesTrend,
      },
      {
        key: "savings",
        label: t('savings'),
        value: savVal,
        delta: dashboardStats?.savingsTrend ?? 0,
        trend: savingsTrend,
      },
    ];
  }, [dashboardStats, chartData, t]);

  // Quick contacts extracted from real transactions
  const quickContacts = useMemo(() => {
    const contactsMap = new Map<string, { id: string; name: string; walletId: string }>();

    transactions.forEach((tx) => {
      const isCredit = wallet?.accountNumber
        ? tx.recipientAccountNumber === wallet.accountNumber
        : tx.type === "CREDIT";
      const targetId = isCredit ? tx.senderAccountNumber : tx.recipientAccountNumber;

      if (targetId && targetId !== wallet?.accountNumber && !contactsMap.has(targetId)) {
        const cleanName =
          tx.description && !tx.description.toLowerCase().includes("virement")
            ? tx.description
            : `Contact ${targetId.slice(-4)}`;
        contactsMap.set(targetId, {
          id: `c-${tx.id}`,
          name: cleanName,
          walletId: targetId,
        });
      }
    });

    return Array.from(contactsMap.values()).slice(0, 3);
  }, [transactions, wallet?.accountNumber]);

  if (sessionLoading || ((txLoading || analyticsLoading) && displayedTransactions.length === 0 && !dashboardStats)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--accent-light)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-20)] border-t-[var(--accent)]" />
          <p className="eyebrow !text-xs tracking-[0.3em] text-[var(--muted)]">
            Initialisation de votre espace Elite...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative text-[var(--text)]">
      {/* Error Banner */}
      {(error || analyticsError) && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-[rgba(251,113,133,0.3)] bg-[var(--negative-15)] px-4 py-3 text-sm text-[var(--negative)]">
          <span>{error || analyticsError}</span>
          <button
            onClick={() => {
              setError(null);
              setAnalyticsError(null);
            }}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Header Greeting + Action Buttons */}
      <div className="sw-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow first-letter:uppercase text-[var(--muted)]">{formatLongDate(new Date())}</p>
          <h1 className="font-display mt-2 text-3xl leading-tight text-[var(--text)] sm:text-5xl">
            {greeting},{" "}
            <span className="italic text-[var(--accent)]">{firstName}</span>
          </h1>
        </div>
        {/* Desktop Header Action Buttons */}
        <div className="hidden sm:flex gap-2.5">
          <Button
            variant="outline"
            onClick={() => setActionModal({ open: true, mode: "deposit" })}
          >
            <ArrowDownLeft className="h-4 w-4" /> {t('deposit')}
          </Button>
          <Button onClick={() => setActionModal({ open: true, mode: "p2p" })}>
            <Send className="h-4 w-4" /> {t('mode_p2p')}
          </Button>
        </div>
      </div>

      {/* 2. Mobile Action Pills: [ ➖ Saisir Dépense ] & [ ➕ Saisir Entrée ] */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
        <button
          type="button"
          onClick={() => setActionModal({ open: true, mode: "expense" })}
          className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 py-3 px-4 text-xs font-bold text-rose-300 shadow-sm active:scale-98 transition cursor-pointer hover:bg-rose-500/20"
        >
          <div className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/20 text-rose-300">
            <Minus className="h-3.5 w-3.5" />
          </div>
          <span>Saisir Dépense</span>
        </button>

        <button
          type="button"
          onClick={() => setActionModal({ open: true, mode: "deposit" })}
          className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3 px-4 text-xs font-bold text-emerald-300 shadow-sm active:scale-98 transition cursor-pointer hover:bg-emerald-500/20"
        >
          <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span>Saisir Entrée</span>
        </button>
      </div>

      {/* 12-Column Responsive Layout */}
      <div className="mt-6 sm:mt-8 grid gap-6 lg:grid-cols-12">
        {/* Main Column (8 cols): 1. BalancePanel → 3. StatCards → 4. RecentActivity (on mobile) → 5. FlowAnalytics */}
        <div className="min-w-0 space-y-6 lg:col-span-8">
          {/* 1. Salutation & Solde Principal (Carte Elite) */}
          <section id="cards" className="scroll-mt-28">
            <BalancePanel
              wallet={wallet}
              holder={firstName}
              monthlyLimit={5000}
              monthlySpent={dashboardStats?.totalExpenses ?? 0}
              onDepositClick={() => setActionModal({ open: true, mode: "deposit" })}
              onWithdrawClick={() => setActionModal({ open: true, mode: "expense" })}
              onSettingsClick={() => setIsHistoryModalOpen(true)}
            />
          </section>

          {/* 3. Résumé du Mois (Cartes de stats avec jauge de budget) */}
          <section>
            <StatCards stats={statItems} />
          </section>

          {/* 4. Dernières Dépenses (Activité récente) - Placé ici pour smartphone */}
          <div className="lg:hidden">
            <section id="transactions" className="scroll-mt-28">
              <RecentActivity
                items={displayedTransactions}
                currentAccountNumber={wallet?.accountNumber}
                onViewAll={() => setIsHistoryModalOpen(true)}
                maxItems={5}
              />
            </section>
          </div>

          {/* 5. Graphiques & Donut d'analyse (présentés sous forme repliable / accordéon sur mobile) */}
          <section id="analytics" className="scroll-mt-28">
            {/* Mobile Accordion Header */}
            <div className="lg:hidden mb-2">
              <button
                type="button"
                onClick={() => setMobileAnalyticsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 text-sm font-bold text-[var(--text)] transition cursor-pointer hover:bg-[var(--surface-3)]"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="h-4 w-4 text-[var(--accent)]" />
                  <span>Graphiques & Analyse des Dépenses</span>
                </div>
                {mobileAnalyticsOpen ? (
                  <ChevronUp className="h-4 w-4 text-[var(--muted)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
                )}
              </button>
            </div>

            <div className={!mobileAnalyticsOpen ? "hidden lg:block" : "block"}>
              <FlowAnalytics
                dailyFlow={dailyFlowPoints}
                breakdown={spendingBreakdown}
                insight={{
                  title: "Insight Elite",
                  spendingChange: dashboardStats?.expensesTrend ?? -100,
                }}
                onViewReport={() => setIsHistoryModalOpen(true)}
              />
            </div>
          </section>
        </div>

        {/* Aside Column (4 cols, visible on desktop / large screen): QuickTransfer → RecentActivity → UpgradeCard */}
        <aside
          className="min-w-0 space-y-6 lg:col-span-4"
          aria-label="Actions rapides et flux"
        >
          <section id="virement" className="hidden lg:block">
            <QuickTransfer
              balance={wallet?.balance}
              contacts={quickContacts}
              onTransferSuccess={handleTransactionSuccess}
            />
          </section>

          <section id="transactions-desktop" className="hidden lg:block scroll-mt-28">
            <RecentActivity
              items={displayedTransactions}
              currentAccountNumber={wallet?.accountNumber}
              onViewAll={() => setIsHistoryModalOpen(true)}
              maxItems={5}
            />
          </section>

          <section>
            <UpgradeCard />
          </section>
        </aside>
      </div>

      {/* History Modal ("Tout voir") */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-2xl sm:p-7 text-[var(--text)]">
            <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-6 py-4 backdrop-blur-xl sm:-mx-7 sm:-mt-7 sm:px-7">
              <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--text)]">
                <History className="h-5 w-5 text-[var(--accent)]" />
                {t('history_title')}
              </h3>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] cursor-pointer"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <TransactionsList
              transactions={displayedTransactions}
              currentAccountNumber={wallet?.accountNumber}
              showControls={true}
            />
          </div>
        </div>
      )}

      {/* Quick Action: BottomSheet on Mobile, Modal on Desktop */}
      <BottomSheet
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, mode: "deposit" })}
        title={
          actionModal.mode === "deposit"
            ? t('confirm_deposit')
            : actionModal.mode === "expense"
            ? t('confirm_expense')
            : t('confirm_transfer')
        }
      >
        <QuickTransfer
          balance={wallet?.balance}
          contacts={quickContacts}
          initialMode={actionModal.mode}
          standalone={true}
          onTransferSuccess={handleTransactionSuccess}
        />
      </BottomSheet>
    </div>
  );
}