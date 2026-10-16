import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { JSX } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/DashBoard'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './theme/ThemeProvider'
import { LanguageProvider } from './context/LanguageContext'

function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const { isAuthenticated, loading } = useAuth()
  const isDemo =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('demo') === 'true' ||
      localStorage.getItem('token') === 'sw-demo-session')

  if (loading && !isDemo) {
    return <div className="min-h-screen bg-[var(--bg)]" />
  }

  if (!isAuthenticated && !isDemo) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RedirectIfAuthenticated({ children }: { children: JSX.Element }): JSX.Element {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-[var(--bg)]" />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <ThemeProvider defaultTheme="emerald">
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Auth Pages - No Layout */}
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuthenticated>
                  <RegisterPage />
                </RedirectIfAuthenticated>
              }
            />

            {/* Protected Routes - With Layout */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard/cartes"
              element={
                <RequireAuth>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard/transactions"
              element={
                <RequireAuth>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard/profil"
              element={<Navigate to="/profile" replace />}
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </RequireAuth>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  </ThemeProvider>
  )
}

export default App