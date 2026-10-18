# Compte-rendu — Correctifs de déploiement Vercel

Date : 2026-10-17 · Périmètre : `smart-wallet-ui/`

| # | Problème | Statut |
|---|----------|--------|
| 1 | Icônes PWA manquantes (404 sur `pwa-192x192.png`) | ✅ Corrigé |
| 2 | `POST /api/v1/auth/register` → 405 sur Vercel | ✅ Corrigé (mode local autonome) |
| 3 | Violation Permissions Policy `unload` (SockJS) | ✅ Corrigé |

Validation : `npm run build` réussit (`tsc -b` + `vite build`, 0 erreur ; seul reste l'avertissement habituel sur la taille de chunk > 500 kB).

---

## 1. Icônes PWA

**Cause** : le manifest de `vite.config.ts` déclarait `/pwa-192x192.png` et `/pwa-512x512.png`, mais aucun de ces fichiers n'existait dans `public/` (et `apple-touch-icon.png`, listé dans `includeAssets`, manquait aussi).

**Correctif** :
- Nouveau script `scripts/generate-pwa-icons.mjs` (Node pur, sans dépendance : rasterisation anticrénelée + encodeur PNG via `zlib`). Il produit un « V » blanc sur une tuile émeraude en dégradé, sur fond `#05070a` (theme_color).
- Fichiers générés dans `public/` : `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png` (180×180), tous des PNG RGBA valides.
- `vite.config.ts` : icônes ajoutées à `includeAssets` ; l'entrée maskable utilise `purpose: 'maskable'` (au lieu de `'any maskable'`, déconseillé). Le « V » reste dans la zone sûre de 80 %.
- `index.html` : `apple-touch-icon` pointe maintenant vers le PNG (au lieu du SVG, ignoré par iOS).
- Script npm : `npm run icons` pour régénérer.

## 2. Inscription / connexion sans backend (mode local autonome)

**Cause** : sans `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` dans Vercel, `isSupabaseConfigured` vaut `false` et le code appelait `/api/v1/auth/register`. Vercel n'héberge qu'une SPA statique : il répond 405 au POST.

**Correctif** — nouveau module `src/lib/localAuth.ts` :
- `isBackendUnavailable(err)` : vrai pour une erreur réseau, un statut 404/405/501/502/503/504 ou une réponse HTML (rewrite SPA).
- `registerLocalAccount()` : stocke le compte dans `localStorage` (`vaultis_local_accounts`, mot de passe haché en SHA-256) et initialise le portefeuille dans IndexedDB (table Dexie `wallet`) avec un **solde de 0.000 DT** et un numéro de compte `SW-…`.
- `authenticateLocalAccount()` : connexion par nom d'utilisateur ou e-mail.
- `localAdapter` : adaptateur axios utilisé pour les sessions locales (token `sw-local-<id>`). Il sert `profile/me`, `wallet/me`, `transactions/history`, `analytics/stats|chart` et `PUT profile/me` depuis le navigateur. Les autres écritures échouent comme une coupure réseau, ce qui active la file hors-ligne existante (`syncEngine`). Le Dashboard et le Profil fonctionnent donc sans modification.

**Branchements** :
- `api/axiosConfig.ts` : en session locale, l'intercepteur de requête bascule sur `localAdapter`.
- `context/AuthContext.tsx` :
  - `refreshUserData` restaure les sessions locales.
  - Nouveaux `loginLocal(account)` (ajoute aussi la notification « Connecté en Mode Local / Hors-ligne. Configurez Supabase pour la synchronisation Cloud. »), `enterDemoMode()` et `isLocalMode`.
  - `login()` essaie d'abord un compte local, puis le backend ; si aucun serveur n'est joignable, il affiche un message clair au lieu du 405.
- `components/Register.tsx` : ordre Supabase → backend Spring Boot. Si le backend est indisponible, il crée le compte local, connecte l'utilisateur, affiche le message amical et redirige vers `/dashboard`.
- `components/Login.tsx` : connexion aux comptes locaux, plus un bouton **« Essayer en Mode Démo / Local »**, affiché seulement si Supabase n'est pas configuré.

Quand Supabase est configuré, le comportement est inchangé : Supabase Auth reste prioritaire.

## 3. SockJS / violation `unload`

**Cause** : `sockjs-client` enregistre un écouteur `unload` **dès l'import du module**. Sur Vercel, il n'existe en plus aucun endpoint `/ws`, d'où des erreurs de reconnexion en boucle.

**Correctif** (`hooks/useWebSocket.ts`) :
- `isWebSocketAvailable()` : STOMP n'est activé que si `VITE_WS_URL` est défini, ou si l'app tourne sur `localhost` / `127.0.0.1` (Spring Boot en local).
- Pas de WebSocket pour les sessions démo et locales.
- `sockjs-client` est chargé par **import dynamique** (seulement un `import type` statique). Vérifié dans le build : tout le code SockJS, y compris l'écouteur `unload`, se trouve dans un chunk séparé, ni importé ni préchargé par `index.html`. En production sur Vercel, ce code n'est jamais téléchargé.
- `AuthContext` appelle toujours `useWebSocket` ; la décision d'activer ou non le WebSocket est prise dans le hook, au même endroit pour tous les appelants.

---

## Pour activer la synchronisation Cloud sur Vercel

Dans *Project Settings → Environment Variables*, définissez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (et, si vous avez un serveur temps réel, `VITE_WS_URL` / `VITE_API_URL`), puis redéployez. Les variables `VITE_*` sont injectées au moment du build.

## Limites connues

- Les comptes locaux n'existent que dans le navigateur où ils ont été créés : ils ne sont pas migrés automatiquement vers Supabase.
- Les erreurs de lint `react-hooks/set-state-in-effect` (Login.tsx, AuthContext.tsx) et `react-refresh/only-export-components` (AuthContext.tsx) existaient avant ces changements et n'ont pas été touchées.
