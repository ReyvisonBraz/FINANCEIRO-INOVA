// Tipos globais compartilhados entre módulos

export type UserRole = "owner" | "manager" | "employee";

export type TransactionType = "income" | "expense";

export type PaymentStatus = "pending" | "partial" | "paid";

export type ServiceOrderPriority = "low" | "medium" | "high" | "urgent";

export type InventoryCategory = "product" | "service";

export interface ServiceOrderPart {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentHistoryEntry {
  date: string;
  amount: number;
  method: string;
  note?: string;
}
