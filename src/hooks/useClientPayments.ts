import { useCallback } from 'react';
import { ClientPayment } from '../types';
import { useClientPaymentStore } from '../store/useClientPaymentStore';
import { supabase } from '../lib/supabase';

export function useClientPayments(showToast: (message: string, type: 'success' | 'error') => void) {
  const { 
    clientPayments, setClientPayments, 
    paymentsPage, setPaymentsPage 
  } = useClientPaymentStore();

  const fetchClientPayments = useCallback(async (page: number, searchTerm: string = '') => {
    try {
      let query = supabase
        .from('client_payments')
        .select(`
          *,
          customer:customers(first_name, last_name)
        `, { count: 'exact' })
        .order('due_date', { ascending: true })
        .range((page - 1) * 20, page * 20 - 1);

      if (searchTerm) {
        query = query.or(
          `description.ilike.%${searchTerm}%,sale_id.ilike.%${searchTerm}%,customer.first_name.ilike.%${searchTerm}%,customer.last_name.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const mapped = (data || []).map(p => ({
        id: p.id,
        customerId: p.customer_id,
        description: p.description,
        totalAmount: p.total_amount,
        paidAmount: p.paid_amount,
        purchaseDate: p.purchase_date,
        dueDate: p.due_date,
        paymentMethod: p.payment_method,
        status: p.status,
        installmentsCount: p.installments_count,
        type: p.type,
        saleId: p.sale_id,
        paymentHistory: p.payment_history,
        customerName: p.customer ? `${p.customer.first_name} ${p.customer.last_name}` : ''
      }));
      
      setClientPayments({ 
        data: mapped, 
        meta: { total: count || 0, page, limit: 20, totalPages: Math.ceil((count || 0) / 20) }
      });
    } catch (err) {
      console.error("Failed to fetch client payments", err);
      showToast('Erro ao carregar pagamentos.', 'error');
    }
  }, [showToast, setClientPayments]);

  const saveClientPaymentAPI = useCallback(async (payment: Partial<ClientPayment>, id?: number) => {
    const mapped = {
      customer_id: payment.customerId,
      description: payment.description,
      total_amount: payment.totalAmount,
      paid_amount: payment.paidAmount,
      purchase_date: payment.purchaseDate,
      due_date: payment.dueDate,
      payment_method: payment.paymentMethod,
      status: payment.status || 'pending',
      installments_count: payment.installmentsCount || 1,
      type: payment.type || 'income',
      sale_id: payment.saleId,
      payment_history: payment.paymentHistory ? JSON.stringify(payment.paymentHistory) : '[]',
      created_by: payment.createdBy,
      updated_by: payment.updatedBy
    };
    
    if (id) {
      const { error } = await supabase
        .from('client_payments')
        .update(mapped)
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('client_payments')
        .insert([mapped]);
      if (error) throw error;
    }
  }, []);

  const deleteClientPaymentAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('client_payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const deleteClientPaymentGroupAPI = useCallback(async (saleId: string) => {
    const { error } = await supabase
      .from('client_payments')
      .delete()
      .eq('sale_id', saleId);
    if (error) throw error;
  }, []);

  const recordPaymentAPI = useCallback(async (id: number, amount: number, date: string, updatedBy?: number) => {
    const { data: payment, error: fetchError } = await supabase
      .from('client_payments')
      .select('paid_amount, payment_history, total_amount')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const newPaidAmount = (payment.paid_amount || 0) + amount;
    const newStatus = newPaidAmount >= payment.total_amount ? 'paid' : 'partial';
    
    let history = [];
    try {
      history = JSON.parse(payment.payment_history || '[]');
    } catch (e) {}
    history.push({ amount, date });
    
    const { error } = await supabase
      .from('client_payments')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        payment_history: JSON.stringify(history),
        updated_by: updatedBy
      })
      .eq('id', id);
    
    if (error) throw error;
    
    return { newPaidAmount, newStatus };
  }, []);

  return {
    clientPayments,
    paymentsPage,
    setPaymentsPage,
    fetchClientPayments,
    saveClientPaymentAPI,
    deleteClientPaymentAPI,
    deleteClientPaymentGroupAPI,
    recordPaymentAPI
  };
}
