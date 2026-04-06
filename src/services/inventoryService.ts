import api from './api/index';
import type { InventoryItem } from '../types';

export interface InventoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: 'product' | 'service' | 'all';
}

export interface InventoryListResponse {
  data: InventoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const inventoryService = {
  async getAll(filters: InventoryFilters = {}): Promise<InventoryListResponse> {
    const { page = 1, limit = 20, search = '', category = 'all' } = filters;
    let url = `/inventory?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (category !== 'all') url += `&category=${category}`;
    
    const { data } = await api.get<InventoryListResponse>(url);
    return data;
  },

  async getById(id: number): Promise<InventoryItem> {
    const { data } = await api.get<InventoryItem>(`/inventory/${id}`);
    return data;
  },

  async create(item: Partial<InventoryItem>): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/inventory', item);
    return data;
  },

  async update(id: number, item: Partial<InventoryItem>): Promise<{ success: boolean }> {
    const { data } = await api.put<{ success: boolean }>(`/inventory/${id}`, item);
    return data;
  },

  async delete(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/inventory/${id}`);
    return data;
  },
};

export default inventoryService;
