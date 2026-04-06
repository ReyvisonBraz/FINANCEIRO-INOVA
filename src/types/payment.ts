export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type PaymentType = 'income' | 'expense';

export interface PaymentHistoryItem {
  amount: number;
  date: string;
}

export interface ClientPayment {
  id: number;
  customerId: number;
  description: string;
  totalAmount: number;
  paidAmount: number;
  purchaseDate: string;
  dueDate: string;
  paymentMethod: string;
  status: PaymentStatus;
  installmentsCount: number;
  type: PaymentType;
  saleId?: string;
  customerName?: string;
  paymentHistory?: string;
  createdBy?: number;
  updatedBy?: number;
}

export type PaymentFormData = Pick<ClientPayment, 'customerId' | 'description' | 'totalAmount' | 'paidAmount' | 'purchaseDate' | 'dueDate' | 'paymentMethod' | 'status' | 'installmentsCount' | 'type' | 'saleId'>;
