import { useState, useCallback, useMemo } from 'react';
import { Transaction } from '../types';
import { useFilterStore } from '../store/useFilterStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { format, endOfMonth, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';

export function useTransactions(showToast: (message: string, type: 'success' | 'error') => void) {
  const { 
    transactions, setTransactions, 
    transactionsPage, setTransactionsPage 
  } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    searchTerm, filterType, filterCategory,
    dateFilterMode, selectedDate, selectedMonth, startDate, endDate,
    filterMinAmount, filterMaxAmount
  } = useFilterStore();

  const fetchTransactions = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);

      if (search) {
        query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`);
      }
      
      if (filterType && filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      
      if (filterCategory && filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      
      if (dateFilterMode === 'day' && selectedDate) {
        query = query.eq('date', selectedDate);
      } else if (dateFilterMode === 'month' && selectedMonth) {
        query = query.gte('date', `${selectedMonth}-01`).lte('date', format(endOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd'));
      } else if (dateFilterMode === 'range' && startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      }
      
      if (filterMinAmount) {
        query = query.gte('amount', filterMinAmount);
      }
      
      if (filterMaxAmount) {
        query = query.lte('amount', filterMaxAmount);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const mapped = (data || []).map((t: any) => ({
        id: t.id,
        description: t.description,
        category: t.category,
        type: t.type,
        amount: t.amount,
        date: t.date,
        status: t.status,
        paymentId: t.payment_id,
        saleId: t.sale_id,
        createdBy: t.created_by,
        updatedBy: t.updated_by
      }));
      
      setTransactions({ 
        data: mapped, 
        meta: { total: count || 0, page, limit: 20, totalPages: Math.ceil((count || 0) / 20) }
      });
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      showToast('Erro ao carregar transações.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    showToast, setTransactions, filterType, filterCategory, 
    dateFilterMode, selectedDate, selectedMonth, startDate, endDate, 
    filterMinAmount, filterMaxAmount
  ]);

  const saveTransactionAPI = useCallback(async (transaction: Partial<Transaction>, id?: number) => {
    const mapped = {
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      status: transaction.status || 'Concluído',
      created_by: transaction.createdBy,
      updated_by: transaction.updatedBy
    };
    
    if (id) {
      const { error } = await supabase
        .from('transactions')
        .update(mapped)
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('transactions')
        .insert([mapped]);
      if (error) throw error;
    }
  }, []);

  const deleteTransactionAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const handleDuplicateTransaction = useCallback(async (tx: Transaction) => {
    try {
      await saveTransactionAPI({
        description: `${tx.description} (Cópia)`,
        category: tx.category,
        type: tx.type,
        amount: tx.amount,
        date: new Date().toISOString().split('T')[0],
      });
      fetchTransactions(transactionsPage, searchTerm);
      showToast('Transação duplicada com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to duplicate", err);
      showToast('Erro ao duplicar transação.', 'error');
    }
  }, [saveTransactionAPI, fetchTransactions, transactionsPage, searchTerm, showToast]);

  const filteredTransactions = useMemo(() => {
    return transactions.data;
  }, [transactions.data]);

  return {
    transactions,
    transactionsPage,
    setTransactionsPage,
    fetchTransactions,
    saveTransactionAPI,
    deleteTransactionAPI,
    handleDuplicateTransaction,
    filteredTransactions,
    isLoading
  };
}
