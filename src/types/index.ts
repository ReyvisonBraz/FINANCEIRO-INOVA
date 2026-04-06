export type Screen = 'dashboard' | 'transactions' | 'reports' | 'settings' | 'customers' | 'client-payments' | 'service-orders' | 'inventory';

export type { User, AuditLog, UserRole } from './user';
export type { Customer, CustomerFormData } from './customer';
export type { Transaction, TransactionType, TransactionFormData } from './transaction';
export type { ClientPayment, PaymentStatus, PaymentType, PaymentFormData, PaymentHistoryItem } from './payment';
export type { InventoryItem, InventoryItemFormData } from './inventory';
export type { AppSettings, Category, CategoryType } from './settings';
export type { 
  ServiceOrder, 
  ServiceOrderPart, 
  ServiceOrderItem, 
  ServiceOrderStatus, 
  ServiceOrderPriority,
  ServiceOrderFormData 
} from './service-order';
export type { EquipmentType, Brand, Model } from './equipment';
