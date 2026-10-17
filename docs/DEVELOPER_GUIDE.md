# 👨‍💻 Guide du Développeur & Règles d'Or — SmartWallet

> **Guide d'Ingénierie Logicielle pour Développeurs & Assistants IA**  
> **Version :** 2.0.0  
> **Objectif :** Garantir la pérennité, la lisibilité et l'intégrité absolue du code sur les 5 prochaines années.

---

## 1. 🌟 Les Règles d'Or Fondamentales

Tout développeur ou agent IA intervenant sur le codebase de SmartWallet **DOIT** respecter impérativement ces 4 principes directeurs :

### 1.1 Règle "Zéro Mock en Fonctionnement Nominal"
* **Principe :** Dans le flux opérationnel normal de l'application (frontend en dev, preview ou production), **aucun mock hardcodé ne doit masquer la réalité du stockage**.
* **Application pratique :** Les transactions, les soldes et les opérations passent **toujours** soit par **IndexedDB (Dexie.js)** en local, soit par **Supabase Cloud (PostgreSQL)**, soit par l'API Spring Boot. Les simulations statiques en mémoire volatile (ex: `useState([{ id: 1, amount: 50 }])`) sont formellement proscrites pour les entités métier persistantes.
* **Exceptions admises :** Les mocks sont réservés exclusivement aux tests unitaires isolés (`*.spec.ts`, `*.test.tsx`).

---

