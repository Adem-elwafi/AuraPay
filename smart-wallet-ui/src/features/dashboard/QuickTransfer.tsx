import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  AtSign,
  CheckCircle2,
  CircleDollarSign,
  CloudOff,
  FileText,
  ReceiptText,
  Send,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { getApiErrorMessage } from "../../api/axiosConfig";
import { Card, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import { Avatar, Segmented, type SegmentOption } from "../../components/ui/primitives";
import { formatMoney } from "../../lib/format";
import { cn } from "../../lib/cn";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { createDeposit, createExpense, initiateTransfer } from "../../services/transaction.service";
import { syncEngine } from "../../services/syncEngine";
import type { TransactionCategory, TransactionResponse } from "../../api/types";

export interface Contact {
  id: string;
  name: string;
  walletId: string;
}

export interface QuickTransferProps {
  balance?: number;
  contacts?: Contact[];
  onTransferSuccess?: (tx?: TransactionResponse) => void;
  initialMode?: "p2p" | "expense" | "deposit";
  standalone?: boolean;
}

const MODES: SegmentOption<"p2p" | "expense" | "deposit">[] = [
  { value: "p2p", label: "Transfert P2P", icon: ArrowLeftRight },
  { value: "expense", label: "Dépense", icon: ReceiptText },
  { value: "deposit", label: "Dépôt", icon: CircleDollarSign },
];

const PRESETS = [5, 10, 20, 50];

const EXPENSE_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: "ALIMENTATION", label: "Alimentation & Restauration" },
  { value: "TRANSPORT", label: "Transport & Mobilité" },
  { value: "LOISIRS", label: "Loisirs & Style de vie" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "REVENUS", label: "Revenus" },
  { value: "AUTRE", label: "Autre" },
];

const DEFAULT_CONTACTS: Contact[] = [
  { id: "c1", name: "Sophie Laurent", walletId: "SW-1 2266 5841 3" },
  { id: "c2", name: "Marcus Chen", walletId: "SW-9 4071 6891 9" },
  { id: "c3", name: "Lina Amri", walletId: "SW-4 5512 0098 2" },
];

/** Parses "1 234,50" or "1234.5" → 1234.5 */
const parseAmount = (s: string | number): number =>
  Number(String(s).replace(/\s/g, "").replace(",", ".")) || 0;

