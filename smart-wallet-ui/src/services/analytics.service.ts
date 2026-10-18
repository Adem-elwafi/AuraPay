import api from '../api/axiosConfig';
import type { ChartDataPoint, DashboardStatsResponse } from '../api/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const EMPTY_STATS: DashboardStatsResponse = {
  totalRevenues: 0,
  totalExpenses: 0,
  totalSavings: 0,
  revenuesTrend: 0,
  expensesTrend: 0,
  savingsTrend: 0,
};

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: txs, error } = await supabase
          .from('transactions')
          .select('amount, type, timestamp')
          .eq('user_id', authData.user.id);

        if (!error && Array.isArray(txs)) {
          let totalRevenues = 0;
          let totalExpenses = 0;

          for (const tx of txs) {
            const amt = Number(tx.amount) || 0;
            if (tx.type === 'CREDIT') totalRevenues += amt;
            else if (tx.type === 'DEBIT') totalExpenses += amt;
          }

          const totalSavings = Math.max(0, totalRevenues - totalExpenses);

          return {
            totalRevenues,
            totalExpenses,
            totalSavings,
            revenuesTrend: 0,
            expensesTrend: 0,
            savingsTrend: 0,
          };
        }
      }
    } catch (e) {
      console.warn('Erreur chargement stats Supabase:', e);
    }
  }

  try {
    const response = await api.get<DashboardStatsResponse>('/v1/analytics/stats');
    if (response.data && typeof response.data === 'object' && 'totalRevenues' in response.data) {
      return response.data;
    }
  } catch (err) {
    console.warn('Erreur appel stats API:', err);
  }

  return EMPTY_STATS;
};

export const getDashboardChart = async (): Promise<ChartDataPoint[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: txs, error } = await supabase
          .from('transactions')
          .select('amount, type, timestamp')
          .eq('user_id', authData.user.id)
          .order('timestamp', { ascending: true });

        if (!error && Array.isArray(txs) && txs.length > 0) {
          const map = new Map<string, number>();
          let runningBalance = 0;

          for (const tx of txs) {
            const d = new Date(tx.timestamp);
            const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            const delta = tx.type === 'CREDIT' ? Number(tx.amount) : -Number(tx.amount);
            runningBalance += delta;
            map.set(label, runningBalance);
          }

          return Array.from(map.entries()).map(([label, amount]) => ({ label, amount }));
        }
        return [];
      }
    } catch (e) {
      console.warn('Erreur chargement chart Supabase:', e);
    }
  }

  try {
    const response = await api.get<ChartDataPoint[]>('/v1/analytics/chart');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn('Erreur appel chart API:', err);
    return [];
  }
};