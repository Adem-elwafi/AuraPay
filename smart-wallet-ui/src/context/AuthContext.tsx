import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { setUnauthorizedHandler } from '../api/axiosConfig'
import type { AuthResponse, Profile, Wallet } from '../api/types'
import { useWebSocket } from '../hooks/useWebSocket'
import { formatMoney } from '../lib/format'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  LOCAL_MODE_MESSAGE,
  authenticateLocalAccount,
  findLocalAccountByToken,
  getLocalProfile,
  getLocalWallet,
  isBackendUnavailable,
  isLocalToken,
  toLocalToken,
  type LocalAccount,
} from '../lib/localAuth'

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
  /** Ouvre une session en mode local autonome (aucun backend ni Supabase). */
  loginLocal: (account: LocalAccount) => Promise<void>
  /** Ouvre la session de démonstration (données fictives, aucun serveur requis). */
  enterDemoMode: () => Promise<void>
  /** Vrai si la session courante est locale (compte stocké dans le navigateur). */
  isLocalMode: boolean
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
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.signOut().catch(() => undefined)
    }
    clearSession()
    setLoading(false)
    navigate('/login', { replace: true })
  }, [clearSession, navigate])

  const applyToken = useCallback((token: string) => {
    localStorage.setItem('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  }, [])

  const refreshUserData = useCallback(async () => {
    const storedToken = localStorage.getItem('token')
    if (isLocalToken(storedToken)) {
      const account = findLocalAccountByToken(storedToken)
      if (!account) {
        localStorage.removeItem('token')
        clearSession()
        setLoading(false)
        return
      }
      setUser(getLocalProfile(account))
      setWallet(await getLocalWallet(account))
      setIsAuthenticated(true)
      setLoading(false)
      return
    }

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setLoading(true)
        try {
          const [profileRes, walletRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
            supabase.from('wallets').select('*').eq('user_id', session.user.id).maybeSingle(),
          ])

          let walletData = walletRes.data;
          if (!walletData) {
            const newAcc = `SW-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
            const { data: createdWallet } = await supabase
              .from('wallets')
              .insert({
                user_id: session.user.id,
                balance: 1000.00,
                currency: 'EUR',
                account_number: newAcc,
              })
              .select('*')
              .maybeSingle();
            if (createdWallet) walletData = createdWallet;
          }

          setUser({
            username: profileRes.data?.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Utilisateur',
            fullName: profileRes.data?.full_name || session.user.user_metadata?.full_name || '',
            email: session.user.email || '',
            avatarUrl: profileRes.data?.avatar_url || '',
          })

          setWallet({
            balance: Number(walletData?.balance ?? 0),
            currency: walletData?.currency || 'EUR',
            accountNumber: walletData?.account_number || `SW-${session.user.id.slice(0, 8)}`,
          })
          setIsAuthenticated(true)
        } catch (e) {
          console.warn("Échec chargement session Supabase:", e)
        } finally {
          setLoading(false)
        }
        return
      }
    }

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
      const demoBalance = Number(localStorage.getItem('sw_demo_balance') || '79.98');
      setUser((prev) => prev || { id: 1, username: 'adem_dev', fullName: 'Adem Elwafi', email: 'adem@smartwallet.com', avatarUrl: '' })
      setWallet({ balance: demoBalance, currency: 'EUR', accountNumber: 'SW-3 6395 5398 7' })
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

  // Écoute Realtime native avec Supabase (Postgres Changes)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !isAuthenticated) return;
    const client = supabase;

    let channel: ReturnType<typeof client.channel> | null = null;
    let cancelled = false;

    const setupRealtime = async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user?.id || cancelled) return;

      const userId = session.user.id;
      channel = client
        .channel(`supabase-realtime-user-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newRow = payload.new as { balance?: number; currency?: string; account_number?: string } | undefined;
            if (newRow && newRow.balance !== undefined) {
              handleWalletUpdate({
                balance: Number(newRow.balance),
                currency: newRow.currency || 'TND',
                accountNumber: newRow.account_number || '',
              });
            } else {
              void refreshUserData().catch(() => undefined);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void refreshUserData().catch(() => undefined);
            window.dispatchEvent(new CustomEvent('vaultis-tx-updated'));
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Supabase Realtime] Connecté aux changements de portefeuille et transactions');
          }
        });
    };

    void setupRealtime();

    return () => {
      cancelled = true;
      if (channel) {
        void client.removeChannel(channel);
      }
    };
  }, [isAuthenticated, handleWalletUpdate, refreshUserData]);

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

  const loginLocal = useCallback(
    async (account: LocalAccount) => {
      localStorage.setItem('token', toLocalToken(account))
      delete api.defaults.headers.common.Authorization
      await refreshUserData()
      setNotifications((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          title: 'Mode Local / Hors-ligne',
          message: LOCAL_MODE_MESSAGE,
          timestamp: new Date(),
          read: false,
          type: 'info',
        },
        ...prev,
      ])
    },
    [refreshUserData]
  )

  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      if (isSupabaseConfigured && supabase) {
        let email = credentials.username.trim()
        if (!email.includes('@')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', email)
            .maybeSingle()
          if (profile?.email) {
            email = profile.email
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: credentials.password,
        })
        if (error) {
          throw new Error(error.message)
        }
        if (data.session) {
          await loginSuccess(data.session.access_token)
          return
        }
      }

      // Compte créé sur cet appareil en mode local : inutile d'interroger un serveur
      const localAccount = isSupabaseConfigured
        ? null
        : await authenticateLocalAccount(credentials.username, credentials.password)
      if (localAccount) {
        await loginLocal(localAccount)
        return
      }

      try {
        const response = await api.post<AuthResponse>('/v1/auth/authenticate', credentials)
        await loginSuccess(response.data.token)
      } catch (error) {
        if (!isSupabaseConfigured && isBackendUnavailable(error)) {
          throw new Error(
            "Aucun serveur disponible et aucun compte local ne correspond. Créez un compte (mode local) ou utilisez le Mode Démo.",
            { cause: error }
          )
        }
        throw error
      }
    },
    [loginSuccess, loginLocal]
  )

  const enterDemoMode = useCallback(async () => {
    localStorage.setItem('token', 'sw-demo-session')
    await refreshUserData()
  }, [refreshUserData])

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

  // Recalculé quand l'utilisateur change (le token local est posé juste avant setUser)
  const isLocalMode = isAuthenticated && !!user && isLocalToken(localStorage.getItem('token'))

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      wallet,
      isAuthenticated,
      loading,
      login,
      loginSuccess,
      loginLocal,
      enterDemoMode,
      isLocalMode,
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
      loginLocal,
      enterDemoMode,
      isLocalMode,
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