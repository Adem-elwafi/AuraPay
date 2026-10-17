import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Coins,
  Globe,
  Sliders,
  Database,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileJson,
  Coffee,
  Utensils,
  Home,
  Zap,
  Bus,
  HeartPulse,
  ShoppingBag,
  MoreHorizontal,
  ShieldAlert,
  Cloud,
  CloudOff,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Badge } from "../components/ui/primitives";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useSyncEngine } from "../services/syncEngine";
import { db } from "../lib/db";
import { formatMoney } from "../lib/format";
import { cn } from "../lib/cn";
import { getSupabaseConfig, setCustomSupabaseConfig, clearCustomSupabaseConfig } from "../lib/supabase";

export interface TunisianCategory {
  id: string;
  nameFr: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  enabled: boolean;
}

const DEFAULT_CATEGORIES: TunisianCategory[] = [
  { id: "ALIMENTATION", nameFr: "Alimentation & Marché", nameAr: "التغذية والسوق", nameEn: "Groceries & Food", icon: "Utensils", color: "#10b981", enabled: true },
  { id: "CAFE", nameFr: "Sorties & Café", nameAr: "المقاهي والخروج", nameEn: "Coffee & Outings", icon: "Coffee", color: "#f59e0b", enabled: true },
  { id: "LOGEMENT", nameFr: "Loyer & Logement", nameAr: "الكراء والسكن", nameEn: "Rent & Housing", icon: "Home", color: "#6366f1", enabled: true },
  { id: "FACTURES", nameFr: "Factures STEG / SONEDE", nameAr: "فواتير الستاغ والصوناد", nameEn: "STEG / SONEDE Utilities", icon: "Zap", color: "#ec4899", enabled: true },
  { id: "TRANSPORT", nameFr: "Transport & Carburant", nameAr: "النقل والمحروقات", nameEn: "Transport & Fuel", icon: "Bus", color: "#06b6d4", enabled: true },
  { id: "SANTE", nameFr: "Santé & Pharmacie", nameAr: "الصحة والصيدلية", nameEn: "Health & Pharmacy", icon: "HeartPulse", color: "#ef4444", enabled: true },
  { id: "SHOPPING", nameFr: "Shopping & Habillement", nameAr: "التسوق والملابس", nameEn: "Shopping & Clothes", icon: "ShoppingBag", color: "#8b5cf6", enabled: true },
  { id: "AUTRE", nameFr: "Autres Dépenses", nameAr: "مصاريف أخرى", nameEn: "Other Expenses", icon: "MoreHorizontal", color: "#64748b", enabled: true },
];

