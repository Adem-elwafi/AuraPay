# 🔌 Spécification de l'API & Protocole WebSocket — SmartWallet

> **Contrat d'Interface REST, WebSocket STOMP & Modèle d'Erreur RFC 7807**  
> **Version :** 2.0.0  
> **Base URL :** `http://localhost:8081` (Local) / `https://api.smartwallet.com` (Production)  
> **Format d'échange :** `application/json; charset=UTF-8`

---

## 1. 🔐 Authentification & Sécurité des Échanges

Toutes les routes d'API (à l'exception des points d'entrée `/api/v1/auth/*`) exigent la présence d'un jeton d'authentification **JWT Bearer Token** dans l'en-tête HTTP :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

* **Algorithme de signature :** HMAC-SHA256 (`HS256`).
* **Durée de validité du jeton :** 24 heures par défaut.
* **Extraction de l'identité :** Le claim `sub` (Subject) contient l'adresse email ou le nom d'utilisateur unique.

---

## 2. 📡 Endpoints REST

### 2.1 Module Authentification (`/api/v1/auth`)

#### A. Inscription (`POST /api/v1/auth/register`)
Crée un nouveau compte utilisateur avec portefeuille initialisé.

* **Headers :** `Content-Type: application/json`
* **Corps de la requête :**
  ```json
  {
    "username": "adem_dev",
    "email": "adem@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Réponses :**
  * `200 OK` :
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZGVtX2RldiIsImlhdCI6MTcyOTEyMDAwMCwiZXhwIjoxNzI5MjA2NDAwfQ..."
    }
    ```
  * `409 Conflict` : `Username or email already in use`

---

#### B. Connexion (`POST /api/v1/auth/login` ou `/api/v1/auth/authenticate`)
Authentifie un utilisateur et retourne un jeton d'accès JWT.

* **Corps de la requête :**
  ```json
  {
    "username": "adem@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Réponses :**
  * `200 OK` :
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  * `401 Unauthorized` : `Invalid username or password`

---

### 2.2 Module Profil Utilisateur (`/api/v1/profile`)

#### A. Obtenir son profil (`GET /api/v1/profile/me`)
* **Headers :** `Authorization: Bearer <token>`
* **Réponse `200 OK` :**
  ```json
  {
    "id": 1,
    "username": "adem_dev",
    "email": "adem@example.com",
    "fullName": "Adem Ben Amor",
    "avatarUrl": "https://avatars.example.com/adem.png",
    "createdAt": "2026-10-15T12:00:00Z"
  }
  ```

#### B. Mettre à jour son profil (`PUT /api/v1/profile/me`)
* **Headers :** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Corps de la requête :**
  ```json
  {
    "fullName": "Adem Ben Amor",
    "email": "adem.new@example.com",
    "avatarUrl": "https://avatars.example.com/new_avatar.png"
  }
  ```
* **Réponse `200 OK` :** Objet `ProfileResponse` actualisé.
* **Réponse `400 Bad Request` :** `Email already in use`

---

### 2.3 Module Portefeuille (`/api/v1/wallet`)

#### Obtenir les données du portefeuille (`GET /api/v1/wallet/me`)
* **Headers :** `Authorization: Bearer <token>`
* **Réponse `200 OK` :**
  ```json
  {
    "id": 1,
    "balance": 2450.750,
    "currency": "TND",
    "accountNumber": "SW-9847291042",
    "updatedAt": "2026-10-16T18:30:00Z"
  }
  ```

---

### 2.4 Module Transactions (`/api/v1/transactions`)

#### A. Enregistrer une Dépense (`POST /api/v1/transactions/expense`)
Débite le compte du montant indiqué avec affectation d'une catégorie.

* **Corps de la requête :**
  ```json
  {
    "amount": 15.450,
    "category": "Alimentation",
    "description": "Déjeuner restaurant"
  }
  ```
* **Réponse `201 Created` :**
  ```json
  {
    "id": 104,
    "amount": 15.450,
    "type": "DEBIT",
    "category": "Alimentation",
    "description": "Déjeuner restaurant",
    "timestamp": "2026-10-16T19:15:00Z",
    "senderAccountNumber": "SW-9847291042",
    "recipientAccountNumber": null
  }
  ```
* **Réponse `400 Bad Request` :** `Solde insuffisant pour effectuer cette dépense`

---

#### B. Effectuer un Dépôt (`POST /api/v1/transactions/deposit`)
Crédite le portefeuille de l'utilisateur.

* **Corps de la requête :**
  ```json
  {
    "amount": 500.000
  }
  ```
* **Réponse `201 Created` :** Objet `TransactionResponse` avec `type: "CREDIT"`.

---

#### C. Virement P2P entre comptes (`POST /api/v1/transactions/transfer`)
Transfère des fonds de manière atomique vers le compte d'un autre utilisateur.

* **Corps de la requête :**
  ```json
  {
    "recipientAccountNumber": "SW-1049283741",
    "amount": 120.000,
    "description": "Remboursement courses"
  }
  ```
* **Réponse `201 Created` :** Objet `TransactionResponse` confirmant le débit.
* **Réponse `400 Bad Request` :** `Solde insuffisant` ou `Compte destinataire invalide`.

---

#### D. Historique des transactions (`GET /api/v1/transactions/history`)
Récupère la liste chronologique de toutes les transactions du compte connecté.

* **Réponse `200 OK` :**
  ```json
  [
    {
      "id": 104,
      "amount": 15.450,
      "type": "DEBIT",
      "category": "Alimentation",
      "description": "Déjeuner restaurant",
      "timestamp": "2026-10-16T19:15:00Z",
      "senderAccountNumber": "SW-9847291042",
      "recipientAccountNumber": null
    },
    {
      "id": 103,
      "amount": 500.000,
      "type": "CREDIT",
      "category": "Dépôt",
      "description": "Alimentation compte bancaire",
      "timestamp": "2026-10-16T10:00:00Z",
      "senderAccountNumber": null,
      "recipientAccountNumber": "SW-9847291042"
    }
  ]
  ```

---

### 2.5 Module Statistiques & Analytique (`/api/v1/analytics`)

#### A. Métriques globales du Dashboard (`GET /api/v1/analytics/stats`)
* **Réponse `200 OK` :**
  ```json
  {
    "totalIncome": 3500.000,
    "totalExpenses": 1049.250,
    "balance": 2450.750,
    "savingsRate": 70.02
  }
  ```

#### B. Données pour Graphique d'Évolution (`GET /api/v1/analytics/chart`)
* **Réponse `200 OK` :**
  ```json
  [
    { "date": "2026-10-10", "income": 0.0, "expense": 45.500 },
    { "date": "2026-10-11", "income": 1200.0, "expense": 12.000 },
    { "date": "2026-10-12", "income": 0.0, "expense": 89.200 }
  ]
  ```

---

## 3. ⚡ Protocole WebSocket STOMP (Temps Réel)

Le serveur Spring Boot expose un broker de messages STOMP pour notifier instantanément les clients des mouvements de compte sans polling HTTP.

```mermaid
sequenceDiagram
    participant Client as React Client (STOMP Client)
    participant Broker as WebSocket Broker (/ws)
    participant Service as WalletService (Spring Boot)

    Client->>Broker: CONNECT [Headers: Authorization: Bearer <token>]
    Broker->>Broker: JwtChannelInterceptor valide le token
    Broker-->>Client: CONNECTED
    Client->>Broker: SUBSCRIBE /topic/wallet/{username}

    Note over Service: Virement entrant ou Dépense validée
    Service->>Service: Commit Transaction SQL (afterCommit)
    Service->>Broker: convertAndSend("/topic/wallet/{username}", payload)
    Broker-->>Client: MESSAGE /topic/wallet/{username} (Nouveau solde & tx)
    Client->>Client: Mise à jour 60 FPS du Dashboard
