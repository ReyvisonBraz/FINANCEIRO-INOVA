import { apiFetch } from '../lib/apiFetch';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = '';

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
      const res = await apiFetch(`${API_BASE}/api/notifications`);
      if (!res.ok) return;
      const data = await res.json();
      setOverdueDebts(data.payments?.overdue || []);
      setDueTodayDebts(data.payments?.dueToday || []);
      setUpcomingDebts(data.payments?.upcoming || []);
      setOverdueServiceOrders(data.serviceOrders?.overdue || []);
      setDueTodayServiceOrders(data.serviceOrders?.dueToday || []);
      setUpcomingServiceOrders(data.serviceOrders?.upcoming || []);
    } catch {
      // silently fail — notifications are non-critical
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // refresh every 5 min
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
