import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useNotifications = (
  _clientPayments: any[],
  _serviceOrders: any[]
) => {
  const [overdueDebts, setOverdueDebts] = useState<any[]>([]);
  const [dueTodayDebts, setDueTodayDebts] = useState<any[]>([]);
  const [upcomingDebts, setUpcomingDebts] = useState<any[]>([]);
  const [overdueServiceOrders, setOverdueServiceOrders] = useState<any[]>([]);
  const [dueTodayServiceOrders, setDueTodayServiceOrders] = useState<any[]>([]);
  const [upcomingServiceOrders, setUpcomingServiceOrders] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [paymentsResult, ordersResult] = await Promise.all([
        supabase
          .from('client_payments')
          .select('*, customer:customers(first_name, last_name)', { count: 'exact' })
          .neq('status', 'paid')
          .order('due_date', { ascending: true }),
        supabase
          .from('service_orders')
          .select('*, customer:customers(first_name, last_name)', { count: 'exact' })
          .not().eq('status', 'Concluído')
          .not().eq('status', 'Entregue')
          .not().eq('status', 'Cancelado')
          .order('entry_date', { ascending: true })
      ]);

      if (paymentsResult.data) {
        const payments = paymentsResult.data;
        setOverdueDebts(payments.filter((p: any) => p.due_date < today));
        setDueTodayDebts(payments.filter((p: any) => p.due_date === today));
        setUpcomingDebts(payments.filter((p: any) => p.due_date > today && p.due_date <= threeDaysLater));
      }

      if (ordersResult.data) {
        const orders = ordersResult.data;
        setOverdueServiceOrders(orders.filter((o: any) => o.analysis_prediction && o.analysis_prediction < today));
        setDueTodayServiceOrders(orders.filter((o: any) => o.analysis_prediction === today));
        setUpcomingServiceOrders(orders.filter((o: any) => o.analysis_prediction && o.analysis_prediction > today && o.analysis_prediction <= threeDaysLater));
      }
    } catch {
      // silently fail — notifications are non-critical
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const totalPaymentNotifications = overdueDebts.length + dueTodayDebts.length + upcomingDebts.length;
  const totalServiceOrderNotifications = overdueServiceOrders.length + dueTodayServiceOrders.length + upcomingServiceOrders.length;
  const totalNotifications = totalPaymentNotifications + totalServiceOrderNotifications;

  return {
    upcomingDebts,
    dueTodayDebts,
    overdueDebts,
    overdueServiceOrders,
    dueTodayServiceOrders,
    upcomingServiceOrders,
    totalPaymentNotifications,
    totalServiceOrderNotifications,
    totalNotifications,
    fetchNotifications
  };
};
