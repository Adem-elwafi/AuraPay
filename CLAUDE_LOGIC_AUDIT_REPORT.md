# Rapport d'audit — Logique métier & intégrité financière (SmartWallet)

> **Périmètre** : passage de la démo à un usage quotidien réel en Tunisie (smartphone, TND à 3 décimales).
> **Date** : 2026-10-16 · **Auditeur** : Claude (audit statique du code, aucun test exécuté)
> **Fichiers analysés** : `lib/format.ts`, `lib/db.ts`, `services/syncEngine.ts`, `lib/supabase.ts`, `context/AuthContext.tsx`, `context/LanguageContext.tsx`, `api/axiosConfig.ts`, `features/dashboard/QuickTransfer.tsx`, `pages/DashBoard.tsx`, `features/dashboard/FlowAnalytics.tsx|FlowChart.tsx`, `App.tsx`, `supabase_schema.sql`, `WalletService.java`, `TransactionController.java`, `AnalyticsService.java`, `Wallet.java`, `Transaction.java`, `GlobalExceptionHandler.java`, `application.properties`.

---

## 0. Résumé exécutif

| Sévérité | Nombre | Thème dominant |
|---|---|---|
| 🔴 Critique | 7 | Faux succès, double source de vérité, perte des millimes, données exposées |
| 🟠 Majeur | 13 | Idempotence, sessions démo/réelles, analytics faux, mode hors-ligne incomplet |
| 🟡 Mineur | 14 | Formatage, messages, robustesse |

**Constat principal** : l'application possède **deux backends qui ne se parlent pas** :
1. **Spring Boot / MySQL** — source de vérité du **solde**, de l'historique et des analytics affichés ;
2. **IndexedDB → Supabase** — file hors-ligne qui ne pousse **que vers Supabase** et dont les données ne sont **jamais relues** par l'interface (seulement exportées en CSV/JSON dans les Paramètres).

Conséquence : toute opération « enregistrée hors-ligne » est affichée comme **réussie**, mais **n'atteint jamais le solde ni l'historique** de l'utilisateur. Pour un suivi réel des dépenses, c'est le défaut bloquant n°1.

**Top 5 à corriger avant toute utilisation réelle** : C1, C2, C3, C4, C5.

---

## 1. 🔴 Bugs CRITIQUES

### C1 — Toute erreur API est transformée en « succès hors-ligne »
**Fichier** : `smart-wallet-ui/src/features/dashboard/QuickTransfer.tsx:150-185`

Le bloc `catch (err)` met **systématiquement** l'opération en file IndexedDB et affiche `status = "done"`, quelle que soit la cause de l'erreur :

| Cause réelle | Résultat affiché | Réalité |
|---|---|---|
| `400 Insufficient balance` (P2P) | ✅ « Opération réussie » | Aucun virement |
| `400 ... more than 3 decimal places` (ex. `12.3456`) | ✅ | Rejeté |
| `400 Recipient account not found` | ✅ | Rejeté |
| `401` token expiré | ✅ (puis déconnexion) | Rejeté |
| `500` erreur serveur | ✅ | Inconnu |

Le message d'erreur (ligne 187-188) n'est atteint que si **IndexedDB elle-même** échoue — donc pratiquement jamais. La validation backend est entièrement neutralisée côté UX.

**Correction** :
```ts
} catch (err) {
  const isNetworkError = axios.isAxiosError(err) && !err.response; // pas de réponse HTTP
  if (!isNetworkError || mode === "p2p") {      // un P2P ne peut PAS être différé
    setStatus("error");
    setErrorMessage(getApiErrorMessage(err, "Une erreur est survenue"));
    return;
  }
  // ... fallback hors-ligne uniquement pour expense/deposit en cas de vraie coupure réseau
}
```

---

### C2 — Les opérations hors-ligne ne sont jamais rejouées vers l'API Spring (double source de vérité)
**Fichiers** : `services/syncEngine.ts:215-260`, `pages/DashBoard.tsx:73-95`, `context/AuthContext.tsx:165-234`

