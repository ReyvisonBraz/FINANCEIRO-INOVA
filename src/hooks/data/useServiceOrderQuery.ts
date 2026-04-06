import { useQuery } from '@tanstack/react-query';
import { serviceOrderService } from '../../services';

export const useServiceOrderQuery = (id: number) => {
  return useQuery({
    queryKey: ['service-order', id],
    queryFn: () => serviceOrderService.getById(id),
    enabled: !!id,
  });
};

export const useServiceOrdersQuery = (filters?: {
  page?: number;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: 'newest' | 'oldest' | 'priority' | 'prediction' | 'amount-desc' | 'amount-asc';
}) => {
  const { page = 1, search = '', status = 'all', priority = 'all', sortBy = 'newest' } = filters || {};
  
  return useQuery({
    queryKey: ['service-orders', page, search, status, priority, sortBy],
    queryFn: () => serviceOrderService.getAll({ page, search, status, priority, sortBy }),
  });
};

export const useServiceOrderStatusesQuery = () => {
  return useQuery({
    queryKey: ['service-order-statuses'],
    queryFn: () => serviceOrderService.getStatuses(),
    staleTime: 1000 * 60 * 5,
  });
};

export default useServiceOrderQuery;
