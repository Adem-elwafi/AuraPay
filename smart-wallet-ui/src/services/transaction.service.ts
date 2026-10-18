import axiosInstance from '../api/axiosConfig';
import type { DepositRequest, ExpenseRequest, TransactionCategory, TransactionResponse, TransactionType, TransferRequest } from '../api/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Initiate a transfer between wallets
 */
export const initiateTransfer = async (transferRequest: TransferRequest): Promise<TransactionResponse> => {
  if (isSupabaseConfigured && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const nowIso = new Date().toISOString();
      const clientUuid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 1. Sender wallet
      const { data: senderWallet, error: senderErr } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (senderErr || !senderWallet) {
        throw new Error('Portefeuille expéditeur introuvable.');
      }

      const senderBalance = Number(senderWallet.balance) || 0;
      if (senderBalance < transferRequest.amount) {
        throw new Error('Solde insuffisant pour effectuer ce virement.');
      }

      // 2. Recipient wallet (search by clean account number)
      const cleanRecipient = transferRequest.recipientAccountNumber.replace(/\s+/g, '').toUpperCase();
      const { data: allWallets, error: recErr } = await supabase
        .from('wallets')
        .select('*');

      if (recErr) throw recErr;

      const recipientWallet = allWallets?.find(
        (w) => (w.account_number || '').replace(/\s+/g, '').toUpperCase() === cleanRecipient
      );

      if (!recipientWallet) {
        throw new Error('Numéro de compte destinataire introuvable.');
      }

      if (recipientWallet.user_id === authData.user.id) {
        throw new Error('Vous ne pouvez pas effectuer de virement vers votre propre compte.');
      }

      // 3. Insert DEBIT transaction for sender
      const { data: txRow, error: txError } = await supabase
        .from('transactions')
        .insert({
          id: clientUuid,
          user_id: authData.user.id,
          amount: transferRequest.amount,
          type: 'DEBIT',
          category: 'AUTRE',
          description: transferRequest.description || 'Virement sortant',
          payment_method: 'Virement',
          sender_account_number: senderWallet.account_number || null,
          recipient_account_number: recipientWallet.account_number || null,
          timestamp: nowIso,
          created_at: nowIso,
        })
        .select('*')
        .single();

      if (txError) throw txError;

      // 4. Insert CREDIT transaction for recipient
      await supabase
        .from('transactions')
        .insert({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          user_id: recipientWallet.user_id,
          amount: transferRequest.amount,
          type: 'CREDIT',
          category: 'REVENUS',
          description: `Virement reçu de ${senderWallet.account_number || 'SmartWallet'}`,
          payment_method: 'Virement',
          sender_account_number: senderWallet.account_number || null,
          recipient_account_number: recipientWallet.account_number || null,
          timestamp: nowIso,
          created_at: nowIso,
        });

      // 5. Update wallet balances (ensures instant update even if SQL trigger not yet deployed)
      await supabase
        .from('wallets')
        .update({ balance: senderBalance - transferRequest.amount, updated_at: nowIso })
        .eq('user_id', authData.user.id);

      await supabase
        .from('wallets')
        .update({ balance: (Number(recipientWallet.balance) || 0) + transferRequest.amount, updated_at: nowIso })
        .eq('user_id', recipientWallet.user_id);

      return {
        id: txRow?.id || clientUuid,
        amount: transferRequest.amount,
        timestamp: txRow?.timestamp || nowIso,
        type: 'DEBIT',
        category: 'AUTRE',
        description: transferRequest.description || 'Virement sortant',
        senderAccountNumber: senderWallet.account_number || null,
        recipientAccountNumber: recipientWallet.account_number || null,
      };
    }
  }

  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/transfer', transferRequest);
  return response.data;
};

/**
 * Register a personal expense for the logged-in user
 */
export const createExpense = async (expenseRequest: ExpenseRequest): Promise<TransactionResponse> => {
  if (isSupabaseConfigured && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const nowIso = new Date().toISOString();
      const clientUuid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      const currentBalance = Number(wallet?.balance) || 0;
      if (currentBalance < expenseRequest.amount) {
        throw new Error('Solde insuffisant pour effectuer cette dépense.');
      }

      const { data: txRow, error: txError } = await supabase
        .from('transactions')
        .insert({
          id: clientUuid,
          user_id: authData.user.id,
          amount: expenseRequest.amount,
          type: 'DEBIT',
          category: expenseRequest.category,
          description: expenseRequest.description || 'Dépense personnelle',
          payment_method: 'Carte',
          sender_account_number: wallet?.account_number || null,
          recipient_account_number: null,
          timestamp: nowIso,
          created_at: nowIso,
        })
        .select('*')
        .single();

      if (txError) throw txError;

      // Update wallet balance
      await supabase
        .from('wallets')
        .update({
          balance: currentBalance - expenseRequest.amount,
          updated_at: nowIso,
        })
        .eq('user_id', authData.user.id);

      return {
        id: txRow?.id || clientUuid,
        amount: expenseRequest.amount,
        timestamp: txRow?.timestamp || nowIso,
        type: 'DEBIT',
        category: expenseRequest.category,
        description: expenseRequest.description || 'Dépense personnelle',
        senderAccountNumber: wallet?.account_number || null,
        recipientAccountNumber: null,
      };
    }
  }

  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/expense', expenseRequest);
  return response.data;
};

/**
 * Deposit funds into the logged-in user's wallet
 */
export const createDeposit = async (depositRequest: DepositRequest): Promise<TransactionResponse> => {
  if (isSupabaseConfigured && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const nowIso = new Date().toISOString();
      const clientUuid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      const newBalance = (Number(wallet?.balance) || 0) + depositRequest.amount;

      const { data: txRow, error: txError } = await supabase
        .from('transactions')
        .insert({
          id: clientUuid,
          user_id: authData.user.id,
          amount: depositRequest.amount,
          type: 'CREDIT',
          category: 'REVENUS',
          description: depositRequest.description || 'Dépôt de fonds',
          payment_method: 'Carte',
          sender_account_number: null,
          recipient_account_number: wallet?.account_number || null,
          timestamp: nowIso,
          created_at: nowIso,
        })
        .select('*')
        .single();

      if (txError) throw txError;

      // Update wallet balance in Supabase
      await supabase
        .from('wallets')
        .update({
          balance: newBalance,
          updated_at: nowIso,
        })
        .eq('user_id', authData.user.id);

      return {
        id: txRow?.id || clientUuid,
        amount: depositRequest.amount,
        timestamp: txRow?.timestamp || nowIso,
        type: 'CREDIT',
        category: 'REVENUS',
        description: depositRequest.description || 'Dépôt de fonds',
        senderAccountNumber: null,
        recipientAccountNumber: wallet?.account_number || null,
      };
    }
  }

  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/deposit', depositRequest);
  return response.data;
};

/**
 * Get the transaction history for the logged-in user
 */
export const getTransactionHistory = async (): Promise<TransactionResponse[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Erreur récupération transactions Supabase:', error);
      } else if (data) {
        return data.map((row) => ({
          id: row.id,
          amount: Number(row.amount),
          timestamp: row.timestamp || row.created_at,
          type: row.type as TransactionType,
          category: (row.category as TransactionCategory) || null,
          description: row.description ?? null,
          senderAccountNumber: row.sender_account_number ?? null,
          recipientAccountNumber: row.recipient_account_number ?? null,
        }));
      }
    }
  }

  const response = await axiosInstance.get<TransactionResponse[]>('/v1/transactions/history');
  return response.data;
};