- `syncTransactionCreate` n'écrit **que dans Supabase** (`supabase.from('transactions').upsert`). Aucun appel à `/api/v1/transactions/expense|deposit|transfer`.
- Le Dashboard, le solde (`/v1/wallet/me`) et les analytics viennent **exclusivement** de Spring/MySQL.
- `db.transactions` n'est lu nulle part dans l'UI (uniquement `SettingsPage` pour export/reset).

**Scénario** : métro sans réseau → l'utilisateur saisit « Café 2,500 DT » → ✅ succès → retour du réseau → la dépense n'apparaît ni dans l'historique, ni dans le solde, ni dans les stats. Si Supabase n'est pas configuré, elle reste en file **indéfiniment** (badge « en attente » permanent).

En plus, sur le **chemin de succès** (l.130-138), chaque opération est aussi enfilée vers Supabase : Supabase contient donc un mélange « opérations réelles + opérations jamais appliquées », impossible à réconcilier avec MySQL.

**Correction (choisir UNE source de vérité)** :
- **Option A (recommandée à court terme)** : le `syncEngine` rejoue la file vers l'API Spring (`createExpense`/`createDeposit`) avec une clé d'idempotence (voir M1) ; supprimer l'écriture Supabase ou la faire côté serveur.
- **Option B** : migrer complètement vers Supabase (solde calculé par une fonction SQL/trigger), et retirer Spring.
- Dans tous les cas : fusionner les transactions `pending` locales dans la liste affichée et dans un **solde projeté** (`solde serveur − Σ dépenses pending + Σ dépôts pending`), avec badge « non synchronisé ».

---

### C3 — Perte silencieuse des millimes en base MySQL (migration de scale non appliquée)
**Fichiers** : `model/Wallet.java:406`, `model/Transaction.java:447`, `application.properties:4`

Le diff montre `scale = 2` → `scale = 3`. Or `spring.jpa.hibernate.ddl-auto=update` **ne modifie jamais** le type d'une colonne existante. Sur une base créée auparavant, les colonnes restent `DECIMAL(19,2)` : MySQL **arrondit silencieusement** `15.455` → `15.46` (simple *Note*, pas d'erreur, même en mode strict).

Aggravant : la réponse HTTP et le message WebSocket renvoient la valeur **en mémoire** (`15.455`), alors que la base stocke `15.46` → le solde « saute » au rechargement suivant.

**Correction** : migration explicite (et passer à Flyway/Liquibase, `ddl-auto=validate`) :
```sql
ALTER TABLE wallets      MODIFY balance DECIMAL(19,3) NOT NULL;
ALTER TABLE transactions MODIFY amount  DECIMAL(19,3) NOT NULL;
```
Vérifier ensuite avec `SHOW CREATE TABLE wallets;`.

---

### C4 — Schéma Supabase en 2 décimales et en EUR
**Fichier** : `supabase_schema.sql:885-886, 896, 912, 1004-1005`

- `amount NUMERIC(15,2)`, `balance NUMERIC(15,2)`, `monthly_limit NUMERIC(15,2)` → les millimes sont **arrondis** à la synchro (`2.455` → `2.46`).
- `currency DEFAULT 'EUR'` et le trigger `handle_new_user` crée un wallet **EUR avec 1000.00 de solde offert** → faux solde pour un usage réel.

**Correction** : `NUMERIC(15,3)`, `DEFAULT 'TND'`, solde initial `0.000`.

---

### C5 — Données financières de tous les utilisateurs lisibles/modifiables publiquement (Supabase RLS)
**Fichiers** : `supabase_schema.sql:962-975`, `syncEngine.ts:221-230`

- Les policies autorisent `user_id IS NULL` en SELECT / INSERT / UPDATE.
- L'app s'authentifie via le **JWT Spring**, jamais via `supabase.auth` → `supabase.auth.getUser()` renvoie toujours `null` → **toutes** les transactions sont insérées avec `user_id = NULL`.
- Résultat : quiconque possède la clé `anon` (embarquée dans le bundle JS public) peut **lire et modifier toutes les transactions de tous les utilisateurs**.

