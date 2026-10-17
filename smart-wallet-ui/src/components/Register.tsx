import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, Lock, Mail, User, UserCheck, AlertCircle } from 'lucide-react'
import api, { getApiErrorMessage } from '../api/axiosConfig'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { LOCAL_MODE_MESSAGE, isBackendUnavailable, registerLocalAccount } from '../lib/localAuth'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import TextField from './ui/TextField'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,30}$/

export default function Register() {
  const navigate = useNavigate()
  const { loginLocal } = useAuth()

  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    acceptTerms: true,
  })

  const [errors, setErrors] = useState<{
    username?: string
    fullName?: string
    email?: string
    password?: string
    acceptTerms?: string
  }>({})

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const update = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) {
      setErrors((er) => ({ ...er, [key]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const validate = () => {
    const next: typeof errors = {}

    const u = form.username.trim()
    if (!u) {
      next.username = "Nom d'utilisateur requis."
    } else if (!USERNAME_RE.test(u)) {
      next.username = '3 à 30 caractères (lettres, chiffres, tirets ou underscores).'
    }

    const em = form.email.trim()
    if (!em) {
      next.email = 'Adresse e-mail requise.'
    } else if (!EMAIL_RE.test(em)) {
      next.email = 'Format d’e-mail invalide (ex. contact@exemple.com).'
    }

    if (form.fullName && form.fullName.trim().length < 2) {
      next.fullName = 'Le nom complet doit comporter au moins 2 caractères.'
    }

    if (!form.password) {
      next.password = 'Mot de passe requis.'
    } else if (form.password.length < 8) {
      next.password = '8 caractères minimum.'
    }

    if (!form.acceptTerms) {
      next.acceptTerms = 'Veuillez accepter les conditions générales.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setSuccessMessage(null)

    if (!validate()) return

    setLoading(true)

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              username: form.username.trim(),
              full_name: form.fullName.trim() || form.username.trim(),
            },
          },
        })
        if (error) {
          throw new Error(error.message)
        }
      } else {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          ...(form.fullName.trim() ? { fullName: form.fullName.trim() } : {}),
        }
        try {
          await api.post('/v1/auth/register', payload)
        } catch (err: unknown) {
          if (!isBackendUnavailable(err)) throw err
          // Ni Supabase ni Spring Boot (ex. Vercel statique) : mode local autonome, jamais d'écran 405
          const account = await registerLocalAccount(payload)
          await loginLocal(account)
          setSuccessMessage(LOCAL_MODE_MESSAGE)
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
          return
        }
      }

      setSuccessMessage('Compte créé avec succès ! Redirection vers la connexion…')

      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err: unknown) {
      console.error('Erreur inscription', err)
      const customMsg = err instanceof Error ? err.message : null
      setServerError(
        customMsg || getApiErrorMessage(err, "Une erreur est survenue lors de l'inscription. Vérifiez les informations saisies.")
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {serverError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="leading-relaxed">{serverError}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <TextField
            label="Nom d'utilisateur"
            icon={User}
            type="text"
            autoComplete="username"
            placeholder="adem_dev"
            value={form.username}
            onChange={update('username')}
            error={errors.username}
            containerClassName="bg-[#f4f7f6] border-slate-200/80 focus-within:bg-white focus-within:border-emerald-500 shadow-none"
            inputClassName="text-slate-800 placeholder:text-slate-400 text-sm"
            autoFocus
          />

          <TextField
            label="Nom complet"
            icon={UserCheck}
            type="text"
            autoComplete="name"
            placeholder="Adem Larbi"
            value={form.fullName}
            onChange={update('fullName')}
            error={errors.fullName}
            containerClassName="bg-[#f4f7f6] border-slate-200/80 focus-within:bg-white focus-within:border-emerald-500 shadow-none"
            inputClassName="text-slate-800 placeholder:text-slate-400 text-sm"
          />
        </div>

        <TextField
          label="Adresse e-mail"
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="adem@exemple.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          containerClassName="bg-[#f4f7f6] border-slate-200/80 focus-within:bg-white focus-within:border-emerald-500 shadow-none"
          inputClassName="text-slate-800 placeholder:text-slate-400 text-sm"
        />

        <TextField
          label="Mot de passe"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="8 caractères minimum."
          containerClassName="bg-[#f4f7f6] border-slate-200/80 focus-within:bg-white focus-within:border-emerald-500 shadow-none"
          inputClassName="text-slate-800 placeholder:text-slate-400 text-sm"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="pt-0.5">
          <label className="flex cursor-pointer select-none items-start gap-2 text-[11px] text-slate-600">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={update('acceptTerms')}
              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600 cursor-pointer"
            />
            <span>
              J'accepte les{' '}
              <span className="text-emerald-700 font-medium">conditions générales</span> et la{' '}
              <span className="text-emerald-700 font-medium">politique de confidentialité</span>.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-[11px] text-rose-600">{errors.acceptTerms}</p>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="h-11 px-12 rounded-full bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            {loading ? 'Création en cours…' : "S'INSCRIRE"}
          </Button>
        </div>
      </form>
    </div>
  )
}
export { Register }