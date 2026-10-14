// Le backend (AuthenticationResponse) ne renvoie que le JWT
export interface AuthResponse {
    token: string;
}

export interface Wallet {
    accountNumber: string;
    balance: number;
    currency: string;
}

export type WalletResponse = Wallet;

export type TransactionType = 'DEBIT' | 'CREDIT';

export interface TransferRequest {
    recipientAccountNumber: string;
    amount: number;
    description: string;
}

export type TransactionCategory = 'ALIMENTATION' | 'TRANSPORT' | 'LOISIRS' | 'SHOPPING' | 'REVENUS' | 'AUTRE';

export interface ExpenseRequest {
    amount: number;
    category: TransactionCategory;
    description: string;
}

export interface DepositRequest {
    amount: number;
    description?: string;
}

export interface TransactionResponse {
    id: number;
    amount: number;
    timestamp: string;
    type: TransactionType;
    category: TransactionCategory | null;
    description: string | null;
    senderAccountNumber: string | null;
    recipientAccountNumber: string | null;
}

/** Transaction as displayed in the UI: server data, or a local offline entry not yet synchronised. */
export type DisplayTransaction = TransactionResponse & { pendingSync?: boolean };

export interface DashboardStatsResponse {
    totalRevenues: number;
    totalExpenses: number;
    totalSavings: number;
    revenuesTrend: number;
    expensesTrend: number;
    savingsTrend: number;
}

export interface ChartDataPoint {
    label: string;
    amount: number;
}

export interface ApiError {
    message: string;
}

// Miroir de ProfileResponse : le backend n'expose pas l'id utilisateur
export interface Profile {
    username: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
}

export interface UpdateProfileRequest {
    email: string;
    fullName?: string;
    avatarUrl?: string;
}
