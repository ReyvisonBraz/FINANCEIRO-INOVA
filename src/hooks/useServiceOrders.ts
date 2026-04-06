import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceOrderService } from '../services';
import type { ServiceOrder } from '../types';
import { useServiceOrderStore } from '../store/useServiceOrderStore';
import { useFilterStore } from '../store/useFilterStore';
import { useToast } from '../components/ui/Toast';

export const useServiceOrders = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const {
    serviceOrdersPage, setServiceOrdersPage,
  } = useServiceOrderStore();

  const { 
    osSearchTerm,
    osStatusFilter,
    osPriorityFilter,
    osSortBy,
    osDateFilter
  } = useFilterStore();

  const { data: serviceOrdersData, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'service-orders', 
      serviceOrdersPage, 
      osSearchTerm, 
      osStatusFilter, 
      osPriorityFilter, 
      osSortBy, 
      osDateFilter
    ],
    queryFn: async () => {
      return await serviceOrderService.getAll({
        page: serviceOrdersPage,
        limit: 20,
        search: osSearchTerm,
        status: osStatusFilter,
        priority: osPriorityFilter,
        sortBy: osSortBy as any,
        dateFilter: osDateFilter as any
      });
    },
  });

  const { data: serviceOrderStatuses } = useQuery({
    queryKey: ['service-order-statuses'],
    queryFn: async () => {
      return await serviceOrderService.getStatuses();
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: equipmentTypes } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const api = (await import('../services/api/index')).default;
      const response = await api.get('/equipment-types');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      return await serviceOrderService.getBrands();
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const models: { id: number; name: string; brandId: number }[] = [];
      for (const brand of (brandsData || [])) {
        const brandModels = await serviceOrderService.getModels(brand.id);
        models.push(...brandModels.map(m => ({ ...m, brandId: brand.id })));
      }
      return models;
    },
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ order, id }: { order: Partial<ServiceOrder>; id?: number }) => {
      if (id) {
        return await serviceOrderService.update(id, order);
      } else {
        return await serviceOrderService.create(order as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      showToast('Ordem de serviço salva com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save service order', error);
      showToast(error.response?.data?.error || 'Erro ao salvar ordem de serviço.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await serviceOrderService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      showToast('Ordem de serviço excluída com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete service order', error);
      showToast(error.response?.data?.error || 'Erro ao excluir ordem de serviço.', 'error');
    },
  });

  const addStatusMutation = useMutation({
    mutationFn: async (status: any) => {
      return await serviceOrderService.createStatus(status);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-order-statuses'] }),
  });

  const deleteStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return await serviceOrderService.deleteStatus(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-order-statuses'] }),
  });

  const addBrandMutation = useMutation({
    mutationFn: async (name: string) => {
      return await serviceOrderService.createBrand(name);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  const addModelMutation = useMutation({
    mutationFn: async ({ brandId, name }: { brandId: number; name: string }) => {
      return await serviceOrderService.createModel(brandId, name);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['models'] }),
  });

  const addEquipmentTypeMutation = useMutation({
    mutationFn: async (name: string) => {
      return await serviceOrderService.createEquipmentType(name);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment-types'] }),
  });

  return {
    serviceOrders: serviceOrdersData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } },
    serviceOrdersPage,
    setServiceOrdersPage,
    serviceOrderStatuses: serviceOrderStatuses || [],
    equipmentTypes: equipmentTypes || [],
    brands: brandsData || [],
    models: modelsData || [],
    fetchServiceOrders: refetch,
    saveServiceOrderAPI: (order: Partial<ServiceOrder>, id?: number) => saveMutation.mutateAsync({ order, id }),
    deleteServiceOrderAPI: (id: number) => deleteMutation.mutateAsync(id),
    addServiceOrderStatusAPI: (status: any) => addStatusMutation.mutateAsync(status),
    deleteServiceOrderStatusAPI: (id: number) => deleteStatusMutation.mutateAsync(id),
    addEquipmentTypeAPI: (name: string) => addEquipmentTypeMutation.mutateAsync(name),
    addBrandAPI: (name: string) => addBrandMutation.mutateAsync(name),
    addModelAPI: ({ brandId, name }: { brandId: number; name: string }) => addModelMutation.mutateAsync({ brandId, name }),
    isLoading,
    isError
  };
};