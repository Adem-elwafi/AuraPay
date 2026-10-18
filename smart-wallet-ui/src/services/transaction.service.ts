import axiosInstance from '../api/axiosConfig';
import type { DepositRequest, ExpenseRequest, TransactionCategory, TransactionResponse, TransactionType, TransferRequest } from '../api/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isLocalToken, findLocalAccountByToken } from '../lib/localAuth';
import { db } from '../lib/db';
import { syncEngine } from './syncEngine';

/**
 * Initiate a transfer between wallets
 */
export const initiateTransfer = async (transferRequest: TransferRequest): Promise<TransactionResponse> => {
  const storedToken = localStorage.getItem('token');
  const nowIso = new Date().toISOString();
  const clientUuid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Supabase Cloud Session
  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      let { data: senderWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!senderWallet) {
        const newAcc = `SW-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        const { data: created } = await supabase
          .from('wallets')
          .insert({
            user_id: session.user.id,
            balance: 1000.00,
            currency: 'EUR',
            account_number: newAcc,
          })
          .select('*')
          .single();
        senderWallet = created;
      }

      const senderBalance = Number(senderWallet?.balance) || 0;
      if (senderBalance < transferRequest.amount) {
        throw new Error('Solde insuffisant pour effectuer ce virement.');
      }

      const cleanRecipient = transferRequest.recipientAccountNumber.replace(/\s+/g, '').toUpperCase();
      const { data: allWallets } = await supabase.from('wallets').select('*');
      const recipientWallet = allWallets?.find(
        (w) => (w.account_number || '').replace(/\s+/g, '').toUpperCase() === cleanRecipient
      );

      if (!recipientWallet) {
        throw new Error('Numéro de compte destinataire introuvable.');
      }

      if (recipientWallet.user_id === session.user.id) {
        throw new Error('Vous ne pouvez pas effectuer de virement vers votre propre compte.');
      }

      const { data: txRow, error: txError } = await supabase
        .from('transactions')
        .insert({
          id: clientUuid,
          user_id: session.user.id,
          amount: transferRequest.amount,
          type: 'DEBIT',
          category: 'AUTRE',
          description: transferRequest.description || 'Virement sortant',
          payment_method: 'Virement',
          sender_account_number: senderWallet?.account_number || null,
          recipient_account_number: recipientWallet.account_number || null,
          timestamp: nowIso,
          created_at: nowIso,
        })
        .select('*')
        .single();

      if (txError) throw txError;

      // Recipient transaction
      await supabase.from('transactions').insert({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        user_id: recipientWallet.user_id,
        amount: transferRequest.amount,
        type: 'CREDIT',
        category: 'REVENUS',
        description: `Virement reçu de ${senderWallet?.account_number || 'SmartWallet'}`,
        payment_method: 'Virement',
        sender_account_number: senderWallet?.account_number || null,
        recipient_account_number: recipientWallet.account_number || null,
        timestamp: nowIso,
        created_at: nowIso,
      });

      // Update balances
      await supabase
        .from('wallets')
        .update({ balance: senderBalance - transferRequest.amount, updated_at: nowIso })
        .eq('user_id', session.user.id);

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
        senderAccountNumber: senderWallet?.account_number || null,
        recipientAccountNumber: recipientWallet.account_number || null,
      };
    }
  }

  // 2. Local Account
  if (isLocalToken(storedToken)) {
    const account = findLocalAccountByToken(storedToken);
    if (account) {
      const stored = await db.wallet.get(account.accountNumber);
      const current = stored?.balance || 0;
      if (current < transferRequest.amount) {
        throw new Error('Solde local insuffisant pour effectuer ce virement.');
      }
      await db.wallet.put({
        id: account.accountNumber,
        balance: current - transferRequest.amount,
        currency: stored?.currency || 'TND',
        updatedAt: nowIso,
      });

      const localTx = await syncEngine.enqueueTransaction({
        amount: transferRequest.amount,
        type: 'DEBIT',
        category: 'AUTRE',
        description: transferRequest.description || 'Virement sortant',
        senderAccountNumber: account.accountNumber,
        recipientAccountNumber: transferRequest.recipientAccountNumber,
      });

      return {
        id: localTx.clientUuid || String(localTx.id || Date.now()),
        amount: transferRequest.amount,
        timestamp: localTx.timestamp,
        type: 'DEBIT',
        category: 'AUTRE',
        description: transferRequest.description || 'Virement sortant',
        senderAccountNumber: account.accountNumber,
        recipientAccountNumber: transferRequest.recipientAccountNumber,
      };
    }
  }

  // 3. Demo Session
  if (storedToken === 'sw-demo-session') {
    const current = Number(localStorage.getItem('sw_demo_balance') || '79.98');
    if (current < transferRequest.amount) {
      throw new Error('Solde démo insuffisant pour effectuer ce virement.');
    }
    const newBal = current - transferRequest.amount;
    localStorage.setItem('sw_demo_balance', newBal.toFixed(2));

    const localTx = await syncEngine.enqueueTransaction({
      amount: transferRequest.amount,
      type: 'DEBIT',
      category: 'AUTRE',
      description: transferRequest.description || 'Virement sortant (Mode Démo)',
      senderAccountNumber: 'SW-3 6395 5398 7',
      recipientAccountNumber: transferRequest.recipientAccountNumber,
    });

    return {
      id: localTx.clientUuid || String(localTx.id || Date.now()),
      amount: transferRequest.amount,
      timestamp: localTx.timestamp,
      type: 'DEBIT',
      category: 'AUTRE',
      description: transferRequest.description || 'Virement sortant (Mode Démo)',
      senderAccountNumber: 'SW-3 6395 5398 7',
      recipientAccountNumber: transferRequest.recipientAccountNumber,
    };
  }

  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/transfer', transferRequest);
  return response.data;
};

/**
 * Register a personal expense for the logged-in user
 */
export const createExpense = async (expenseRequest: ExpenseRequest): Promise<TransactionResponse> => {
  const storedToken = localStorage.getItem('token');
  const nowIso = new Date().toISOString();
  const clientUuid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Supabase Cloud Session
  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      let { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!wallet) {
        const newAcc = `SW-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        const { data: created } = await supabase
          .from('wallets')
          .insert({
            user_id: session.user.id,
            balance: 1000.00,
            currency: 'EUR',
            account_number: newAcc,
          })
          .select('*')
          .single();
        wallet = created;
      }

      const currentBalance = Number(wallet?.balance) || 0;
      if (currentBalance < expenseRequest.amount) {
        throw new Error('Solde insuffisant pour effectuer cette dépense.');
      }

      const { data: txRow, error: txError } = await supabase
        .from('transactions')
        .insert({
          id: clientUuid,
          user_id: session.user.id,
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

      await supabase
        .from('wallets')
        .update({
          balance: currentBalance - expenseRequest.amount,
          updated_at: nowIso,
        })
        .eq('user_id', session.user.id);

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

  // 2. Local Account
  if (isLocalToken(storedToken)) {
    const account = findLocalAccountByToken(storedToken);
    if (account) {
      const stored = await db.wallet.get(account.accountNumber);
      const current = stored?.balance || 0;
      if (current < expenseRequest.amount) {
        throw new Error('Solde local insuffisant pour cette dépense.');
      }
      await db.wallet.put({
        id: account.accountNumber,
        balance: current - expenseRequest.amount,
        currency: stored?.currency || 'TND',
        updatedAt: nowIso,
      });

      const localTx = await syncEngine.enqueueTransaction({
        amount: expenseRequest.amount,
        type: 'DEBIT',
        category: expenseRequest.category,
        description: expenseRequest.description || 'Dépense personnelle',
        senderAccountNumber: account.accountNumber,
        recipientAccountNumber: null,
      });

      return {
        id: localTx.clientUuid || String(localTx.id || Date.now()),
        amount: expenseRequest.amount,
        timestamp: localTx.timestamp,
        type: 'DEBIT',
        category: expenseRequest.category,
        description: expenseRequest.description || 'Dépense personnelle',
        senderAccountNumber: account.accountNumber,
        recipientAccountNumber: null,
      };
    }
  }

  // 3. Demo Session
  if (storedToken === 'sw-demo-session') {
    const current = Number(localStorage.getItem('sw_demo_balance') || '79.98');
    if (current < expenseRequest.amount) {
      throw new Error('Solde démo insuffisant pour cette dépense.');
    }
    const newBal = current - expenseRequest.amount;
    localStorage.setItem('sw_demo_balance', newBal.toFixed(2));

    const localTx = await syncEngine.enqueueTransaction({
      amount: expenseRequest.amount,
      type: 'DEBIT',
      category: expenseRequest.category,
      description: expenseRequest.description || 'Dépense personnelle (Mode Démo)',
      senderAccountNumber: 'SW-3 6395 5398 7',
      recipientAccountNumber: null,
    });

    return {
      id: localTx.clientUuid || String(localTx.id || Date.now()),
      amount: expenseRequest.amount,
      timestamp: localTx.timestamp,
      type: 'DEBIT',
      category: expenseRequest.category,
      description: expenseRequest.description || 'Dépense personnelle (Mode Démo)',
      senderAccountNumber: 'SW-3 6395 5398 7',
      recipientAccountNumber: null,
    };
  }

  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/expense', expenseRequest);
  return response.data;
};

/**
 * Deposit funds into the logged-in user's wallet
 */
export const createDeposit = async (depositRequest: DepositRequest): Promise<TransactionResponse> => {
  const storedToken = localStorage.getItem('token');
  const nowIso = new Date().toISOString();
  const clientUuid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Supabase Cloud Session
  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      let { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!wallet) {
        const newAcc = `SW-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        const { data: created } = await supabase
          .from('wallets')
          .insert({
            user_id: session.user.id,
            balance: 1000.00,
            currency: 'EUR',
            account_number: newAcc,
          })
          .select('*')
          .single();
        wallet = created;
      }

      const newBalance = (Number(wallet?.balance) || 0) + depositRequest.amount;

      const { data: txRow, error: txError } = await supabase
        .from('transactions')
        .insert({
          id: clientUuid,
          user_id: session.user.id,
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
        .eq('user_id', session.user.id);

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

  // 2. Local Account
  if (isLocalToken(storedToken)) {
    const account = findLocalAccountByToken(storedToken);
    if (account) {
      const stored = await db.wallet.get(account.accountNumber);
      const newBal = (stored?.balance || 0) + depositRequest.amount;
      await db.wallet.put({
        id: account.accountNumber,
        balance: newBal,
        currency: stored?.currency || 'TND',
        updatedAt: nowIso,
      });

      const localTx = await syncEngine.enqueueTransaction({
        amount: depositRequest.amount,
        type: 'CREDIT',
        category: 'REVENUS',
        description: depositRequest.description || 'Dépôt de fonds',
        senderAccountNumber: null,
        recipientAccountNumber: account.accountNumber,
      });

      return {
        id: localTx.clientUuid || String(localTx.id || Date.now()),
        amount: depositRequest.amount,
        timestamp: localTx.timestamp,
        type: 'CREDIT',
        category: 'REVENUS',
        description: depositRequest.description || 'Dépôt de fonds',
        senderAccountNumber: null,
        recipientAccountNumber: account.accountNumber,
      };
    }
  }

  // 3. Demo Session
  if (storedToken === 'sw-demo-session') {
    const current = Number(localStorage.getItem('sw_demo_balance') || '79.98');
    const newBal = current + depositRequest.amount;
    localStorage.setItem('sw_demo_balance', newBal.toFixed(2));

    const localTx = await syncEngine.enqueueTransaction({
      amount: depositRequest.amount,
      type: 'CREDIT',
      category: 'REVENUS',
      description: depositRequest.description || 'Dépôt de fonds (Mode Démo)',
      senderAccountNumber: null,
      recipientAccountNumber: 'SW-3 6395 5398 7',
    });

    return {
      id: localTx.clientUuid || String(localTx.id || Date.now()),
      amount: depositRequest.amount,
      timestamp: localTx.timestamp,
      type: 'CREDIT',
      category: 'REVENUS',
      description: depositRequest.description || 'Dépôt de fonds (Mode Démo)',
      senderAccountNumber: null,
      recipientAccountNumber: 'SW-3 6395 5398 7',
    };
  }

  const response = await axiosInstance.post<TransactionResponse>('/v1/transactions/deposit', depositRequest);
  return response.data;
};

/**
 * Get the transaction history for the logged-in user
 */
export const getTransactionHistory = async (): Promise<TransactionResponse[]> => {
  const storedToken = localStorage.getItem('token');

  // 1. Supabase Cloud Session
  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });

      if (!error && Array.isArray(data)) {
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
      return [];
    }
  }

  // 2. Local Account or Demo Session (Dexie DB)
  if (isLocalToken(storedToken) || storedToken === 'sw-demo-session') {
    const localTxs = await db.transactions.orderBy('timestamp').reverse().toArray().catch(() => []);
    if (Array.isArray(localTxs) && localTxs.length > 0) {
      return localTxs.map((local) => ({
        id: local.clientUuid || String(local.id || Date.now()),
        amount: Number(local.amount),
        timestamp: local.timestamp,
        type: local.type,
        category: (local.category as TransactionCategory) || null,
        description: local.description ?? null,
        senderAccountNumber: local.senderAccountNumber ?? null,
        recipientAccountNumber: local.recipientAccountNumber ?? null,
      }));
    }
    return [];
  }

  try {
    const response = await axiosInstance.get<TransactionResponse[]>('/v1/transactions/history');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn('Erreur appel getTransactionHistory API:', err);
    return [];
  }
};
