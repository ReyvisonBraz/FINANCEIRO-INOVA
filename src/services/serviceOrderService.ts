import api from './api/index';
import type { ServiceOrder, ServiceOrderStatus } from '../types';

export interface ServiceOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: 'newest' | 'oldest' | 'priority' | 'prediction' | 'amount-desc' | 'amount-asc';
  dateFilter?: 'all' | 'today' | 'week' | 'month';
}

export interface ServiceOrderListResponse {
  data: ServiceOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts?: {
      awaiting: number;
      active: number;
      ready: number;
      urgent: number;
    };
  };
}

export interface CreateServiceOrderPayload {
  customerId: number;
  equipmentType?: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  equipmentColor?: string;
  equipmentSerial?: string;
  reportedProblem?: string;
  arrivalPhotoUrl?: string;
  arrivalPhotoBase64?: string;
  status?: string;
  entryDate?: string;
  customerPassword?: string;
  accessories?: string;
  ramInfo?: string;
  ssdInfo?: string;
  priority?: 'low' | 'medium' | 'high';
  createdBy?: number;
}

export interface UpdateServiceOrderPayload extends Partial<CreateServiceOrderPayload> {
  technicalAnalysis?: string;
  servicesPerformed?: string;
  services?: { name: string; price: number }[];
  partsUsed?: { id?: number; name: string; quantity: number; unitPrice: number; subtotal: number }[];
  serviceFee?: number;
  totalAmount?: number;
  finalObservations?: string;
  updatedBy?: number;
}

export const serviceOrderService = {
  async getAll(filters: ServiceOrderFilters = {}): Promise<ServiceOrderListResponse> {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = 'all',
      priority = 'all',
      sortBy = 'newest',
      dateFilter = 'all'
    } = filters;

    let url = `/service-orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    
    if (status !== 'all') url += `&status=${status}`;
    if (priority !== 'all') url += `&priority=${priority}`;
    if (sortBy) url += `&sortBy=${sortBy}`;
    if (dateFilter !== 'all') url += `&dateFilter=${dateFilter}`;

    const { data } = await api.get<ServiceOrderListResponse>(url);
    return data;
  },

  async getById(id: number): Promise<ServiceOrder> {
    const { data } = await api.get<ServiceOrder>(`/service-orders/${id}`);
    return data;
  },

  async create(order: CreateServiceOrderPayload): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/service-orders', order);
    return data;
  },

  async update(id: number, order: UpdateServiceOrderPayload): Promise<{ success: boolean }> {
    const { data } = await api.put<{ success: boolean }>(`/service-orders/${id}`, order);
    return data;
  },

  async delete(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/service-orders/${id}`);
    return data;
  },

  async getStatuses(): Promise<ServiceOrderStatus[]> {
    const { data } = await api.get<ServiceOrderStatus[]>('/service-order-statuses');
    return data;
  },

  async createStatus(status: Partial<ServiceOrderStatus>): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/service-order-statuses', status);
    return data;
  },

  async deleteStatus(id: number): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(`/service-order-statuses/${id}`);
    return data;
  },

  async getBrands(): Promise<{ id: number; name: string }[]> {
    const { data } = await api.get<{ id: number; name: string }[]>('/brands');
    return data;
  },

  async createBrand(name: string): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/brands', { name });
    return data;
  },

  async getModels(brandId: number): Promise<{ id: number; name: string }[]> {
    const { data } = await api.get<{ id: number; name: string }[]>(`/brands/${brandId}/models`);
    return data;
  },

  async createModel(brandId: number, name: string): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>(`/brands/${brandId}/models`, { name });
    return data;
  },

  async createEquipmentType(name: string): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>('/equipment-types', { name });
    return data;
  },
};

export default serviceOrderService;
