import api from './api/index';
import type { User, AuditLog } from '../types';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const authService = {
  async login(credentials: LoginPayload): Promise<User> {
    const { data } = await api.post<User>('/login', credentials);
    return data;
  },

  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async createUser(user: Partial<User> & { password: string }): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/users', user);
    return data;
  },

  async updateUser(id: number, user: Partial<User>): Promise<{ success: boolean }> {
    const { data } = await api.put<{ success: boolean }>(`/users/${id}`, user);
    return data;
  },

  async deleteUser(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/users/${id}`);
    return data;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data } = await api.get<AuditLog[]>('/audit-logs');
    return data;
  },
};

export default authService;
