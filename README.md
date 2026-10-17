# 💎 SmartWallet (Vaultis) — The Elite Financial Platform

[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Bundler-Vite%208-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase Cloud](https://img.shields.io/badge/Cloud%20BaaS-Supabase%20(Always--On)-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![IndexedDB Dexie](https://img.shields.io/badge/Offline--First-Dexie.js%20(IndexedDB)-7c3aed?style=flat-square)](https://dexie.org/)
[![Spring Boot 4](https://img.shields.io/badge/Backend-Spring%20Boot%204%20%2F%20Java%2021-6db33f?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![WebSockets STOMP](https://img.shields.io/badge/Real--time-STOMP%20%2F%20SockJS-f97316?style=flat-square)](https://stomp.github.io/)
[![License MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)

> **L'élégance technologique au service de votre patrimoine.**  
> SmartWallet est une plateforme financière personnelle haut de gamme combinant un design **Ultra Dark Luxury**, une architecture **Offline-First résiliente** et une synchronisation cloud instantanée à **0s de Cold-Start** ($0/mois).

---

## 📚 Documentation Technique Complète (`/docs/`)

Le projet dispose d'une suite documentaire exhaustive et pérenne pour accompagner les développeurs et agents autonomes :

| Document | Description | Lien |
| :--- | :--- | :--- |
| 🏗 **Architecture Système** | Modèle C4 complet, moteur de synchronisation Offline-First, idempotence `clientUuid`, diagrammes de flux et résolution de conflits. | [Consulter `docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| 🚀 **Guide de Déploiement** | Déploiement Local pas-à-pas, activation Supabase Cloud ($0/mois), Docker & Docker Compose, et installation Mobile PWA (iOS/Android). | [Consulter `docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| 🗄 **Base de Données** | Modèle relationnel ERD Mermaid, spécification PostgreSQL (Supabase), schémas Dexie.js (IndexedDB) et politiques de sécurité RLS. | [Consulter `docs/DATABASE.md`](docs/DATABASE.md) |
| 🔌 **Spécification API & STOMP** | Spécification détaillée des endpoints REST (Auth, Profile, Wallet, Transactions, Analytics), WebSockets STOMP et RFC 7807. | [Consulter `docs/API_SPECIFICATION.md`](docs/API_SPECIFICATION.md) |
| 👨‍💻 **Guide du Développeur** | Règles d'or "Zéro Mock en Nominal", conventions de code, gestion du Dinar Tunisien (TND à 3 décimales) et recettes d'extension. | [Consulter `docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) |
| 🧪 **Stratégie de Test** | Matrice de tests aux limites (offline -> online, double dépense, millimes, soldes nuls) et checklist "Go / No-Go" pré-production. | [Consulter `docs/TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md) |

---

## ✨ Fonctionnalités Majeures

* **📱 Architecture Mobile & Offline-First Réelle :** Saisie instantanée de dépenses même en zone blanche (avion, sous-sol, sans 4G). Les transactions sont stockées dans IndexedDB et automatiquement réconciliées avec le Cloud dès le retour du réseau.
* **⚡ Zéro Cold Start ($0/mois) :** Intégration native avec **Supabase Cloud** (PostgreSQL managé) assurant une disponibilité 24/7 sans aucune seconde de réveil ou de mise en veille.
* **🇹🇳 Support Natif du Dinar Tunisien (TND) :** Gestion monétaire stricte à 3 décimales (millimes, ex: `15.450 DT` ou `د.ت`) avec moteur de formatage universel.
* **🌍 Internationalisation Trilingue (i18n) :** Bascule instantanée entre le Français (`fr`), l'Anglais (`en`) et l'Arabe (`ar`).
* **💎 Design "Ultra Dark Luxury" :** Interface immersive avec flous d'arrière-plan (*glassmorphism*), contrastes soignés, transitions à 60 FPS et typographie financière d'élite.
* **🔄 Synchronisation Temps Réel STOMP & WebSockets :** Notifications push instantanées lors des virements P2P et actualisation du solde sans rechargement de page.

---

## ⚡ Démarrage Rapide

### Option A : Lancement Automatisé (Windows)
```cmd
# Lance MySQL, le backend Spring Boot (port 8081) et le frontend Vite (port 5173)
start.bat

# Arrête l'ensemble des processus proprement
stop.bat
```

### Option B : Lancement Manuel du Frontend (Mode Serverless / Offline-First)
```bash
cd smart-wallet-ui
npm install
npm run dev
```
L'application est immédiatement accessible sur `http://localhost:5173`.  
Pour la connecter à votre base Cloud gratuite, renseignez simplement vos clés Supabase dans `smart-wallet-ui/.env` (voir [Guide de Déploiement](docs/DEPLOYMENT.md)).

---

## 📲 Installation Mobile (PWA)

* **Sur iOS (Safari) :** Ouvrez l'URL de votre application > Touchez le bouton de partage > Touchez **"Sur l'écran d'accueil"**.
* **Sur Android (Chrome) :** Ouvrez l'URL > Touchez les 3 points verticaux > Touchez **"Installer l'application"**.

SmartWallet fonctionne alors comme une application native autonome avec persistance locale intégrale.

---

## 🛡 Sécurité & Isolation des Données

* **Authentification JWT :** Tokens signés HMAC-SHA256 validés à chaque requête HTTP et trame WebSocket STOMP.
* **Row Level Security (RLS) :** Sécurisation cryptographique au niveau du moteur de base de données PostgreSQL. Aucun utilisateur ne peut accéder ou altérer les données financières d'un tiers.
* **Idempotence de Synchronisation :** Chaque transaction est étiquetée avec un `clientUuid` unique éliminant tout risque de double débit lors des rejeux réseau.

---

## 📄 Licence & Droits
Ce projet est sous licence MIT — voir le fichier [LICENSE](LICENSE) pour plus de détails.  
© 2026 SmartWallet Ecosystem. Tous droits réservés.