**Correction** : supprimer `OR user_id IS NULL` ; exiger une session Supabase (ou passer la synchro par le backend avec la `service_role` côté serveur uniquement) ; refuser la synchro tant que `userId` est `null` (laisser l'élément en file).

---

### C6 — Un virement P2P peut être « mis en file hors-ligne »
**Fichier** : `QuickTransfer.tsx:152-160`

Un transfert entre deux comptes est une opération **serveur atomique** (verrous, contrôle de solde). Le mettre en file IndexedDB n'a aucun sens : il ne sera jamais exécuté, le destinataire ne recevra rien, mais l'émetteur voit ✅ et une ligne « Virement P2P (Hors-ligne) » dans l'export. 
**Correction** : interdire le P2P hors-ligne (bouton désactivé si `!navigator.onLine`, erreur explicite sinon).

---

### C7 — Écriture locale non atomique (transaction orpheline jamais synchronisée)
**Fichier** : `syncEngine.ts:133-148`

`db.transactions.add()` puis `db.sync_queue.add()` sont deux écritures séparées. Si l'onglet est tué entre les deux (fréquent sur mobile : app passée en arrière-plan), la transaction existe localement en `pending` **sans élément de file** → jamais synchronisée, et rien ne la détecte.

**Correction** :
```ts
await db.transaction('rw', db.transactions, db.sync_queue, async () => {
  const id = await db.transactions.add(localTx);
  await db.sync_queue.add({ ...queueItem, payload: { ...localTx, localId: id } });
});
```

---

## 2. 🟠 Bugs MAJEURS

### M1 — Aucune idempotence côté API Spring → doublons
**Fichiers** : `TransactionController.java`, `WalletService.java`, `QuickTransfer.tsx`

- Aucun en-tête/clé d'idempotence sur `/expense`, `/deposit`, `/transfer`.
- Scénario 3G tunisien : la requête aboutit côté serveur mais la réponse est perdue (timeout) → `catch` → C1 enregistre une **deuxième** fois hors-ligne → doublon dès que C2 sera corrigé (rejeu).
- Le `clientUuid` (`tx_${Date.now()}_${random}`) n'est **pas** un UUID et n'est envoyé qu'à Supabase.

**Correction** : générer `crypto.randomUUID()` **avant** l'appel HTTP, l'envoyer en en-tête `Idempotency-Key` ; côté Spring, colonne `client_uuid UNIQUE` sur `transactions` et renvoyer la transaction existante si la clé est déjà connue.

### M2 — Double-clic / double-tap : protection uniquement par état React
**Fichier** : `QuickTransfer.tsx:91-108`

`canSubmit` dépend de `status !== "sending"` (état React asynchrone). Une soumission par Entrée + clic, ou deux taps très rapprochés avant re-rendu, peuvent déclencher deux `submit`. Sans M1, rien côté serveur ne déduplique.
**Correction** : verrou synchrone `const inFlight = useRef(false)` testé/posé en tout début de `submit`, + clé d'idempotence (M1).

### M3 — Le tableau de bord se démonte après chaque opération
**Fichiers** : `AuthContext.tsx:189`, `App.tsx:21-23`, `QuickTransfer.tsx:142`, `DashBoard.tsx:129-138`

`refreshUserData()` fait `setLoading(true)` → `RequireAuth` rend une `<div>` vide → **tout le Dashboard (et QuickTransfer) est démonté** puis remonté. Effets : l'écran « ✅ réussi » disparaît, la modale se ferme brutalement, les `setTimeout` (l.144, 176) modifient un composant démonté, toutes les données sont rechargées. De plus `refreshUserData` est appelé **deux fois** (QuickTransfer l.142 + `handleTransactionSuccess` l.132).
**Correction** : distinguer `initialLoading` (premier chargement) et `refreshing` (silencieux) ; un seul appel de rafraîchissement.

### M4 — Graphique de flux : double intégration du solde
**Fichiers** : `AnalyticsService.java:160-199`, `DashBoard.tsx:144-149`, `FlowChart.tsx:47`, `FlowAnalytics.tsx:55-57`

Le backend renvoie un **solde courant** par jour (`runningBalance`). Le front le traite comme un **flux net journalier** (`net: p.amount`) puis le **re-cumule** (`cum += p.net`) et la carte affiche `Σ net` comme « flux net cumulé ». Avec un solde stable de 500 DT, le graphique affiche **+15 000 DT** sur 30 jours.
**Correction** : soit le backend renvoie le net journalier (`dailyNetChanges`), soit le front utilise directement le solde sans recumuler. Clarifier le libellé.

### M5 — Données financières fictives affichées à un utilisateur réel
**Fichiers** : `DashBoard.tsx:151-162, 190-198`, `FlowAnalytics.tsx:30-40`

- Si `chartData` est vide (nouveau compte, erreur réseau), une courbe **inventée** (« +1 199,40 € ») s'affiche.
- Sparklines dépenses/épargne = `solde × 0.5` (pure fabrication).
- `insight` par défaut « −12 % de dépenses » si non fourni.
**Correction** : états vides explicites (« Pas encore de données »), jamais de valeurs synthétiques hors mode démo.

### M6 — Virements reçus comptés comme dépenses dans la répartition
**Fichier** : `DashBoard.tsx:166-185`

`spendingBreakdown` filtre `t.type === "DEBIT"`. Or un virement P2P est stocké **une seule fois** en `DEBIT` (côté émetteur) et le destinataire le lit comme crédit. Pour le destinataire, l'argent **reçu** gonfle donc la catégorie « AUTRE » des dépenses. 
**Correction** : utiliser la même règle que `RecentActivity` : sortant ⇔ `recipientAccountNumber !== wallet.accountNumber`. Idéalement exposer un champ `direction: "IN" | "OUT"` calculé par le backend (la logique `isIncoming` existe déjà dans `AnalyticsService`).

### M7 — Session démo « collante » et mélangée aux données réelles
**Fichiers** : `AuthContext.tsx:37-72, 166-187, 257-264`, `App.tsx:16-19`, `axiosConfig.ts:42`

- Ouvrir une seule fois `?demo=true` écrit `token = 'sw-demo-session'` **de manière permanente** dans `localStorage` ; l'utilisateur reste en démo tant qu'il ne se déconnecte pas.
- `RequireAuth` laisse passer sans authentification si `?demo=true` est dans l'URL, même avec une session réelle (le profil démo écrase alors l'état initial).
- En démo, les appels API partent avec `Bearer sw-demo-session` → 401/403 → l'intercepteur ne déconnecte pas → C1 enregistre l'opération **en IndexedDB partagée** avec les données réelles (aucune séparation par utilisateur).
- Incohérence : démo initialisée en `TND 79.980` (l.53) puis `EUR 79.98` dans `refreshUserData` (l.184).
**Correction** : flag démo en `sessionStorage`, base Dexie distincte (`SmartWalletDB_demo`), aucune écriture réseau/locale persistante en démo, devise TND partout.

