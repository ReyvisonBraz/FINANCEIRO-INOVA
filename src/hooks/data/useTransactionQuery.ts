import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../../services';

export const useTransactionQuery = (id: number) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  });
};

export const useTransactionsQuery = (filters?: {
  page?: number;
  search?: string;
  type?: 'all' | 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { page = 1, search = '', type = 'all', category = 'all' } = filters || {};
  
  return useQuery({
    queryKey: ['transactions', page, search, type, category],
    queryFn: () => transactionService.getAll({ page, search, type, category }),
  });
};

export default useTransactionQuery;
