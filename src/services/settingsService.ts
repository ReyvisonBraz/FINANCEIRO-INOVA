import api from './api/index';
import type { AppSettings, Category } from '../types';

export interface SettingsResponse extends AppSettings {}

export const settingsService = {
  async get(): Promise<SettingsResponse> {
    const { data } = await api.get<SettingsResponse>('/settings');
    return data;
  },

  async update(settings: Partial<SettingsResponse>): Promise<{ success: boolean }> {
    const { data } = await api.post<{ success: boolean }>('/settings', settings);
    return data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async createCategory(category: Partial<Category>): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/categories', category);
    return data;
  },

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/categories/${id}`);
    return data;
  },
};

export default settingsService;
