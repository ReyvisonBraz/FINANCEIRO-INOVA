import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services';
import type { Transaction } from '../types';
import { useFilterStore } from '../store/useFilterStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { format, endOfMonth, parseISO } from 'date-fns';
import { useToast } from '../components/ui/Toast';

export function useTransactions() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { 
    transactionsPage, setTransactionsPage 
  } = useTransactionStore();
  const { 
    searchTerm, filterType, filterCategory,
    dateFilterMode, selectedDate, selectedMonth, startDate, endDate,
    filterMinAmount, filterMaxAmount
  } = useFilterStore();

  const buildFilters = () => {
    let startDateFilter: string | undefined;
    let endDateFilter: string | undefined;
    
    if (dateFilterMode === 'day') {
      startDateFilter = selectedDate;
      endDateFilter = selectedDate;
    } else if (dateFilterMode === 'month') {
      startDateFilter = `${selectedMonth}-01`;
      endDateFilter = format(endOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
    } else if (dateFilterMode === 'range') {
      startDateFilter = startDate;
      endDateFilter = endDate;
    }

    return {
      page: transactionsPage,
      search: searchTerm,
      type: filterType as 'all' | 'income' | 'expense',
      category: filterCategory,
      startDate: startDateFilter,
      endDate: endDateFilter,
      minAmount: filterMinAmount ? Number(filterMinAmount) : undefined,
      maxAmount: filterMaxAmount ? Number(filterMaxAmount) : undefined,
    };
  };

  const { data: transactionsData, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'transactions', 
      transactionsPage, 
      searchTerm, 
      filterType, 
      filterCategory, 
      dateFilterMode, 
      selectedDate, 
      selectedMonth, 
      startDate, 
      endDate, 
      filterMinAmount, 
      filterMaxAmount
    ],
    queryFn: async () => {
      return await transactionService.getAll(buildFilters());
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ transaction, id }: { transaction: Partial<Transaction>; id?: number }) => {
      if (id) {
        return await transactionService.update(id, transaction);
      } else {
        return await transactionService.create(transaction);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Transação salva com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save transaction', error);
      showToast(error.response?.data?.error || 'Erro ao salvar transação.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await transactionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Transação excluída com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete transaction', error);
      showToast(error.response?.data?.error || 'Erro ao excluir transação.', 'error');
    },
  });

  const handleDuplicateTransaction = async (tx: Transaction) => {
    try {
      await saveMutation.mutateAsync({
        transaction: {
          description: `${tx.description} (Cópia)`,
          category: tx.category,
          type: tx.type,
          amount: tx.amount,
          date: new Date().toISOString().split('T')[0],
        }
      });
    } catch (err) {
      console.error("Failed to duplicate", err);
    }
  };

  return {
    transactions: transactionsData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } },
    transactionsPage,
    setTransactionsPage,
    fetchTransactions: refetch,
    saveTransactionAPI: (transaction: Partial<Transaction>, id?: number) => saveMutation.mutateAsync({ transaction, id }),
    deleteTransactionAPI: (id: number) => deleteMutation.mutateAsync(id),
    handleDuplicateTransaction,
    filteredTransactions: transactionsData?.data || [],
    isLoading,
    isError
  };
}