### M8 — Déconnexion sans purge des données locales (téléphone partagé)
**Fichiers** : `AuthContext.tsx:153-158`, `lib/db.ts`

`logout()` ne vide ni `db.transactions` ni `db.sync_queue`, et les tables ne sont pas indexées par utilisateur. Un autre compte connecté sur le même téléphone verra/exportera les transactions du précédent, et la file en attente sera synchronisée **sous l'identité du nouvel utilisateur**.
**Correction** : ajouter `userId` dans `LocalTransaction`/`SyncQueueItem` (nouvelle `version(2)` du schéma Dexie), filtrer par utilisateur, et à la déconnexion : purger, ou bloquer tant que la file n'est pas vide (avec avertissement).

### M9 — Démarrage hors-ligne : solde affiché à 0,000 DT
**Fichiers** : `AuthContext.tsx:191-221`, `lib/db.ts` (table `wallet` jamais écrite)

Hors-ligne, `/profile/me` et `/wallet/me` échouent sans 401 → `isAuthenticated = true` mais `wallet = null` → solde `0,000 DT`, historique vide. La table Dexie `wallet` existe mais n'est **jamais alimentée**.
**Correction** : persister le dernier wallet/profil/historique connus dans Dexie à chaque succès ; les recharger en cas d'échec réseau avec un indicateur « données du JJ/MM HH:mm ».

