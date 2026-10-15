import React, { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  CloudOff,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  Receipt,
  Search,
} from "lucide-react";
import type { DisplayTransaction, TransactionResponse } from "../api/types";
import { getTransactionHistory } from "../services/transaction.service";
import { IconTile } from "./ui/primitives";
import { formatDateTime, formatMoney } from "../lib/format";
import { useLanguage } from "../context/LanguageContext";

export interface TransactionsListProps {
  transactions?: DisplayTransaction[];
  autoLoad?: boolean;
  onLoad?: (transactions: TransactionResponse[]) => void;
  currentAccountNumber?: string;
  showControls?: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  ALIMENTATION: { label: "Alimentation", icon: "🛒" },
  TRANSPORT: { label: "Transport", icon: "🚌" },
  LOISIRS: { label: "Loisirs", icon: "🎬" },
  SHOPPING: { label: "Shopping", icon: "🛍️" },
  REVENUS: { label: "Revenus", icon: "💰" },
  AUTRE: { label: "Autre", icon: "💳" },
};

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions: initialTransactions = [],
  autoLoad = false,
  onLoad,
  currentAccountNumber,
  showControls = false,
}) => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<DisplayTransaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  useEffect(() => {
    if (autoLoad && transactions.length === 0) {
      void loadTransactions();
    }
  }, [autoLoad]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactionHistory();
      setTransactions(data);
      onLoad?.(data);
    } catch (err) {
      setError("Impossible de charger l'historique des transactions");
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTransactions.length > 0) {
      setTransactions(initialTransactions);
    }
  }, [initialTransactions]);

  const getTransactionDisplay = (tx: TransactionResponse) => {
    const config = tx.category ? CATEGORY_CONFIG[tx.category] : null;
    const label =
      tx.description && tx.description.trim() !== ""
        ? tx.description
        : config
        ? config.label
        : tx.type === "CREDIT"
        ? "Virement Reçu"
        : "Achat / Dépense";

    return { label, categoryLabel: config?.label || "Général" };
  };

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const isCredit = currentAccountNumber
        ? tx.recipientAccountNumber === currentAccountNumber
        : tx.type === "CREDIT";

      // 1. Filter by type
      if (selectedType === "CREDIT" && !isCredit) return false;
      if (selectedType === "DEBIT" && isCredit) return false;

      // 2. Filter by category
      if (selectedCategory !== "ALL" && tx.category !== selectedCategory) return false;

      // 3. Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const description = (tx.description || "").toLowerCase();
        const sender = (tx.senderAccountNumber || "").toLowerCase();
        const recipient = (tx.recipientAccountNumber || "").toLowerCase();
        const categoryLabel = tx.category
          ? (CATEGORY_CONFIG[tx.category]?.label || "").toLowerCase()
          : "";

        const matches =
          description.includes(query) ||
          sender.includes(query) ||
          recipient.includes(query) ||
          categoryLabel.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, selectedCategory, selectedType, currentAccountNumber]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Date",
      "Type",
      "Description",
      "Catégorie",
      "Expéditeur",
      "Destinataire",
      "Montant (TND)",
    ];

    const rows = filteredTransactions.map((tx) => {
      const isCredit = currentAccountNumber
        ? tx.recipientAccountNumber === currentAccountNumber
        : tx.type === "CREDIT";
      const formattedDate = tx.timestamp ? new Date(tx.timestamp).toLocaleString("fr-FR") : "";
      return [
        tx.id,
        formattedDate,
        isCredit ? "CREDIT" : "DEBIT",
        tx.description || "",
        tx.category || "",
        tx.senderAccountNumber || "",
        tx.recipientAccountNumber || "",
        `${isCredit ? "" : "-"}${tx.amount}`,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `releve_smartwallet_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--muted)]">
        Chargement des transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[rgba(251,113,133,0.3)] bg-[var(--negative-15)] p-4 text-xs text-[var(--negative)]">
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters row */}
      {showControls && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder={t('search_tx')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-soft)]"
              />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50 shadow-xs shrink-0 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              {t('export_csv')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              <Filter className="h-3 w-3" /> {t('filter')}
            </span>

            {/* Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] outline-none transition hover:border-[var(--line-strong)] focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text)]">{t('all_types')}</option>
              <option value="CREDIT" className="bg-[var(--surface)] text-[var(--text)]">{t('credit_type')}</option>
              <option value="DEBIT" className="bg-[var(--surface)] text-[var(--text)]">{t('debit_type')}</option>
            </select>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] outline-none transition hover:border-[var(--line-strong)] focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text)]">{t('all_categories')}</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, value]) => (
                <option key={key} value={key} className="bg-[var(--surface)] text-[var(--text)]">
                  {value.icon} {value.label}
                </option>
              ))}
            </select>

            <span className="ml-auto text-[11px] text-[var(--muted)]">
              {filteredTransactions.length} transaction(s)
            </span>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--subtle)]">
            <Receipt size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">{t('no_transactions_yet')}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{t('no_transactions_recent')}</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isCredit = currentAccountNumber
              ? tx.recipientAccountNumber === currentAccountNumber
              : tx.type === "CREDIT";

            const { label } = getTransactionDisplay(tx);
            const signedAmount = isCredit ? Math.abs(tx.amount) : -Math.abs(tx.amount);
            const counterpart = isCredit
              ? tx.senderAccountNumber || "Virement entrant"
              : tx.recipientAccountNumber || tx.category || "Dépense";

            return (
              <div
                key={tx.pendingSync ? `pending-${tx.id}` : tx.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5 transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-3)] group shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <IconTile
                    icon={isCredit ? ArrowDownLeft : ArrowUpRight}
                    tone={isCredit ? "accent" : "negative"}
                    size="md"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent-text)] transition-colors">
                      {label}
                      {tx.pendingSync && (
                    <span
                      title="Enregistrée hors-ligne, en attente de synchronisation"
                      className="ml-1.5 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px align-middle text-[9px] font-semibold text-amber-400"
                    >
                      <CloudOff className="h-2.5 w-2.5" aria-hidden /> En attente
                    </span>
                  )}
                    </h4>
                    <p className="truncate text-[12px] text-[var(--muted)]">
                      {isCredit ? "Reçu de" : "Envoyé à"} : {counterpart}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div
                    className={`tabular text-sm font-bold ${
                      isCredit ? "text-[var(--accent-light)]" : "text-[var(--text)]"
                    }`}
                  >
                    {formatMoney(signedAmount, "TND", undefined, { signed: true })}
                  </div>
                  {tx.timestamp && (
                    <p className="text-[10px] text-[var(--subtle)] mt-0.5">
                      {formatDateTime(tx.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
export { TransactionsList };