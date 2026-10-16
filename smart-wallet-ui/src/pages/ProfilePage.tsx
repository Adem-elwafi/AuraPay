import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import axios from "axios";
import {
  AlertCircle,
  AtSign,
  Camera,
  CheckCircle2,
  Copy,
  CreditCard,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Wallet as WalletIcon,
} from "lucide-react";
import api, { getApiErrorMessage } from "../api/axiosConfig";
import type { Profile, UpdateProfileRequest } from "../api/types";
import { useAuth } from "../context/AuthContext";
import AuraBackground from "../components/backgrounds/AuraBackground";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import { Badge, Pill } from "../components/ui/primitives";
import { formatMoney } from "../lib/format";
import { useLanguage } from "../context/LanguageContext";

export default function ProfilePage() {
  const { wallet, refreshUserData } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    email: "",
    fullName: "",
    avatarUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password change state
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Copied accountNumber feedback
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Initialize and load user profile
  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const { data } = await api.get<Profile>("/v1/profile/me");

        setProfile(data);
        setFormData({
          email: data.email || "",
          fullName: data.fullName || "",
          avatarUrl: data.avatarUrl || "",
        });
      } catch (err: unknown) {
        if (localStorage.getItem('token') === 'sw-demo-session') {
          const demoProfile = {
            id: 1,
            username: "adem_dev",
            fullName: "Adem Elwafi",
            email: "adem@smartwallet.com",
            avatarUrl: "",
          };
          setProfile(demoProfile);
          setFormData({
            email: demoProfile.email,
            fullName: demoProfile.fullName,
            avatarUrl: "",
          });
        } else {
          setError(getApiErrorMessage(err, "Impossible de charger le profil."));
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  // Compute initials
  const displayName = formData.fullName || profile?.fullName || profile?.username || "Membre";

  const getInitials = () => {
    if (displayName) {
      const parts = displayName.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0].substring(0, 2).toUpperCase();
    }
    return "SW";
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image est trop volumineuse (maximum 5 Mo).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        setError(null);
        setSuccess(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmitProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: updated } = await api.put<Profile>("/v1/profile/me", formData);

      setProfile(updated);
      setSuccess("Votre profil a été mis à jour avec succès.");
      // Refresh AuthContext so that Header avatar and name update instantly
      void refreshUserData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Impossible de mettre à jour le profil."));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (passwordState.newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put("/v1/profile/password", {
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
      });
      setPasswordSuccess("Mot de passe mis à jour avec succès.");
      setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      // Ne jamais simuler un succès : l'endpoint n'existe pas encore côté API
      setPasswordError(
        axios.isAxiosError(err) && err.response?.status === 404
          ? "Le changement de mot de passe n'est pas encore disponible."
          : getApiErrorMessage(err, "Erreur lors du changement de mot de passe.")
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const copyAccountNumber = () => {
    const acc = wallet?.accountNumber;
    if (!acc) return;
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  if (loading) {
    return (
      <div className="relative flex min-h-[60vh] items-center justify-center">
        <AuraBackground variant="app" />
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-20)] border-t-[var(--accent)]" />
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Chargement de votre profil…
          </span>
        </div>
      </div>
    );
  }

  // Pas de numéro fictif : l'API n'expose pas d'id de profil, seul le wallet porte le numéro de compte
  const effectiveAccountNumber = wallet?.accountNumber ?? "—";

  return (
    <div className="relative space-y-8 animate-in fade-in duration-300">
      {/* Background Aura */}
      <AuraBackground variant="app" />

      {/* Page Title & Status Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Pill icon={Shield} className="mb-3">
            Espace Sécurisé · SmartWallet Identity
          </Pill>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
            Mon Profil & Paramètres
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">
            Gérez votre identité numérique, vos coordonnées bancaires et vos clés de sécurité.
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Membre Vérifié</Badge>
          <Badge variant="positive">2FA Activé</Badge>
          <Badge variant="default">Tier Élite</Badge>
        </div>
      </div>

      {/* Main Grid: Left Column (Identity Overview) + Right Column (Forms) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Avatar & Account Card */}
        <div className="space-y-6 lg:col-span-5">
          {/* Identity Card */}
          <Card className="text-center overflow-hidden">
            <CardHeader
              eyebrow="IDENTITÉ"
              title="Profil Numérique"
              className="text-left"
            />

            <CardContent className="mt-2 flex flex-col items-center">
              {/* Avatar with luxury glow ring & upload trigger */}
              <div className="relative group my-4">
                {/* Glow ring */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-emerald-400/25 via-emerald-200/20 to-transparent blur-md opacity-80 group-hover:opacity-100 transition duration-500" />

                {/* Avatar container */}
                <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-[var(--accent)] ring-offset-4 ring-offset-[var(--bg)] bg-[var(--surface-2)] flex items-center justify-center shadow-sm">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar utilisateur"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--surface-2)]">
                      <span className="font-display text-3xl font-bold tracking-wider text-[var(--accent)] select-none">
                        {getInitials()}
                      </span>
                    </div>
                  )}

                  {/* Upload overlay hover */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    title="Changer la photo de profil"
                  >
                    <Camera className="h-6 w-6 text-white mb-1" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
                      Modifier
                    </span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={saving}
                    className="sr-only"
                  />
                </div>
              </div>

              {/* Display Name and Handle */}
              <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
                {displayName}
              </h2>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                @{profile?.username || "utilisateur"}
              </p>

              {/* Avatar Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <label
                  htmlFor="avatar-upload-btn"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] shadow-2xs transition cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Importer une photo
                </label>
                <input
                  id="avatar-upload-btn"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={saving}
                  className="sr-only"
                />

                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer shadow-2xs"
                    title="Supprimer la photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                )}
              </div>
            </CardContent>

            {/* Account Metadata List */}
            <div className="mt-6 border-t border-[var(--line)] pt-4 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-[var(--subtle)]" /> Compte SmartWallet
                </span>
                <button
                  onClick={copyAccountNumber}
                  className="font-mono font-medium text-[var(--text)] flex items-center gap-1 hover:text-[var(--accent-light)] transition cursor-pointer"
                  title="Copier le numéro de compte"
                >
                  {effectiveAccountNumber}
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              {copiedAccount && (
                <p className="text-[11px] text-[var(--positive)] text-right">
                  Copié dans le presse-papier !
                </p>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] flex items-center gap-1.5">
                  <WalletIcon className="h-3.5 w-3.5 text-[var(--subtle)]" /> Solde disponible
                </span>
                <span className="font-semibold text-[var(--text)]">
                  {wallet?.balance != null
                    ? formatMoney(wallet.balance)
                    : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--positive)]" /> Statut KYC
                </span>
                <span className="text-[var(--positive)] font-semibold flex items-center gap-1">
                  Vérifié niveau 3
                </span>
              </div>
            </div>
          </Card>

          {/* Security Overview Card */}
          <Card>
            <CardHeader
              eyebrow="PROTECTION"
              title="Sécurité Active"
              icon={Shield}
            />
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
                <div className="mt-0.5 rounded-lg bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">Chiffrement AES-256</h4>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    Toutes vos données et transactions sont chiffrées de bout en bout.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
                <div className="mt-0.5 rounded-lg bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">Double Authentification (2FA)</h4>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    Validation requise pour tout virement supérieur à 500 DT.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Edit Form + Password Change */}
        <div className="space-y-6 lg:col-span-7">
          {/* Personal Info Form */}
          <form onSubmit={handleSubmitProfile}>
            <Card>
              <CardHeader
                eyebrow="COORDONNÉES"
                title={t('personal_info')}
                description="Modifiez vos données de profil utilisées pour les notifications et les transferts."
                icon={UserIcon}
              />

              <CardContent className="space-y-5">
                {/* Alerts */}
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-[rgba(251,113,133,0.3)] bg-[var(--negative-15)] p-4 text-sm text-[var(--negative)] animate-in fade-in">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t('error')}</p>
                      <p className="text-xs mt-0.5 opacity-90">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--accent-30)] bg-[var(--accent-10)] p-4 text-sm text-[var(--positive)] animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t('success')}</p>
                      <p className="text-xs mt-0.5 opacity-90">{success}</p>
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <TextField
                  id="fullName"
                  name="fullName"
                  label={t('full_name')}
                  icon={UserIcon}
                  value={formData.fullName || ""}
                  onChange={handleInputChange}
                  placeholder="ex. Alexandre Martin"
                  disabled={saving}
                />

                {/* Email Address */}
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label={t('email')}
                  icon={Mail}
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  placeholder="alexandre@example.com"
                  disabled={saving}
                />

                {/* Username (Read Only) */}
                <TextField
                  id="username"
                  name="username"
                  label={t('username')}
                  icon={AtSign}
                  value={profile?.username || ""}
                  disabled
                  hint="Le nom d'utilisateur est unique et sert à votre identifiant de connexion."
                />

                {/* Account Number (Read Only) */}
                <TextField
                  id="accountNumber"
                  label="Numéro de compte principal (IBAN)"
                  icon={CreditCard}
                  value={effectiveAccountNumber}
                  disabled
                  hint="Identifiant bancaire géré par le protocole SmartWallet."
                />
              </CardContent>

              <CardFooter className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (profile) {
                      setFormData({
                        email: profile.email || "",
                        fullName: profile.fullName || "",
                        avatarUrl: profile.avatarUrl || "",
                      });
                      setError(null);
                      setSuccess(null);
                    }
                  }}
                  disabled={saving}
                >
                  <RefreshCw className="h-4 w-4" /> Réinitialiser
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                >
                  {saving ? t('loading') : t('save')}
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Password & Security Card */}
          <form onSubmit={handlePasswordSubmit}>
            <Card>
              <CardHeader
                eyebrow="SÉCURITÉ & AUTHENTIFICATION"
                title={t('change_password')}
                description="Assurez-vous d'utiliser un mot de passe fort d'au moins 8 caractères."
                icon={KeyRound}
              />

              <CardContent className="space-y-5">
                {passwordError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-[rgba(251,113,133,0.3)] bg-[var(--negative-15)] p-4 text-sm text-[var(--negative)] animate-in fade-in">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t('error')}</p>
                      <p className="text-xs mt-0.5 opacity-90">{passwordError}</p>
                    </div>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--accent-30)] bg-[var(--accent-10)] p-4 text-sm text-[var(--positive)] animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t('success')}</p>
                      <p className="text-xs mt-0.5 opacity-90">{passwordSuccess}</p>
                    </div>
                  </div>
                )}

                <TextField
                  id="currentPassword"
                  type="password"
                  label={t('current_password')}
                  icon={Lock}
                  value={passwordState.currentPassword}
                  onChange={(e) =>
                    setPasswordState((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="••••••••••••"
                  disabled={passwordSaving}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id="newPassword"
                    type="password"
                    label={t('new_password')}
                    icon={Lock}
                    value={passwordState.newPassword}
                    onChange={(e) =>
                      setPasswordState((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    placeholder="••••••••••••"
                    disabled={passwordSaving}
                  />

                  <TextField
                    id="confirmPassword"
                    type="password"
                    label={t('confirm_password')}
                    icon={Lock}
                    value={passwordState.confirmPassword}
                    onChange={(e) =>
                      setPasswordState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    placeholder="••••••••••••"
                    disabled={passwordSaving}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  variant="subtle"
                  loading={passwordSaving}
                  disabled={
                    passwordSaving ||
                    !passwordState.currentPassword ||
                    !passwordState.newPassword ||
                    !passwordState.confirmPassword
                  }
                >
                  {passwordSaving ? t('loading') : t('change_password')}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}