### M10 — File de synchronisation : retries infinis, pas de backoff, pas d'état `failed`
**Fichier** : `syncEngine.ts:182-202`

- `attempts` est incrémenté mais **jamais plafonné** ; aucun backoff : un élément invalide (ex. contrainte CHECK) est retenté à chaque déclenchement, pour toujours.
- `syncStatus: 'failed'` n'est jamais positionné → l'utilisateur ne voit jamais qu'une opération a échoué.
- L'échec d'un élément n'interrompt pas la boucle → l'ordre FIFO n'est **pas garanti** (élément 2 synchronisé avant élément 1).
- Tout élément dont `entity/action` n'est pas `transaction/CREATE` est **supprimé de la file sans traitement** (l.186-192) → perte silencieuse pour les futurs `UPDATE`/`DELETE`.
- `syncStatus: isSupabaseConfigured && this.isOnline ? 'pending' : 'pending'` (l.128) : ternaire mort.
**Correction** : distinguer erreurs transitoires (réseau/5xx → retry avec backoff exponentiel) et définitives (4xx → `failed`, sortir de la file, notifier) ; `break` sur erreur transitoire pour préserver l'ordre ; lever une erreur sur action inconnue au lieu de supprimer.

### M11 — Synchronisations perdues pendant un cycle en cours
**Fichier** : `syncEngine.ts:163-164`

Si `triggerSync()` est appelé pendant `isSyncing === true`, il retourne immédiatement. Les éléments ajoutés pendant le cycle (le tableau est lu une seule fois l.180) attendent le prochain événement `online` ou un rechargement de l'app.
**Correction** : flag `syncRequested` ; en `finally`, relancer un cycle si demandé. Ajouter aussi une synchro sur `visibilitychange` (retour au premier plan sur mobile) et un intervalle périodique.

### M12 — `navigator.onLine` n'est pas un indicateur fiable
**Fichier** : `syncEngine.ts:14, 47-56`

Sur mobile (Wi-Fi captif, 4G faible), `onLine === true` alors qu'aucune requête ne passe. Combiné à C1, l'app « réussit » tout. 
**Correction** : considérer comme hors-ligne toute erreur Axios sans `response` ; ping léger `/actuator/health` avant de vider la file.

### M13 — Fuseau horaire : `LocalDateTime` sans offset
**Fichiers** : `Transaction.java:452`, `WalletService.java:126,163,194`, `TransactionResponse.java`, `AnalyticsService.java:134-140`

- Les horodatages sont `LocalDateTime.now()` dans le fuseau **du serveur** et sérialisés **sans offset** (`2026-10-16T10:00:00`). Le navigateur les interprète en heure locale. Si le serveur est hébergé en UTC, toutes les heures sont décalées d'1 h pour la Tunisie (UTC+1) et les **bornes de mois** des stats (`YearMonth.now()`) sont fausses autour de minuit le 1er.
- La date réelle d'une dépense hors-ligne (`timestamp` client) est ignorée par l'API.
**Correction** : `Instant`/`OffsetDateTime` en base et en JSON ; calculer les périodes avec `ZoneId.of("Africa/Tunis")` ; accepter un `occurredAt` optionnel dans `ExpenseRequest`.

---

## 3. 🟡 Bugs MINEURS

