import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../store/useFilterStore';
import { supabase } from '../lib/supabase';

export const useStats = () => {
  const navigate = useNavigate();
  const { setDateFilterMode } = useFilterStore();
  const [stats, setStats] = useState({ 
    totalIncome: 0, 
    totalExpenses: 0, 
    netBalance: 0, 
    chartData: [],
    sortedIncomeRanking: [],
    sortedExpenseRanking: [],
    pendingPayments: 0, 
    activeOS: 0 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [incomeResult, expenseResult, pendingResult, osResult] = await Promise.all([
        supabase.from('transactions').select('amount', { count: 'exact' }).eq('type', 'income'),
        supabase.from('transactions').select('amount', { count: 'exact' }).eq('type', 'expense'),
        supabase.from('client_payments').select('id', { count: 'exact' }).neq('status', 'paid'),
        supabase.from('service_orders').select('id').or('status.neq.Concluído,status.neq.Entregue,status.neq.Cancelado')
      ]);

      const totalIncome = incomeResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalExpenses = expenseResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const pendingPayments = pendingResult.data?.length || 0;
      const activeOS = osResult.data?.length || 0;

      const chartData = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toISOString().slice(0, 7);
        const name = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        
        chartData.push({ name, income: 0, expense: 0 });
      }

      const sortedIncomeRanking: [string, number][] = [];
      const sortedExpenseRanking: [string, number][] = [];

      setStats({
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        chartData,
        sortedIncomeRanking,
        sortedExpenseRanking,
        pendingPayments,
        activeOS
      });
    } catch (err) {
      console.error("Failed to fetch stats", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChartClick = useCallback((data: any) => {
    if (data && data.activeLabel) {
      setDateFilterMode('month');
      navigate('/transactions');
    }
  }, [navigate, setDateFilterMode]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    handleChartClick
  };
};