export default function QuickTransfer({
  balance: propBalance,
  contacts = DEFAULT_CONTACTS,
  onTransferSuccess,
  initialMode = "p2p",
  standalone = false,
}: QuickTransferProps) {
  const { wallet, refreshUserData } = useAuth();
  const { t, isRtl } = useLanguage();
  const currentBalance = propBalance !== undefined ? propBalance : wallet?.balance ?? 0;

  const [mode, setMode] = useState<"p2p" | "expense" | "deposit">(initialMode);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("ALIMENTATION");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "queued" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const value = parseAmount(amount);
  const remaining = mode === "deposit" ? currentBalance + value : currentBalance - value;
  // Les dépenses en espèces ne sont pas bloquées même avec solde virtuel à 0
  const overBalance = mode === "p2p" && value > currentBalance;
  const needsRecipient = mode === "p2p";
  const canSubmit =
    value > 0 &&
    !overBalance &&
    (!needsRecipient || recipient.trim().length >= 4) &&
    status !== "sending";

  const handleModeChange = (nextMode: "p2p" | "expense" | "deposit") => {
    setMode(nextMode);
    setStatus("idle");
    setErrorMessage("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      let tx: TransactionResponse;
      if (mode === "p2p") {
        tx = await initiateTransfer({
          recipientAccountNumber: recipient.trim(),
          amount: value,
          description: description.trim() || "Virement P2P instantané",
        });
      } else if (mode === "expense") {
        tx = await createExpense({
          amount: value,
          category,
          description: description.trim() || "Dépense personnelle",
        });
      } else {
        tx = await createDeposit({
          amount: value,
        });
      }

      setStatus("done");
      onTransferSuccess?.(tx);
      await refreshUserData().catch(() => undefined);

      setTimeout(() => {
        setStatus("idle");
        setAmount("");
        setRecipient("");
        setDescription("");
      }, 2400);
    } catch (err: unknown) {
      // Only a genuine network outage (no HTTP response) may fall back to the offline queue.
      // Any HTTP error (400 insufficient balance / invalid amount, 401, 5xx...) is a real rejection.
      const isNetworkError =
        (typeof navigator !== "undefined" && !navigator.onLine) ||
        (axios.isAxiosError(err) && !err.response);

      // A P2P transfer moves money between two accounts: it can never be deferred without the server.
      if (!isNetworkError || mode === "p2p") {
        setStatus("error");
        setErrorMessage(
          isNetworkError
            ? "Connexion indisponible : un virement P2P nécessite une connexion au serveur. Réessayez une fois en ligne."
            : getApiErrorMessage(err, "Une erreur est survenue lors de l'opération")
        );
        return;
      }

      try {
        const localTx = await syncEngine.enqueueTransaction({
          amount: value,
          type: mode === "deposit" ? "CREDIT" : "DEBIT",
          category: mode === "expense" ? category : "REVENUS",
          description: description.trim() || (mode === "deposit" ? "Dépôt d'argent (Hors-ligne)" : "Dépense personnelle (Hors-ligne)"),
          senderAccountNumber: mode === "deposit" ? null : wallet?.accountNumber,
          recipientAccountNumber: mode === "deposit" ? wallet?.accountNumber : null,
        });

        const fallbackResponse: TransactionResponse = {
          id: typeof localTx.id === "number" ? -localTx.id : -Date.now(),
          amount: value,
          timestamp: localTx.timestamp,
          type: localTx.type,
          category: (localTx.category as TransactionCategory) || null,
          description: localTx.description ?? null,
          senderAccountNumber: mode === "deposit" ? null : wallet?.accountNumber ?? null,
          recipientAccountNumber: mode === "deposit" ? wallet?.accountNumber ?? null : null,
        };

        setStatus("queued");
        onTransferSuccess?.(fallbackResponse);

        setTimeout(() => {
          setStatus("idle");
          setAmount("");
          setDescription("");
        }, 2400);
      } catch (offlineErr) {
        console.error("Local storage error:", offlineErr);
        setStatus("error");
        setErrorMessage("Connexion indisponible et enregistrement local impossible. Réessayez plus tard.");
      }
    }
  };

  const body = (
    <>
      {!standalone && <CardHeader title="Transfert rapide" icon={ArrowLeftRight} />}
      <Segmented
        options={MODES}
        value={mode}
        onChange={handleModeChange}
        label="Type d'opération"
        className={standalone ? "mb-4" : "mt-3.5"}
      />

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {mode === "deposit" ? "Recharge instantanée" : mode === "expense" ? "Dépense Elite" : "Virement premium"}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">
            {mode === "deposit"
              ? "Alimentez instantanément votre portefeuille SmartWallet."
              : mode === "expense"
              ? "Enregistrez une dépense catégorisée en quelques secondes."
              : "Envoyez des fonds en temps réel à un autre compte SmartWallet."}
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{t('balance_label')}</p>
          <p className="tabular text-[13px] font-bold text-[var(--accent-text)]">{formatMoney(currentBalance)}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
        {needsRecipient && (
          <>
            <div>
              <p className="eyebrow mb-1.5 !text-[10px] text-[var(--muted)]">{t('recent_contacts')}</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5" aria-label="Contacts récents">
                {contacts.map((c) => {
                  const active = recipient === c.walletId;
                  const initials = c.name.split(" ")[0];
                  const label = c.name.includes("Contact") ? "Contact" : initials;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setRecipient(c.walletId)}
                      title={`${c.name} (${c.walletId})`}
                      aria-label={`Choisir ${c.name}`}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] p-1 pr-3 text-left transition cursor-pointer shrink-0 shadow-2xs",
                        active
                          ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface)] bg-[var(--accent-soft)] border-[var(--accent)]"
                          : "opacity-85 hover:opacity-100 hover:border-[var(--line-strong)] hover:bg-[var(--surface-3)]"
                      )}
                    >
                      <Avatar name={initials} size={26} />
                      <span className="truncate text-xs font-semibold text-[var(--text)] max-w-[85px]">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <TextField
              icon={AtSign}
              placeholder={t('recipient_placeholder')}
              aria-label="Identifiant destinataire"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                if (status === "error") setStatus("idle");
              }}
            />
          </>
        )}

        {mode === "expense" && (
          <div>
            <label htmlFor="qt-category" className="eyebrow mb-1.5 block !text-[10px] text-[var(--muted)]">
              {t('expense_category')}
            </label>
            <select
              id="qt-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] cursor-pointer shadow-xs"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-[var(--surface)] text-[var(--text)]">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount Input Card */}
        <div
          className={cn(
            "rounded-3xl border bg-[var(--surface-2)] px-5 pb-4 pt-5 transition focus-within:shadow-[0_0_0_4px_var(--accent-15)] focus-within:bg-[var(--surface)]",
            overBalance
              ? "border-rose-400"
              : "border-[var(--line)] focus-within:border-[var(--accent)]"
          )}
        >
          <label htmlFor="qt-amount" className="sr-only">
            {t('amount_label')}
          </label>
          <div className="flex items-baseline justify-center gap-2">
            <input
              id="qt-amount"
              inputMode="decimal"
              placeholder="0.000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^\d.,\s]/g, ""));
                if (status === "error") setStatus("idle");
              }}
              style={{ width: `${Math.max(4, amount.length || 4) + 0.5}ch` }}
              className="tabular max-w-full min-w-0 bg-transparent text-center text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
            />
            <span className="text-2xl font-semibold text-[var(--muted)]">{isRtl ? "د.ت" : "DT"}</span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => {
                  setAmount(String(p));
                  if (status === "error") setStatus("idle");
                }}
                className="tabular min-h-[44px] rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent-text)] hover:bg-[var(--accent-soft)] active:scale-95 cursor-pointer shadow-2xs"
              >
                {p} {isRtl ? "د.ت" : "DT"}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Description */}
        <TextField
          icon={FileText}
          placeholder={t('description_placeholder')}
          aria-label="Motif ou description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <p
          className={cn(
            "tabular text-[12px]",
            overBalance ? "text-[var(--negative)]" : "text-[var(--subtle)]"
          )}
          aria-live="polite"
        >
          {overBalance
            ? `${t('overbalance_warning')} (${formatMoney(currentBalance)}).`
            : `${t('estimated_balance')} ${formatMoney(remaining)}`}
        </p>

        {status === "error" && errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-2xl border border-[rgba(251,113,133,0.3)] bg-[var(--negative-15)] px-4 py-3 text-xs text-[var(--negative)]"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {status === "queued" ? (
          <div
            role="status"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 text-center text-sm font-semibold text-amber-400"
          >
            <CloudOff className="h-4 w-4 shrink-0" /> Enregistré hors-ligne · en attente de synchronisation
          </div>
        ) : status === "done" ? (
          <div
            role="status"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent-15)] text-sm font-semibold text-[var(--accent-light)]"
          >
            <CheckCircle2 className="h-4 w-4" /> {t('op_success')}
          </div>
        ) : (
          <Button
            type="submit"
            size="lg"
            block
            loading={status === "sending"}
            className="shadow-[0_0_24px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(16,185,129,0.65)]"
          >
            {status === "sending"
              ? t('processing')
              : mode === "deposit"
              ? t('confirm_deposit')
              : mode === "expense"
              ? t('confirm_expense')
              : t('confirm_transfer')}
            {status !== "sending" && <Send className="h-4 w-4" />}
          </Button>
        )}
      </form>
    </>
  );

  if (standalone) {
    return <div className="w-full">{body}</div>;
  }

  return (
    <Card className="!p-5 sm:!p-6">
      {body}
    </Card>
  );
}

export { QuickTransfer };
