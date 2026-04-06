import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services';
import type { Customer } from '../types';
import { useToast } from '../components/ui/Toast';
import { useCustomerStore } from '../store/useCustomerStore';
import { useFilterStore } from '../store/useFilterStore';

export const useCustomers = () => {
  const queryClient = useQueryClient();
  const { customersPage, setCustomersPage } = useCustomerStore();
  const { customerSearchTerm, setCustomerSearchTerm } = useFilterStore();
  const { showToast } = useToast();

  const { data: customersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', customersPage, customerSearchTerm],
    queryFn: async () => {
      return await customerService.getAll({ page: customersPage, search: customerSearchTerm });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ customer, id }: { customer: Partial<Customer>; id?: number }) => {
      if (id) {
        return await customerService.update(id, customer);
      } else {
        return await customerService.create(customer);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('Cliente salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save customer', error);
      showToast(error.response?.data?.error || 'Erro ao salvar cliente.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await customerService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('Cliente excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete customer', error);
      showToast(error.response?.data?.error || 'Erro ao excluir cliente.', 'error');
    },
  });

  const checkCustomerPaymentsAPI = async (id: number) => {
    return await customerService.getPayments(id);
  };

  return { 
    customers: customersData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } }, 
    customersPage,
    setCustomersPage,
    customerSearchTerm,
    setCustomerSearchTerm,
    isLoading,
    isError,
    fetchCustomers: refetch, 
    saveCustomerAPI: (customer: Partial<Customer>, id?: number) => saveMutation.mutateAsync({ customer, id }),
    deleteCustomerAPI: (id: number) => deleteMutation.mutateAsync(id),
    checkCustomerPaymentsAPI
  };
};