### Moteur monétaire — `lib/format.ts`
| # | Ligne | Problème | Correction |
|---|---|---|---|
| m1 | 32 | `toFixed(3)` sur des flottants binaires : `(1.0005).toFixed(3)` → `"1.000"`, `(2.0015).toFixed(3)` → `"2.001"` ; les sommes côté front (`0.1+0.2`) accumulent de l'erreur. | Calculer en **millimes entiers** (`Math.round(v*1000)`), ou recevoir les montants en chaîne depuis l'API (`@JsonFormat(shape = STRING)` sur `BigDecimal`). |
| m2 | 29, 41-43 | Zéro négatif : `formatMoney(-0.0004)` → `"-0,000 DT"` ; avec `signed`, `-0` → `"+"`. | Signe déterminé après arrondi : `const m = Math.round(value*1000); if (m === 0) → pas de signe`. |
| m3 | 33 | Séparateur de milliers = espace normal → sur mobile, `1 234,500 DT` peut se couper en fin de ligne. | Utiliser ` ` (espace fine insécable) et ` ` avant le symbole. |
| m4 | 28 | `NaN`/`undefined` → `"NaN DT"` affiché à l'utilisateur. | `if (!Number.isFinite(value)) return "—";` |
| m5 | 39-43 | En arabe (RTL), le signe `-` et `د.ت` sont mal ordonnés par l'algorithme bidi. | Envelopper dans `⁦…⁩` (LRI/PDI) ou utiliser `Intl.NumberFormat('ar-TN', {style:'currency', currency:'TND'})`. |
| m6 | 1-5 | `FormatMoneyOptions` déclare `currency`/`locale` mais n'est pas utilisé ; la signature réelle est positionnelle. `formatEUR` formate en réalité du TND. | Unifier la signature, renommer `formatEUR` → `formatTND`. |
| m7 | 7-14 | `formatMoney` lit `localStorage` à chaque appel (sur chaque ligne de liste), découplé de `LanguageContext` → pas de re-rendu garanti au changement de langue. | Passer la locale depuis le contexte (hook `useMoney()`). |

### Saisie des montants — `QuickTransfer.tsx`
| # | Ligne | Problème | Correction |
|---|---|---|---|
| m8 | 64-65 | `parseAmount` ne remplace que la **première** virgule : `"1.234,500"` → `NaN` → `0` ; `"1,234.5"` → `0`. Le bouton reste juste inactif, **sans message**. | Parser robuste (dernier séparateur = décimal si suivi de 1-3 chiffres), message « Montant invalide ». |
| m9 | 86, 92 | Aucun contrôle des 3 décimales côté client : `12.3456` est envoyé → rejeté (→ C1). | Refuser > 3 décimales à la saisie (regex `^\d+([.,]\d{0,3})?$`) et envoyer `Math.round(value*1000)/1000`. |
| m10 | 86 | Pas de montant maximum : un montant > 10¹⁶ dépasse `DECIMAL(19,3)` → 500 (voir m13). | Plafond métier (ex. 1 000 000 DT) client + serveur. |
| m11 | 144, 176 | `setTimeout` de réinitialisation non annulé : efface la saisie si l'utilisateur recommence dans les 2,4 s ; s'exécute après démontage. | Stocker l'ID dans un `useRef`, `clearTimeout` au démontage/changement. |

### Backend — `WalletService.java` / `TransactionController.java`
| # | Ligne | Problème | Correction |
|---|---|---|---|
| m12 | WalletService 197 / DepositRequest | `DepositRequest.description` est ignoré (description codée en dur). | Utiliser `description` si fourni. |
| m13 | Controller 279-282, 339-342, 361-364 | `catch (Exception e)` renvoie `e.getMessage()` (messages SQL/Hibernate exposés) ; « Wallet not found » (`RuntimeException`) → 500 au lieu de 404 ; un débordement de précision → 500. | Exceptions métier dédiées + `@ControllerAdvice` unique, messages génériques, `@Valid` + `@DecimalMax`. |
| m14 | GlobalExceptionHandler 533-536 | Toute `DataIntegrityViolationException` (y compris un dépassement de montant) renvoie « Username or email already in use ». | Message spécifique selon la contrainte. |
| m15 | ExpenseRequest | Catégorie invalide → `HttpMessageNotReadableException` → 500 générique (au lieu de 400). | Handler dédié → 400. |
| m16 | WalletService 157-158 | Dépenses autorisées avec solde négatif (choix assumé) mais aucun signal métier : le « solde » peut devenir négatif sans alerte. | Documenter ; afficher un avertissement côté UI quand `remaining < 0`. |
| m17 | AnalyticsService 253-259 | Tendance = ±100 % dès que le mois précédent vaut 0 (trompeur pour un nouveau compte). | Renvoyer `null` et afficher « — ». |
| m18 | TransactionController 300 / AnalyticsService 132 | Chargement de **tout** l'historique à chaque appel (historique et analytics) → lent après des mois d'usage quotidien. | Pagination + requêtes d'agrégation SQL par période. |

