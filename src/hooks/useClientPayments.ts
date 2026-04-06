import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services';
import type { ClientPayment } from '../types';
import { useToast } from '../components/ui/Toast';
import { useClientPaymentStore } from '../store/useClientPaymentStore';
import { useFilterStore } from '../store/useFilterStore';

export function useClientPayments() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { paymentsPage, setPaymentsPage } = useClientPaymentStore();
  const { paymentSearchTerm } = useFilterStore();

  const { data: clientPaymentsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientPayments', paymentsPage, paymentSearchTerm],
    queryFn: async () => {
      return await paymentService.getAll({ page: paymentsPage, search: paymentSearchTerm });
    },
  });

  const savePaymentMutation = useMutation({
    mutationFn: async ({ payment, id }: { payment: Partial<ClientPayment>; id?: number }) => {
      if (id) {
        return await paymentService.update(id, payment);
      } else {
        return await paymentService.create(payment);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPayments'] });
      showToast('Pagamento salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save payment', error);
      showToast(error.message || 'Erro ao salvar pagamento.', 'error');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await paymentService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPayments'] });
      showToast('Pagamento excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete payment', error);
      showToast('Erro ao excluir pagamento.', 'error');
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, amount, date, updatedBy }: { id: number; amount: number; date: string; updatedBy?: number }) => {
      return await paymentService.recordPayment(id, { amount, date, updatedBy });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPayments'] });
      showToast('Pagamento registrado com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to record payment', error);
      showToast(error.message || 'Erro ao registrar pagamento.', 'error');
    },
  });

  const safeClientPayments = (clientPaymentsData && clientPaymentsData.data) 
    ? clientPaymentsData 
    : { data: [], meta: { page: 1, totalPages: 1, total: 0, limit: 20 } };

  return {
    clientPayments: safeClientPayments,
    clientPaymentsQuery: clientPaymentsData,
    paymentsPage,
    setPaymentsPage,
    isLoading,
    isError,
    refetch,
    savePaymentMutation,
    deletePaymentMutation,
    recordPaymentMutation,
    addPaymentMutation: savePaymentMutation,
    deletePaymentMutationAPI: deletePaymentMutation,
    saveClientPaymentAPI: (payment: Partial<ClientPayment>, id?: number) => savePaymentMutation.mutateAsync({ payment, id }),
    deleteClientPaymentAPI: (id: number) => deletePaymentMutation.mutateAsync(id),
  };
}
