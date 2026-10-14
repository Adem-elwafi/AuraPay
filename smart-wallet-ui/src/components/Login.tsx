import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { getApiErrorMessage } from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import TextField from './ui/TextField'

const REMEMBER_KEY = 'vaultis_remembered_user'
const LEGACY_REMEMBER_KEY = 'smartwallet_remembered_user'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    remember: true,
  })
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Load remembered user if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY) || localStorage.getItem(LEGACY_REMEMBER_KEY)
      if (saved) {
        setForm((prev) => ({ ...prev, identifier: saved, remember: true }))
      }
    } catch {
      /* ignore storage access error */
    }
  }, [])

  const update = (key: 'identifier' | 'password' | 'remember') => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key as 'identifier' | 'password']) {
      setErrors((er) => ({ ...er, [key]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const validate = () => {
    const next: { identifier?: string; password?: string } = {}
    const id = form.identifier.trim()
    if (!id) {
      next.identifier = "Saisissez votre nom d'utilisateur ou e-mail."
    }
    if (!form.password) {
      next.password = 'Saisissez votre mot de passe.'
    } else if (form.password.length < 4) {
      next.password = 'Le mot de passe doit comporter au moins 4 caractères.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setLoading(true)

    try {
      if (form.remember) {
        localStorage.setItem(REMEMBER_KEY, form.identifier.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
        localStorage.removeItem(LEGACY_REMEMBER_KEY)
      }

      await login({
        username: form.identifier.trim(),
        password: form.password,
      })

      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('Erreur de connexion', err)
      setServerError(
        getApiErrorMessage(err, 'Identifiants incorrects ou session impossible à démarrer. Veuillez réessayer.')
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

      <form noValidate onSubmit={handleSubmit} className="space-y-3.5">
        <TextField
          label="Nom d'utilisateur ou e-mail"
          icon={Mail}
          type="text"
          inputMode="text"
          autoComplete="username"
          placeholder="ex: adem_dev ou adem@smartwallet.com"
          value={form.identifier}
          onChange={update('identifier')}
          error={errors.identifier}
          containerClassName="bg-[#f4f7f6] border-slate-200/80 focus-within:bg-white focus-within:border-emerald-500 shadow-none"
          inputClassName="text-slate-800 placeholder:text-slate-400 text-sm"
          autoFocus
        />

        <TextField
          label="Mot de passe"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
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

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-600 transition hover:text-slate-900">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={update('remember')}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600 cursor-pointer"
            />
            Se souvenir de moi
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              alert('Veuillez contacter le support Vaultis pour réinitialiser vos accès.')
            }}
            className="text-xs font-medium text-slate-500 hover:text-emerald-700 transition"
          >
            Mot de passe oublié ?
          </a>
        </div>

        <div className="flex justify-center pt-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="h-11 px-12 rounded-full bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            {loading ? 'Connexion…' : 'SE CONNECTER'}
          </Button>
        </div>
      </form>
    </div>
  )
}
export { Login }