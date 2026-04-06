export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  CUSTOMERS: '/clientes',
  PAYMENTS: '/vendas',
  SERVICE_ORDERS: '/ordens',
  INVENTORY: '/estoque',
  REPORTS: '/relatorios',
  SETTINGS: '/configuracoes',
} as const;

export const SCREENS = {
  DASHBOARD: 'dashboard',
  TRANSACTIONS: 'transactions',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  CUSTOMERS: 'customers',
  CLIENT_PAYMENTS: 'client-payments',
  SERVICE_ORDERS: 'service-orders',
  INVENTORY: 'inventory',
} as const;

export type Screen = typeof SCREENS[keyof typeof SCREENS];
