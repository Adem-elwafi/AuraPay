import axiosInstance from '../api/axiosConfig';
import type { DepositRequest, ExpenseRequest, TransactionResponse, TransferRequest } from '../api/types';

/**
 * Initiate a transfer between wallets
 */
export const initiateTransfer = async (transferRequest: TransferRequest): Promise<TransactionResponse> => {
  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/transfer', transferRequest);
  return response.data;
};

/**
 * Register a personal expense for the logged-in user
 */
export const createExpense = async (expenseRequest: ExpenseRequest): Promise<TransactionResponse> => {
  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/expense', expenseRequest);
  return response.data;
};

/**
 * Deposit funds into the logged-in user's wallet
 */
export const createDeposit = async (depositRequest: DepositRequest): Promise<TransactionResponse> => {
  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/deposit', depositRequest);
  return response.data;
};

/**
 * Get the transaction history for the logged-in user
 */
export const getTransactionHistory = async (): Promise<TransactionResponse[]> => {
  const response = await axiosInstance.get<TransactionResponse[]>('/v1/transactions/history');
  return response.data;
};
