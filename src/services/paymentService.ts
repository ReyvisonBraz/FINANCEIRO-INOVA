import api from './api/index';
import type { ClientPayment } from '../types';

export interface PaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaymentListResponse {
  data: ClientPayment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RecordPaymentPayload {
  amount: number;
  date: string;
  updatedBy?: number;
}

export const paymentService = {
  async getAll(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
    const { page = 1, limit = 20, search = '' } = filters;
    const { data } = await api.get<PaymentListResponse>(
      `/client-payments?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    return data;
  },

  async getById(id: number): Promise<ClientPayment> {
    const { data } = await api.get<ClientPayment>(`/client-payments/${id}`);
    return data;
  },

  async create(payment: Partial<ClientPayment>): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/client-payments', payment);
    return data;
  },

  async update(id: number, payment: Partial<ClientPayment>): Promise<{ success: boolean }> {
    const { data } = await api.put<{ success: boolean }>(`/client-payments/${id}`, payment);
    return data;
  },

  async recordPayment(id: number, payload: RecordPaymentPayload): Promise<{ success: boolean; newPaidAmount: number; newStatus: string }> {
    const { data } = await api.post<{ success: boolean; newPaidAmount: number; newStatus: string }>(
      `/client-payments/${id}/pay`, 
      payload
    );
    return data;
  },

  async delete(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/client-payments/${id}`);
    return data;
  },

  async deleteGroup(saleId: string): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/client-payments/group/${saleId}`);
    return data;
  },
};

export default paymentService;
