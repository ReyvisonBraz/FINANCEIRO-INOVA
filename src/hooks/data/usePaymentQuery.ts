import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services';

export const usePaymentQuery = (id: number) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getById(id),
    enabled: !!id,
  });
};

export const usePaymentsQuery = (options?: { page?: number; search?: string }) => {
  const { page = 1, search = '' } = options || {};
  
  return useQuery({
    queryKey: ['payments', page, search],
    queryFn: () => paymentService.getAll({ page, search }),
  });
};

export default usePaymentQuery;
