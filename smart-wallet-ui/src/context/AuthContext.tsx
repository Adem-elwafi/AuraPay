import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { setUnauthorizedHandler } from '../api/axiosConfig'
import type { AuthResponse, Profile, Wallet } from '../api/types'
import { useWebSocket } from '../hooks/useWebSocket'
import { formatMoney } from '../lib/format'

export interface AppNotification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: 'info' | 'success' | 'warning' | 'danger'
}

type AuthContextValue = {
  user: Profile | null
  wallet: Wallet | null
  isAuthenticated: boolean
  loading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  loginSuccess: (token: string) => Promise<void>
  refreshUserData: () => Promise<void>
  logout: () => void
  notifications: AppNotification[]
  unreadCount: number
  markAllAsRead: () => void
  clearNotifications: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token')
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true'
      if (t === 'sw-demo-session' || isDemo) {
        return { id: 1, username: 'adem_dev', fullName: 'Adem Elwafi', email: 'adem@smartwallet.com', avatarUrl: '' }
      }
    }
    return null
  })
  const [wallet, setWallet] = useState<Wallet | null>(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token')
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true'
      if (t === 'sw-demo-session' || isDemo) {
        return { id: 1, balance: 79.980, currency: 'TND', accountNumber: 'SW-3 6395 5398 7', active: true }
      }
    }
    return null
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token')
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true'
      return Boolean((t && t.length > 0) || isDemo)
    }
    return false
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token')
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true'
      if (t === 'sw-demo-session' || isDemo) return false
    }
    return true
  })

  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Callback stable : useWebSocket ne doit pas se reconnecter à chaque rendu
  const walletRef = useRef<Wallet | null>(null)
  useEffect(() => {
    walletRef.current = wallet
  }, [wallet])

  const handleWalletUpdate = useCallback((newWallet: Wallet) => {
    const prevWallet = walletRef.current
    walletRef.current = newWallet
    setWallet(newWallet)

    if (prevWallet && prevWallet.balance !== newWallet.balance) {
      const diff = newWallet.balance - prevWallet.balance
      const isGain = diff > 0
      const absoluteDiff = formatMoney(Math.abs(diff))
      const title = isGain ? 'Fonds Reçus' : 'Compte Débité'
      const message = isGain
        ? `Virement entrant de +${absoluteDiff} reçu.`
        : `Virement sortant de -${absoluteDiff} effectué.`

      const newNotif: AppNotification = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        message,
        timestamp: new Date(),
        read: false,
        type: isGain ? 'success' : 'info',
      }

      setNotifications((prev) => [newNotif, ...prev])

      // Play a premium sound effect
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav')
        audio.volume = 0.4
        void audio.play()
      } catch (e) {
        console.log('Audio playback error', e)
      }
    }
  }, [])

  // Activation du WebSocket en temps réel
  useWebSocket({
    enabled: isAuthenticated && !!user,
    username: user?.username,
    token: localStorage.getItem('token') || undefined,
    onWalletUpdate: handleWalletUpdate,
  })

  const clearSession = useCallback(() => {
    setUser(null)
    setWallet(null)
    setIsAuthenticated(false)
    setNotifications([])
    delete api.defaults.headers.common.Authorization
  }, [])

  // Toute réponse 401 (token expiré/invalide) ferme la session ; les routes protégées redirigent vers /login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      setLoading(false)
    })
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    clearSession()
    setLoading(false)
    navigate('/login', { replace: true })
  }, [clearSession, navigate])

  const applyToken = useCallback((token: string) => {
    localStorage.setItem('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  }, [])

  const refreshUserData = useCallback(async () => {
    let token = localStorage.getItem('token')
    if (typeof window !== 'undefined' && window.location) {
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true'
      if (isDemo && !token) {
        token = 'sw-demo-session'
        localStorage.setItem('token', token)
      }
    }

    if (!token) {
      clearSession()
      setLoading(false)
      return
    }

    if (token === 'sw-demo-session') {
      setUser((prev) => prev || { id: 1, username: 'adem_dev', fullName: 'Adem Elwafi', email: 'adem@smartwallet.com', avatarUrl: '' })
      setWallet((prev) => prev || { id: 1, balance: 79.98, currency: 'EUR', accountNumber: 'SW-3 6395 5398 7', active: true })
      setIsAuthenticated(true)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const [profileResult, walletResult] = await Promise.allSettled([
        api.get<Profile>('/v1/profile/me'),
        api.get<Wallet>('/v1/wallet/me'),
      ])

      if (profileResult.status === 'fulfilled') {
        setUser(profileResult.value.data)
      } else {
        console.warn("Échec du chargement du profil:", profileResult.reason)
      }

      if (walletResult.status === 'fulfilled') {
        setWallet(walletResult.value.data)
      } else {
        console.warn("Échec du chargement du portefeuille:", walletResult.reason)
      }

      const rejectedReasons = [profileResult, walletResult]
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map((result) => result.reason)

      if (rejectedReasons.some((rejection) => axios.isAxiosError(rejection) && rejection.response?.status === 401)) {
        if (token !== 'sw-demo-session') {
          localStorage.removeItem('token')
          clearSession()
          return
        }
      }

      setIsAuthenticated(true)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (token !== 'sw-demo-session') {
          localStorage.removeItem('token')
          clearSession()
          return
        }
      }
      console.error("Erreur lors de l'actualisation des données utilisateur:", error)
    } finally {
      setLoading(false)
    }
  }, [clearSession])

  const loginSuccess = useCallback(async (token: string) => {
    applyToken(token)
    setIsAuthenticated(true)

    try {
      await refreshUserData()
    } catch {
      // Keep the authenticated state if one bootstrap call races/fails during login.
      setIsAuthenticated(true)
    }
  }, [applyToken, refreshUserData])

  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      const response = await api.post<AuthResponse>('/v1/auth/authenticate', credentials)
      await loginSuccess(response.data.token)
    },
    [loginSuccess]
  )

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (typeof window !== 'undefined' && window.location) {
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true'
      if (isDemo && !token) {
        token = 'sw-demo-session'
        localStorage.setItem('token', token)
      }
    }

    if (!token) {
      clearSession()
      setLoading(false)
      return
    }

    void refreshUserData().catch(() => undefined)
  }, [clearSession, refreshUserData])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      wallet,
      isAuthenticated,
      loading,
      login,
      loginSuccess,
      refreshUserData,
      logout,
      notifications,
      unreadCount,
      markAllAsRead,
      clearNotifications,
    }),
    [
      user,
      wallet,
      isAuthenticated,
      loading,
      login,
      loginSuccess,
      refreshUserData,
      logout,
      notifications,
      unreadCount,
      markAllAsRead,
      clearNotifications,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}