### Session — `AuthContext.tsx` / `axiosConfig.ts` / `LanguageContext.tsx`
| # | Ligne | Problème | Correction |
|---|---|---|---|
| m19 | application.properties:10 | JWT de **1 h** sans refresh token → reconnexion toutes les heures sur mobile. | Refresh token (httpOnly) ou durée adaptée + renouvellement silencieux. |
| m20 | AuthContext 97-104 | Notification « Virement entrant/sortant » pour **tout** changement de solde (dépôt, dépense) ; un `refreshUserData` qui arrive avant le WebSocket supprime la notification. | Envoyer le type d'opération dans le payload WebSocket. |
| m21 | AuthContext 119-121 | Son téléchargé depuis un CDN tiers (`mixkit.co`) à chaque changement de solde → fuite de métadonnées d'activité, échec hors-ligne. | Fichier audio local dans `/public`. |
| m22 | AuthContext 132 | `localStorage.getItem('token')` lu à chaque rendu pour le WebSocket : après `logout`/401 le hook n'est re-rendu qu'au prochain changement d'état. | Garder le token dans un état React. |
| m23 | LanguageContext 28-33 | `setLanguage` recréé à chaque rendu (absent des deps du `useMemo`) ; changement de langue ne re-formate pas les montants des composants mémoïsés (lien m7). | `useCallback` + passer la locale à `formatMoney`. |
| m24 | AuthContext 240-245 | `try/catch` autour de `refreshUserData` inutile (la fonction n'échoue jamais) ; `isAuthenticated` mis à `true` avant validation du token. | Mettre `isAuthenticated` à `true` seulement après le profil chargé. |

---

## 4. Matrice des cas limites demandés

| Cas | Comportement actuel | Verdict |
|---|---|---|
| Montant `0` / vide | Bouton inactif (`value > 0`) ; backend refuse aussi | ✅ OK (pas de message explicite) |
| Montant négatif | Le `-` est filtré à la saisie ; backend refuse | ✅ OK |
| Montant `"12,5"` / `"12.5"` / `"1 250,5"` | Correctement parsé | ✅ OK |
| Montant `"1.250,500"` ou `"1,250.5"` | Parsé à 0, bouton inactif silencieux | 🟡 m8 |
| Montant `12.3456` | Envoyé, rejeté, **affiché comme réussi** | 🔴 C1 + m9 |
| Millimes `0.005 DT` | OK en JS/Java ; **arrondi en MySQL (si colonne non migrée) et Supabase** | 🔴 C3, C4 |
| Dépense avec solde 0 | Autorisée (front + back), solde négatif | 🟡 m16 (choix métier) |
| P2P > solde | Bloqué côté UI ; si contourné → 400 → **affiché réussi** | 🔴 C1 |
| Double clic | Protégé par état React seulement, aucune idempotence serveur | 🟠 M1, M2 |
| Réponse perdue (timeout) | Opération réelle + copie hors-ligne → doublon potentiel | 🟠 M1 |
| Perte du token (401) | Déconnexion, mais l'opération en cours est enregistrée « hors-ligne » | 🔴 C1 |
| Mode avion | Enregistré localement, **jamais appliqué au solde** | 🔴 C2 |
| Démarrage hors-ligne | Solde 0,000 DT, historique vide | 🟠 M9 |
| Démo → réel sur le même appareil | Token démo persistant, IndexedDB partagée | 🟠 M7, M8 |
| Changement d'utilisateur | File de l'ancien utilisateur synchronisée sous le nouveau | 🟠 M8 |
| App tuée pendant l'enregistrement | Transaction locale orpheline | 🔴 C7 |

## 5. Promesses non gérées / erreurs silencieuses

| Emplacement | Problème |
|---|---|
| `QuickTransfer.tsx:131-138` | `void enqueueTransaction(...).catch(() => undefined)` — échec IndexedDB ignoré. |
| `QuickTransfer.tsx:142`, `DashBoard.tsx:132`, `AuthContext.tsx:272` | `refreshUserData().catch(() => undefined)` — erreurs avalées (sans impact réel car la fonction ne rejette jamais, mais masque les régressions). |
| `syncEngine.ts:88-90` | `refreshPendingCount` avale l'erreur Dexie (quota plein / mode privé Safari) → compteur figé. |
| `syncEngine.ts:206-207` | Erreur globale de synchro : simple `console.error`, aucun état exposé à l'UI. |
| `syncEngine.ts:221` | `supabase.auth.getUser()` : l'objet `error` est ignoré. |
| `syncEngine.ts:36, 41, 50, 98` | `void this.triggerSync()` / `void refreshPendingCount()` sans catch (rejet possible si Dexie indisponible). |
| `AuthContext.tsx:121` | `void audio.play()` — la promesse rejetée (autoplay bloqué sur mobile) n'est pas capturée par le `try/catch` synchrone → *unhandled rejection*. |
| `DashBoard.tsx:84-91` | Erreur d'historique non-401 : liste vidée **sans message** (l'utilisateur croit n'avoir aucune transaction). |

---

## 6. Plan de remédiation recommandé

**Sprint 1 — Intégrité (bloquant avant usage réel)**
1. C1/C6 : n'utiliser le fallback hors-ligne que pour les erreurs réseau, jamais pour le P2P.
2. C3/C4 : migrations `DECIMAL(19,3)` / `NUMERIC(15,3)`, devise `TND`, solde initial 0 ; passer à Flyway + `ddl-auto=validate`.
3. C5 : supprimer `user_id IS NULL` des policies RLS ; bloquer la synchro sans utilisateur.
4. C7 : transaction Dexie atomique.
5. M1/M2 : `Idempotency-Key` (UUID v4) + colonne unique + verrou `useRef`.

**Sprint 2 — Cohérence hors-ligne**
6. C2 : décider de la source de vérité unique ; rejouer la file vers l'API retenue ; afficher les `pending` dans l'historique et un solde projeté.
7. M8/M7 : scoper IndexedDB par utilisateur, séparer la démo.
8. M9/M10/M11/M12 : cache local du wallet, backoff + état `failed`, re-synchro sur `visibilitychange`, détection réseau par erreur Axios.

**Sprint 3 — Exactitude des analyses & UX**
9. M4/M5/M6 : corriger la double intégration du graphique, supprimer les données fictives, utiliser la direction réelle (IN/OUT).
10. M3 : rafraîchissement silencieux sans démonter le Dashboard.
11. M13 : `OffsetDateTime` + `Africa/Tunis`.
12. Mineurs m1-m24.

**Tests à ajouter** (aucun test n'existe actuellement sur ces chemins) :
- `format.test.ts` : `0`, `-0`, `0.0005`, `1.0005`, `1234567.891`, `NaN`, locales fr/ar/en.
- `parseAmount.test.ts` : `"12,5"`, `"1 250,500"`, `"1.250,5"`, `"12.3456"`, `""`.
- `syncEngine.test.ts` (fake-indexeddb) : atomicité, ordre FIFO, retry/backoff, action inconnue.
- `WalletServiceTest` : scale 3 persistée (`0.005` relu = `0.005`), idempotence, transferts concurrents.
