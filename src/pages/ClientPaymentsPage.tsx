import React, { useState, useEffect } from 'react';
import { ClientPayments } from '../components/payments/ClientPayments';
import { useClientPayments } from '../hooks/useClientPayments';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '../components/ui/Toast';
import { useFilterStore } from '../store/useFilterStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import { useFormStore } from '../store/useFormStore';
import { useAppStore } from '../store/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import { useReceipt } from '../hooks/useReceipt';
import { format } from 'date-fns';
import { sendWhatsAppPaymentReminder } from '../lib/whatsappUtils';
import { ClientPayment } from '../types';

export const ClientPaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    clientPayments, 
    paymentsPage,
    setPaymentsPage, 
    fetchClientPayments,
    saveClientPaymentAPI, 
    deleteClientPaymentAPI,
    deleteClientPaymentGroupAPI,
    recordPaymentAPI
  } = useClientPayments(showToast);
  const { customers, fetchCustomers } = useCustomers();
  const { settings } = useSettingsStore();
  const { currentUser } = useAuthStore();
  const { 
    paymentSearchTerm, setPaymentSearchTerm,
    paymentFilterStatus, setPaymentFilterStatus,
    paymentSortMode, setPaymentSortMode
  } = useFilterStore();
  
  const [localSearchTerm, setLocalSearchTerm] = useState(paymentSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setPaymentSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setPaymentSearchTerm]);

  const { generateReceipt } = useReceipt(settings, customers.data);

  const {
    setClientPaymentToDelete,
    setIsRecordingPayment,
    isRecordingPayment,
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    openConfirm
  } = useModalStore();
  const { newClientPayment, setNewClientPayment } = useFormStore();
  const { 
    isAddingClientPayment, setIsAddingClientPayment,
    expandedPayments, togglePaymentExpansion,
    setIsAddingCustomer,
    setCustomerRegistrationSource
  } = useAppStore();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClientPayments(paymentsPage, debouncedSearchTerm);
    fetchCustomers();
  }, [fetchClientPayments, fetchCustomers, paymentsPage, debouncedSearchTerm]);

  const filteredClientPayments = clientPayments.data.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) || 
                          payment.description.toLowerCase().includes(paymentSearchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

    switch (paymentFilterStatus) {
      case 'paid': return payment.status === 'paid';
      case 'partial': return payment.status === 'partial';
      case 'pending': return payment.status === 'pending' && !isOverdue;
      case 'overdue': return isOverdue;
      default: return true;
    }
  }).sort((a, b) => {
    if (paymentSortMode === 'amount') {
      return b.totalAmount - a.totalAmount;
    } else if (paymentSortMode === 'alphabetical') {
      return a.customerName.localeCompare(b.customerName);
    } else {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  });

  const handleAddClientPayment = async () => {
    if (isSaving) return;
    if (!newClientPayment.customerId || !newClientPayment.totalAmount) return;
    
    setIsSaving(true);
    try {
      const total = parseFloat(newClientPayment.totalAmount.toString().replace(',', '.'));
      const paid = parseFloat((newClientPayment.paidAmount || '0').toString().replace(',', '.'));
      const installmentsCount = newClientPayment.installmentsCount || 1;
      const interval = newClientPayment.installmentInterval || 'monthly';
      const saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const promises = [];

      if (paid > 0) {
        promises.push(saveClientPaymentAPI({
          ...newClientPayment,
          description: `ENTRADA: ${newClientPayment.description}`,
          totalAmount: paid,
          paidAmount: paid,
          dueDate: newClientPayment.purchaseDate,
          status: 'paid',
          installmentsCount: 1,
          saleId,
          createdBy: currentUser?.id
        }));
      }

      const remainingAmount = total - paid;
      if (remainingAmount > 0) {
        const installmentAmount = remainingAmount / installmentsCount;

        for (let i = 0; i < installmentsCount; i++) {
          let dueDate = new Date(newClientPayment.dueDate + 'T12:00:00');
          if (interval === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + i);
          } else if (interval === 'biweekly') {
            dueDate.setDate(dueDate.getDate() + (i * 15));
          } else if (interval === 'weekly') {
            dueDate.setDate(dueDate.getDate() + (i * 7));
          } else if (interval === 'daily') {
            dueDate.setDate(dueDate.getDate() + i);
          }

          const description = installmentsCount > 1 
            ? `${newClientPayment.description} (Parcela ${i + 1}/${installmentsCount})`
            : newClientPayment.description;

          promises.push(saveClientPaymentAPI({
            ...newClientPayment,
            description,
            totalAmount: installmentAmount,
            paidAmount: 0,
            dueDate: format(dueDate, 'yyyy-MM-dd'),
            status: 'pending',
            installmentsCount: 1,
            saleId,
            createdBy: currentUser?.id
          }));
        }
      }

      await Promise.all(promises);

      setIsAddingClientPayment(false);
      setNewClientPayment({
        customerId: 0,
        description: '',
        totalAmount: '',
        paidAmount: '',
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'Dinheiro',
        installmentsCount: 1,
        installmentInterval: 'monthly',
        type: 'income'
      });
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      showToast('Pagamento adicionado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to add client payment", err);
      showToast('Erro ao adicionar pagamento de cliente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!isRecordingPayment || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount.toString().replace(',', '.'));
    
    const [y, m, d] = paymentDate.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const now = new Date();
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    try {
      await recordPaymentAPI(
        isRecordingPayment.id, 
        amount, 
        dateObj.toISOString(), 
        currentUser?.id
      );
      setIsRecordingPayment(null);
      setPaymentAmount('');
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      showToast('Pagamento registrado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to record payment", err);
      showToast('Erro ao registrar pagamento.', 'error');
    }
  };

  const handleWhatsAppReminder = (payment: ClientPayment) => {
    const customer = customers.data.find(c => c.id === payment.customerId);
    if (!customer) return;
    sendWhatsAppPaymentReminder(payment, customer, settings.appName);
  };

  const handleDeleteClientPaymentGroup = async (saleId: string) => {
    openConfirm(
      'Excluir Venda Completa',
      'Deseja excluir todos os lançamentos desta venda agrupada? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await deleteClientPaymentGroupAPI(saleId);
          fetchClientPayments(paymentsPage, paymentSearchTerm);
          showToast('Venda excluída com sucesso.', 'success');
        } catch (err) {
          console.error("Failed to delete client payment group", err);
          showToast('Erro ao excluir venda.', 'error');
        }
      },
      'danger'
    );
  };

  return (
    <ClientPayments 
      filteredClientPayments={filteredClientPayments}
      generateReceipt={generateReceipt}
      sendWhatsAppReminder={handleWhatsAppReminder}
      handleDeleteClientPayment={(payment) => setClientPaymentToDelete(payment.id)}
      handleDeleteClientPaymentGroup={handleDeleteClientPaymentGroup}
      handleRecordPayment={handleRecordPayment}
      customers={customers.data}
      handleAddClientPayment={handleAddClientPayment}
      isSaving={isSaving}
      pagination={{
        currentPage: clientPayments.meta.page,
        totalPages: clientPayments.meta.totalPages,
        totalItems: clientPayments.meta.total,
        limit: clientPayments.meta.limit
      }}
      onPageChange={setPaymentsPage}
      isAddingClientPayment={isAddingClientPayment}
      setIsAddingClientPayment={setIsAddingClientPayment}
      expandedPayments={expandedPayments}
      togglePaymentExpansion={togglePaymentExpansion}
      paymentSearchTerm={paymentSearchTerm}
      setPaymentSearchTerm={setPaymentSearchTerm}
      paymentFilterStatus={paymentFilterStatus}
      setPaymentFilterStatus={setPaymentFilterStatus}
      paymentSortMode={paymentSortMode}
      setPaymentSortMode={setPaymentSortMode}
      isRecordingPayment={isRecordingPayment}
      setIsRecordingPayment={setIsRecordingPayment}
      paymentAmount={paymentAmount}
      setPaymentAmount={setPaymentAmount}
      paymentDate={paymentDate}
      setPaymentDate={setPaymentDate}
      newClientPayment={newClientPayment}
      setNewClientPayment={setNewClientPayment}
      onTriggerAddCustomer={() => {
        setCustomerRegistrationSource('payments');
        setIsAddingCustomer(true);
      }}
    />
  );
};

export default ClientPaymentsPage;
