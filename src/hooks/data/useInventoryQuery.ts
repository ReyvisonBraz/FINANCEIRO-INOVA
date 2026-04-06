import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../../services';

export const useInventoryQuery = (id: number) => {
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
};

export const useInventoryItemsQuery = (options?: { page?: number; search?: string; category?: 'all' | 'product' | 'service' }) => {
  const { page = 1, search = '', category = 'all' } = options || {};
  
  return useQuery({
    queryKey: ['inventory', page, search, category],
    queryFn: () => inventoryService.getAll({ page, search, category }),
  });
};

export default useInventoryQuery;
