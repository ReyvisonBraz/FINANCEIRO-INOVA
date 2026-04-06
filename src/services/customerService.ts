import api from './api/index';
import type { Customer } from '../types';

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customerService = {
  async getAll(filters: CustomerFilters = {}): Promise<CustomerListResponse> {
    const { page = 1, limit = 20, search = '' } = filters;
    const { data } = await api.get<CustomerListResponse>(
      `/customers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    return data;
  },

  async getById(id: number): Promise<Customer> {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  async create(customer: Partial<Customer>): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/customers', customer);
    return data;
  },

  async update(id: number, customer: Partial<Customer>): Promise<{ success: boolean }> {
    const { data } = await api.put<{ success: boolean }>(`/customers/${id}`, customer);
    return data;
  },

  async delete(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/customers/${id}`);
    return data;
  },

  async getPayments(id: number): Promise<Customer[]> {
    const { data } = await api.get<Customer[]>(`/customers/${id}/payments`);
    return data;
  },
};

export default customerService;
