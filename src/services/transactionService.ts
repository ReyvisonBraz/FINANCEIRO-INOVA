import api from './api/index';
import type { Transaction } from '../types';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'all' | 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionListResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const transactionService = {
  async getAll(filters: TransactionFilters = {}): Promise<TransactionListResponse> {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      type = 'all',
      category = 'all',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = filters;

    let url = `/transactions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    
    if (type !== 'all') url += `&type=${type}`;
    if (category !== 'all') url += `&category=${encodeURIComponent(category)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (minAmount) url += `&minAmount=${minAmount}`;
    if (maxAmount) url += `&maxAmount=${maxAmount}`;

    const { data } = await api.get<TransactionListResponse>(url);
    return data;
  },

  async getById(id: number): Promise<Transaction> {
    const { data } = await api.get<Transaction>(`/transactions/${id}`);
    return data;
  },

  async create(transaction: Partial<Transaction>): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/transactions', transaction);
    return data;
  },

  async update(id: number, transaction: Partial<Transaction>): Promise<{ success: boolean }> {
    const { data } = await api.put<{ success: boolean }>(`/transactions/${id}`, transaction);
    return data;
  },

  async delete(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/transactions/${id}`);
    return data;
  },
};

export default transactionService;
