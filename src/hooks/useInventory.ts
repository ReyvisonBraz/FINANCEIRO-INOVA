import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services';
import type { InventoryItem } from '../types';
import { useToast } from '../components/ui/Toast';

export function useInventory() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const result = await inventoryService.getAll();
      return (result as any).data || result || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ item, id }: { item: Partial<InventoryItem>; id?: number }) => {
      if (id) {
        return await inventoryService.update(id, item);
      } else {
        return await inventoryService.create(item);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      showToast('Item de estoque salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save inventory item', error);
      showToast(error.response?.data?.error || 'Erro ao salvar item de estoque.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await inventoryService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      showToast('Item excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete inventory item', error);
      showToast(error.response?.data?.error || 'Erro ao excluir item.', 'error');
    },
  });

  return {
    inventoryItems: inventoryItems || [],
    fetchInventoryItems: refetch,
    saveInventoryItemAPI: (item: Partial<InventoryItem>, id?: number) => saveMutation.mutateAsync({ item, id }),
    deleteInventoryItemAPI: (id: number) => deleteMutation.mutateAsync(id),
    isLoading,
    isError
  };
}