export default function SettingsPage() {
  const { language, setLanguage, isRtl } = useLanguage();
  const { refreshUserData } = useAuth();
  const { isOnline, hasCloudConnection, pendingCount, triggerSync } = useSyncEngine();

  // 1. Currency & Budget Preferences
  const [currency, setCurrency] = useState<string>(() => localStorage.getItem("sw_currency") || "TND");
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    const val = localStorage.getItem("sw_monthly_budget");
    return val ? parseFloat(val) : 2000;
  });
  const [alertThreshold, setAlertThreshold] = useState<number>(() => {
    const val = localStorage.getItem("sw_alert_threshold");
    return val ? parseInt(val, 10) : 80;
  });

  // 2. Display & Privacy
  const [discreetMode, setDiscreetMode] = useState<boolean>(() => {
    return localStorage.getItem("sw_discreet_mode") === "true";
  });

  // 3. Tunisian Categories
  const [categories, setCategories] = useState<TunisianCategory[]>(() => {
    const saved = localStorage.getItem("sw_categories");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CATEGORIES;
      }
    }
    return DEFAULT_CATEGORIES;
  });
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#10b981");

  // Supabase Cloud Configuration
  const [supabaseConfig] = useState(getSupabaseConfig);
  const [inputUrl, setInputUrl] = useState(supabaseConfig.url || "");
  const [inputKey, setInputKey] = useState(supabaseConfig.anonKey || "");
  const [showSupabaseForm, setShowSupabaseForm] = useState(!supabaseConfig.isConfigured);
  const [supabaseSaveError, setSupabaseSaveError] = useState<string | null>(null);

  // Status & Feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  const handleConnectSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseSaveError(null);
    if (!inputUrl.trim() || !inputKey.trim()) {
      setSupabaseSaveError("Veuillez renseigner l'URL et la clé anon de votre projet Supabase.");
      return;
    }
    if (!inputUrl.startsWith("http")) {
      setSupabaseSaveError("L'URL Supabase doit commencer par https://");
      return;
    }
    setCustomSupabaseConfig(inputUrl, inputKey);
  };

  const handleDisconnectSupabase = () => {
    if (window.confirm("Voulez-vous déconnecter Supabase et repasser en Mode Local Autonome ?")) {
      clearCustomSupabaseConfig();
    }
  };

  // Save Settings Handlers
  const handleSaveBudget = () => {
    localStorage.setItem("sw_currency", currency);
    localStorage.setItem("sw_monthly_budget", budgetLimit.toString());
    localStorage.setItem("sw_alert_threshold", alertThreshold.toString());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleDiscreet = () => {
    const next = !discreetMode;
    setDiscreetMode(next);
    localStorage.setItem("sw_discreet_mode", String(next));
    window.dispatchEvent(new Event("storage"));
  };

  const handleToggleCategory = (id: string) => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
    );
    setCategories(updated);
    localStorage.setItem("sw_categories", JSON.stringify(updated));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newId = "CAT_" + Date.now();
    const newCat: TunisianCategory = {
      id: newId,
      nameFr: newCatName.trim(),
      nameAr: newCatName.trim(),
      nameEn: newCatName.trim(),
      icon: "MoreHorizontal",
      color: newCatColor,
      enabled: true,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem("sw_categories", JSON.stringify(updated));
    setNewCatName("");
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem("sw_categories", JSON.stringify(updated));
  };

  // 4. Data & Export Handlers
  const handleExportCSV = async () => {
    try {
      const txs = await db.transactions.toArray();
      if (!txs.length) {
        alert("Aucune transaction enregistrée à exporter.");
        return;
      }

      const headers = ["ID", "Date", "Type", "Montant", "Devise", "Categorie", "Description", "Statut Sync"];
      const rows = txs.map((tx) => [
        tx.id ?? "",
        tx.timestamp,
        tx.type,
        tx.amount.toFixed(3),
        "TND",
        `"${(tx.category || "").replace(/"/g, '""')}"`,
        `"${(tx.description || "").replace(/"/g, '""')}"`,
        tx.syncStatus,
      ]);

      const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `smartwallet-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV error:", err);
      alert("Erreur lors de l'exportation CSV.");
    }
  };

  const handleExportJSON = async () => {
    try {
      const txs = await db.transactions.toArray();
      const localWallet = await db.wallet.toArray();
      const backupData = {
        app: "SmartWallet",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        wallet: localWallet,
        transactions: txs,
        categories,
        settings: {
          currency,
          budgetLimit,
          alertThreshold,
          discreetMode,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `smartwallet-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export JSON error:", err);
      alert("Erreur lors de l'exportation JSON.");
    }
  };

  const handleResetData = async () => {
    if (resetConfirmText.trim().toUpperCase() !== "RESET") {
      alert("Veuillez saisir 'RESET' pour confirmer.");
      return;
    }
    try {
      await db.transactions.clear();
      await db.sync_queue.clear();
      setResetModalOpen(false);
      setResetConfirmText("");
      await refreshUserData();
      alert("Toutes les données de transactions locales ont été réinitialisées.");
    } catch (err) {
      console.error("Reset error:", err);
      alert("Erreur lors de la réinitialisation.");
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Utensils": return <Utensils className="h-4 w-4" />;
      case "Coffee": return <Coffee className="h-4 w-4" />;
      case "Home": return <Home className="h-4 w-4" />;
      case "Zap": return <Zap className="h-4 w-4" />;
      case "Bus": return <Bus className="h-4 w-4" />;
      case "HeartPulse": return <HeartPulse className="h-4 w-4" />;
      case "ShoppingBag": return <ShoppingBag className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-15)] text-[var(--accent)] border border-[var(--accent-20)]">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                Paramètres
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Personnalisez votre expérience, vos plafonds, vos devises et vos sauvegardes.
              </p>
            </div>
          </div>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Préférences enregistrées avec succès</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SECTION 1: Préférences Monétaires & Budget */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              title="Préférences Monétaires & Budget"
              eyebrow="Finance & Devises"
              icon={Coins}
            />
            <div className="mt-5 space-y-4">
              {/* Currency Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                  Devise Principale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "TND", label: "TND (DT · د.ت)", desc: "Dinar Tunisien (3 décimales)" },
                    { code: "EUR", label: "EUR (€)", desc: "Euro" },
                    { code: "USD", label: "USD ($)", desc: "Dollar US" },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCurrency(item.code)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer",
                        currency === item.code
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)] ring-2 ring-[var(--accent-20)] font-bold"
                          : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                      )}
                    >
                      <span className="text-sm font-bold">{item.code}</span>
                      <span className="text-[10px] opacity-75 mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Target Budget */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                  Budget Mensuel Cible (DT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="ex: 2000"
                  />
                  <span className="absolute right-4 top-2.5 text-xs font-bold text-[var(--muted)]">
                    DT / mois
                  </span>
                </div>
                <p className="text-[11px] text-[var(--subtle)] mt-1">
                  Ce montant définit la jauge de suivi des dépenses sur le tableau de bord.
                </p>
              </div>

              {/* Alert Threshold Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Seuil d'Alerte de Dépassement
                  </label>
                  <span className="text-xs font-extrabold text-[var(--accent)]">
                    {alertThreshold}% ({formatMoney((budgetLimit * alertThreshold) / 100)})
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent)] h-2 rounded-lg bg-[var(--surface-2)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--subtle)] mt-1">
                  <span>50% (Prudent)</span>
                  <span>80% (Recommandé)</span>
                  <span>100% (Strict)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--line)] flex justify-end">
            <Button size="sm" onClick={handleSaveBudget}>
              Enregistrer le budget
            </Button>
          </div>
        </Card>

        {/* SECTION 2: Langue & Affichage */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              title="Langue & Affichage"
              eyebrow="Interface & Accessibilité"
              icon={Globe}
            />
            <div className="mt-5 space-y-4">
              {/* Language Switcher */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                  Langue de l'interface
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "fr", label: "Français", sub: "Standard TN" },
                    { id: "ar", label: "عربي (تونس)", sub: "دعم RTL كامل" },
                    { id: "en", label: "English", sub: "International" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLanguage(item.id as "fr" | "ar" | "en")}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer",
                        language === item.id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)] ring-2 ring-[var(--accent-20)] font-bold"
                          : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                      )}
                    >
                      <span className="text-sm font-bold">{item.label}</span>
                      <span className="text-[10px] opacity-75 mt-0.5">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Discrétion (Masquer solde) */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    {discreetMode ? (
                      <EyeOff className="h-4 w-4 text-[var(--accent)]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[var(--muted)]" />
                    )}
                    <span className="text-sm font-bold text-[var(--text)]">Mode Discrétion</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Masque le solde disponible par défaut (•••• DT) pour préserver votre vie privée en public ou dans les transports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleDiscreet}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    discreetMode ? "bg-[var(--accent)]" : "bg-neutral-700"
                  )}
                  role="switch"
                  aria-checked={discreetMode}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                      discreetMode ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* RTL info */}
              {isRtl && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
                  Le mode d'écriture de droite à gauche (RTL) est actuellement actif. Tous les éléments graphiques et numériques sont adaptés.
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--line)] flex justify-between items-center text-xs text-[var(--muted)]">
            <span>Préférences d'affichage persistées</span>
            <Badge variant="outline">Sauvegarde locale instantanée</Badge>
          </div>
        </Card>
      </div>

      {/* SECTION 3: Catégories Tunisiennes Personnalisées */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardHeader
            title="Catégories de Dépenses Tunisiennes"
            eyebrow="Personnalisation Locale"
            icon={Sliders}
          />
          <span className="text-xs text-[var(--muted)]">
            Activez, désactivez ou ajoutez vos propres rubriques de dépenses quotidiennes.
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const label = language === "ar" ? cat.nameAr : language === "en" ? cat.nameEn : cat.nameFr;
            return (
              <div
                key={cat.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-3.5 transition",
                  cat.enabled
                    ? "border-[var(--line)] bg-[var(--surface-2)]"
                    : "border-[var(--line)]/50 bg-[var(--surface-2)]/40 opacity-50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text)] truncate">{label}</p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {cat.enabled ? "Active" : "Désactivée"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(cat.id)}
                    className={cn(
                      "rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer",
                      cat.enabled
                        ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                    )}
                  >
                    {cat.enabled ? "ON" : "OFF"}
                  </button>
                  {cat.id.startsWith("CAT_") && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleAddCategory} className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--line)]">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nouvelle catégorie (ex: Sport, Éducation...)"
            className="flex-1 min-w-[200px] rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--muted)]">Couleur :</span>
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-0.5"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </Button>
        </form>
      </Card>

      {/* SECTION 4: Données, Export & Cloud */}
      <Card>
        <CardHeader
          title="Données, Export & Statut Cloud"
          eyebrow="Synchronisation & Sauvegarde"
          icon={Database}
        />

        {/* Supabase Cloud Interactive Connector */}
        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[var(--line)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                  supabaseConfig.isConfigured ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                )}
              >
                {supabaseConfig.isConfigured ? <Cloud className="h-5 w-5" /> : <CloudOff className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[var(--text)]">Connexion Supabase Cloud</h4>
                  <Badge variant={supabaseConfig.isConfigured ? "accent" : "outline"}>
                    {supabaseConfig.isConfigured ? "Connecté au Cloud" : "Mode Local Autonome"}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {supabaseConfig.isConfigured
                    ? `Synchronisation en temps réel active avec votre projet : ${supabaseConfig.url}`
                    : "Supabase n'est pas encore connecté. Renseignez vos 2 clés ci-dessous pour activer la sauvegarde Cloud instantanément."}
                </p>
              </div>
            </div>

            {supabaseConfig.isConfigured ? (
              <Button size="sm" variant="outline" onClick={handleDisconnectSupabase} className="shrink-0 text-xs text-rose-400 hover:text-rose-300">
                Déconnecter / Changer
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowSupabaseForm((v) => !v)} className="shrink-0 text-xs">
                {showSupabaseForm ? "Masquer le formulaire" : "Configurer les clés"}
              </Button>
            )}
          </div>

          {/* Form to connect Supabase */}
          {(!supabaseConfig.isConfigured || showSupabaseForm) && (
            <form onSubmit={handleConnectSupabase} className="mt-4 space-y-3">
              {supabaseSaveError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
                  {supabaseSaveError}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                    URL du projet Supabase (Project URL)
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                    Clé publique anon (Project API Key anon)
                  </label>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                <span className="text-[11px] text-[var(--muted)]">
                  💡 Retrouvez ces clés sur <strong>supabase.com</strong> ➔ Votre Projet ➔ <strong>Project Settings</strong> ➔ <strong>API</strong>.
                </span>
                <Button type="submit" size="sm" variant="primary" className="text-xs shrink-0">
                  <Cloud className="h-3.5 w-3.5 mr-1.5" /> Enregistrer & Activer le Cloud
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {/* Cloud / Sync Status Block */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--text)]">Statut de la base</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    isOnline && hasCloudConnection
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {isOnline && hasCloudConnection ? "Supabase Cloud" : "IndexedDB Offline"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Vos opérations sont d'abord sécurisées localement dans <strong>Dexie DB</strong>, puis répliquées en temps réel sur <strong>Supabase</strong>.
              </p>
              {pendingCount > 0 && (
                <p className="text-xs font-semibold text-amber-400 mt-2">
                  ⚠️ {pendingCount} opération(s) en attente de synchronisation.
                </p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--line)]">
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => void triggerSync()}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Forcer la synchronisation
              </Button>
            </div>
          </div>

          {/* Export CSV / Excel */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--text)]">Export Tableur (CSV / Excel)</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Téléchargez un relevé comptable universel de toutes vos transactions, montants en 3 décimales et catégories pour votre gestion.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--line)]">
              <Button size="sm" className="w-full text-xs" onClick={handleExportCSV}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Télécharger CSV
              </Button>
            </div>
          </div>

          {/* Export JSON / Backup */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold text-[var(--text)]">Sauvegarde Complète (JSON)</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Exportez une image complète de votre coffre-fort : solde, historique d'opérations et catégories personnalisées.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--line)]">
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleExportJSON}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Sauvegarde JSON
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone: Reset test data */}
        <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" /> Zone Critique
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              Réinitialiser l'historique des transactions de test et vider la base locale Dexie.
            </p>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setResetModalOpen(true)}
            className="shrink-0 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Réinitialiser les données
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal for Reset */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="max-w-md w-full rounded-3xl border border-rose-500/40 bg-[var(--surface-1)] p-6 shadow-2xl text-[var(--text)]">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Confirmation Requise</h3>
            </div>
            <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">
              Cette action supprimera toutes les transactions enregistrées localement dans votre navigateur. Cette opération est irréversible.
            </p>
            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-[var(--text)] block">
                Tapez <strong>RESET</strong> pour valider :
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET"
                className="w-full rounded-xl border border-rose-500/40 bg-[var(--surface-2)] px-3 py-2 text-sm font-mono text-[var(--text)] focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResetModalOpen(false);
                  setResetConfirmText("");
                }}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleResetData}
                disabled={resetConfirmText.trim().toUpperCase() !== "RESET"}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
