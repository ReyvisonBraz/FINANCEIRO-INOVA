export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: string;
  paymentMethod?: string;
  createdBy?: number;
  updatedBy?: number;
  paymentId?: number;
  saleId?: string;
  customerName?: string;
  customerPhone?: string;
}

export type TransactionFormData = Pick<Transaction, 'description' | 'category' | 'type' | 'amount' | 'date'>;
