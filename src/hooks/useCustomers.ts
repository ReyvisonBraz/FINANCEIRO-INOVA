import { useCallback } from 'react';
import { Customer } from '../types';
import { useToast } from '../components/ui/Toast';
import { useCustomerStore } from '../store/useCustomerStore';
import { useFilterStore } from '../store/useFilterStore';
import { supabase } from '../lib/supabase';

export const useCustomers = () => {
  const { 
    customers, setCustomers, 
    customersPage, setCustomersPage,
    isLoading, setIsLoading
  } = useCustomerStore();
  const { customerSearchTerm, setCustomerSearchTerm } = useFilterStore();
  const { showToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[useCustomers] 🔄 Fetching customers...', { customersPage, customerSearchTerm });
      
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('first_name', { ascending: true })
        .range((customersPage - 1) * 20, customersPage * 20 - 1);

      if (customerSearchTerm) {
        query = query.or(
          `first_name.ilike.%${customerSearchTerm}%,last_name.ilike.%${customerSearchTerm}%,nickname.ilike.%${customerSearchTerm}%,phone.ilike.%${customerSearchTerm}%,company_name.ilike.%${customerSearchTerm}%`
        );
      }

      const { data, error, count } = await query;
      
      console.log('[useCustomers] 📦 Raw response:', { error, count, dataLength: data?.length });
      
      if (error) {
        console.error('[useCustomers] ❌ Query error:', error);
        throw error;
      }
      
      console.log('[useCustomers] ✅ Success:', data?.length, 'customers fetched');
      
      const mapped = (data || []).map(c => ({
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        nickname: c.nickname,
        cpf: c.cpf,
        companyName: c.company_name,
        phone: c.phone,
        observation: c.observation,
        creditLimit: c.credit_limit,
        createdAt: c.created_at,
        createdBy: c.created_by,
        updatedBy: c.updated_by,
        updatedAt: c.updated_at
      }));
      
      setCustomers({ 
        data: mapped, 
        meta: { total: count || 0, page: customersPage, limit: 20, totalPages: Math.ceil((count || 0) / 20) }
      });
    } catch (err) {
      console.error("Failed to fetch customers", err);
      showToast('Erro ao carregar clientes.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [customersPage, customerSearchTerm, showToast, setCustomers, setIsLoading]);

  const saveCustomerAPI = useCallback(async (customer: Partial<Customer>, id?: number): Promise<{ id: number } | null> => {
    console.log('[useCustomers] 💾 Saving customer:', { customer, id });
    const mapped = {
      first_name: customer.firstName,
      last_name: customer.lastName,
      nickname: customer.nickname || null,
      cpf: customer.cpf || null,
      company_name: customer.companyName || null,
      phone: customer.phone,
      observation: customer.observation || null,
      credit_limit: customer.creditLimit || 0,
      updated_at: new Date().toISOString()
    };
    
    if (id) {
      mapped['updated_by'] = customer.updatedBy;
      const { error } = await supabase
        .from('customers')
        .update(mapped)
        .eq('id', id);
      if (error) throw error;
      return { id };
    } else {
      mapped['created_by'] = customer.createdBy;
      const { data, error } = await supabase
        .from('customers')
        .insert([mapped])
        .select('id')
        .single();
      if (error) throw error;
      return data ? { id: data.id } : null;
    }
  }, []);

  const deleteCustomerAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const checkCustomerPaymentsAPI = useCallback(async (id: number) => {
    const { data, error } = await supabase
      .from('client_payments')
      .select('*')
      .eq('customer_id', id);
    if (error) throw error;
    return data;
  }, []);

  return { 
    customers, 
    customersPage,
    setCustomersPage,
    isLoading,
    customerSearchTerm,
    setCustomerSearchTerm,
    fetchCustomers, 
    saveCustomerAPI,
    deleteCustomerAPI,
    checkCustomerPaymentsAPI
  };
};