```

### 3.1 Spécifications de Connexion
* **Endpoint HTTP / WebSocket :** `/ws` (Support SockJS natif activé).
* **Autorisation STOMP :** Le token JWT doit être transmis dans les en-têtes de la trame `CONNECT` :
  ```text
  CONNECT
  accept-version:1.2,1.1,1.0
  heart-beat:10000,10000
  Authorization:Bearer eyJhbGciOiJIUzI1Ni...
  ^@
  ```
* **Canal de souscription utilisateur :**
  `/topic/wallet/{username}`
* **Exemple de trame reçue :**
  ```json
  {
    "balance": 2435.300,
    "lastTransaction": {
      "id": 105,
      "amount": 15.450,
      "type": "DEBIT",
      "category": "Alimentation"
    }
  }
  ```

---

## 4. ⚠️ Gestion des Erreurs & Format RFC 7807 (Problem Details)

L'API standardise ses réponses d'erreurs selon la norme internationale **RFC 7807** (`application/problem+json`).

### 4.1 Structure du Format RFC 7807
```json
{
  "type": "https://api.smartwallet.com/errors/insufficient-balance",
  "title": "Solde Insuffisant",
  "status": 400,
  "detail": "Votre solde actuel (45.000 DT) ne permet pas de couvrir une dépense de 50.000 DT.",
  "instance": "/api/v1/transactions/expense",
  "timestamp": "2026-10-16T20:15:30Z"
}
```

### 4.2 Matrice des Codes d'Erreur

| Code HTTP | Titre / Type RFC 7807 | Règle Métier Déclenchée |
| :--- | :--- | :--- |
| `400 Bad Request` | `insufficient-balance` | Solde du compte inférieur au montant débité |
| `400 Bad Request` | `invalid-argument` | Montant négatif, nul ou paramètre manquant |
| `401 Unauthorized` | `invalid-credentials` | Identifiant ou mot de passe erroné |
| `401 Unauthorized` | `expired-token` | Jeton JWT expiré ou malformé |
| `403 Forbidden` | `forbidden-access` | Tentative d'accès aux données d'un autre utilisateur |
| `404 Not Found` | `user-not-found` | Compte destinataire ou portefeuille introuvable |
| `409 Conflict` | `duplicate-resource` | Email ou nom d'utilisateur déjà attribué |
| `500 Server Error` | `internal-server-error` | Exception imprévue / Défaillance persistance |
