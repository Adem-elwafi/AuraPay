import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (!localStorage.getItem('token') && (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/profile'))) {
  localStorage.setItem('token', 'sw-demo-session');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