### 1.2 Règle de Précision Monétaire & Dinar Tunisien (TND)
* **Principe :** Le Dinar Tunisien s'exprime en **millimes**, soit **exactement 3 chiffres après la virgule** (ex: `15.450 DT` ou `0.800 DT`).
* **Formatage :** Toujours utiliser le moteur universel `formatMoney()` situé dans [src/lib/format.ts](file:///c:/Users/Adem/Desktop/smart-wallet/smart-wallet-ui/src/lib/format.ts).
* **Règles d'affichage :**
  * En locale Française/Anglaise : espace pour les milliers, virgule pour les décimales, suffixe `DT` (ex: `1 250,500 DT`).
  * En locale Arabe (`ar`) : suffixe `د.ت` (ex: `1 250,500 د.ت`).
* **Calculs arithmétiques :** Pour éviter les erreurs d'imprécision IEEE 754 (ex: `0.1 + 0.2 === 0.30000000000000004`), convertissez les montants en sous-unités entières (millimes : `Math.round(amount * 1000)`) avant sommation ou utilisez `Number(val.toFixed(3))`.

---

### 1.3 Idempotence et Conception Offline-First
* **Principe :** L'interface ne doit jamais supposer qu'une connexion réseau active est disponible pour autoriser une action utilisateur.
* **Génération d'identifiants :** Toute création d'entité génère un `clientUuid` côté client avant insertion dans IndexedDB.
* **Asynchronisme :** L'UI est mise à jour immédiatement dès l'écriture locale réussie ; la synchronisation distante avec le Cloud est déléguée à l'arrière-plan par `syncEngine`.

---

### 1.4 Respect du Design System "Ultra Dark Luxury"
* **Palette :** Fond noir profond (`bg-slate-950` / `bg-[#0a0d14]`), bordures subtiles (`border-white/10`), accents émeraude/or (`text-emerald-400`, `text-amber-400`).
* **Composants d'icônes :** Utiliser exclusivement le catalogue moderne `lucide-react`.
* **Animations :** Transitions fluides 60 FPS sans à-coups via Tailwind ou GSAP (`@gsap/react`).

---

## 2. 📁 Arborescence des Dossiers & Responsabilités

```text
smart-wallet/
├── docs/                     # Documentation technique pérenne (C4, DB, API, etc.)
├── smart-wallet-api/         # Backend Spring Boot 4 / Java 21 / Kotlin
│   └── src/main/java/com/smartwallet/
│       ├── config/           # Configuration Spring (Security, WebSockets, Beans)
│       ├── controller/       # Contrôleurs REST (Auth, Wallet, Transactions...)
│       ├── dto/              # Objets de transfert de données immuables (Records)
│       ├── exception/        # Gestionnaires d'erreurs (GlobalExceptionHandler)
│       ├── model/            # Entités JPA Hibernate (User, Wallet, Transaction)
│       ├── repository/       # Interfaces Spring Data JPA
│       ├── security/         # Filtres JWT & Intercepteur STOMP
│       └── service/          # Logique métier transactionnelle
├── smart-wallet-ui/          # Frontend React 19 / TypeScript / Vite
│   └── src/
│       ├── api/              # Clients Axios & types API distants
│       ├── components/       # Composants graphiques réutilisables
│       ├── context/          # Contextes React (AuthContext, LanguageContext)
│       ├── features/         # Modules fonctionnels découplés
│       ├── hooks/            # Hooks personnalisés (useElementWidth, useSync...)
│       ├── lib/              # Moteurs centraux (db.ts, format.ts, i18n.ts, supabase.ts)
│       ├── pages/            # Écrans principaux (Dashboard, Login, Register, Profile)
│       ├── services/         # Services applicatifs (syncEngine.ts)
│       └── theme/            # Tokens de styles et variantes
└── supabase_schema.sql       # Script DDL SQL pour Supabase Cloud
```

---

## 3. 🏷 Conventions de Nommage

| Élément | Convention | Exemple |
| :--- | :--- | :--- |
| **Composants React** | PascalCase | `TransactionHistoryTable.tsx`, `WalletBalanceCard.tsx` |
| **Hooks personnalisés** | camelCase débutant par `use` | `useSyncEngine.ts`, `useElementWidth.ts` |
| **Services & Moteurs** | camelCase ou PascalCase pour classes | `syncEngine.ts`, `SmartWalletDatabase` |
| **Fichiers Utilitaires** | camelCase | `format.ts`, `cn.ts` |
| **Interfaces TypeScript** | PascalCase | `LocalTransaction`, `SyncQueueItem` |
| **Types TypeScript** | PascalCase | `SyncStatus`, `SyncAction` |
| **Colonnes SQL** | snake_case | `user_id`, `created_at`, `payment_method` |
| **Tables SQL** | Pluriel snake_case | `profiles`, `wallets`, `transactions` |
| **Endpoints REST** | Kebab-case au pluriel | `/api/v1/transactions/history` |

---

## 4. 🛠 Recettes d'Évolution (How-To)

### 4.1 Comment ajouter une nouvelle Catégorie de transaction ?

Pour introduire une nouvelle catégorie (ex: `Santé` / `Health`) sans régression :

1. **Mettre à jour les traductions i18n dans [src/lib/i18n.ts](file:///c:/Users/Adem/Desktop/smart-wallet/smart-wallet-ui/src/lib/i18n.ts) :**
   ```typescript
   // Ajouter la clé dans les dictionnaires fr, en, ar :
   fr: {
     categoryHealth: "Santé & Soins",
   },
   en: {
     categoryHealth: "Healthcare",
   },
   ar: {
     categoryHealth: "الصحة والرعاية",
   }
   ```
2. **Ajouter l'icône et la configuration visuelle dans le composant de sélection :**
   Dans le modal de dépense (`NewTransactionModal.tsx` ou composant dédié), importez l'icône Lucide correspondante (`HeartPulse` ou `Activity`) et ajoutez-la à la liste des catégories avec sa couleur d'accentuation.
3. **Vérifier la contrainte backend / SQL :**
   Dans `supabase_schema.sql`, la colonne `category` est de type `VARCHAR(50)`, elle accepte donc automatiquement la nouvelle chaîne sans modification DDL nécessaire.

---

### 4.2 Comment ajouter une nouvelle Devise ?

Pour ajouter par exemple le Dirham Émirati (`AED`) ou le Dollar Canadien (`CAD`) :

1. **Adapter le moteur de formatage dans [src/lib/format.ts](file:///c:/Users/Adem/Desktop/smart-wallet/smart-wallet-ui/src/lib/format.ts) :**
   Si la devise possède 2 décimales (cas standard) : elle est automatiquement prise en charge par `Intl.NumberFormat` dans le bloc de repli.
   Si la devise possède un nombre spécifique de décimales (ex: KWD à 3 décimales) :
   ```typescript
   if (currency.toUpperCase() === "KWD") {
     // Configurer le split à 3 décimales avec le symbole "د.ك"
   }
   ```
2. **Ajouter l'option dans le sélecteur de devises du Profil :**
   Mettre à jour la liste des devises supportées dans le profil utilisateur et s'assurer que la colonne `currency VARCHAR(10)` de la table `wallets` est respectée.

---

### 4.3 Comment ajouter un nouveau Composant ou un nouvel Écran ?

1. **Créer le fichier dans `src/components/` ou `src/pages/` :**
   Utilisez toujours TypeScript strict avec typage des props.
   ```tsx
   import React from 'react';
   import { LucideIcon } from 'lucide-react';

   interface StatWidgetProps {
     title: string;
     amount: number;
     icon: LucideIcon;
     trend?: number;
   }

   export const StatWidget: React.FC<StatWidgetProps> = ({ title, amount, icon: Icon, trend }) => {
     return (
       <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-300">
         <div className="flex items-center justify-between">
           <span className="text-sm text-slate-400 font-medium">{title}</span>
           <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
             <Icon className="w-5 h-5" />
           </div>
         </div>
         <p className="mt-3 text-2xl font-bold tracking-tight text-white">
           {formatMoney(amount)}
         </p>
       </div>
     );
   };
   ```
2. **Tester le responsive design :**
   Vérifiez l'affichage sur mobile (375px), tablette (768px) et écran large (1440px).
3. **Tester l'accessibilité :**
   Veillez au contraste suffisant des textes gris (`text-slate-400` minimum sur fond noir) et ajoutez des attributs `aria-label` sur les boutons sans libellé textuel direct.
