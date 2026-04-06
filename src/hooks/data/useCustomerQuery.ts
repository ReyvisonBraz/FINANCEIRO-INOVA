import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services';

export const useCustomerQuery = (id: number) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
};

export const useCustomersQuery = (options?: { page?: number; search?: string }) => {
  const { page = 1, search = '' } = options || {};
  
  return useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customerService.getAll({ page, search }),
  });
};

export default useCustomerQuery;
